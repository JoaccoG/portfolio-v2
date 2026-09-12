import type { APIRoute } from 'astro';
import { clientKey } from '../../../server/rate-limit';
import { collectHeaders, UMAMI_COLLECT } from '../../../server/umami';

export const prerender = false;

const MAX_BYTES = 16_384;

export const POST: APIRoute = async ({ request, clientAddress }) => {
	const body = await request.text();
	if (!body || body.length > MAX_BYTES) {
		return new Response(null, { status: 413 });
	}
	try {
		const res = await fetch(UMAMI_COLLECT, {
			method: 'POST',
			headers: collectHeaders(request, clientKey(request, clientAddress)),
			body,
			signal: AbortSignal.timeout(5_000),
		});
		return new Response(await res.text(), {
			status: res.status,
			headers: {
				'Content-Type': res.headers.get('content-type') ?? 'application/json',
				'Cache-Control': 'no-store',
			},
		});
	} catch {
		return new Response(null, { status: 502 });
	}
};
