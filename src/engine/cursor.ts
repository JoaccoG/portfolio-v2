export function initCursor(): void {
	if (!matchMedia('(pointer: fine)').matches) return;
	const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const doc = document.documentElement;
	const dot = document.querySelector<HTMLElement>('[data-cursor-dot]');
	const ring = document.querySelector<HTMLElement>('[data-cursor-ring]');
	if (!dot || !ring) return;
	doc.style.setProperty('--curCur', 'none');
	doc.style.setProperty('--curO', '1');
	addEventListener('pageshow', (e) => {
		if (!e.persisted) return;
		doc.style.setProperty('--curCur', 'auto');
		setTimeout(() => doc.style.setProperty('--curCur', 'none'), 60);
	});
	let mx = -60;
	let my = -60;
	let dx = -60;
	let dy = -60;
	let rx = -60;
	let ry = -60;
	addEventListener(
		'mousemove',
		(e) => {
			mx = e.clientX;
			my = e.clientY;
		},
		{ passive: true },
	);
	document.addEventListener('mouseover', (e) => {
		const el = e.target instanceof Element ? e.target : null;
		const field = el?.closest('input, textarea') ?? null;
		const target = el?.closest('[data-cur]') ?? null;
		dot.style.setProperty('--cdo', target || field ? '0' : '1');
		if (field) ring.style.setProperty('--curO', '0');
		else ring.style.removeProperty('--curO');
		if (target) {
			ring.style.setProperty('--crs', '1.55');
			ring.style.setProperty('--crc', 'var(--acc, #b4342a)');
			ring.style.setProperty('--cf', '1');
		} else {
			ring.style.setProperty('--crs', '1');
			ring.style.removeProperty('--crc');
			ring.style.setProperty('--cf', '0');
		}
	});
	const df = rm ? 1 : 0.55;
	const rf = rm ? 1 : 0.16;
	const loop = () => {
		requestAnimationFrame(loop);
		dx += (mx - dx) * df;
		dy += (my - dy) * df;
		rx += (mx - rx) * rf;
		ry += (my - ry) * rf;
		dot.style.setProperty('--cdx', `${Math.round(dx * 10) / 10}px`);
		dot.style.setProperty('--cdy', `${Math.round(dy * 10) / 10}px`);
		ring.style.setProperty('--crx', `${Math.round(rx * 10) / 10}px`);
		ring.style.setProperty('--cry', `${Math.round(ry * 10) / 10}px`);
	};
	requestAnimationFrame(loop);
}
