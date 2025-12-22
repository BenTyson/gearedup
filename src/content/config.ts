import { defineCollection, z } from 'astro:content';

// Reusable product schema
const productSchema = z.object({
  name: z.string(),
  brand: z.string(),
  price: z.number(),
  affiliateUrl: z.string().url(),
  image: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  bestFor: z.string(),
  verdict: z.string(),
  rank: z.enum(['best-overall', 'best-budget', 'best-premium', 'runner-up']).optional(),
});

// FAQ schema
const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

// "Best X for Y" recommendation pages - the core content type
const recommendations = defineCollection({
  type: 'content',
  schema: z.object({
    // SEO & Meta
    title: z.string(),
    metaDescription: z.string(),
    keywords: z.array(z.string()).optional(),
    canonicalUrl: z.string().optional(),
    ogImage: z.string().optional(),

    // Categorization
    category: z.string(),
    subcategory: z.string().optional(),

    // Content dates
    publishedDate: z.date(),
    lastUpdated: z.date(),

    // Products (optional - DB is source of truth, markdown is legacy/backup)
    quickAnswer: productSchema.optional(),
    products: z.array(productSchema).optional(),

    // Additional content
    methodology: z.string(),
    faqs: z.array(faqSchema),

    // Status
    draft: z.boolean().default(false),
  }),
});

// Category hub pages
const categories = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    metaDescription: z.string(),
    heroImage: z.string().optional(),
    color: z.string(),
    icon: z.string().optional(),
    featuredPages: z.array(z.string()).optional(),
  }),
});

// Gift guide pages
const giftGuides = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    metaDescription: z.string(),
    persona: z.string(), // "quilters", "board-gamers", etc.
    priceRanges: z.array(z.object({
      label: z.string(),
      min: z.number(),
      max: z.number(),
    })).optional(),
    products: z.array(productSchema),
    publishedDate: z.date(),
    lastUpdated: z.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  recommendations,
  categories,
  'gift-guides': giftGuides,
};

// Export types for use in components
export type Product = z.infer<typeof productSchema>;
export type FAQ = z.infer<typeof faqSchema>;
export type Recommendation = z.infer<typeof recommendations.schema>;
export type CategoryContent = z.infer<typeof categories.schema>;
export type GiftGuide = z.infer<typeof giftGuides.schema>;
