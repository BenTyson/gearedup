# GearedUp - Project Documentation

> For quick session start, see [SESSION-START.md](./SESSION-START.md)

---

## 1. Project Overview

| Field | Value |
|-------|-------|
| **Project** | GearedUp |
| **Tagline** | "Gear up for your hobby" |
| **What** | Curated "best X for Y" recommendations for hobby gear |
| **Stack** | Astro 5.x + Tailwind 4.x + TypeScript |
| **Port** | 4488 |
| **Hosting** | Railway |
| **Database** | Supabase (future) |
| **Revenue** | Affiliate links (Amazon, specialty retailers) |
| **Target** | $1-3K/month |
| **Status** | MVP Complete - Content Phase |

---

## 2. Vision & Strategy

### What is GearedUp?

GearedUp is a curated recommendation site targeting hobbyists searching for gear. Every page answers a specific "best X for Y" query with honest, well-researched recommendations.

**Examples:**
- "Best rotary cutter for quilting"
- "Best card sleeves for MTG"
- "Best resin printer for miniatures"

### Why This Will Work

1. **Low competition** - Major review sites ignore niche hobby gear
2. **High intent traffic** - People searching are ready to buy
3. **Passionate audience** - Hobbyists research deeply and spend money
4. **Evergreen content** - Hobby gear doesn't change as fast as tech
5. **Long-tail SEO goldmine** - Thousands of specific queries

### Target Users

| Persona | Example Search | Behavior |
|---------|----------------|----------|
| **New Hobbyist** | "best sewing machine for beginners" | Needs guidance |
| **Upgrading Hobbyist** | "best rotary cutter for heavy fabric" | Wants validation |
| **Gift Buyer** | "best gifts for quilters" | High intent, quick answer |
| **Niche Enthusiast** | "best sleeves for MTG cards" | Will buy premium |

---

## 3. Technical Implementation

### Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Astro 5.x | SSG, fast, SEO-optimized |
| **Styling** | Tailwind 4.x | Modern, utility-first |
| **Hosting** | Railway | User preference, port 4488 |
| **Database** | Supabase | Future price tracking |
| **Analytics** | Plausible | Privacy-focused (future) |

### Project Structure

```
gearedup/
├── src/
│   ├── content/
│   │   ├── config.ts              # Content collection schema
│   │   └── recommendations/       # Markdown content pages
│   │       ├── quilting/
│   │       └── board-gaming/
│   ├── components/
│   │   ├── products/              # ProductCard, QuickAnswer, ComparisonTable
│   │   ├── layout/                # Header, Footer
│   │   ├── seo/                   # FAQSchema
│   │   └── ui/                    # CategoryGrid, FAQAccordion
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── BestXForYLayout.astro
│   │   └── CategoryHubLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── [category]/index.astro
│   │   └── [...slug].astro
│   ├── data/categories.ts
│   └── styles/global.css
├── public/images/products/
├── docs/
├── astro.config.mjs
├── railway.json
├── tsconfig.json
└── package.json
```

### Commands

```bash
npm run dev      # Dev server at http://localhost:4488
npm run build    # Production build
npm run preview  # Preview production build
```

### URL Structure

```
/                                    # Homepage with category grid
/quilting/                           # Category hub
/quilting/best-rotary-cutter-for-beginners/  # Recommendation page
/board-gaming/                       # Category hub
/board-gaming/best-card-sleeves-for-mtg/     # Recommendation page
/about/                              # About/methodology
```

---

## 4. Content Model

### Data Schema (src/content/config.ts)

```typescript
interface Product {
  name: string;
  brand: string;
  price: number;
  affiliateUrl: string;
  image: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  verdict: string;
  rank?: 'best-overall' | 'best-budget' | 'best-premium' | 'runner-up';
}

interface Recommendation {
  title: string;
  metaDescription: string;
  category: string;
  publishedDate: Date;
  lastUpdated: Date;
  quickAnswer: Product;
  products: Product[];
  methodology: string;
  faqs: Array<{ question: string; answer: string }>;
}
```

### Page Types

| Type | URL Pattern | % of Content |
|------|-------------|--------------|
| Best X for Y | `/[category]/best-[product]-for-[use-case]/` | 80% |
| Category Hub | `/[category]/` | 10% |
| Gift Guides | `/gifts-for-[persona]/` | 10% (future) |

---

## 5. Hobby Categories

### Tier 1: Launch (Active)

| Category | Slug | Status |
|----------|------|--------|
| Quilting & Sewing | `quilting` | 1 page |
| Board Gaming | `board-gaming` | 1 page |
| Miniature Painting | `miniature-painting` | Hub only |
| Knitting | `knitting` | Hub only |

