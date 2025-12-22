#!/usr/bin/env npx tsx
/**
 * Extract products from markdown files and create JSON for import
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

const CONTENT_DIR = path.join(process.cwd(), 'src/content/recommendations');

interface Product {
  name: string;
  brand: string;
  category: string;
  slug: string;
  bestFor?: string;
  verdict?: string;
  rank?: string;
  pros?: string[];
  cons?: string[];
  asin?: string;
}

function extractProducts(): Product[] {
  const products: Product[] = [];
  const seen = new Set<string>();

  // Get all markdown files
  const categories = fs.readdirSync(CONTENT_DIR);

  for (const category of categories) {
    const categoryPath = path.join(CONTENT_DIR, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract frontmatter
      const match = content.match(/^---\n([\s\S]*?)\n---/);
      if (!match) continue;

      try {
        const frontmatter = yaml.parse(match[1]);

        // Extract products array
        if (frontmatter.products && Array.isArray(frontmatter.products)) {
          for (const p of frontmatter.products) {
            const slug = generateSlug(p.brand, p.name);

            if (seen.has(slug)) continue;
            seen.add(slug);

            // Extract ASIN from affiliate URL if it's a direct /dp/ link
            let asin: string | undefined;
            if (p.affiliateUrl) {
              const asinMatch = p.affiliateUrl.match(/\/dp\/([A-Z0-9]{10})/);
              if (asinMatch) {
                asin = asinMatch[1];
              }
            }

            products.push({
              name: p.name,
              brand: p.brand,
              category: frontmatter.category,
              slug,
              bestFor: p.bestFor,
              verdict: p.verdict,
              rank: p.rank,
              pros: p.pros,
              cons: p.cons,
              asin,
            });
          }
        }
      } catch (e) {
        console.error(`Failed to parse ${filePath}:`, e);
      }
    }
  }

  return products;
}

function generateSlug(brand: string, name: string): string {
  return `${brand}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const products = extractProducts();

console.log(JSON.stringify(products, null, 2));
console.error(`\nExtracted ${products.length} unique products`);
