const CLOSE_DELAY = 220;
const COPIED_FOR = 2000;

export function initShare(): void {
	const roots = [...document.querySelectorAll<HTMLElement>('[data-share]')];
	if (!roots.length) return;
	const hover = matchMedia('(hover: hover) and (pointer: fine)').matches;
	const entries: { root: HTMLElement; close: () => void }[] = [];

	for (const root of roots) {
		const toggle = root.querySelector<HTMLButtonElement>('[data-share-toggle]');
		const slip = root.querySelector<HTMLElement>('[data-share-slip]');
		if (!toggle || !slip) continue;
		let timer = 0;
		const set = (open: boolean) => {
			clearTimeout(timer);
			root.classList.toggle('open', open);
			toggle.setAttribute('aria-expanded', String(open));
			slip.inert = !open;
		};
		set(false);
		root.dataset.ready = '';
		entries.push({ root, close: () => set(false) });

		toggle.addEventListener('click', () => {
			set(hover || !root.classList.contains('open'));
		});
		if (hover) {
			root.addEventListener('mouseenter', () => set(true));
			root.addEventListener('mouseleave', () => {
				timer = window.setTimeout(() => set(false), CLOSE_DELAY);
			});
		}
		root.addEventListener('focusout', (event) => {
			if (!root.contains(event.relatedTarget as Node | null)) set(false);
		});
		root.addEventListener('keydown', (event) => {
			if (event.key !== 'Escape' || !root.classList.contains('open')) return;
			set(false);
			toggle.focus();
		});

		const copy = root.querySelector<HTMLButtonElement>('[data-share-copy]');
		const label = root.querySelector<HTMLElement>('[data-share-copy-label]');
		let copiedTimer = 0;
		copy?.addEventListener('click', async () => {
			try {
				await navigator.clipboard.writeText(root.dataset.url ?? location.href);
			} catch {
				return;
			}
			if (!label) return;
			clearTimeout(copiedTimer);
			const before = label.dataset.idle ?? label.textContent ?? '';
			label.dataset.idle = before;
			label.textContent = copy.dataset.copied ?? before;
			copiedTimer = window.setTimeout(() => {
				label.textContent = before;
				delete label.dataset.idle;
			}, COPIED_FOR);
		});

		const native = root.querySelector<HTMLElement>('[data-share-native]');
		if (native && !hover && typeof navigator.share === 'function') {
			native.hidden = false;
			native.querySelector('button')?.addEventListener('click', () => {
				navigator
					.share({
						title: root.dataset.title,
						text: root.dataset.text,
						url: root.dataset.nativeUrl,
					})
					.catch(() => {});
			});
		}
	}

	document.addEventListener('click', (event) => {
		const target = event.target as Node;
		for (const { root, close } of entries) {
			if (!root.contains(target)) close();
		}
	});
}
