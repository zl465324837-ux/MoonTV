export const runtime = 'edge';

export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get('url');
  if (!url) return new Response('no url', { status: 400 });
  
  let src = url;
  try { src = decodeURIComponent(url); } catch {}
  
  try {
    const u = new URL(src);
    // 把 https://img3.doubanio.com/... 变成 https://i0.wp.com/img3.doubanio.com/...
    const wp = `https://i0.wp.com/${u.host}${u.pathname}${u.search}`;
    return Response.redirect(wp, 302);
  } catch {
    return Response.redirect(`https://images.weserv.nl/?url=${encodeURIComponent(src)}`, 302);
  }
}