### Tier 2: Expansion (Future)

- Mountaineering & Hiking (Summit58 synergy)
- Woodworking
- Resin Crafts
- Drawing & Illustration
- Calligraphy & Journaling
- Tabletop RPG

---

## 6. Implementation Status

### Phase 1: Foundation ✅ COMPLETE

- [x] Astro project with TypeScript
- [x] Tailwind 4.x styling
- [x] Railway configuration (port 4488)
- [x] Content collection schema
- [x] Page templates (BestXForY, CategoryHub)
- [x] Core components (ProductCard, QuickAnswer, ComparisonTable)
- [x] Homepage with category grid
- [x] Dynamic routing
- [x] 2 sample recommendation pages

### Phase 2: Content (IN PROGRESS)

- [ ] Research real products for pilot pages
- [ ] Add real product images
- [ ] Create 8 remaining pilot pages:
  - Quilting: cutting mat, sewing machine, scissors, ruler set
  - Board Gaming: storage, playmat, dice, table topper
- [ ] Deploy to Railway
- [ ] Apply for Amazon Associates

### Phase 3: Scale (Future)

- [ ] Expand to 30+ pages
- [ ] Add gift guide pages
- [ ] Implement Supabase for price tracking
- [ ] Add specialty affiliate programs
- [ ] FAQ schema markup optimization

---

## 7. Affiliate Strategy

| Partner | Commission | Use For |
|---------|------------|---------|
| Amazon Associates | 1-4% | Primary (highest conversion) |
| ShareASale | 5-15% | Specialty retailers |
| Direct Programs | 5-20% | Brand-specific |

**Link Strategy:**
- Primary CTA → Amazon (convenience)
- Secondary → Specialty retailer (higher commission)
- Always disclose affiliate relationship

---

## 8. SEO Strategy

### Target Keywords

Format: `best [product] for [modifier]`

**Modifiers:**
- Skill level: "for beginners", "for professionals"
- Use case: "for quilting", "for miniatures"
- Constraint: "under $50", "for small spaces"

### On-Page SEO

- Quick answer in first 100 words (featured snippet)
- Comparison tables (rich results)
- FAQ schema markup
- Last updated dates (freshness signal)

---

## 9. Sister Site Ecosystem

```
                    ┌──────────────┐
                    │   GearedUp   │ ← Central hub
                    │ (all hobbies)│
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
  ┌────────────┐   ┌────────────┐   ┌────────────┐
  │  Summit58  │   │ Good Game  │   │  CraftCalc │
  │  (14ers)   │   │  (boards)  │   │  (crafts)  │
  └────────────┘   └────────────┘   └────────────┘
```

Cross-linking boosts SEO for all sites.

---

## 10. Session Log

### 2025-12-18 - MVP Complete
- Initialized Astro 5.x + Tailwind 4.x project
- Configured for Railway (port 4488)
- Created all core components and layouts
- Built homepage, about page, category hubs
- Created 2 sample recommendation pages with placeholder content
- Project builds and runs successfully

### 2025-12-15 - Project Created
- Created comprehensive planning document
- Defined 4-phase implementation plan
- Selected pilot categories: Quilting + Board Gaming

---

## 11. Agent Instructions

### Do
- Keep pages focused and scannable
- Always include quick answer at top
- Use comparison tables
- Be honest about pros AND cons
- Include "last updated" dates

### Don't
- Write fluff to hit word counts
- Recommend products just for high commission
- Forget affiliate disclosures
- Ignore mobile experience

### Adding Content

1. Create markdown file in `src/content/recommendations/[category]/`
2. Follow schema in `src/content/config.ts`
3. Add images to `public/images/products/`
4. Page auto-routes based on file path

---

## 12. Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| `src/content/config.ts` | Content collection types |
| `src/layouts/BestXForYLayout.astro` | Main page template |
| `src/components/products/ProductCard.astro` | Product display |
| `src/data/categories.ts` | Category definitions |
| `src/styles/global.css` | Tailwind theme |
| `astro.config.mjs` | Astro config (port 4488) |
| `railway.json` | Railway deployment config |

### Design Tokens

- Primary: `brand-500` to `brand-700` (green)
- Quilting: pink
- Board Gaming: violet
- Miniatures: amber
- Knitting: rose

### Links

- [Astro Docs](https://docs.astro.build)
- [Tailwind 4 Docs](https://tailwindcss.com)
- [Amazon Associates](https://affiliate-program.amazon.com)
