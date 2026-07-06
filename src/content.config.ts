import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/projects/en' }),
	schema: z.object({
		order: z.number(),
		kickerLabel: z.string(),
		year: z.number(),
		titleLines: z.array(z.string()).length(2),
		dek: z.string(),
		composedWith: z.string(),
		deepDive: z.boolean().default(false),
		story: z.array(z.string()).optional(),
		particulars: z
			.object({
				role: z.string(),
				year: z.string(),
				composed: z.string(),
				status: z.string(),
			})
			.optional(),
		quote: z.object({ text: z.string(), cite: z.string() }).optional(),
		links: z.object({ repo: z.string(), live: z.string() }).optional(),
	}),
});

export const collections = { projects };
