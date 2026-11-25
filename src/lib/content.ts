import { z } from 'zod';

import siteJson from '../data/site.json';
import homeJson from '../data/pages/home.json';
import missionsJson from '../data/pages/missions.json';
import governmentJson from '../data/pages/government.json';
import contactJson from '../data/pages/contact.json';
import actualitesPageJson from '../data/pages/actualites.json';
import communiquesPageJson from '../data/pages/communiques.json';

const iconValues = [
  'landmark',
  'building',
  'mail',
  'sprout',
  'heart',
  'road',
  'leaf',
  'book',
  'shield',
  'users',
  'scale',
  'briefcase',
  'map-pin',
  'compass',
  'search',
  'globe',
  'arrow-right',
] as const;

const iconSchema = z.enum(iconValues);
const hrefSchema = z
  .string()
  .min(1)
  .refine(
    (value) =>
      value.startsWith('/') ||
      value.startsWith('mailto:') ||
      value.startsWith('tel:') ||
      value.startsWith('https://') ||
      value.startsWith('http://'),
    'Le lien doit être un chemin interne ou une URL valide.',
  );

const ctaSchema = z.object({
  label: z.string().min(1),
  href: hrefSchema,
});

const seoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  ogImage: z.string().optional(),
});

const introSchema = z.object({
  eyebrow: z.string(),
  title: z.string().min(1),
  text: z.string(),
});

const quoteSchema = z.object({
  text: z.string().min(1),
  author: z.string().min(1),
  role: z.string(),
});

const siteSchema = z.object({
  name: z.string().min(1),
  officialName: z.string(),
  shortName: z.string(),
  officialLabel: z.string(),
  country: z.string(),
  utilityText: z.string(),
  tagline: z.string(),
  description: z.string(),
  logo: z.string().optional(),
  email: z.email(),
  phone: z.string(),
  address: z.string(),
  hours: z.string(),
  socials: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.url(),
      }),
    )
    .default([]),
  footerNote: z.string(),
  footerTagline: z.string(),
});

const homeSchema = z.object({
  seo: seoSchema,
  hero: z.object({
    eyebrow: z.string(),
    titleLine1: z.string().min(1),
    titleLine2: z.string().min(1),
    titleHighlight: z.string().min(1),
    text: z.string(),
    image: z.string().min(1),
    imageAlt: z.string().min(1),
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema,
    values: z.array(z.string()),
    cardTitle: z.string(),
    cardText: z.string(),
  }),
  featured: z.object({
    eyebrow: z.string(),
    title: z.string().min(1),
    linkLabel: z.string(),
    linkHref: hrefSchema,
  }),
  releases: z.object({
    title: z.string().min(1),
    linkLabel: z.string(),
    linkHref: hrefSchema,
  }),
  newsletter: z.object({
    eyebrow: z.string(),
    title: z.string().min(1),
    text: z.string(),
    buttonLabel: z.string().min(1),
    buttonHref: hrefSchema,
  }),
});

const missionsSchema = z.object({
  seo: seoSchema,
  intro: introSchema,
  items: z.array(
    z.object({
      title: z.string().min(1),
      icon: iconSchema,
      text: z.string(),
      points: z.array(z.string()),
    }),
  ),
  domains: z.object({
    eyebrow: z.string(),
    title: z.string().min(1),
    text: z.string(),
    items: z.array(
      z.object({
        title: z.string().min(1),
        text: z.string(),
        icon: iconSchema,
      }),
    ),
  }),
  cta: z.object({
    eyebrow: z.string(),
    title: z.string().min(1),
    text: z.string(),
    buttonLabel: z.string().min(1),
    buttonHref: hrefSchema,
  }),
});

const governmentSchema = z.object({
  seo: seoSchema,
  intro: introSchema,
  story: z.object({
    title: z.string().min(1),
    paragraphs: z.array(z.string()).min(1),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    badgeTitle: z.string(),
    badgeText: z.string(),
  }),
  values: z.object({
    eyebrow: z.string(),
    title: z.string().min(1),
    text: z.string(),
    items: z.array(
      z.object({
        title: z.string().min(1),
        text: z.string(),
        icon: iconSchema,
      }),
    ),
  }),
  institutions: z.object({
    eyebrow: z.string(),
    title: z.string().min(1),
    text: z.string(),
    items: z.array(
      z.object({
        title: z.string().min(1),
        text: z.string(),
        icon: iconSchema,
      }),
    ),
  }),
  territories: z.object({
    eyebrow: z.string(),
    title: z.string().min(1),
    text: z.string(),
    items: z.array(z.string()),
  }),
  quote: quoteSchema,
  cta: z.object({
    eyebrow: z.string(),
    title: z.string().min(1),
    text: z.string(),
    buttonLabel: z.string().min(1),
    buttonHref: hrefSchema,
  }),
});

const contactSchema = z.object({
  seo: seoSchema,
  intro: introSchema,
  form: z.object({
    title: z.string().min(1),
    text: z.string(),
    successMessage: z.string().min(1),
    errorMessage: z.string().min(1),
    privacyNote: z.string(),
  }),
  details: z.object({
    title: z.string().min(1),
    text: z.string(),
    notice: z.string(),
    responseTime: z.string(),
  }),
});

const listingPageSchema = z.object({
  seo: seoSchema,
  intro: introSchema,
});

export const site = siteSchema.parse(siteJson);
export const home = homeSchema.parse(homeJson);
export const missions = missionsSchema.parse(missionsJson);
export const government = governmentSchema.parse(governmentJson);
export const contact = contactSchema.parse(contactJson);
export const actualitesPage = listingPageSchema.parse(actualitesPageJson);
export const communiquesPage = listingPageSchema.parse(communiquesPageJson);

export type Site = z.infer<typeof siteSchema>;
export type IconName = z.infer<typeof iconSchema>;
export type Cta = z.infer<typeof ctaSchema>;
