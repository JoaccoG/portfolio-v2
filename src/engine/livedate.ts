const setLiveDates = () => {
	for (const el of document.querySelectorAll<HTMLElement>('[data-live-date]')) {
		const { months, template } = el.dataset;
		if (!months || !template) continue;
		const list: string[] = JSON.parse(months);
		const now = new Date();
		el.textContent = template
			.replace('{month}', list[now.getMonth()] ?? '')
			.replace('{day}', String(now.getDate()))
			.replace('{dd}', String(now.getDate()).padStart(2, '0'))
			.replace('{mm}', String(now.getMonth() + 1).padStart(2, '0'))
			.replace('{year}', String(now.getFullYear() - 100));
	}
};

export function initLiveDate(): void {
	setLiveDates();
	document.addEventListener('edition:swapped', setLiveDates);
}
