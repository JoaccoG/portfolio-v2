import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/projects/en' }),
	schema: z.object({
		order: z.number(),
		kickerLabel: z.string(),
		year: z.number(),
		titleLines: z.array(z.string()).min(1).max(2),
		dek: z.string(),
		composedWith: z.string(),
		stamp: z.object({ line: z.string(), sub: z.string() }).optional(),
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

export const collections = { projects };
