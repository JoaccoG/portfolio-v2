import { copyFor, localeOf, localePath } from '../i18n/t';
import {
	type Column,
	columnSlug,
	headingLabels,
	longDate,
	numeralOf,
	readingLabel,
	wordCount,
} from './columns';

const SERIF = "Georgia, 'Times New Roman', serif";
const INK = '#1c1710';
const SOFT = '#3a3222';
const ACC = '#b4342a';
const PAPER = '#f2ead8';
const GROUND = '#0f0c08';
const RULE = '#7a746a';
const FAINT = '#8d8678';
const UNSUBSCRIBE = '{{{RESEND_UNSUBSCRIBE_URL}}}';
const HAND = '&#9758;&#65038;';

export type WireMail = {
	subject: string;
	html: string;
	text: string;
};

const escapeHtml = (value: string): string =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');

const ledeOf = (column: Column): string => {
	const block = (column.body ?? '')
		.split(/\n\s*\n/)
		.map((part) => part.trim())
		.find((part) => part && !/^(import |<|#|>|!\[|```|[-*] )/.test(part));
	return (block ?? '')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[*_`]/g, '')
		.replace(/\s+/g, ' ');
};

const tagged = (url: URL, campaign: string): string => {
	const out = new URL(url);
	out.searchParams.set('utm_source', 'wire');
	out.searchParams.set('utm_medium', 'email');
	out.searchParams.set('utm_campaign', campaign);
	return out.toString();
};

export function wireMail(
	column: Column,
	index: number,
	total: number,
	locale: string,
	site: URL,
): WireMail {
	const lang = localeOf(locale);
	const copy = copyFor(lang);
	const m = copy.columns.wire.mail;
	const slug = columnSlug(column);
	const other = lang === 'es' ? 'en' : 'es';
	const href = tagged(
		new URL(localePath(lang, `/columns/${slug}/`), site),
		slug,
	);
	const otherHref = tagged(
		new URL(localePath(other, `/columns/${slug}/`), site),
		slug,
	);
	const masthead = new URL('/wire/masthead.png', site).toString();
	const { title, dek } = column.data;
	const lede = ledeOf(column);
	const dateline = [
		copy.columns.article.columnNo.replace('{roman}', numeralOf(index, total)),
		headingLabels(column.data.headings, lang),
		longDate(column.data.pubDate, lang).toUpperCase(),
	].join(' · ');
	const reading = readingLabel(wordCount(column), lang);

	const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${GROUND};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${GROUND};">${escapeHtml(dek)}</div>
<div style="background-color:${GROUND};padding:36px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background-color:${PAPER};border:3px double #6d675d;">
<tr><td style="padding:30px 28px 28px;font-family:${SERIF};color:${INK};">
<a href="${href}" style="text-decoration:none;"><img src="${masthead}" width="510" alt="The Daily Godoy" style="display:block;width:100%;max-width:510px;height:auto;margin:0 auto;border:0;font-family:${SERIF};font-size:30px;color:${INK};text-align:center;" /></a>
<hr style="border:none;border-top:1px solid ${INK};margin:14px 0 0;" />
<p style="margin:6px 0 6px;text-align:center;font-size:10px;letter-spacing:2px;color:${INK};">${escapeHtml(dateline)}</p>
<hr style="border:none;border-top:3px double ${RULE};margin:0;" />
<p style="margin:24px 0 0;text-align:center;font-size:11px;letter-spacing:5px;color:${ACC};">${escapeHtml(m.kicker)}</p>
<h1 style="margin:12px 0 0;text-align:center;font-family:${SERIF};font-size:30px;line-height:1.15;font-weight:700;color:${INK};text-wrap:balance;"><a href="${href}" style="color:${INK};text-decoration:none;">${escapeHtml(title)}</a></h1>
<p style="margin:12px 0 0;text-align:center;font-style:italic;font-size:17px;line-height:1.5;color:${SOFT};text-wrap:balance;">${escapeHtml(dek)}</p>
<p style="margin:18px 0 0;text-align:center;color:${ACC};font-size:13px;">&#10022;</p>
<p style="margin:18px 0 0;font-size:16px;line-height:1.75;color:${INK};">${escapeHtml(lede)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px auto 0;"><tr><td style="border:1px solid ${INK};padding:3px;">
<a href="${href}" style="display:block;border:1px solid ${INK};padding:11px 22px;font-family:${SERIF};font-size:12px;letter-spacing:3px;color:${INK};text-decoration:none;">${escapeHtml(m.read)}&nbsp;&nbsp;<span style="color:${ACC};font-size:15px;">${HAND}</span></a>
</td></tr></table>
<p style="margin:12px 0 0;text-align:center;font-style:italic;font-size:11px;letter-spacing:2px;color:${SOFT};">${escapeHtml(reading)}</p>
<hr style="border:none;border-top:1px dotted ${FAINT};margin:26px 0 14px;" />
<p style="margin:0;text-align:center;font-style:italic;font-size:13px;color:${SOFT};"><a href="${otherHref}" style="color:${SOFT};text-decoration:underline;">${escapeHtml(m.other)}</a>&nbsp;<span style="color:${ACC};">${HAND}</span></p>
</td></tr>
</table>
<p style="font-family:${SERIF};font-size:10px;letter-spacing:2px;line-height:1.9;color:${FAINT};margin:18px 0 0;text-align:center;">${escapeHtml(m.why.toUpperCase())}<br /><a href="${UNSUBSCRIBE}" style="color:${FAINT};text-decoration:underline;">${escapeHtml(m.unsubscribe.toUpperCase())}</a></p>
</td></tr></table>
</div>
</body>
</html>`;

	const text = [
		`THE DAILY GODOY — ${m.kicker}`,
		dateline,
		'',
		title,
		dek,
		'',
		lede,
		'',
		`${m.read}: ${href}`,
		reading,
		'',
		`${m.other}: ${otherHref}`,
		'',
		'—',
		m.why,
		`${m.unsubscribe}: ${UNSUBSCRIBE}`,
	].join('\n');

	return { subject: title, html, text };
}
