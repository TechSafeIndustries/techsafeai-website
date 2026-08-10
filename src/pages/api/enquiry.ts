import type { APIRoute } from 'astro';
import { handleEnquiryRequest } from '../../server/enquiry/service.mjs';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  return handleEnquiryRequest(request, {
    clientAddress: clientAddress || 'unknown'
  });
};

export const ALL: APIRoute = async () => {
  return new Response(JSON.stringify({ accepted: false, code: 'METHOD_NOT_ALLOWED' }), {
    status: 405,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      allow: 'POST'
    }
  });
};
