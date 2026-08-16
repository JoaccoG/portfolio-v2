import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import en from './i18n/en.json';

const projects = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/projects/en' }),
	schema: ({ image }) =>
		z.object({
			order: z.number(),
			kickerLabel: z.string(),
			year: z.number(),
			titleLines: z.array(z.string()).min(1).max(2),
			dek: z.string(),
			composedWith: z.string(),
			stamp: z.object({ line: z.string(), sub: z.string() }).optional(),
			cover: z.object({ src: image(), alt: z.string() }).optional(),
			pageTwo: z
				.object({
					name: z.string(),
					headline: z.string(),
					dek: z.string(),
					figCaption: z.string(),
					figCaptionItalic: z.string(),
					story: z.array(z.string()),
					note: z.string().optional(),
					particulars: z.object({
						role: z.string(),
						year: z.number(),
						composed: z.string(),
						status: z.string(),
					}),
					quote: z.object({ text: z.string(), cite: z.string() }),
					links: z.object({ repo: z.string(), live: z.string() }),
				})
				.optional(),
		}),
});

const headings = Object.keys(en.columns.headings) as [string, ...string[]];

const columns = defineCollection({
	loader: glob({ pattern: '*.mdx', base: './src/content/columns/en' }),
	schema: z.object({
		title: z.string(),
		dek: z.string(),
		headings: z.array(z.enum(headings)).min(1),
		pubDate: z.coerce.date(),
		signoff: z.string(),
		draft: z.boolean().default(false),
	}),
});

export const collections = { projects, columns };
