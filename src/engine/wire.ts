import { copy } from '../i18n/t';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function initWire(): void {
	const form = document.querySelector<HTMLFormElement>('form[data-wire]');
	if (!form) return;
	const error = document.querySelector<HTMLElement>('[data-wire-error]');
	const note = document.querySelector<HTMLElement>('[data-wire-note]');
	const button = form.querySelector<HTMLButtonElement>('[data-wire-submit]');
	const input = form.querySelector<HTMLInputElement>('input[name="email"]');
	const postmaster = copy.telegrams.postmaster;
	const w = copy.columns.wire;
	const submitLabel = button?.textContent ?? '';
	const idleNote = note?.textContent ?? '';
	let done = false;
	const showError = (text: string) => {
		if (!error) return;
		error.textContent = postmaster.prefix + text;
		error.hidden = false;
	};
	const setBusy = (busy: boolean) => {
		if (!button) return;
		button.disabled = busy;
		button.textContent = busy ? w.sending : submitLabel;
	};
	const setDone = (already: boolean) => {
		done = true;
		if (button) {
			button.disabled = true;
			button.textContent = w.done;
		}
		if (note) note.textContent = already ? w.already : w.doneNote;
		if (error) error.hidden = true;
	};
	input?.addEventListener('input', () => {
		if (!done) return;
		done = false;
		setBusy(false);
		if (note) note.textContent = idleNote;
	});
	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		if (done) return;
		const data = new FormData(form);
		const email = String(data.get('email') ?? '').trim();
		const wire = String(data.get('wire') ?? '').trim();
		if (!EMAIL_RE.test(email)) {
			showError(postmaster.email);
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
			const payload = (await res.json().catch(() => null)) as {
				ok?: boolean;
				error?: string;
				already?: boolean;
			} | null;
			if (!res.ok) {
				const code = payload?.error;
				if (code === 'rate') showError(postmaster.rate);
				else if (code === 'email') showError(postmaster.email);
				else showError(postmaster.wireDown);
				setBusy(false);
				return;
			}
			setDone(payload?.already === true);
		} catch {
			showError(postmaster.wireDown);
			setBusy(false);
		}
	});
}
