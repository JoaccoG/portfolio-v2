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

export function profileVars(pp: number): Record<string, string> {
	const vars: Record<string, string> = {};
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
	return vars;
}

export const finaleRamp = (s: number, finTop: number, vh: number): number =>
	Math.round(ss(cl(s, finTop - vh, finTop - vh * 0.25)) * 1000) / 1000;

const setter = (el: HTMLElement) => {
	const cache = new Map<string, string>();
	return (k: string, v: string) => {
		if (cache.get(k) !== v) {
			cache.set(k, v);
			el.style.setProperty(k, v);
		}
	};
};

export function initEngine(): { measure: () => void } | undefined {
	const content = document.querySelector<HTMLElement>(
		'[data-engine="content"]',
	);
	if (!content) return undefined;
	const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const hero = document.querySelector<HTMLElement>('[data-hero]');
	const prof = document.querySelector<HTMLElement>('[data-sec="profile"]');
	const board = prof?.querySelector<HTMLElement>('[data-board]') ?? null;
	const fin = document.querySelector<HTMLElement>('[data-sec="finale"]');
	const progress = document.querySelector<HTMLElement>('[data-progress]');
	const cue = document.querySelector<HTMLElement>('[data-cue]');
	const svHero = hero ? setter(hero) : undefined;
	const svProf = prof ? setter(prof) : undefined;
	const svFin = fin ? setter(fin) : undefined;
	const svCue = cue ? setter(cue) : undefined;
	const visible = new Set<Element>();
	const fluid = matchMedia('(hover: hover) and (pointer: fine)').matches;
	let vh = innerHeight;
	let lastW = 0;
	let mx = 1;
	let profTop = 0;
	let travel = 1;
	let finTop = 0;
	let lastPg = '';
	let scheduled = false;
	const update = () => {
		scheduled = false;
		const s = Math.max(0, window.scrollY);
		if (progress) {
			const pg = String(Math.round(cl(s, 0, mx) * 1000) / 1000);
			if (pg !== lastPg) {
				lastPg = pg;
				progress.style.transform = `scaleX(${pg})`;
			}
		}
		svCue?.('--cue', s > 60 ? '0' : '1');
		if (svHero && hero && visible.has(hero)) {
			svHero('--hp', String(Math.round(cl(s, 0, vh) * 1000) / 1000));
		}
		if (svProf && prof && visible.has(prof)) {
			const pp = Math.round(cl(s - profTop, 0, travel) * 1000) / 1000;
			const vars = profileVars(pp);
			for (const k in vars) {
				const v = vars[k];
				if (v !== undefined) svProf(k, v);
			}
		}
		if (svFin && fin && visible.has(fin)) {
			svFin('--fp', String(finaleRamp(s, finTop, vh)));
		}
	};
	const schedule = () => {
		if (!scheduled) {
			scheduled = true;
			requestAnimationFrame(update);
		}
	};
	const measure = () => {
		if (fluid || innerWidth !== lastW) {
			lastW = innerWidth;
			vh = innerHeight;
			prof?.style.setProperty('--board-h', `${vh}px`);
		}
		mx = Math.max(1, document.documentElement.scrollHeight - innerHeight);
		if (prof) {
			profTop = docTop(prof);
			travel = Math.max(1, prof.offsetHeight - (board?.offsetHeight ?? vh));
		}
		if (fin) finTop = docTop(fin);
		schedule();
	};
	const io = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) visible.add(entry.target);
			else visible.delete(entry.target);
		}
		schedule();
	});
	for (const el of [hero, prof, fin]) if (el) io.observe(el);
	for (const btn of document.querySelectorAll<HTMLElement>('[data-target]')) {
		btn.addEventListener('click', () => {
			const el = document.querySelector<HTMLElement>(
				`[data-goto="${btn.dataset.target}"]`,
			);
			if (!el) return;
			window.scrollTo({
				top: Math.max(0, docTop(el) - 8),
				behavior: rm ? 'auto' : 'smooth',
			});
		});
	}
	const portrait = document.querySelector<HTMLElement>('[data-portrait]');
	if (portrait && matchMedia('(hover: none)').matches) {
		portrait.addEventListener('click', () => {
			const on = portrait.style.getPropertyValue('--mo') === '1';
			portrait.style.setProperty('--mo', on ? '0' : '1');
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
