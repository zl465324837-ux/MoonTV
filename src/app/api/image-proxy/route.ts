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

  // 用 wsrv.nl，支持完整 https 链接
  const target = `https://wsrv.nl/?url=${encodeURIComponent(decoded)}&output=jpg`;

  try {
    const res = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://movie.douban.com/',
        'Accept': 'image/*',
      },
    });
    if (!res.ok) throw new Error('wsrv failed');
    const buf = await res.arrayBuffer();
    return new Response(buf, {
      headers: {
        'Content-Type': res.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    // 如果 wsrv 也失败，直接 302 跳转到原图，让浏览器自己去试
    return Response.redirect(decoded, 302);
  }
}
