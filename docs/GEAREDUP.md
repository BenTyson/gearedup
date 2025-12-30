# GearedUp - Project Documentation

> For quick session start, see [SESSION-START.md](./SESSION-START.md)

---

## 1. Project Overview

| Field | Value |
|-------|-------|
| **Project** | GearedUp |
| **Tagline** | "Gear up for your hobby" |
| **What** | Curated "best X for Y" recommendations for hobby gear |
| **Stack** | Astro 5.x + React + Tailwind 4.x + TypeScript + Supabase |
| **Port** | 4488 |
| **Hosting** | Railway (Node adapter for SSR) |
| **Database** | Supabase (products, pages, auth) |
| **Revenue** | Affiliate links (Amazon, specialty retailers) |
| **Target** | $1-3K/month |
| **Status** | Live with Admin Dashboard |

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
| **Framework** | Astro 5.x | SSG + SSR hybrid |
| **UI Islands** | React 19 | Interactive admin components |
| **Styling** | Tailwind 4.x | Modern, utility-first |
| **Hosting** | Railway | Node adapter for SSR |
| **Database** | Supabase | Products, pages, auth |
| **Auth** | Supabase Auth | Email/password for admin |

### Project Structure

```
gearedup/
├── src/
│   ├── components/
│   │   ├── admin/               # React components for admin UI
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── PageList.tsx
│   │   │   ├── PageForm.tsx
│   │   │   └── PageProductLinker.tsx
│   │   ├── products/            # ProductCard, QuickAnswer, ComparisonTable
│   │   ├── layout/              # Header, Footer
│   │   └── ui/                  # CategoryGrid, FAQAccordion
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── AdminLayout.astro    # Admin page wrapper with sidebar
│   │   └── BestXForYLayout.astro
│   ├── lib/
│   │   ├── supabase.ts          # Public Supabase client
│   │   ├── supabase-admin.ts    # Server-side Supabase client
│   │   └── products.ts          # Product fetching + transformation
│   ├── middleware/
│   │   └── index.ts             # Auth protection for /admin/*
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── admin/               # Admin dashboard (SSR)
│   │   │   ├── index.astro
│   │   │   ├── login.astro
│   │   │   ├── products/
│   │   │   ├── pages/
│   │   │   └── page-products/
│   │   ├── api/                 # API routes
│   │   │   ├── auth/
│   │   │   ├── products/
│   │   │   ├── pages/
│   │   │   ├── page-products/
│   │   │   └── rebuild/
│   │   ├── [category]/index.astro
│   │   └── [...slug].astro
│   ├── content/recommendations/
│   └── styles/global.css
├── scripts/
│   ├── products.ts              # CLI for product management
│   ├── sync-pages.ts            # Sync pages to DB
│   └── extract-products.ts      # Extract from markdown
├── supabase/migrations/
├── public/images/products/
├── docs/
├── astro.config.mjs
├── nixpacks.toml
└── package.json
```

### Commands

```bash
npm run dev      # Dev server at http://localhost:4488
npm run build    # Production build
npm run preview  # Preview production build
railway up       # Deploy to Railway
```

### URL Structure

```
/                                    # Homepage with category grid
/quilting/                           # Category hub
/quilting/best-rotary-cutter-for-beginners/  # Recommendation page
/admin/                              # Admin dashboard (auth required)
/admin/products                      # Manage products
/admin/pages                         # Manage recommendation pages
/admin/page-products/[id]            # Link products to pages
/about/                              # About/methodology
```

---

## 4. Content Model

### Database Schema (Supabase)

```sql
-- Products table
products (
  id uuid PRIMARY KEY,
  slug text UNIQUE,
  name text,
  brand text,
  category text,
  price numeric,
  original_price numeric,
  amazon_url text,
  image_url text,
  rating numeric,
  review_count integer,
  description text,
  features text[],
  pros text[],
  cons text[],
  asin text,
  created_at timestamptz,
  updated_at timestamptz
)

-- Recommendation pages table
recommendation_pages (
  id uuid PRIMARY KEY,
  slug text UNIQUE,
  title text,
  category text,
  intro text,
  buyers_guide text,
  meta_description text,
  created_at timestamptz,
  updated_at timestamptz
)

-- Junction table for page-product relationships
page_products (
  id uuid PRIMARY KEY,
  page_id uuid REFERENCES recommendation_pages,
  product_id uuid REFERENCES products,
  display_order integer,
  is_featured boolean,
  custom_description text
)
```

### Page Types

| Type | URL Pattern | % of Content |
|------|-------------|--------------|
| Best X for Y | `/[category]/best-[product]-for-[use-case]/` | 80% |
| Category Hub | `/[category]/` | 10% |
| Gift Guides | `/gifts-for-[persona]/` | 10% (future) |

---

## 5. Hobby Categories

### Active Categories

