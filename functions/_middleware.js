// Send visitors on the default Pages address to the official domain.
// Per-deployment preview URLs (<hash>.mahayanacap.pages.dev) are left alone.
const PAGES_HOST = 'mahayanacap.pages.dev';
const CANONICAL = 'https://www.mahayanacap.com';

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === PAGES_HOST) {
    return Response.redirect(`${CANONICAL}${url.pathname}${url.search}`, 301);
  }
  return next();
}
