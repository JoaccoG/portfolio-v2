import node from '@astrojs/node';
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
	output: 'static',
	adapter: node({ mode: 'standalone' }),
	env: {
		schema: {
			RESEND_API_KEY: envField.string({
				context: 'server',
				access: 'secret',
			}),
		},
	},
});
