export function initLiveDate(): void {
	for (const el of document.querySelectorAll<HTMLElement>('[data-live-date]')) {
		const { months, template } = el.dataset;
		if (!months || !template) continue;
		const list: string[] = JSON.parse(months);
		const now = new Date();
		el.textContent = template
			.replace('{month}', list[now.getMonth()] ?? '')
			.replace('{day}', String(now.getDate()))
			.replace('{year}', String(now.getFullYear() - 100));
	}
}
