export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) return new Response('missing', { status: 400 });

  let decoded = url;
  try { decoded = decodeURIComponent(url); } catch {}

  // 直接302跳转到最稳的公共代理，浏览器自己去加载
  const proxied = `https://images.weserv.nl/?url=${encodeURIComponent(decoded)}&output=jpg&q=80&n=-1`;
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': proxied,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
