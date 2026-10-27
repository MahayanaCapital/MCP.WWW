// Mahayana Markets Brief — daily auto-updating market data + headlines.
// Cloudflare Pages Function: GET /api/brief?lang=en|zh
// Data is fetched live and cached at the edge for 20 minutes, so the
// brief refreshes itself every day (and intraday) with no rebuild needed.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
const TTL = 1200; // seconds

// [symbol, group, English name, Chinese name, kind]
const INSTRUMENTS = [
  ['^GSPC', 'americas', 'S&P 500', '標普 500', 'index'],
  ['^IXIC', 'americas', 'Nasdaq Composite', '納斯達克綜合', 'index'],
  ['^DJI', 'americas', 'Dow Jones', '道瓊工業', 'index'],
  ['^GSPTSE', 'americas', 'S&P/TSX', '加拿大 TSX', 'index'],
  ['^BVSP', 'americas', 'Bovespa', '巴西 Bovespa', 'index'],
  ['^STOXX50E', 'europe', 'Euro Stoxx 50', '歐洲斯托克 50', 'index'],
  ['^FTSE', 'europe', 'FTSE 100', '英國富時 100', 'index'],
  ['^GDAXI', 'europe', 'DAX', '德國 DAX', 'index'],
  ['^FCHI', 'europe', 'CAC 40', '法國 CAC 40', 'index'],
  ['^N225', 'asia', 'Nikkei 225', '日經 225', 'index'],
  ['^HSI', 'asia', 'Hang Seng', '恒生指數', 'index'],
  ['000001.SS', 'asia', 'Shanghai Comp.', '上證綜指', 'index'],
  ['399001.SZ', 'asia', 'Shenzhen Comp.', '深證成指', 'index'],
  ['^KS11', 'asia', 'KOSPI', '韓國 KOSPI', 'index'],
  ['^TWII', 'asia', 'Taiex', '台灣加權', 'index'],
  ['^NSEI', 'asia', 'Nifty 50', '印度 Nifty 50', 'index'],
  ['^AXJO', 'asia', 'ASX 200', '澳洲 ASX 200', 'index'],
  ['^TNX', 'rates', 'US 10Y Yield', '美國 10 年期殖利率', 'yield'],
  ['^FVX', 'rates', 'US 5Y Yield', '美國 5 年期殖利率', 'yield'],
  ['^IRX', 'rates', 'US 3M T-Bill', '美國 3 個月國庫券', 'yield'],
  ['^VIX', 'rates', 'VIX Volatility', 'VIX 波動率', 'index'],
  ['DX-Y.NYB', 'fx', 'US Dollar Index', '美元指數', 'fx'],
  ['EURUSD=X', 'fx', 'EUR / USD', '歐元 / 美元', 'fx'],
  ['USDJPY=X', 'fx', 'USD / JPY', '美元 / 日圓', 'fx'],
  ['GBPUSD=X', 'fx', 'GBP / USD', '英鎊 / 美元', 'fx'],
  ['CNY=X', 'fx', 'USD / CNY', '美元 / 人民幣', 'fx'],
  ['HKD=X', 'fx', 'USD / HKD', '美元 / 港元', 'fx'],
  ['GC=F', 'commodities', 'Gold', '黃金', 'commodity'],
  ['SI=F', 'commodities', 'Silver', '白銀', 'commodity'],
  ['CL=F', 'commodities', 'WTI Crude', 'WTI 原油', 'commodity'],
  ['BZ=F', 'commodities', 'Brent Crude', '布蘭特原油', 'commodity'],
  ['HG=F', 'commodities', 'Copper', '銅', 'commodity'],
  ['NG=F', 'commodities', 'Natural Gas', '天然氣', 'commodity'],
  ['BTC-USD', 'crypto', 'Bitcoin', '比特幣', 'crypto'],
  ['ETH-USD', 'crypto', 'Ether', '以太幣', 'crypto'],
];

