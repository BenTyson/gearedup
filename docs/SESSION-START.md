# GearedUp - Session Start

> Read this first. 60-second context for any agent.

## Quick Context

| Field | Value |
|-------|-------|
| **Project** | GearedUp |
| **What** | Affiliate site: "best X for Y" hobby gear recommendations |
| **Stack** | Astro 5.x + Tailwind 4.x + TypeScript |
| **Port** | 4488 (local dev) |
| **Live URL** | https://gearedup-production.up.railway.app |
| **Hosting** | Railway (deployed) |
| **Database** | Supabase (linked, not yet used) |
| **Status** | **LIVE** - 10 recommendation pages published |

## Commands

```bash
npm run dev      # http://localhost:4488
npm run build    # Production build
npm run start    # Serve production build locally
railway up       # Deploy to Railway
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
├── content/
│   ├── config.ts                    # Content collection schema
│   └── recommendations/
│       ├── quilting/                # 5 quilting gear pages
│       └── board-gaming/            # 5 board gaming gear pages
├── components/
│   ├── products/                    # ProductCard, QuickAnswer, ComparisonTable
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
└── styles/
    └── global.css                   # Tailwind + custom theme
```

## Adding Content

**New recommendation page:**
1. Create `src/content/recommendations/[category]/[slug].md`
2. Follow frontmatter schema in `src/content/config.ts`
3. Add product images to `public/images/products/`
4. Run `npm run build && railway up` to deploy

**New category:**
1. Add to `src/data/categories.ts`
2. Create `src/content/recommendations/[category]/` directory
3. Hub page auto-generates at `/[category]/`

## What's Needed Next

1. **Real product images** - Replace placeholders in `/public/images/products/`
2. **Amazon Associates** - Apply and get affiliate tag
3. **Analytics** - Set up Plausible or similar
4. **More content** - Expand to 30+ pages for SEO traction

## Key Files

| File | Purpose |
|------|---------|
| `src/content/config.ts` | Content collection types |
| `src/layouts/BestXForYLayout.astro` | Main page template |
| `nixpacks.toml` | Railway build configuration |
| `railway.json` | Railway deployment config |

## Links

- [Live Site](https://gearedup-production.up.railway.app)
- [Railway Dashboard](https://railway.com/project/318fb22c-ac73-40bd-942c-105187b3d098)
- [Full planning doc](./GEAREDUP.md)
