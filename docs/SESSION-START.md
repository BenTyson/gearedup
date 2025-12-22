# GearedUp - Session Start

> Read this first. 60-second context for any agent.

## Quick Context

| Field | Value |
|-------|-------|
| **Project** | GearedUp |
| **What** | Affiliate site: "best X for Y" hobby gear recommendations |
| **Stack** | Astro 5.x + Tailwind 4.x + TypeScript + Supabase |
| **Port** | 4488 (local dev) |
| **Live URL** | https://gearedup-production.up.railway.app |
| **Hosting** | Railway (deployed) |
| **Database** | Supabase (active - products table populated) |
| **Affiliate Tag** | `bentropy-20` |
| **Status** | **LIVE** - 10 recommendation pages, 39 products in DB |

## Current Work: Product Infrastructure

### What's Done
- Supabase schema created: `products`, `product_asins`, `price_history`, `product_images`, views
- CLI tool built: `scripts/products.ts` (add, list, verify, import, export, generate-urls)
- 39 products imported into Supabase from markdown files
- **ASIN research completed** - 23 products now have direct `/dp/ASIN` links in markdown files
- Remaining 16 products use search URLs (not on Amazon or problematic listings)

### ASINs Added (23 products)
| Category | Products with Direct ASINs |
|----------|---------------------------|
| Sewing Machines | Brother CS7000X, Janome HD3000, Singer M3220 |
| Rotary Cutters | Fiskars 45mm, OLFA 45mm, DAFA 45mm |
| Cutting Mats | OLFA 24x36, Fiskars 24x36, ARTEZA 18x24, Alvin 36x48 |
| Scissors | Kai 7250 (10"), Gingher 8", Fiskars 8", Kai N5275 (11") |
| Rulers | Omnigrid 6x24, ARTEZA 4pc |
| Card Sleeves | Ultra Pro Eclipse, Ultimate Guard Katana, Dragon Shield Matte, Ultra Pro Pro-Matte |
| Dice | Chessex Gemini, Norse Foundry Metal, Wiz Dice |
| Storage | Closetmaid 9-Cube |
| Playmats | Ultimate Guard XenoSkin, Gamegenic Prime |

### Products Using Search/Direct Links (not on Amazon)
- IKEA KALLAX (linked to ikea.com)
- Inked Gaming playmats (linked to inkedgaming.com)
- Creative Grids rulers (counterfeits on Amazon - search link)
- Quilters Select rulers (not sold on Amazon - search link)
- Brother SE630 (only recertified on Amazon - search link)
- Boutique makers: Gamermats, Mats by Mars, BoxThrone, etc.

### What's Next
1. **Add build-time Supabase integration** - Pull prices at build time
2. **Sync ASINs to Supabase** - Import the new ASINs into `product_asins` table
3. **Add real product images** - Replace placeholder images

## CLI Commands

```bash
# Development
npm run dev                    # http://localhost:4488
npm run build                  # Production build
railway up                     # Deploy to Railway

# Product Management (requires env vars)
export PUBLIC_SUPABASE_URL=https://jhbqynpgdfkvsfeydqoo.supabase.co
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
├── best_for, verdict, rank
├── pros[], cons[]

product_asins
├── product_id → products
├── asin
├── marketplace (default: US)
├── is_primary
├── verified_at

price_history
├── asin_id → product_asins
├── price, currency, in_stock
├── checked_at

products_with_prices (view)
└── Joins products + primary ASIN + current price
```

## Live Pages

| URL | Category |
|-----|----------|
| `/` | Homepage |
| `/about/` | About page |
| `/quilting/` | Quilting hub (5 pages) |
| `/board-gaming/` | Board Gaming hub (5 pages) |

### Quilting Pages
- `/quilting/best-rotary-cutter-for-beginners/`
- `/quilting/best-cutting-mat-for-quilting/`
- `/quilting/best-sewing-machine-for-quilting-under-500/`
- `/quilting/best-fabric-scissors-for-quilting/`
- `/quilting/best-quilting-ruler-set/`

### Board Gaming Pages
- `/board-gaming/best-card-sleeves-for-mtg/`
- `/board-gaming/best-board-game-storage/`
- `/board-gaming/best-playmat-for-card-games/`
- `/board-gaming/best-dice-set-for-dnd/`
- `/board-gaming/best-board-game-table-topper/`

## Project Structure

```
src/
├── content/recommendations/     # Markdown files with frontmatter
├── components/products/         # ProductCard, QuickAnswer, ComparisonTable
├── layouts/BestXForYLayout.astro
└── pages/[...slug].astro

scripts/
├── products.ts                  # CLI for product management
└── extract-products.ts          # Extract products from markdown

supabase/migrations/
└── 20251221000000_products.sql  # Database schema
```

## Key Files

| File | Purpose |
|------|---------|
| `scripts/products.ts` | Product management CLI |
| `scripts/extract-products.ts` | Extract products from markdown |
| `supabase/migrations/20251221000000_products.sql` | DB schema |
| `src/content/config.ts` | Content collection types |
| `.env` | Supabase credentials |

## Links

- [Live Site](https://gearedup-production.up.railway.app)
- [Railway Dashboard](https://railway.com/project/318fb22c-ac73-40bd-942c-105187b3d098)
- [Supabase Dashboard](https://supabase.com/dashboard/project/jhbqynpgdfkvsfeydqoo)
- [Full planning doc](./GEAREDUP.md)
