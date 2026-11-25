import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const publicationSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  category: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
  imageAlt: z.string().min(1),
  readingTime: z.string().min(1),
  featured: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const collections = {
  actualites: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/actualites' }),
    schema: publicationSchema,
  }),
  communiques: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/communiques' }),
    schema: publicationSchema,
  }),
};
