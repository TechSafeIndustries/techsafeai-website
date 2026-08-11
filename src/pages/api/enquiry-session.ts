import type { APIRoute } from 'astro';
import { createEnquiryId } from '../../server/enquiry/submission.mjs';

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ enquiryId: createEnquiryId() }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, max-age=0'
    }
  });
};

export const ALL: APIRoute = async () => {
  return new Response(JSON.stringify({ code: 'METHOD_NOT_ALLOWED' }), {
    status: 405,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      allow: 'GET'
    }
  });
};
