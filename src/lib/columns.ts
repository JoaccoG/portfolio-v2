import { type CollectionEntry, getCollection } from 'astro:content';
import { copyFor, localeOf } from '../i18n/t';

export type Column = CollectionEntry<'columns'>;
type Locale = string | undefined;

const WPM = 230;
const ROMAN: [number, string][] = [
	[100, 'C'],
	[90, 'XC'],
	[50, 'L'],
	[40, 'XL'],
	[10, 'X'],
	[9, 'IX'],
	[5, 'V'],
	[4, 'IV'],
	[1, 'I'],
];

export function roman(n: number): string {
	let rest = n;
	let out = '';
	for (const [value, glyph] of ROMAN) {
		while (rest >= value) {
			out += glyph;
			rest -= value;
		}
	}
	return out;
}

export const numberWord = (n: number, locale: Locale): string =>
	copyFor(locale).machinery.numberWords[n] ?? String(n);

export const countLabel = (n: number, locale: Locale): string => {
	const c = copyFor(locale).columns.count;
	return (n === 1 ? c.one : c.many).replace('{n}', numberWord(n, locale));
};

const minutesOf = (words: number): number =>
	Math.max(1, Math.round(words / WPM));

export const readingLabel = (words: number, locale: Locale): string => {
	const c = copyFor(locale).columns.reading;
	const minutes = minutesOf(words);
	return (minutes === 1 ? c.one : c.many).replace(
		'{n}',
		numberWord(minutes, locale),
	);
};

export const readingShortLabel = (words: number, locale: Locale): string => {
	const c = copyFor(locale).columns.readingShort;
	const minutes = minutesOf(words);
	return (minutes === 1 ? c.one : c.many).replace(
		'{n}',
		numberWord(minutes, locale),
	);
};

export const wordsLabel = (words: number, locale: Locale): string =>
	copyFor(locale).columns.words.replace(
		'{n}',
		words.toLocaleString(localeOf(locale) === 'es' ? 'es-AR' : 'en-US'),
	);

export const longDate = (date: Date, locale: Locale): string => {
	const m = copyFor(locale).masthead;
	return m.dateTemplate
		.replace('{month}', m.months[date.getUTCMonth()] ?? '')
		.replace('{day}', String(date.getUTCDate()))
		.replace('{dd}', String(date.getUTCDate()).padStart(2, '0'))
		.replace('{mm}', String(date.getUTCMonth() + 1).padStart(2, '0'))
		.replace('{year}', String(date.getUTCFullYear() - 100));
};

export const shortDate = (date: Date, locale: Locale): string => {
	const m = copyFor(locale).masthead;
	return `${date.getUTCDate()} ${(m.months[date.getUTCMonth()] ?? '').slice(0, 3)} ${date.getUTCFullYear() - 100}`;
};

export const editionYear = (date: Date): string =>
	String(date.getUTCFullYear() - 100);

export const headingLabel = (key: string, locale: Locale): string =>
	(copyFor(locale).columns.headings as Record<string, string>)[key] ?? key;

export const headingLabels = (keys: string[], locale: Locale): string =>
	keys.map((key) => headingLabel(key, locale)).join(' · ');

export const numeralOf = (index: number, total: number): string =>
	roman(total - index);

export const columnSlug = (column: Column): string =>
	column.id.slice(column.id.indexOf('/') + 1);

export async function getColumns(locale: Locale): Promise<Column[]> {
	const prefix = `${localeOf(locale)}/`;
	const all = await getCollection(
		'columns',
		({ id, data }) => !data.draft && id.startsWith(prefix),
	);
	return all.sort(
		(a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
	);
}

export function wordCount(column: Column): number {
	const prose = (column.body ?? '')
		.replace(/^import .*$/gm, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\]\([^)]*\)/g, ']')
		.replace(/[#>*_`[\]]/g, ' ');
	return prose.split(/\s+/).filter(Boolean).length;
}
