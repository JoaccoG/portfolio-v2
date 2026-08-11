export function initFeed(): void {
	const list = document.querySelector<HTMLElement>('[data-list]');
	const chips = document.querySelector<HTMLElement>('[data-chips]');
	if (!list || !chips) return;
	const rows = [...list.querySelectorAll<HTMLElement>('[data-row]')];
	const heads = [...list.querySelectorAll<HTMLElement>('[data-year-head]')];
	const empty = list.querySelector<HTMLElement>('[data-empty]');
	const buttons = [
		...chips.querySelectorAll<HTMLButtonElement>('[data-heading]'),
	];
	const words: string[] = JSON.parse(list.dataset.words ?? '[]');
	const one = list.dataset.countOne ?? '{n}';
	const many = list.dataset.countMany ?? '{n}';
	const count = (n: number) =>
		(n === 1 ? one : many).replace('{n}', words[n] ?? String(n));

	const apply = (heading: string) => {
		let shown = 0;
		const perYear = new Map<string, number>();
		for (const row of rows) {
			const on = !heading || row.dataset.heading === heading;
			row.hidden = !on;
			if (!on) continue;
			shown++;
			const year = row.dataset.year ?? '';
			perYear.set(year, (perYear.get(year) ?? 0) + 1);
		}
		for (const head of heads) {
			const n = perYear.get(head.dataset.yearHead ?? '') ?? 0;
			head.hidden = n === 0;
			const label = head.querySelector<HTMLElement>('[data-year-count]');
			if (label) label.textContent = count(n);
		}
		if (empty) empty.hidden = shown > 0;
		for (const button of buttons) {
			button.setAttribute(
				'aria-pressed',
				String((button.dataset.heading ?? '') === heading),
			);
		}
		const url = new URL(location.href);
		if (heading) url.searchParams.set('heading', heading);
		else url.searchParams.delete('heading');
		history.replaceState(null, '', url);
	};

	for (const button of buttons) {
		button.addEventListener('click', () => apply(button.dataset.heading ?? ''));
	}
	const initial = new URL(location.href).searchParams.get('heading') ?? '';
	if (initial && buttons.some((b) => b.dataset.heading === initial)) {
		apply(initial);
	}
}
