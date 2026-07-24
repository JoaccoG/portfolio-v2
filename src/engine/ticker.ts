export function initTicker(): void {
	const el = document.querySelector<HTMLElement>('[data-ticker]');
	if (!el) return;
	const io = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			el.style.setProperty('--tk', entry.isIntersecting ? 'running' : 'paused');
		}
	});
	io.observe(el);
}
