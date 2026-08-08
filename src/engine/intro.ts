import { cl, ss } from './engine';

export type IntroHooks = { onSettled?: () => void };

export function initIntro(hooks: IntroHooks = {}): void {
	const doc = document.documentElement;
	const sv = (k: string, v: string) => doc.style.setProperty(k, v);
	let done = false;
	const restoreCursorInk = () => {
		doc.style.removeProperty('--cInk');
		doc.style.removeProperty('--crc');
	};
	const settle = () => {
		if (done) return;
		done = true;
		sv('--preO', '0');
		sv('--prePE', 'none');
		sv('--intro', '1');
		delete doc.dataset.intro;
		sv('--mh', '1');
		doc.style.overflow = '';
		restoreCursorInk();
		hooks.onSettled?.();
	};
	if (doc.dataset.intro !== 'play') {
		settle();
		return;
	}
	sv('--preO', '1');
	sv('--prePE', 'auto');
	sv('--intro', '0');
	sv('--mh', '0');
	sv('--cInk', '#e9e0cc');
	sv('--crc', 'rgba(233, 224, 204, 0.65)');
	doc.style.overflow = 'hidden';
	window.scrollTo(0, 0);
	const counter = document.querySelector<HTMLElement>('[data-precnt]');
	const t0 = performance.now();
	const fallback = setTimeout(settle, 3900);
	const tick = (t: number) => {
		if (done) return;
		const el = t - t0;
		const load = ss(cl(el, 250, 1450));
		if (counter) {
			const n = Math.floor(load * 100);
			counter.textContent = (n < 10 ? '0' : '') + n;
		}
		sv('--plw', String(Math.round(load * 1000) / 1000));
		if (el > 1500) {
			sv('--preO', '0');
			sv('--prePE', 'none');
			restoreCursorInk();
		}
		const rise = cl(el, 1550, 3350);
		sv('--intro', String(Math.round((1 - (1 - rise) ** 4) * 1000) / 1000));
		if (el > 3300) {
			clearTimeout(fallback);
			settle();
			return;
		}
		requestAnimationFrame(tick);
	};
	requestAnimationFrame(tick);
}
