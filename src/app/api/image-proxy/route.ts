import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return new Response('missing url', { status: 400 });

  let src = url;
  try { src = decodeURIComponent(url); } catch {}

  try {
    const u = new URL(src);
    const wpUrl = `https://i0.wp.com/${u.host}${u.pathname}${u.search}`;

    const res = await fetch(wpUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://www.douban.com/',
      },
    });

    if (!res.ok) throw new Error('wp failed');

    const buf = await res.arrayBuffer();
    return new Response(buf, {
      headers: {
        'Content-Type': res.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return NextResponse.redirect(`https://images.weserv.nl/?url=${encodeURIComponent(src)}`, 302);
  }
}
