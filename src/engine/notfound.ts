export function initNotFound(): void {
	const back = document.querySelector<HTMLElement>('[data-back]');
	back?.addEventListener('click', () => {
		if (history.length > 1) history.back();
		else location.href = '/';
	});

	const target = document.querySelector<HTMLElement>('[data-path]');
	if (!target) return;

	let clean = '';
	try {
		clean = decodeURIComponent(location.pathname || '');
	} catch {
		clean = location.pathname || '';
	}
	clean = clean.trim();

	const ok =
		clean !== '' &&
		clean !== '/' &&
		clean.length <= 48 &&
		!/\.html?$/i.test(clean) &&
		!/[?&=%\s]/.test(clean);

	if (ok) target.textContent = clean;
}
