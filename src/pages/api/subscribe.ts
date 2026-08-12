import { RESEND_API_KEY, RESEND_SEGMENT_ID } from 'astro:env/server';
import type { APIRoute } from 'astro';
import { clientKey, createLimiter } from '../../server/rate-limit';

export const prerender = false;

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const limiter = createLimiter({
	windowMs: 60_000,
	maxPerWindow: 5,
	maxGlobal: 30,
	maxKeys: 5000,
});

const respond = (data: unknown, status: number) =>
	new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});

export const POST: APIRoute = async ({ request, clientAddress }) => {
	const now = Date.now();
	if (limiter.overLimit(clientKey(request, clientAddress), now)) {
		return respond({ ok: false, error: 'rate' }, 429);
	}
	let body: { email?: unknown; wire?: unknown };
	try {
		body = await request.json();
	} catch {
		return respond({ ok: false, error: 'bad' }, 400);
	}
	const email = typeof body.email === 'string' ? body.email.trim() : '';
	const wire = typeof body.wire === 'string' ? body.wire.trim() : '';
	if (wire) return respond({ ok: true }, 200);
	if (!EMAIL_RE.test(email) || email.length > 200) {
		return respond({ ok: false, error: 'email' }, 422);
	}
	const contact: Record<string, unknown> = { email, unsubscribed: false };
	if (RESEND_SEGMENT_ID) contact.segments = [{ id: RESEND_SEGMENT_ID }];
	const entered = await fetch('https://api.resend.com/contacts', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${RESEND_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(contact),
	});
	if (!entered.ok) return respond({ ok: false, error: 'send' }, 502);
	return respond({ ok: true }, 200);
};
