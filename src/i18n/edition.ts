import { copyFor } from './t';

export function editionDate(
	locale: string | undefined,
	now: Date = new Date(),
): string {
	const m = copyFor(locale).masthead;
	return m.dateTemplate
		.replace('{month}', m.months[now.getMonth()] ?? '')
		.replace('{day}', String(now.getDate()))
		.replace('{year}', String(now.getFullYear() - 100));
}
