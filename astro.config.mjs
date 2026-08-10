import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
	site: 'https://joaquingodoy.com',
	output: 'static',
	adapter: node({ mode: 'standalone' }),
	integrations: [mdx(), sitemap()],
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
		},
	},
});
