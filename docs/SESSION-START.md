# GearedUp - Session Start

> Read this first. 60-second context for any agent.

## Quick Context

| Field | Value |
|-------|-------|
| **Project** | GearedUp |
| **What** | Affiliate site: "best X for Y" hobby gear recommendations |
| **Stack** | Astro 5.x + React + Tailwind 4.x + TypeScript + Supabase |
| **Port** | 4488 (local dev) |
| **Live URL** | https://gearedup-production.up.railway.app |
| **Admin URL** | https://gearedup-production.up.railway.app/admin |
| **Hosting** | Railway (Node adapter for SSR) |
| **Database** | Supabase (products, pages, auth) |
| **Affiliate Tag** | `bentropy-20` |
| **Status** | **LIVE** - 30 pages, 119 products, admin dashboard active |

## Current State

### What's Complete
- **Database-first architecture** - Products sourced from Supabase at build time
- **Admin dashboard** - Full CRUD for products, pages, and page-product linking
- **Supabase Auth** - Email/password login for admin access
- **Hybrid rendering** - Static public pages, SSR admin routes
- **6 categories live**: Quilting, Board Gaming, Miniature Painting, Home Coffee, Knitting, Photography
- 119 products in database with ASINs where available
- 30 recommendation pages across 6 categories

### Admin Dashboard Features
| Feature | Route |
|---------|-------|
| Dashboard | `/admin` |
| Login | `/admin/login` |
| Product List | `/admin/products` |
| Create Product | `/admin/products/new` |
| Edit Product | `/admin/products/[id]` |
| Page List | `/admin/pages` |
| Create Page | `/admin/pages/new` |
| Edit Page | `/admin/pages/[id]` |
| Link Products to Page | `/admin/page-products/[pageId]` |

### Environment Variables

**Required for Admin:**
```
PUBLIC_SUPABASE_URL=https://jhbqynpgdfkvsfeydqoo.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon key>
ADMIN_EMAILS=your-email@example.com
RAILWAY_DEPLOY_HOOK_URL=<from Railway Settings>
```

## CLI Commands

```bash
# Development
npm run dev                    # http://localhost:4488
npm run build                  # Production build
railway up                     # Deploy to Railway

# Product Management (requires env vars)
export SUPABASE_SERVICE_ROLE_KEY=<from .env file>

npx tsx scripts/products.ts list                      # List all products
npx tsx scripts/products.ts list --category quilting  # Filter by category
npx tsx scripts/products.ts export --output out.json  # Export to JSON
npx tsx scripts/products.ts generate-urls             # Show affiliate URLs

# Extract products from markdown
npx tsx scripts/extract-products.ts > products.json
```

## Database Schema (Supabase)

```
products
├── id (uuid)
├── slug (unique)
├── name, brand, category
├── price, original_price
├── amazon_url, image_url
├── rating, review_count
├── description
├── features[], pros[], cons[]
├── asin

recommendation_pages
├── id (uuid)
├── slug (unique)
├── title, category
├── intro, buyers_guide
├── meta_description

page_products (junction)
├── page_id → recommendation_pages
├── product_id → products
├── display_order
├── is_featured
├── custom_description
```

## Live Pages

| URL | Description |
|-----|-------------|
| `/` | Homepage |
| `/about/` | About page |
| `/admin/` | Admin dashboard (auth required) |
| `/quilting/` | Quilting hub (5 pages) |
| `/board-gaming/` | Board Gaming hub (5 pages) |
| `/miniature-painting/` | Miniature Painting hub (5 pages) |
| `/home-coffee/` | Home Coffee hub (5 pages) |
| `/knitting/` | Knitting hub (5 pages) |
| `/photography/` | Photography hub (5 pages) |

## Project Structure

```
src/
├── components/
│   ├── admin/                   # React components for admin
│   │   ├── ProductList.tsx
│   │   ├── ProductForm.tsx
│   │   ├── PageList.tsx
│   │   ├── PageForm.tsx
│   │   └── PageProductLinker.tsx
│   └── products/                # ProductCard, QuickAnswer, ComparisonTable
├── layouts/
│   ├── BaseLayout.astro
│   ├── AdminLayout.astro        # Admin page wrapper
│   └── BestXForYLayout.astro
├── lib/
│   ├── supabase.ts              # Public Supabase client
│   ├── supabase-admin.ts        # Server-side Supabase client
│   └── products.ts              # Product fetching + transformation
├── middleware/
│   └── index.ts                 # Auth protection for /admin/*
├── pages/
│   ├── admin/                   # Admin dashboard pages (SSR)
│   │   ├── index.astro
│   │   ├── login.astro
│   │   ├── products/
│   │   ├── pages/
│   │   └── page-products/
│   ├── api/                     # API routes
│   │   ├── auth/
│   │   ├── products/
│   │   ├── pages/
│   │   ├── page-products/
│   │   └── rebuild/
│   └── [...slug].astro          # Public recommendation pages (SSG)
└── content/recommendations/     # Markdown content

scripts/
├── products.ts                  # CLI for product management
├── sync-pages.ts                # Sync pages + page-product links to DB
└── extract-products.ts          # Extract products from markdown
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Public Supabase client |
| `src/lib/supabase-admin.ts` | Server-side Supabase client |
| `src/middleware/index.ts` | Auth middleware for admin routes |
| `src/layouts/AdminLayout.astro` | Admin page layout with sidebar |
| `src/components/admin/*.tsx` | React components for admin UI |
| `astro.config.mjs` | Astro config (static output, Node adapter) |
| `nixpacks.toml` | Railway deployment config |

## What's Next

1. **Add RAILWAY_DEPLOY_HOOK_URL** - Enable "Publish Changes" button
2. **PA-API integration** - Real-time prices when qualifying sales achieved
3. **Add real product images** - Replace placeholder images
4. **Add more categories** - Infrastructure ready for expansion

## Links

- [Live Site](https://gearedup-production.up.railway.app)
- [Admin Dashboard](https://gearedup-production.up.railway.app/admin)
- [Railway Dashboard](https://railway.com/project/318fb22c-ac73-40bd-942c-105187b3d098)
- [Supabase Dashboard](https://supabase.com/dashboard/project/jhbqynpgdfkvsfeydqoo)
- [Full planning doc](./GEAREDUP.md)
