export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) return new Response('missing url', { status: 400 });

  let decoded = url;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    // ignore decode error
  }

  const isDouban = decoded.includes('doubanio.com');
  const target = isDouban
    ? `https://images.weserv.nl/?url=${encodeURIComponent(decoded.replace(/^https?:\/\//, ''))}`
    : decoded;

  const res = await fetch(target, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://movie.douban.com/',
    },
  });

  const buf = await res.arrayBuffer();
  return new Response(buf, {
    headers: {
      'Content-Type': res.headers.get('content-type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
