import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  const release = (process.env.RELEASE_SHA ?? '').trim();
  const body: { status: 'ok'; release?: string } = { status: 'ok' };
  if (/^[0-9a-f]{7,40}$/i.test(release)) body.release = release;

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, max-age=0'
    }
  });
};

export const ALL: APIRoute = async () => new Response(null, {
  status: 405,
  headers: { allow: 'GET', 'cache-control': 'no-store' }
});
