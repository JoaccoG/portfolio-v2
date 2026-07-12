export function initReveals(): void {
	const els = document.querySelectorAll<HTMLElement>('[data-rv]');
	const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (rm) {
		for (const el of els) el.style.setProperty('--rv', '1');
		return;
	}
	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					(entry.target as HTMLElement).style.setProperty('--rv', '1');
					io.unobserve(entry.target);
				}
			}
		},
		{ threshold: 0.1, rootMargin: '0px 0px -4% 0px' },
	);
	for (const el of els) {
		const rect = el.getBoundingClientRect();
		if (rect.top < innerHeight && rect.bottom > 0) {
			el.style.setProperty('--rv', '1');
			continue;
		}
		el.style.setProperty('--rv', '0');
		io.observe(el);
	}
}
