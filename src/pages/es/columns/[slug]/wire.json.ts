import type { APIRoute, GetStaticPaths } from 'astro';
import { type Column, columnSlug, getColumns } from '../../../../lib/columns';
import { wireMail } from '../../../../lib/wire-mail';

export const getStaticPaths = (async () => {
	const columns = await getColumns('es');
	return columns.map((column, index) => ({
		params: { slug: columnSlug(column) },
		props: { column, index, total: columns.length },
	}));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) => {
	const { column, index, total } = props as {
		column: Column;
		index: number;
		total: number;
	};
	const mail = wireMail(
		column,
		index,
		total,
		'es',
		site ?? new URL('https://joaquingodoy.com'),
	);
	return new Response(JSON.stringify(mail), {
		headers: { 'Content-Type': 'application/json' },
	});
};
