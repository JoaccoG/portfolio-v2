import { type CollectionEntry, getCollection } from 'astro:content';
import { copy } from '../i18n/t';

export type Column = CollectionEntry<'columns'>;

const WPM = 230;
const m = copy.masthead;
const c = copy.columns;
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

export const numberWord = (n: number): string =>
	copy.machinery.numberWords[n] ?? String(n);

export const countLabel = (n: number): string =>
	(n === 1 ? c.count.one : c.count.many).replace('{n}', numberWord(n));

const minutesOf = (words: number): number =>
	Math.max(1, Math.round(words / WPM));

export const readingLabel = (words: number): string => {
	const minutes = minutesOf(words);
	return (minutes === 1 ? c.reading.one : c.reading.many).replace(
		'{n}',
		numberWord(minutes),
	);
};

export const readingShortLabel = (words: number): string => {
	const minutes = minutesOf(words);
	return (minutes === 1 ? c.readingShort.one : c.readingShort.many).replace(
		'{n}',
		numberWord(minutes),
	);
};

export const wordsLabel = (words: number): string =>
	c.words.replace('{n}', words.toLocaleString('en-US'));

export const longDate = (date: Date): string =>
	m.dateTemplate
		.replace('{month}', m.months[date.getUTCMonth()] ?? '')
		.replace('{day}', String(date.getUTCDate()))
		.replace('{year}', String(date.getUTCFullYear() - 100));

export const shortDate = (date: Date): string =>
	`${date.getUTCDate()} ${(m.months[date.getUTCMonth()] ?? '').slice(0, 3)} ${date.getUTCFullYear() - 100}`;

export const editionYear = (date: Date): string =>
	String(date.getUTCFullYear() - 100);

export const headingLabel = (key: string): string =>
	(c.headings as Record<string, string>)[key] ?? key;

export const numeralOf = (index: number, total: number): string =>
	roman(total - index);

export async function getColumns(): Promise<Column[]> {
	const all = await getCollection('columns', ({ data }) => !data.draft);
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
