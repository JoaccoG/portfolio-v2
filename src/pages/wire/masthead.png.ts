import type { APIRoute } from 'astro';
import { renderMasthead } from '../../lib/card';

export const GET: APIRoute = async () =>
	new Response(new Uint8Array(await renderMasthead()), {
		headers: { 'Content-Type': 'image/png' },
	});
