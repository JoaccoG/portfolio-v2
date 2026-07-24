import { cl, docTop, finaleRamp, profileVars } from './engine';

const setter = (el: HTMLElement) => {
	const cache = new Map<string, string>();
	return (k: string, v: string) => {
		if (cache.get(k) !== v) {
			cache.set(k, v);
			el.style.setProperty(k, v);
		}
	};
};

export function initNativeEngine(): { measure: () => void } | undefined {
	const content = document.querySelector<HTMLElement>(
		'[data-engine="content"]',
	);
	if (!content) return undefined;
	const prof = document.querySelector<HTMLElement>('[data-sec="profile"]');
	const board = prof?.querySelector<HTMLElement>('[data-board]') ?? null;
	const fin = document.querySelector<HTMLElement>('[data-sec="finale"]');
	const progress = document.querySelector<HTMLElement>('[data-progress]');
	const cue = document.querySelector<HTMLElement>('[data-cue]');
	const svProf = prof ? setter(prof) : undefined;
	const svFin = fin ? setter(fin) : undefined;
	const svCue = cue ? setter(cue) : undefined;
	let vh = innerHeight;
	let mx = 1;
	let profTop = 0;
	let travel = 1;
	let finTop = 0;
	let profVis = false;
	let finVis = false;
	let lastPg = '';
	let scheduled = false;
	const update = () => {
		scheduled = false;
		const s = window.scrollY;
		if (progress) {
			const pg = String(Math.round(cl(s, 0, mx) * 1000) / 1000);
			if (pg !== lastPg) {
				lastPg = pg;
				progress.style.transform = `scaleX(${pg})`;
			}
		}
		svCue?.('--cue', s > 60 ? '0' : '1');
		if (svProf && profVis) {
			const pp = Math.round(cl(s - profTop, 0, travel) * 1000) / 1000;
			const vars = profileVars(pp);
			for (const k in vars) {
				const v = vars[k];
				if (v !== undefined) svProf(k, v);
			}
		}
		if (svFin && finVis) svFin('--fp', String(finaleRamp(s, finTop, vh)));
	};
	const schedule = () => {
		if (!scheduled) {
			scheduled = true;
			requestAnimationFrame(update);
		}
	};
	const measure = () => {
		vh = innerHeight;
		mx = Math.max(1, document.documentElement.scrollHeight - vh);
		if (prof) {
			profTop = docTop(prof);
			travel = Math.max(1, prof.offsetHeight - (board?.offsetHeight ?? vh));
		}
		if (fin) finTop = docTop(fin);
		schedule();
	};
	const io = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.target === prof) profVis = entry.isIntersecting;
			if (entry.target === fin) finVis = entry.isIntersecting;
		}
		schedule();
	});
	if (prof) io.observe(prof);
	if (fin) io.observe(fin);
	for (const btn of document.querySelectorAll<HTMLElement>('[data-target]')) {
		btn.addEventListener('click', () => {
			const el = document.querySelector<HTMLElement>(
				`[data-goto="${btn.dataset.target}"]`,
			);
			if (!el) return;
			window.scrollTo({
				top: Math.max(0, docTop(el) - 8),
				behavior: 'smooth',
			});
		});
	}
	addEventListener('scroll', schedule, { passive: true });
	const vv = window.visualViewport;
	if (vv) vv.addEventListener('resize', measure);
	else addEventListener('resize', measure);
	if (document.fonts) document.fonts.ready.then(measure);
	new ResizeObserver(measure).observe(content);
	measure();
	return { measure };
}
