import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
	site: 'https://joaquingodoy.com',
	output: 'static',
	adapter: node({ mode: 'standalone' }),
	integrations: [mdx(), sitemap()],
	image: {
		endpoint: { route: '/_image', entrypoint: './src/server/no-image.ts' },
	},
	env: {
		schema: {
			RESEND_API_KEY: envField.string({
				context: 'server',
				access: 'secret',
			}),
			RESEND_FROM: envField.string({
				context: 'server',
				access: 'secret',
				default: 'The Daily Godoy <onboarding@resend.dev>',
			}),
			RESEND_SEGMENT_ID: envField.string({
				context: 'server',
				access: 'secret',
				optional: true,
			}),
		},
	},
});
