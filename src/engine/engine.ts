export type Measures = {
	profTop?: number;
	profH: number;
	finTop?: number;
	vh: number;
};

export const cl = (v: number, a: number, b: number): number =>
	Math.min(1, Math.max(0, (v - a) / (b - a)));

export const ss = (t: number): number => t * t * (3 - 2 * t);

export const docTop = (start: HTMLElement): number => {
	let top = 0;
	let el: HTMLElement | null = start;
	while (el) {
		top += el.offsetTop;
		el = el.offsetParent as HTMLElement | null;
	}
	return top;
};

export function frameVars(s: number, m: Measures): Record<string, string> {
	const vars: Record<string, string> = {
		'--sY': String(Math.round(s * 10) / 10),
		'--hp': String(Math.round(cl(s, 0, m.vh) * 1000) / 1000),
		'--cue': s > 60 ? '0' : '1',
	};
	if (m.profTop !== undefined) {
		const travel = Math.max(1, m.profH - m.vh);
		const pin = Math.min(travel, Math.max(0, s - m.profTop));
		vars['--pin'] = String(Math.round(pin * 10) / 10);
		const pp = pin / travel;
		const active = Math.min(3, Math.floor(pp * 4));
		for (let i = 0; i < 4; i++) {
			const a = i * 0.25;
			const b = a + 0.25;
			const rise = i === 0 ? 1 : ss(cl(pp, a - 0.03, a + 0.045));
			const fall = i === 3 ? 0 : ss(cl(pp, b - 0.045, b + 0.03));
			vars[`--pc${i}`] = String(Math.round(rise * (1 - fall) * 1000) / 1000);
			vars[`--ptk${i}`] =
				i === active ? 'var(--acc, #b4342a)' : 'rgba(28, 23, 16, 0.25)';
		}
	}
	if (m.finTop !== undefined) {
		vars['--fp'] = String(
			Math.round(ss(cl(s, m.finTop - m.vh, m.finTop - m.vh * 0.25)) * 1000) /
				1000,
		);
	}
	return vars;
}

export function initEngine(): { measure: () => void } | undefined {
	const doc = document.documentElement;
	const content = document.querySelector<HTMLElement>(
		'[data-engine="content"]',
	);
	if (!content) return undefined;
	const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const prof = document.querySelector<HTMLElement>('[data-sec="profile"]');
	const fin = document.querySelector<HTMLElement>('[data-sec="finale"]');
	const cache = new Map<string, string>();
	const sv = (k: string, v: string) => {
		if (cache.get(k) !== v) {
			cache.set(k, v);
			doc.style.setProperty(k, v);
		}
	};
	const measures: Measures = { profH: 0, vh: innerHeight };
	const measure = () => {
		measures.vh = innerHeight;
		sv('--docH', String(Math.max(content.offsetHeight, innerHeight + 10)));
		if (prof) {
			measures.profTop = docTop(prof);
			measures.profH = prof.offsetHeight;
		}
		if (fin) measures.finTop = docTop(fin);
	};
	let s = 0;
	let vk = 0;
	const loop = () => {
		requestAnimationFrame(loop);
		const max = Math.max(1, doc.scrollHeight - innerHeight);
		const target = Math.min(max, Math.max(0, window.scrollY || doc.scrollTop));
		const prev = s;
		s += (target - s) * (rm ? 1 : 0.095);
		if (Math.abs(target - s) < 0.05) s = target;
		const vkTarget = rm ? 0 : Math.max(-1.2, Math.min(1.2, (s - prev) * 0.012));
		vk += (vkTarget - vk) * 0.12;
		if (Math.abs(vk) < 0.002) vk = 0;
		sv('--vk', String(Math.round(vk * 100) / 100));
		sv('--pg', String(Math.round((target / max) * 1000) / 1000));
		const vars = frameVars(s, measures);
		for (const k in vars) {
			const v = vars[k];
			if (v !== undefined) sv(k, v);
		}
	};
	for (const btn of document.querySelectorAll<HTMLElement>('[data-target]')) {
		btn.addEventListener('click', () => {
			const el = document.querySelector<HTMLElement>(
				`[data-goto="${btn.dataset.target}"]`,
			);
			if (!el) return;
			window.scrollTo({ top: Math.max(0, docTop(el) - 8), behavior: 'auto' });
		});
	}
	addEventListener('resize', measure);
	if (document.fonts) document.fonts.ready.then(measure);
	new ResizeObserver(measure).observe(content);
	measure();
	requestAnimationFrame(loop);
	return { measure };
}
