export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const u = searchParams.get('url');
  if (!u) return new Response('missing url', { status: 400 });

  let decoded = u;
  try { decoded = decodeURIComponent(u); } catch {}

  const target = `https://images.weserv.nl/?url=${encodeURIComponent(decoded)}`;

  return Response.redirect(target, 302);
}
