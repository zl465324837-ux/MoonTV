import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const originalUrl = searchParams.get('url');

  if (!originalUrl) {
    return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 });
  }

  let urlToFetch = originalUrl;
  try {
    urlToFetch = decodeURIComponent(originalUrl);
  } catch {}

  // 豆瓣图直接走 wsrv.nl，不走直连，否则 Cloudflare IP 必被封
  const isDouban = urlToFetch.includes('doubanio.com') || urlToFetch.includes('douban.com');
  const targetUrl = isDouban
    ? `https://images.weserv.nl/?url=${encodeURIComponent(urlToFetch.replace(/^https?:\/\//, ''))}&output=jpg`
    : urlToFetch;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://movie.douban.com/',
        'Accept': 'image/*,*/*',
      },
    });

    if (!res.ok) throw new Error(`fetch failed ${res.status}`);

    const buf = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'CDN-Cache-Control': 'public, s-maxage=86400',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: '代理失败', details: (e as Error).message, url: urlToFetch }, { status: 500 });
  }
}
