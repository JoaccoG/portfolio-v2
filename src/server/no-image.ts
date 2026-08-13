import type { APIRoute } from 'astro';

export const prerender = false;

const gone: APIRoute = () => new Response(null, { status: 404 });

export const GET = gone;
export const ALL = gone;
