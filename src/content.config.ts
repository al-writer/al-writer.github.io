import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    genre: z.string(),
    tags: z.array(z.string()).default([]),
    pubDate: z.coerce.date(),
    written: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { stories };
