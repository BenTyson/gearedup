# GearedUp - Session Start

> Read this first. 60-second context for any agent.

## Quick Context

| Field | Value |
|-------|-------|
| **Project** | GearedUp |
| **What** | Affiliate site: "best X for Y" hobby gear recommendations |
| **Stack** | Astro 5.x + Tailwind 4.x + TypeScript |
| **Port** | 4488 |
| **Hosting** | Railway (configured) |
| **Database** | Supabase (future - not yet integrated) |
| **Status** | MVP Complete - needs content |

## Commands

```bash
npm run dev      # http://localhost:4488
npm run build    # Production build
npm run preview  # Preview build on port 4488
```

## Project Structure

```
src/
├── content/
│   ├── config.ts                    # Content collection schema
│   └── recommendations/
│       ├── quilting/                # Quilting gear pages
│       └── board-gaming/            # Board gaming gear pages
├── components/
│   ├── products/                    # ProductCard, QuickAnswer, ComparisonTable, AffiliateLink
│   ├── layout/                      # Header, Footer
│   ├── seo/                         # FAQSchema
│   └── ui/                          # CategoryGrid, FAQAccordion
├── layouts/
│   ├── BaseLayout.astro             # HTML shell, meta tags
│   ├── BestXForYLayout.astro        # Main recommendation page template
│   └── CategoryHubLayout.astro      # Category index pages
├── pages/
│   ├── index.astro                  # Homepage
│   ├── about.astro                  # About page
│   ├── [category]/index.astro       # Category hub routing
│   └── [...slug].astro              # Recommendation page routing
├── data/
│   └── categories.ts                # Category definitions
└── styles/
    └── global.css                   # Tailwind + custom theme
```

## Content Model

Recommendation pages are Markdown with typed frontmatter:

```yaml
---
title: "Best Rotary Cutter for Beginners (2025)"
metaDescription: "..."
category: "quilting"
publishedDate: 2025-01-15
lastUpdated: 2025-01-15
quickAnswer:
  name: "45mm Comfort Loop"
  brand: "Fiskars"
  price: 15
  affiliateUrl: "https://amazon.com/dp/..."
  image: "/images/products/fiskars.jpg"
  pros: ["Comfortable grip", "Easy blade changes"]
  cons: ["Not sharpest initially"]
  bestFor: "Most beginners"
  verdict: "The reliable choice..."
  rank: "best-overall"
products: [...]  # Array of products
methodology: "<p>HTML string...</p>"
faqs: [{ question: "...", answer: "..." }]
---

Markdown body content here...
```

## Current Pages

| URL | Status |
|-----|--------|
| `/` | Complete |
| `/about/` | Complete |
| `/quilting/` | Hub ready, 1 page |
| `/board-gaming/` | Hub ready, 1 page |
| `/quilting/best-rotary-cutter-for-beginners/` | Sample content |
| `/board-gaming/best-card-sleeves-for-mtg/` | Sample content |

## What's Needed Next

1. **Real product images** - Replace placeholders in `/public/images/products/`
2. **Research real products** - 8 more pilot pages with actual product data
3. **Deploy to Railway** - `railway login && railway up`
4. **Set up Supabase** - `supabase login && supabase init` (for future price tracking)

## Pilot Pages to Create

**Quilting (4 remaining):**
- best-cutting-mat-for-quilting
- best-sewing-machine-for-quilting-under-500
- best-fabric-scissors-for-quilting
- best-quilting-ruler-set

**Board Gaming (4 remaining):**
- best-board-game-storage
- best-playmat-for-card-games
- best-dice-set-for-dnd
- best-board-game-table-topper

## Key Patterns

**Adding a new recommendation page:**
1. Create `src/content/recommendations/[category]/[slug].md`
2. Follow the frontmatter schema in `src/content/config.ts`
3. Add product images to `public/images/products/`
4. Page auto-routes to `/[category]/[slug]/`

**Adding a new category:**
1. Add to `src/data/categories.ts`
2. Create `src/content/recommendations/[category]/` directory
3. Hub page auto-generates at `/[category]/`

## Design Tokens

- **Primary color:** `brand-500` to `brand-700` (green)
- **Category colors:** `quilting` (pink), `board-gaming` (violet), `miniatures` (amber), `knitting` (rose)
- **Key utilities:** `product-card`, `affiliate-button`, `quick-answer-box`, `heading-lg/md/sm`

## Links

- [Full planning doc](./GEAREDUP.md)
- [Astro Docs](https://docs.astro.build)
- [Tailwind 4 Docs](https://tailwindcss.com/docs)
