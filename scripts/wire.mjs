const PROD = '[Prod] Portfolio v2 - The Columns';
const SEGMENTS = {
	prod: { en: PROD, es: `${PROD} ES` },
	staging: {
		en: '[Staging] Portfolio v2 - The Columns',
		es: '[Staging] Portfolio v2 - The Columns',
	},
};
const EDITIONS = [
	['en', ''],
	['es', '/es'],
];

const [slug, ...flags] = process.argv.slice(2);
const staging = flags.includes('--staging');
const site = (
	flags.find((flag) => flag.startsWith('--site='))?.slice(7) ??
	'https://joaquingodoy.com'
).replace(/\/$/, '');
const key = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM;

const fail = (message) => {
	console.error(`✗ ${message}`);
	process.exit(1);
};

if (!slug || slug.startsWith('--')) {
	fail('usage: npm run wire -- <column-slug> [--staging] [--site=<origin>]');
}
if (!key) fail('RESEND_API_KEY is missing from .env');
if (!from || from.includes('resend.dev')) {
	fail('RESEND_FROM must be an address on the verified domain');
}

const resend = async (path, init = {}) => {
	const res = await fetch(`https://api.resend.com${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${key}`,
			'Content-Type': 'application/json',
			...init.headers,
		},
	});
	const body = await res.json().catch(() => null);
	if (!res.ok) fail(`Resend ${path} → ${res.status} ${JSON.stringify(body)}`);
	return body;
};

const names = SEGMENTS[staging ? 'staging' : 'prod'];
const segments = new Map(
	(await resend('/segments')).data.map((segment) => [segment.name, segment.id]),
);
const drafted = new Set(
	(await resend('/broadcasts')).data.map((broadcast) => broadcast.name),
);

const mails = [];
for (const [lang, prefix] of EDITIONS) {
	const url = `${site}${prefix}/columns/${slug}/wire.json`;
	const res = await fetch(url).catch(() => null);
	if (!res?.ok) fail(`${url} is not live (${res?.status ?? 'unreachable'})`);
	const segment = segments.get(names[lang]);
	if (!segment) fail(`segment "${names[lang]}" not found in Resend`);
	const name = `${staging ? '[Staging] ' : ''}${slug} · ${lang.toUpperCase()}`;
	if (drafted.has(name)) fail(`a broadcast named "${name}" already exists`);
	mails.push({ lang, name, segment, mail: await res.json() });
}

for (const { lang, name, segment, mail } of mails) {
	const { id } = await resend('/broadcasts', {
		method: 'POST',
		body: JSON.stringify({
			name,
			segment_id: segment,
			from,
			subject: mail.subject,
			html: mail.html,
			text: mail.text,
		}),
	});
	console.log(
		`✓ ${lang.toUpperCase()} draft "${mail.subject}" → https://resend.com/broadcasts/${id}`,
	);
}
console.log('Nothing was sent. Review each draft in Resend and press Send.');
