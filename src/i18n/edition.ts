import { copy } from './t';

export function editionDate(now: Date = new Date()): string {
	const m = copy.masthead;
	return m.dateTemplate
		.replace('{month}', m.months[now.getMonth()] ?? '')
		.replace('{day}', String(now.getDate()))
		.replace('{year}', String(now.getFullYear() - 100));
}
