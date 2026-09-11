import { Idiomorph } from 'idiomorph';

const JS_OWNED = new Set([
	'style',
	'class',
	'inert',
	'hidden',
	'disabled',
	'open',
	'aria-hidden',
	'aria-pressed',
	'aria-expanded',
	'aria-busy',
	'data-intro',
]);
const HEAD_SYNC = [
	'meta[name="description"]',
	'meta[property="og:title"]',
	'meta[property="og:description"]',
	'meta[property="og:locale"]',
	'meta[property="og:url"]',
	'meta[property="og:image:alt"]',
	'meta[name="twitter:title"]',
	'meta[name="twitter:description"]',
	'meta[name="twitter:image:alt"]',
	'link[rel="canonical"]',
];
const BLOCKS =
	'h1, h2, h3, h4, p, li, figcaption, blockquote, cite, button, a, dt, dd, [data-swap-text]';
const STILL = '[data-page-two], [data-ticker], [data-preloader]';
const SWAP_CLASS = 'copy-swap';
const MARGIN = 120;

const rememberEdition = (lang: string) => {
	document.cookie = `edition=${lang}; path=/; max-age=31536000; samesite=lax`;
};

const syncHead = (next: Document) => {
	document.documentElement.lang = next.documentElement.lang;
	document.title = next.title;
	for (const selector of HEAD_SYNC) {
		const from = next.head.querySelector(selector);
		const to = document.head.querySelector(selector);
		if (!from || !to) continue;
		for (const name of ['content', 'href']) {
			const value = from.getAttribute(name);
			if (value !== null) to.setAttribute(name, value);
		}
	}
	const fresh = next.head.querySelectorAll(
		'script[type="application/ld+json"]',
	);
	document.head
		.querySelectorAll('script[type="application/ld+json"]')
		.forEach((el, i) => {
			const source = fresh[i];
			if (source) el.textContent = source.textContent;
		});
};

const markVisibleBlocks = (next: Document): HTMLElement[] => {
	const marked: HTMLElement[] = [];
	const top = -MARGIN;
	const bottom = innerHeight + MARGIN;
	const blocks = document.querySelectorAll<HTMLElement>(`main ${BLOCKS}`);
	const twins = next.querySelectorAll<HTMLElement>(`main ${BLOCKS}`);
	const paired = twins.length === blocks.length;
	blocks.forEach((el, i) => {
		if (paired && twins[i]?.textContent === el.textContent) return;
		if (el.closest(STILL) || el.hasAttribute('data-swap-shell')) return;
		if (el.closest('[inert]')) return;
		if (el.parentElement?.closest(`.${SWAP_CLASS}`)) return;
		const shown = el.checkVisibility?.({
			opacityProperty: true,
			visibilityProperty: true,
		});
		if (shown === false) return;
		const r = el.getBoundingClientRect();
		if (r.bottom < top || r.top > bottom || r.width === 0) return;
		el.classList.add(SWAP_CLASS);
		marked.push(el);
	});
	return marked;
};

const isField = (node: Node): node is HTMLInputElement | HTMLTextAreaElement =>
	node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement;

const morph = (next: Document) => {
	const typed = new Map<Node, string>();
	Idiomorph.morph(document.body, next.body, {
		ignoreActiveValue: true,
		restoreFocus: true,
		callbacks: {
			beforeAttributeUpdated: (name: string) => !JS_OWNED.has(name),
			beforeNodeAdded: (node: Node) => !(node instanceof HTMLScriptElement),
			beforeNodeMorphed: (node: Node) => {
				if (isField(node)) typed.set(node, node.value);
				return undefined;
			},
			afterNodeMorphed: (node: Node) => {
				const value = typed.get(node);
				if (value !== undefined && isField(node) && node.value !== value) {
					node.value = value;
				}
			},
		},
	});
};

const anchorOf = (): { el: Element; top: number } | undefined => {
	for (const el of document.querySelectorAll(`main ${BLOCKS}`)) {
		if (el.closest(STILL)) continue;
		const r = el.getBoundingClientRect();
		if (r.bottom > 0 && r.height > 0) return { el, top: r.top };
	}
	return undefined;
};

const keepAnchor = (anchor: { el: Element; top: number } | undefined) => {
	if (!anchor?.el.isConnected) return;
	const delta = anchor.el.getBoundingClientRect().top - anchor.top;
	if (Math.abs(delta) > 1) scrollBy(0, delta);
};

const fallbackFor = (target: URL, lang: string): string => {
	const root = lang === 'es' ? '/es/' : '/';
	return target.pathname.includes('/columns/') ? `${root}columns/` : root;
};

export async function swapEdition(link: HTMLAnchorElement): Promise<void> {
	const target = new URL(link.href);
	const lang = target.searchParams.get('lang') === 'es' ? 'es' : 'en';
	target.searchParams.delete('lang');
	link.setAttribute('aria-busy', 'true');
	rememberEdition(lang);
	try {
		const res = await fetch(target.pathname + target.search, {
			headers: { Accept: 'text/html' },
		});
		if (!res.ok) {
			location.href = fallbackFor(target, lang);
			return;
		}
		const next = new DOMParser().parseFromString(await res.text(), 'text/html');
		const anchor = anchorOf();
		const refocus =
			document.activeElement instanceof HTMLElement &&
			document.activeElement.hasAttribute('data-edition-switch');
		const apply = () => {
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
			syncHead(next);
			morph(next);
			keepAnchor(anchor);
			if (refocus) {
				document
					.querySelector<HTMLElement>('[data-edition-switch]')
					?.focus({ preventScroll: true });
			}
		};
		const animate =
			typeof document.startViewTransition === 'function' &&
			!matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (animate) {
			const marked = markVisibleBlocks(next);
			const transition = document.startViewTransition(apply);
			try {
				await transition.finished;
			} finally {
				for (const el of marked) el.classList.remove(SWAP_CLASS);
			}
		} else {
			apply();
		}
		history.replaceState(
			null,
			'',
			target.pathname + target.search + location.hash,
		);
		document.dispatchEvent(
			new CustomEvent('edition:swapped', { detail: { lang } }),
		);
	} catch {
		location.href = link.href;
	} finally {
		link.removeAttribute('aria-busy');
	}
}

export function initEdition(): void {
	let busy = false;
	for (const link of document.querySelectorAll<HTMLAnchorElement>(
		'a[data-edition-switch]',
	)) {
		link.addEventListener('click', (event) => {
			if (
				event.defaultPrevented ||
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey
			)
				return;
			event.preventDefault();
			if (busy) return;
			busy = true;
			swapEdition(link).finally(() => {
				busy = false;
			});
		});
	}
}
