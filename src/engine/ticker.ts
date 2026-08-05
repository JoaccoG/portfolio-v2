const SPEED = 64;

export function initTicker(): void {
	const el = document.querySelector<HTMLElement>('[data-ticker]');
	if (!el) return;

	const row = el.querySelector<HTMLElement>('[data-ticker-row]');
	const tune = () => {
		if (!row) return;
		const distance = row.scrollWidth / 2;
		if (distance > 0) {
			el.style.setProperty(
				'--tk-dur',
				`${Math.round((distance / SPEED) * 10) / 10}s`,
			);
		}
	};
	tune();
	if (document.fonts) document.fonts.ready.then(tune);
	addEventListener('resize', tune);

	const io = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			el.style.setProperty('--tk', entry.isIntersecting ? 'running' : 'paused');
		}
	});
	io.observe(el);
}