| Category | Slug | Pages | Products |
|----------|------|-------|----------|
| Quilting & Sewing | `quilting` | 5 | ~20 |
| Board Gaming | `board-gaming` | 5 | ~20 |
| Miniature Painting | `miniature-painting` | 5 | ~20 |
| Home Coffee | `home-coffee` | 5 | ~20 |
| Knitting | `knitting` | 5 | ~20 |
| Photography | `photography` | 5 | ~19 |

### Future Categories

- Woodworking
- Resin Crafts
- Drawing & Illustration
- Calligraphy & Journaling
- Tabletop RPG
- Mountaineering & Hiking

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

### Phase 2: Content ✅ COMPLETE

- [x] 30 recommendation pages across 6 categories
- [x] 119 products in Supabase database
- [x] Database-first architecture
- [x] Deployed to Railway
- [x] Amazon Associates applied

### Phase 3: Admin Dashboard ✅ COMPLETE

- [x] Supabase Auth integration
- [x] Auth middleware for /admin/* routes
- [x] Admin layout with sidebar navigation
- [x] Product CRUD (list, create, edit, delete)
- [x] Page CRUD (list, create, edit, delete)
- [x] Page-product linking with drag-drop reordering
- [x] Featured product support
- [x] Rebuild trigger API endpoint
- [x] React islands for interactive UI

### Phase 4: Scale (Future)

- [ ] PA-API integration for real-time prices
- [ ] Add real product images
- [ ] Expand to more categories
- [ ] Gift guide pages
- [ ] Analytics integration

---

## 7. Admin Dashboard

### Features

| Feature | Description |
|---------|-------------|
| **Authentication** | Supabase Auth with email/password |
| **Dashboard** | Stats overview (products, pages, categories) |
| **Product CRUD** | Full management with filtering by category |
| **Page CRUD** | Manage recommendation pages with markdown support |
| **Page-Product Linking** | Drag-drop reordering, featured products |
| **Publish Changes** | Trigger Railway rebuild via deploy hook |

### Environment Variables

```
PUBLIC_SUPABASE_URL=https://jhbqynpgdfkvsfeydqoo.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon key>
ADMIN_EMAILS=admin@example.com
RAILWAY_DEPLOY_HOOK_URL=<from Railway Settings>
```

---

## 8. Affiliate Strategy

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

## 9. SEO Strategy

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

## 10. Session Log

### 2025-12-24 - Admin Dashboard Complete
- Implemented full admin dashboard with Supabase Auth
- Added React components for product/page management
- Implemented drag-drop page-product linking
- Deployed with Node adapter for SSR

### 2025-12-22 - Categories Expanded
- Added 4 new categories: Miniature Painting, Home Coffee, Knitting, Photography
- Now at 30 pages across 6 categories
- 119 products in database

### 2025-12-21 - Database-First Architecture
- Migrated to Supabase database
- Created CLI tools for product management
- Added ASINs to products

### 2025-12-18 - MVP Complete
- Initialized Astro 5.x + Tailwind 4.x project
- Created all core components and layouts
- Built homepage, about page, category hubs
- Created sample recommendation pages

---

## 11. Agent Instructions

### Do
- Keep pages focused and scannable
- Always include quick answer at top
- Use comparison tables
- Be honest about pros AND cons
- Include "last updated" dates
- Use the admin dashboard for content management

### Don't
- Write fluff to hit word counts
- Recommend products just for high commission
- Forget affiliate disclosures
- Ignore mobile experience

### Adding Content via Admin

1. Log in at `/admin/login`
2. Create products at `/admin/products/new`
3. Create pages at `/admin/pages/new`
4. Link products to pages at `/admin/page-products/[pageId]`
5. Click "Publish Changes" to trigger rebuild

---

## 12. Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Public Supabase client |
| `src/lib/supabase-admin.ts` | Server-side Supabase client |
| `src/middleware/index.ts` | Auth middleware for admin |
| `src/layouts/AdminLayout.astro` | Admin page layout |
| `src/components/admin/*.tsx` | React admin components |
| `astro.config.mjs` | Astro config (Node adapter) |
| `nixpacks.toml` | Railway deployment |

### Design Tokens

- Primary: `brand-500` to `brand-700` (green)
- Quilting: pink
- Board Gaming: violet
- Miniatures: amber
- Knitting: rose
- Coffee: orange
- Photography: blue

### Links

- [Live Site](https://gearedup-production.up.railway.app)
- [Admin Dashboard](https://gearedup-production.up.railway.app/admin)
- [Railway Dashboard](https://railway.com/project/318fb22c-ac73-40bd-942c-105187b3d098)
- [Supabase Dashboard](https://supabase.com/dashboard/project/jhbqynpgdfkvsfeydqoo)
- [Astro Docs](https://docs.astro.build)
- [Tailwind 4 Docs](https://tailwindcss.com)
