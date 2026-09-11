import type { APIRoute, GetStaticPaths } from 'astro';
import { columnCard } from '../../../../lib/card';
import { type Column, columnSlug, getColumns } from '../../../../lib/columns';

export const getStaticPaths = (async () => {
	const columns = await getColumns('es');
	return columns.map((column, index) => ({
		params: { slug: columnSlug(column) },
		props: { column, index, total: columns.length },
	}));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
	const { column, index, total } = props as {
		column: Column;
		index: number;
		total: number;
	};
	const png = await columnCard(column, index, total, 'es');
	return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
