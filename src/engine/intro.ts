import { cl, ss } from './engine';

export type IntroHooks = { onSettled?: () => void };

const LOAD_END = 1450;
const SPIN = 2200;
const TURN = 450;

const outCubic = (t: number) => 1 - (1 - t) ** 3;
const inOutCubic = (t: number) =>
	t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;

const spinPose = (p: number): string => {
	const turn = -TURN * (1 - outCubic(p));
	const size =
		0.04 + 0.96 * inOutCubic(p) + 0.018 * Math.sin(Math.PI * cl(p, 0.82, 1));
	return `rotate(${turn.toFixed(2)}deg) scale(${size.toFixed(4)})`;
};

export function initIntro(hooks: IntroHooks = {}): void {
	const doc = document.documentElement;
	const main = document.querySelector<HTMLElement>('main');
	const stack = document.querySelector<HTMLElement>('.stack');
	const last = new Map<string, string>();
	const sv = (k: string, v: string) => {
		if (last.get(k) === v) return;
		last.set(k, v);
		doc.style.setProperty(k, v);
	};
	let done = false;
	let inkRestored = false;
	const restoreCursorInk = () => {
		if (inkRestored) return;
		inkRestored = true;
		doc.style.removeProperty('--cInk');
		doc.style.removeProperty('--crc');
	};
	const settle = () => {
		if (done) return;
		done = true;
		sv('--preO', '0');
		sv('--prePE', 'none');
		delete doc.dataset.intro;
		if (stack) {
			stack.style.transform = '';
			stack.style.opacity = '';
		}
		sv('--mh', '1');
		doc.style.overflow = '';
		if (main) main.inert = false;
		restoreCursorInk();
		hooks.onSettled?.();
	};
	if (doc.dataset.intro !== 'play') {
		settle();
		return;
	}
	sv('--preO', '1');
	sv('--prePE', 'auto');
	sv('--mh', '0');
	sv('--cInk', '#e9e0cc');
	sv('--crc', 'rgba(233, 224, 204, 0.65)');
	doc.style.overflow = 'hidden';
	if (main) main.inert = true;
	window.scrollTo(0, 0);
	const counter = document.querySelector<HTMLElement>('[data-precnt]');
	const t0 = performance.now();
	const end = LOAD_END + SPIN;
	const fallback = setTimeout(settle, end + 1500);
	let inked = false;
	const tick = (t: number) => {
		if (done) return;
		const el = t - t0;
		const load = ss(cl(el, 250, LOAD_END));
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
		if (el >= LOAD_END) {
			if (!inked) {
				inked = true;
				sv('--mh', '1');
			}
			const p = cl(el, LOAD_END, end);
			if (stack) {
				stack.style.transform = spinPose(p);
				stack.style.opacity = String(cl(p, 0, 0.2));
			}
		}
		if (el >= end) {
			clearTimeout(fallback);
			settle();
			return;
		}
		requestAnimationFrame(tick);
	};
	requestAnimationFrame(tick);
}
