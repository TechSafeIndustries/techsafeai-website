import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  const siteKey = (process.env.TURNSTILE_SITE_KEY ?? '').trim();
  const required = process.env.TURNSTILE_REQUIRED === '1';
  return new Response(JSON.stringify({
    turnstileRequired: required,
    turnstileSiteKey: siteKey
  }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, max-age=0'
    }
  });
};

export const ALL: APIRoute = async () => new Response(null, { status: 405, headers: { allow: 'GET' } });