const FEEDS = {
  en: [
    { url: 'https://www.cnbc.com/id/15839069/device/rss/rss.html', source: 'CNBC Markets', desk: 'markets' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_bulletins', source: 'MarketWatch', desk: 'markets' },
    { url: 'https://www.cnbc.com/id/20910258/device/rss/rss.html', source: 'CNBC Economy', desk: 'economy' },
    { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', source: 'CNBC Finance', desk: 'finance' },
    { url: 'https://www.cnbc.com/id/19832390/device/rss/rss.html', source: 'CNBC Asia', desk: 'asia' },
  ],
  zh: [
    { url: 'https://rthk9.rthk.hk/rthk/news/rss/c_expressnews_cfinance.xml', source: '香港電台 財經', desk: 'finance' },
    { url: 'https://www.cnbc.com/id/15839069/device/rss/rss.html', source: 'CNBC Markets', desk: 'markets' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_bulletins', source: 'MarketWatch', desk: 'markets' },
    { url: 'https://www.cnbc.com/id/19832390/device/rss/rss.html', source: 'CNBC Asia', desk: 'asia' },
  ],
};

async function fetchSpark(symbols, range, interval) {
  const url = `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${encodeURIComponent(symbols.join(','))}&range=${range}&interval=${interval}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, cf: { cacheTtl: 300 } });
  if (!res.ok) throw new Error(`spark ${res.status}`);
  return res.json();
}

async function fetchChart(symbol, range, interval) {
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, cf: { cacheTtl: 300 } });
  if (!res.ok) throw new Error(`chart ${res.status}`);
  const json = await res.json();
  const r = json?.chart?.result?.[0];
  return { timestamp: r?.timestamp || [], close: r?.indicators?.quote?.[0]?.close || [], meta: r?.meta || {} };
}

function clean(points) {
  return points.filter((p) => typeof p.v === 'number' && Number.isFinite(p.v));
}

function toQuote(def, series, lang) {
  const [symbol, group, en, zh, kind] = def;
  if (!series) return null;
  const pts = clean((series.timestamp || []).map((t, i) => ({ t, v: series.close?.[i] })));
  if (pts.length < 2) return null;
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const first = pts[0];
  const change = last.v - prev.v;
  const pct = prev.v ? (change / prev.v) * 100 : 0;
  const monthPct = first.v ? ((last.v - first.v) / first.v) * 100 : 0;
  return {
    symbol, group, kind,
    name: lang === 'zh' ? zh : en,
    price: last.v,
    change,
    pct,
    monthPct,
    time: last.t,
    spark: pts.map((p) => +p.v.toFixed(4)),
  };
}

async function getQuotes(lang) {
  const symbols = INSTRUMENTS.map((d) => d[0]);
  const chunks = [];
  for (let i = 0; i < symbols.length; i += 20) chunks.push(symbols.slice(i, i + 20));
  const map = {};
  await Promise.all(chunks.map(async (chunk) => {
    try {
      const data = await fetchSpark(chunk, '1mo', '1d');
      for (const s of chunk) if (data[s]) map[s] = data[s];
    } catch (e) {
      // Fall back to individual chart requests for this chunk.
      await Promise.all(chunk.map(async (s) => {
        try { map[s] = await fetchChart(s, '1mo', '1d'); } catch (_) { /* skip */ }
      }));
    }
  }));
  // Retry anything the batch call missed, one symbol at a time.
  const missing = INSTRUMENTS.filter((d) => !toQuote(d, map[d[0]], lang)).map((d) => d[0]);
  await Promise.all(missing.map(async (s) => {
    try { map[s] = await fetchChart(s, '1mo', '1d'); } catch (_) { /* skip */ }
  }));
  return INSTRUMENTS.map((d) => toQuote(d, map[d[0]], lang)).filter(Boolean);
}

function decode(str) {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decode(m[1]) : '';
}

async function getFeed(feed) {
  try {
    const res = await fetch(feed.url, { headers: { 'User-Agent': UA }, cf: { cacheTtl: 600 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
    return items.slice(0, 12).map((it) => {
      const title = tag(it, 'title');
      const link = tag(it, 'link') || (it.match(/<guid[^>]*>(https?:[^<]+)<\/guid>/i) || [])[1] || '';
      const pub = Date.parse(tag(it, 'pubDate')) || 0;
      return { title, link: link.trim(), source: feed.source, desk: feed.desk, time: Math.floor(pub / 1000) };
    }).filter((n) => n.title && /^https?:\/\//.test(n.link));
  } catch (_) {
    return [];
  }
}

async function getNews(lang) {
  const lists = await Promise.all((FEEDS[lang] || FEEDS.en).map(getFeed));
  const seen = new Set();
  const out = [];
  // Interleave sources so one outlet does not dominate.
  for (let i = 0; i < 12; i++) {
    for (const list of lists) {
      const n = list[i];
      if (!n) continue;
      const key = n.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(n);
    }
  }
  return out.slice(0, 24);
}

function editionInfo() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const launch = Date.UTC(2026, 9, 27); // Edition No. 1 = 27 Oct 2026
  const issue = Math.max(1, Math.floor((Date.UTC(+parts.year, +parts.month - 1, +parts.day) - launch) / 86400000) + 1);
  return { date, time: `${parts.hour}:${parts.minute}`, issue, generatedAt: now.toISOString() };
}

async function build(lang) {
  const [quotes, news, spx] = await Promise.all([
    getQuotes(lang),
    getNews(lang),
    fetchChart('^GSPC', '1y', '1wk').catch(() => null),
  ]);
  const feature = spx ? clean(spx.timestamp.map((t, i) => ({ t, v: spx.close[i] }))).map((p) => [p.t, +p.v.toFixed(2)]) : [];
  return { edition: editionInfo(), lang, quotes, news, feature };
}

export async function onRequestGet({ request, waitUntil }) {
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang') === 'zh' ? 'zh' : 'en';
  const cache = caches.default;
  const cacheKey = new Request(`${url.origin}/api/brief?lang=${lang}`, { method: 'GET' });
  const fresh = url.searchParams.has('fresh');

  if (!fresh) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }

  let body;
  try {
    body = await build(lang);
  } catch (e) {
    return new Response(JSON.stringify({ error: 'unavailable' }), { status: 503, headers: { 'content-type': 'application/json' } });
  }
  const res = new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=300, s-maxage=${TTL}`,
      'access-control-allow-origin': '*',
    },
  });
  if (body.quotes.length) waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
