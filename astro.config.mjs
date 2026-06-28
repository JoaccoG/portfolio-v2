// @ts-check
import node from '@astrojs/node';
import { defineConfig } from 'astro/config';

// Static-first: every page prerenders; only routes that opt out with
// `export const prerender = false` (the postcard endpoint) run on the
// node server that Railway hosts.
export default defineConfig({
	output: 'static',
	adapter: node({ mode: 'standalone' }),
});
