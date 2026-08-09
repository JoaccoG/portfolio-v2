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
	for (const overlay of document.querySelectorAll<HTMLElement>(
		'[data-page-two]',
	)) {
		let downOutside = false;
		overlay.addEventListener('pointerdown', (e) => {
			downOutside = e.target === overlay;
		});
		overlay.addEventListener('click', (e) => {
			if (downOutside && e.target === overlay) close();
		});
		const sheet = overlay.querySelector<HTMLElement>('[data-p2-sheet]');
		if (!sheet) continue;
		let active = false;
		let began = false;
		let startY = 0;
		let dy = 0;
		let lastY = 0;
		let lastT = 0;
		let vel = 0;
		sheet.addEventListener(
			'touchstart',
			(e) => {
				const t = e.touches[0];
				if (!t) return;
				if (!matchMedia('(max-width: 767.98px)').matches) return;
				if (overlay.scrollTop > 0) return;
				active = true;
				began = false;
				startY = t.clientY;
				lastY = startY;
				lastT = performance.now();
				vel = 0;
				dy = 0;
			},
			{ passive: true },
		);
		sheet.addEventListener(
			'touchmove',
			(e) => {
				const t = e.touches[0];
				if (!active || !t) return;
				const now = performance.now();
				vel = (t.clientY - lastY) / Math.max(1, now - lastT);
				lastY = t.clientY;
				lastT = now;
				dy = t.clientY - startY;
				if (!began) {
					if (dy <= 0 || overlay.scrollTop > 0) {
						active = false;
						return;
					}
					if (dy < 8) return;
					began = true;
					sheet.classList.add('dragging');
				}
				e.preventDefault();
				sheet.style.setProperty('--dragY', String(Math.max(0, Math.round(dy))));
			},
			{ passive: false },
		);
		const release = () => {
			if (!active) return;
			active = false;
			sheet.classList.remove('dragging');
			sheet.style.setProperty('--dragY', '0');
			if (began && (dy > innerHeight * 0.22 || vel > 0.55)) close();
		};
		sheet.addEventListener('touchend', release);
		sheet.addEventListener('touchcancel', release);
	}
	addEventListener('keydown', (e) => {
		if (e.key === 'Escape') close();
	});
}
