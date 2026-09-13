import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { copyFor } from '../i18n/t';
import { type Column, headingLabels, longDate, numeralOf } from './columns';

const W = 1200;
const H = 630;
const CW = 1040;
const CH = 500;
const TILT = -1.4;
const INK = '#1c1710';
const ACC = '#b4342a';
const PAPER = '#f2ead8';
const GROUND = '#0f0c08';

const root = process.cwd();
const asset = (path: string) => readFileSync(join(root, 'src/assets', path));

let fonts: Parameters<typeof satori>[1]['fonts'] | undefined;
const loadFonts = () => {
	fonts ??= [
		{ name: 'Orn', data: asset('cards/tdg-ornaments-400.ttf'), weight: 400 },
		{
			name: 'Unif',
			data: asset('cards/unifrakturmaguntia-400.ttf'),
			weight: 400,
		},
		{ name: 'Abril', data: asset('cards/abril-fatface-400.ttf'), weight: 400 },
		{ name: 'OST', data: asset('cards/old-standard-tt-400.ttf'), weight: 400 },
		{
			name: 'OST',
			data: asset('cards/old-standard-tt-400-italic.ttf'),
			weight: 400,
			style: 'italic',
		},
	];
	return fonts;
};

type Node = { type: string; props: Record<string, unknown> };
const h = (
	type: string,
	style: Record<string, unknown>,
	...children: (Node | string)[]
): Node => ({
	type,
	props: {
		style: { display: 'flex', ...style },
		children: children.length === 1 ? children[0] : children,
	},
});

const caps = {
	fontSize: 15,
	letterSpacing: '0.24em',
};

const headlineSize = (title: string) =>
	title.length > 70 ? 54 : title.length > 46 ? 64 : 78;

const clamp = (text: string, max: number) =>
	text.length <= max ? text : `${text.slice(0, max).replace(/\s+\S*$/, '')}…`;

const seeded = (seed: string) => {
	let s = 0;
	for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
	return () => {
		s = (s * 1664525 + 1013904223) >>> 0;
		return s / 4294967296;
	};
};

const tornPath = (seed: string) => {
	const rnd = seeded(seed);
	const pts: [number, number][] = [];
	const edge = (n: number, at: (t: number, j: number) => [number, number]) => {
		for (let i = 0; i < n; i++) pts.push(at(i / n, rnd() * 9));
	};
	edge(26, (t, j) => [t * CW, j]);
	edge(12, (t, j) => [CW - j * 0.6, t * CH]);
	edge(26, (t, j) => [CW - t * CW, CH - j]);
	edge(12, (t, j) => [j * 0.6, CH - t * CH]);
	return `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L')}Z`;
};

export type CardCopy = {
	seed: string;
	title: string;
	dek: string;
	column: string;
	headings: string;
	date: string;
};

export async function renderCard(copy: CardCopy): Promise<Buffer> {
	const tree = h(
		'div',
		{
			width: CW,
			height: CH,
			flexDirection: 'column',
			padding: '40px 56px',
			color: INK,
			fontFamily: 'Orn, OST',
		},
		h(
			'div',
			{
				justifyContent: 'space-between',
				alignItems: 'flex-end',
				borderBottom: `1px solid ${INK}`,
				paddingBottom: 10,
			},
			h(
				'div',
				{ fontFamily: 'Unif', fontSize: 40, lineHeight: 1 },
				'The Daily Godoy',
			),
			h(
				'div',
				{ ...caps, paddingBottom: 4, gap: 10 },
				h('span', {}, copy.column),
				h('span', {}, '·'),
				h('span', { color: ACC }, copy.headings),
			),
		),
		h(
			'div',
			{
				fontFamily: 'Abril',
				fontSize: headlineSize(copy.title),
				lineHeight: 1.04,
				marginTop: 30,
			},
			copy.title,
		),
		h(
			'div',
			{
				fontStyle: 'italic',
				fontSize: 28,
				lineHeight: 1.3,
				marginTop: 18,
				textWrap: 'balance',
			},
			clamp(copy.dek, 130),
		),
		h(
			'div',
			{ ...caps, marginTop: 'auto', justifyContent: 'space-between' },
			h('span', {}, copy.date.toUpperCase()),
			h(
				'span',
				{ gap: 10 },
				h('span', {}, 'JOAQUINGODOY.COM'),
				h('span', { color: ACC }, '☞'),
			),
		),
	);

	const svg = await satori(tree as never, {
		width: CW,
		height: CH,
		fonts: loadFonts(),
	});
	const text = await sharp(Buffer.from(svg)).png().toBuffer();

	const mottle = await sharp(asset('tex/mul-mottle-19.webp'))
		.resize(1200, 1200)
		.extract({ left: 80, top: 300, width: CW, height: CH })
		.toBuffer();
	const grain = await sharp(asset('tex/mul-grain.webp')).toBuffer();
	const torn = tornPath(copy.seed);
	const mask = Buffer.from(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${CH}"><path d="${torn}" fill="#fff"/></svg>`,
	);

	const clipping = await sharp({
		create: { width: CW, height: CH, channels: 4, background: PAPER },
	})
		.composite([
			{ input: mottle, blend: 'multiply' },
			{ input: grain, tile: true, blend: 'multiply' },
			{ input: text },
			{ input: mask, blend: 'dest-in' },
		])
		.png()
		.toBuffer();

	const shadow = await sharp(
		Buffer.from(
			`<svg xmlns="http://www.w3.org/2000/svg" width="${CW + 100}" height="${CH + 90}"><path transform="translate(50 60)" d="${torn}" fill="rgba(0,0,0,0.85)"/></svg>`,
		),
	)
		.blur(22)
		.png()
		.toBuffer();

	const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
	const tilted = await sharp(clipping)
		.rotate(TILT, { background: transparent })
		.png()
		.toBuffer();
	const tiltedShadow = await sharp(shadow)
		.rotate(TILT, { background: transparent })
		.png()
		.toBuffer();
	const at = async (buf: Buffer) => {
		const m = await sharp(buf).metadata();
		return {
			left: Math.round((W - (m.width ?? 0)) / 2),
			top: Math.round((H - (m.height ?? 0)) / 2),
		};
	};

	return sharp({
		create: { width: W, height: H, channels: 3, background: GROUND },
	})
		.composite([
			{ input: tiltedShadow, ...(await at(tiltedShadow)) },
			{ input: tilted, ...(await at(tilted)) },
		])
		.png({ compressionLevel: 9, palette: false })
		.toBuffer();
}

export async function renderMasthead(): Promise<Buffer> {
	const svg = await satori(
		h(
			'div',
			{
				width: 1040,
				height: 132,
				alignItems: 'center',
				justifyContent: 'center',
				background: PAPER,
				color: INK,
				fontFamily: 'Unif',
				fontSize: 104,
				lineHeight: 1,
			},
			'The Daily Godoy',
		) as never,
		{ width: 1040, height: 132, fonts: loadFonts() },
	);
	return sharp(Buffer.from(svg))
		.png({ compressionLevel: 9, palette: true })
		.toBuffer();
}

export async function columnCard(
	column: Column,
	index: number,
	total: number,
	locale: string,
): Promise<Uint8Array<ArrayBuffer>> {
	const a = copyFor(locale).columns.article;
	const png = await renderCard({
		seed: column.id,
		title: column.data.title,
		dek: column.data.dek,
		column: a.columnNo.replace('{roman}', numeralOf(index, total)),
		headings: headingLabels(column.data.headings, locale),
		date: longDate(column.data.pubDate, locale),
	});
	return new Uint8Array(png);
}
