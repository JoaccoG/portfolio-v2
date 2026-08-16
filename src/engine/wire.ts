const EMAIL_RE = /^\S+@\S+\.\S+$/;
const POSTAL_MS = 8000;

export function initWire(): void {
	const form = document.querySelector<HTMLFormElement>('form[data-wire]');
	if (!form) return;
	const desk = document.querySelector<HTMLElement>('[data-wire-desk]');
	const sent = document.querySelector<HTMLElement>('[data-wire-sent]');
	const error = document.querySelector<HTMLElement>('[data-wire-error]');
	const button = form.querySelector<HTMLButtonElement>('[data-wire-submit]');
	const label = form.querySelector<HTMLElement>('[data-wire-label]');
	const hand = form.querySelector<HTMLElement>('[data-wire-hand]');
	const input = form.querySelector<HTMLInputElement>('input[name="email"]');
	const say = form.dataset;
	const submitLabel = label?.textContent ?? '';
	const showError = (text: string | undefined) => {
		if (!error) return;
		error.textContent = (say.prefix ?? '') + (text ?? '');
		error.hidden = false;
	};
	const setBusy = (busy: boolean) => {
		if (button) button.disabled = busy;
		if (label) label.textContent = busy ? (say.sending ?? '') : submitLabel;
		if (hand) hand.hidden = busy;
	};
	const showPostal = () => {
		if (desk) desk.hidden = true;
		if (sent) {
			sent.hidden = false;
			sent.focus();
		}
		window.setTimeout(() => {
			const hadFocus = document.activeElement === sent;
			if (sent) sent.hidden = true;
			if (desk) desk.hidden = false;
			if (hadFocus) input?.focus();
		}, POSTAL_MS);
	};
	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		const data = new FormData(form);
		const email = String(data.get('email') ?? '').trim();
		const wire = String(data.get('wire') ?? '').trim();
		if (!EMAIL_RE.test(email)) {
			showError(say.email);
			return;
		}
		if (error) error.hidden = true;
		setBusy(true);
		try {
			const res = await fetch('/api/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, wire }),
			});
			if (!res.ok) {
				const payload = (await res.json().catch(() => null)) as {
					error?: string;
				} | null;
				const code = payload?.error;
				if (code === 'rate') showError(say.rate);
				else if (code === 'email') showError(say.email);
				else showError(say.wireDown);
				setBusy(false);
				return;
			}
			form.reset();
			setBusy(false);
			showPostal();
		} catch {
			showError(say.wireDown);
			setBusy(false);
		}
	});
}
