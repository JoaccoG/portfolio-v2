const largestSource = (img: HTMLImageElement): string => {
	const candidates = (img.srcset || '')
		.split(',')
		.map((entry) => entry.trim().split(/\s+/))
		.filter((parts) => parts[0])
		.sort(
			(a, b) =>
				Number.parseInt(b[1] ?? '0', 10) - Number.parseInt(a[1] ?? '0', 10),
		);
	return candidates[0]?.[0] || img.currentSrc || img.src;
};

export function initArticle(): void {
	const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const content = document.querySelector<HTMLElement>(
		'[data-engine="content"]',
	);
	const feedPath = '/columns';

	for (const btn of document.querySelectorAll<HTMLElement>(
		'[data-back-columns]',
	)) {
		btn.addEventListener('click', () => {
			const fromFeed = document.referrer.startsWith(location.origin + feedPath);
			if (history.length > 1 && fromFeed) history.back();
			else location.href = feedPath;
		});
	}

	const sheet = document.querySelector<HTMLElement>('[data-index-sheet]');
	const toggle = document.querySelector<HTMLButtonElement>(
		'[data-index-toggle]',
	);
	const label = toggle?.querySelector<HTMLElement>('[data-index-label]');
	const floating = document.querySelector<HTMLElement>('[data-floating]');
	let sheetOpen = false;
	const setSheet = (open: boolean) => {
		if (!sheet || !toggle) return;
		sheetOpen = open;
		sheet.classList.toggle('open', open);
		sheet.inert = !open;
		sheet.setAttribute('aria-hidden', String(!open));
		toggle.setAttribute('aria-expanded', String(open));
		if (label) {
			label.textContent = open
				? (label.dataset.open ?? '')
				: (label.dataset.closed ?? '');
		}
		if (open) {
			setTimeout(
				() => {
					sheet.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
				},
				rm ? 30 : 450,
			);
		} else {
			toggle.focus({ preventScroll: true });
		}
	};
	toggle?.addEventListener('click', () => setSheet(!sheetOpen));

	const box = document.querySelector<HTMLElement>('[data-plate-box]');
	const img = box?.querySelector<HTMLImageElement>('[data-plate-img]');
	const cap = box?.querySelector<HTMLElement>('[data-plate-cap]');
	let lastFocus: Element | null = null;
	let boxOpen = false;
	const closeBox = () => {
		if (!box || !boxOpen) return;
		boxOpen = false;
		box.classList.remove('open');
		box.inert = true;
		box.setAttribute('aria-hidden', 'true');
		if (content) content.inert = false;
		if (floating) floating.inert = false;
		if (sheet) sheet.inert = !sheetOpen;
		document.documentElement.style.overflow = '';
		if (lastFocus instanceof HTMLElement) {
			lastFocus.focus({ preventScroll: true });
		}
	};
	const openBox = (btn: HTMLElement) => {
		if (!box || !img || boxOpen) return;
		const source = btn.querySelector<HTMLImageElement>('img');
		if (!source) return;
		img.src = largestSource(source);
		img.alt = source.alt;
		if (cap) {
			cap.textContent =
				btn
					.closest('figure')
					?.querySelector('figcaption > span:first-child')
					?.textContent?.trim() ?? '';
		}
		lastFocus = document.activeElement;
		boxOpen = true;
		box.inert = false;
		box.setAttribute('aria-hidden', 'false');
		box.classList.add('open');
		if (content) content.inert = true;
		if (floating) floating.inert = true;
		if (sheet) sheet.inert = true;
		document.documentElement.style.overflow = 'hidden';
		setTimeout(
			() => {
				box
					.querySelector<HTMLElement>('[data-plate-focus]')
					?.focus({ preventScroll: true });
			},
			rm ? 30 : 350,
		);
	};
	for (const btn of document.querySelectorAll<HTMLElement>(
		'[data-plate-open]',
	)) {
		btn.addEventListener('click', () => openBox(btn));
	}
	for (const closer of document.querySelectorAll<HTMLElement>(
		'[data-plate-close]',
	)) {
		closer.addEventListener('click', closeBox);
	}
	box?.addEventListener('click', (e) => {
		if (e.target === box) closeBox();
	});
	addEventListener('keydown', (e) => {
		if (e.key !== 'Escape') return;
		if (boxOpen) closeBox();
		else if (sheetOpen) setSheet(false);
	});
}
