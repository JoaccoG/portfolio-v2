const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function initForm(): void {
	const form = document.querySelector<HTMLFormElement>('form[data-telegram]');
	if (!form) return;
	const error = document.querySelector<HTMLElement>('[data-form-error]');
	const sent = document.querySelector<HTMLElement>('[data-sent-state]');
	const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
	const label = form.querySelector<HTMLElement>('[data-form-label]');
	const hand = form.querySelector<HTMLElement>('[data-form-hand]');
	const say = form.dataset;
	const submitLabel = label?.textContent ?? '';
	const sendingLabel = say.sending ?? '';
	const showError = (text: string | undefined) => {
		if (!error) return;
		error.textContent = (say.prefix ?? '') + (text ?? '');
		error.hidden = false;
	};
	const restore = () => {
		if (!button) return;
		button.disabled = false;
		if (label) label.textContent = submitLabel;
		if (hand) hand.hidden = false;
	};
	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		const data = new FormData(form);
		const email = String(data.get('email') ?? '').trim();
		const message = String(data.get('message') ?? '').trim();
		const wire = String(data.get('wire') ?? '').trim();
		if (!EMAIL_RE.test(email)) {
			showError(say.email);
			return;
		}
		if (!message) {
			showError(say.blank);
			return;
		}
		if (error) error.hidden = true;
		if (button) {
			button.disabled = true;
			if (label) label.textContent = sendingLabel;
			if (hand) hand.hidden = true;
		}
		try {
			const res = await fetch('/api/telegram', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, message, wire }),
			});
			if (!res.ok) {
				const payload = (await res.json().catch(() => null)) as {
					error?: string;
				} | null;
				const code = payload?.error;
				if (code === 'rate') showError(say.rate);
				else if (code === 'email') showError(say.email);
				else if (code === 'blank') showError(say.blank);
				else showError(say.wireDown);
				restore();
				return;
			}
			form.reset();
			form.hidden = true;
			if (sent) {
				sent.hidden = false;
				sent.focus();
			}
			window.setTimeout(() => {
				if (sent) {
					const hadFocus = document.activeElement === sent;
					sent.hidden = true;
					if (hadFocus) {
						form.querySelector<HTMLTextAreaElement>('#tg-msg')?.focus();
					}
				}
				form.hidden = false;
				restore();
			}, 8000);
		} catch {
			showError(say.wireDown);
			restore();
		}
	});
}
