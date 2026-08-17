import en from './en.json';
import es from './es.json';

export type Copy = typeof en;
export type Locale = 'en' | 'es';

const copies: Record<Locale, Copy> = { en, es };

export const localeOf = (locale: string | undefined): Locale =>
	locale === 'es' ? 'es' : 'en';

export const copyFor = (locale: string | undefined): Copy =>
	copies[localeOf(locale)];

export const localePath = (locale: string | undefined, path: string): string =>
	localeOf(locale) === 'es' ? `/es${path}` : path;
