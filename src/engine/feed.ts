export function initFeed(): void {
	const list = document.querySelector<HTMLElement>('[data-list]');
	const chips = document.querySelector<HTMLElement>('[data-chips]');
	if (!list || !chips) return;
	let current = '';
	const count = (n: number): string => {
		const words: string[] = JSON.parse(list.dataset.words ?? '[]');
		const one = list.dataset.countOne ?? '{n}';
		const many = list.dataset.countMany ?? '{n}';
		return (n === 1 ? one : many).replace('{n}', words[n] ?? String(n));
	};
	const apply = (heading: string) => {
		current = heading;
		const perYear = new Map<string, number>();
		let shown = 0;
		for (const row of list.querySelectorAll<HTMLElement>('[data-row]')) {
			const on =
				!heading || (row.dataset.headings ?? '').split(' ').includes(heading);
			row.hidden = !on;
			if (!on) continue;
			shown++;
			const year = row.dataset.year ?? '';
			perYear.set(year, (perYear.get(year) ?? 0) + 1);
		}
		for (const head of list.querySelectorAll<HTMLElement>('[data-year-head]')) {
			const n = perYear.get(head.dataset.yearHead ?? '') ?? 0;
			head.hidden = n === 0;
			const label = head.querySelector<HTMLElement>('[data-year-count]');
			if (label) label.textContent = count(n);
		}
		const empty = list.querySelector<HTMLElement>('[data-empty]');
		if (empty) empty.hidden = shown > 0;
		for (const button of chips.querySelectorAll<HTMLButtonElement>(
			'[data-heading]',
		)) {
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
	chips.addEventListener('click', (event) => {
		const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
			'[data-heading]',
		);
		if (button) apply(button.dataset.heading ?? '');
	});
	document.addEventListener('edition:swapped', () => apply(current));
	const initial = new URLSearchParams(location.search).get('heading') ?? '';
	const known = [...chips.querySelectorAll<HTMLElement>('[data-heading]')].some(
		(b) => b.dataset.heading === initial,
	);
	if (initial && known) apply(initial);
}
