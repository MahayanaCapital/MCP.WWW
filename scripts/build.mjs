// Copies the public site into dist/ for Cloudflare Pages.
// Keeps QA screenshots, notes and tooling out of the published site.
import { cpSync, rmSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');
const include = ['index.html', 'assets', 'insights', 'markets', 'team', 'zh-tw', '_headers', '_redirects'];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const item of include) {
  try { cpSync(join(root, item), join(out, item), { recursive: true }); } catch (e) { if (e.code !== 'ENOENT') throw e; }
}
const pages = [];
const walk = (dir, rel = '') => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (name !== 'assets') walk(p, `${rel}${name}/`); }
    else if (name === 'index.html') pages.push(rel);
  }
};
walk(out);
const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.sort().map((p) => `  <url><loc>https://www.mahayanacap.com/${p}</loc><lastmod>${today}</lastmod>${p.includes('markets') ? '<changefreq>daily</changefreq>' : ''}</url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(out, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://www.mahayanacap.com/sitemap.xml\n');
console.log('Built dist/');
