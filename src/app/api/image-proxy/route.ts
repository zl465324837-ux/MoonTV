export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) return new Response('missing url', { status: 400 });

  let decoded = url;
  try { decoded = decodeURIComponent(url); } catch { /* ignore */ }

  const urlsToTry = [
    `https://wsrv.nl/?url=${encodeURIComponent(decoded)}&output=webp`,
    `https://images.weserv.nl/?url=${encodeURIComponent(decoded.replace(/^https?:\/\//, ''))}&output=jpg`,
    `https://images.weserv.nl/?url=${encodeURIComponent(decoded)}`,
  ];

  for (const target of urlsToTry) {
    try {
      const res = await fetch(target, {
        headers: {
          'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36',
          'Referer': 'https://movie.douban.com/',
        },
      });
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      if (buf.byteLength < 1000) continue;
      return new Response(buf, {
        headers: {
          'Content-Type': res.headers.get('content-type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch {
      // try next
    }
  }

  // 实在不行，直接让浏览器去试原图
  return Response.redirect(decoded, 302);
}
