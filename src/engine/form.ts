import { copy } from '../i18n/t';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function initForm(): void {
	const form = document.querySelector<HTMLFormElement>('form[data-telegram]');
	if (!form) return;
	const error = document.querySelector<HTMLElement>('[data-form-error]');
	const sent = document.querySelector<HTMLElement>('[data-sent-state]');
	const postmaster = copy.telegrams.postmaster;
	const showError = (text: string) => {
		if (!error) return;
		error.textContent = postmaster.prefix + text;
		error.hidden = false;
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
		const button = form.querySelector<HTMLButtonElement>(
			'button[type="submit"]',
		);
		if (button) button.disabled = true;
		try {
			const res = await fetch('/api/telegram', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, message, wire }),
			});
			if (!res.ok) throw new Error(String(res.status));
			form.hidden = true;
			if (sent) sent.hidden = false;
		} catch {
			showError(postmaster.wireDown);
			if (button) button.disabled = false;
		}
	});
}
