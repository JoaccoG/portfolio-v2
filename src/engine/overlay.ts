export function initOverlay(): void {
	const content = document.querySelector<HTMLElement>(
		'[data-engine="content"]',
	);
	const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
	let openEl: HTMLElement | null = null;
	let lastFocus: Element | null = null;
	const close = () => {
		if (!openEl) return;
		const overlay = openEl;
		openEl = null;
		overlay.style.setProperty('--p2o', '0');
		overlay.style.setProperty('--p2p', 'none');
		overlay.style.setProperty('--p2', '0');
		overlay.inert = true;
		overlay.setAttribute('aria-hidden', 'true');
		if (content) content.inert = false;
		document.documentElement.style.overflow = '';
		if (lastFocus instanceof HTMLElement) {
			lastFocus.focus({ preventScroll: true });
		}
	};
	const open = (overlay: HTMLElement) => {
		if (openEl) return;
		openEl = overlay;
		lastFocus = document.activeElement;
		overlay.inert = false;
		overlay.setAttribute('aria-hidden', 'false');
		overlay.scrollTop = 0;
		overlay.style.setProperty('--p2o', '1');
		overlay.style.setProperty('--p2p', 'auto');
		overlay.style.setProperty('--p2', '1');
		if (content) content.inert = true;
		document.documentElement.style.overflow = 'hidden';
		setTimeout(
			() => {
				overlay
					.querySelector<HTMLElement>('[data-p2focus]')
					?.focus({ preventScroll: true });
			},
			rm ? 30 : 550,
		);
	};
	for (const btn of document.querySelectorAll<HTMLElement>(
		'[data-page-open]',
	)) {
		btn.addEventListener('click', () => {
			const id = btn.dataset.pageOpen ?? '';
			const overlay = document.querySelector<HTMLElement>(
				`[data-page-two="${CSS.escape(id)}"]`,
			);
			if (overlay) open(overlay);
		});
	}
	for (const closer of document.querySelectorAll<HTMLElement>(
		'[data-p2-close]',
	)) {
		closer.addEventListener('click', close);
	}
	addEventListener('keydown', (e) => {
		if (e.key === 'Escape') close();
	});
}
