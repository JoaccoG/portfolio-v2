import { RESEND_API_KEY, RESEND_FROM } from 'astro:env/server';
import type { APIRoute } from 'astro';
import { clientKey, createLimiter } from '../../server/rate-limit';
import { buildTelegramHtml } from '../../server/telegram-template';

export const prerender = false;

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const MAX_GLOBAL_PER_WINDOW = 30;
const MAX_KEYS = 5000;
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const EDITOR = 'joaquingodoy2407@gmail.com';
const limiter = createLimiter({
	windowMs: WINDOW_MS,
	maxPerWindow: MAX_PER_WINDOW,
	maxGlobal: MAX_GLOBAL_PER_WINDOW,
	maxKeys: MAX_KEYS,
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
			from: RESEND_FROM,
			to: [EDITOR],
			reply_to: email,
			subject: 'Telegram to the Editor — The Daily Godoy',
			text: `From: ${email}\n\n${message}`,
			html: buildTelegramHtml(email, message),
		}),
	});
	if (!sent.ok) return respond({ ok: false, error: 'send' }, 502);
	return respond({ ok: true }, 200);
};
