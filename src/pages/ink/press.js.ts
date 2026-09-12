import type { APIRoute } from 'astro';
import { UMAMI_SCRIPT } from '../../server/umami';

export const prerender = false;

const FRESH_MS = 6 * 60 * 60 * 1000;
let cached: { body: string; at: number } | undefined;

const load = async (): Promise<string | undefined> => {
	if (cached && Date.now() - cached.at < FRESH_MS) return cached.body;
	try {
		const res = await fetch(UMAMI_SCRIPT, {
			signal: AbortSignal.timeout(5_000),
		});
		if (!res.ok) return cached?.body;
		cached = { body: await res.text(), at: Date.now() };
	} catch {
		return cached?.body;
	}
	return cached.body;
};

export const GET: APIRoute = async () => {
	const body = await load();
	if (!body) return new Response('', { status: 503 });
	return new Response(body, {
		headers: {
			'Content-Type': 'application/javascript; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
