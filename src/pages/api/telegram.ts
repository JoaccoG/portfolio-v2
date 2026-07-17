import type { APIRoute } from 'astro';
import { RESEND_API_KEY } from 'astro:env/server';

export const prerender = false;

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const EDITOR = 'joaquingodoy2407@gmail.com';
const hits = new Map<string, { count: number; start: number }>();

const respond = (data: unknown, status: number) =>
	new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});

export const POST: APIRoute = async ({ request, clientAddress }) => {
	const now = Date.now();
	const key = clientAddress ?? 'unknown';
	const slot = hits.get(key);
	if (!slot || now - slot.start > WINDOW_MS) {
		hits.set(key, { count: 1, start: now });
	} else if (++slot.count > MAX_PER_WINDOW) {
		return respond({ ok: false, error: 'rate' }, 429);
	}
	let body: { email?: unknown; message?: unknown; wire?: unknown };
	try {
		body = await request.json();
	} catch {
		return respond({ ok: false, error: 'bad' }, 400);
	}
	const email = typeof body.email === 'string' ? body.email.trim() : '';
	const message = typeof body.message === 'string' ? body.message.trim() : '';
	const wire = typeof body.wire === 'string' ? body.wire.trim() : '';
	if (wire) return respond({ ok: true }, 200);
	if (!EMAIL_RE.test(email) || email.length > 200) {
		return respond({ ok: false, error: 'email' }, 422);
	}
	if (!message || message.length > 5000) {
		return respond({ ok: false, error: 'blank' }, 422);
	}
	const sent = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${RESEND_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: 'The Daily Godoy <onboarding@resend.dev>',
			to: [EDITOR],
			reply_to: email,
			subject: 'Telegram to the Editor — The Daily Godoy',
			text: `From: ${email}\n\n${message}`,
		}),
	});
	if (!sent.ok) return respond({ ok: false, error: 'send' }, 502);
	return respond({ ok: true }, 200);
};
