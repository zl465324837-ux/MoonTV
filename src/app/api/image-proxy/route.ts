import { NextResponse } from 'next/server';
export const runtime = 'edge';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  if (!imageUrl) return NextResponse.json({ error: 'Missing image URL' }, { status: 400 });
  const headers = {
    Referer: 'https://movie.douban.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  };
  try {
    let imageResponse = await fetch(imageUrl, { headers });
    if (!imageResponse.ok) {
      const fallback = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}`;
      imageResponse = await fetch(fallback, { headers: { 'User-Agent': headers['User-Agent'] } });
    }
    if (!imageResponse.ok || !imageResponse.body) return NextResponse.json({ error: 'Image fetch failed' }, { status: 500 });
    const h = new Headers();
    h.set('Content-Type', imageResponse.headers.get('content-type') || 'image/jpeg');
    h.set('Cache-Control', 'public, max-age=15720000, s-maxage=15720000');
    h.set('Access-Control-Allow-Origin', '*');
    return new Response(imageResponse.body, { status: 200, headers: h });
  } catch {
    return NextResponse.json({ error: 'Error fetching image' }, { status: 500 });
  }
}
