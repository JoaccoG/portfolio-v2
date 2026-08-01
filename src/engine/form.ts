import { copy } from '../i18n/t';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function initForm(): void {
	const form = document.querySelector<HTMLFormElement>('form[data-telegram]');
	if (!form) return;
	const error = document.querySelector<HTMLElement>('[data-form-error]');
	const sent = document.querySelector<HTMLElement>('[data-sent-state]');
	const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
	const postmaster = copy.telegrams.postmaster;
	const submitLabel = button?.textContent ?? '';
	const sendingLabel = copy.telegrams.sending;
	const showError = (text: string) => {
		if (!error) return;
		error.textContent = postmaster.prefix + text;
		error.hidden = false;
	};
	const restore = () => {
		if (!button) return;
		button.disabled = false;
		button.textContent = submitLabel;
	};
	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		const data = new FormData(form);
		const email = String(data.get('email') ?? '').trim();
		const message = String(data.get('message') ?? '').trim();
		const wire = String(data.get('wire') ?? '').trim();
		if (!EMAIL_RE.test(email)) {
			showError(postmaster.email);
			return;
		}
		if (!message) {
			showError(postmaster.blank);
			return;
		}
		if (error) error.hidden = true;
		if (button) {
			button.disabled = true;
			button.textContent = sendingLabel;
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
				if (code === 'rate') showError(postmaster.rate);
				else if (code === 'email') showError(postmaster.email);
				else if (code === 'blank') showError(postmaster.blank);
				else showError(postmaster.wireDown);
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
			showError(postmaster.wireDown);
			restore();
		}
	});
}
