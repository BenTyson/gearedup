#!/usr/bin/env npx tsx
/**
 * Sync recommendation pages and page-product relationships to Supabase
 *
 * This script:
 * 1. Reads all markdown files to get page metadata
 * 2. Creates/updates recommendation_pages in Supabase
 * 3. Links products to pages via page_products table
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const CONTENT_DIR = path.join(process.cwd(), 'src/content/recommendations');

interface PageData {
  slug: string;
  category: string;
  title: string;
  metaDescription: string;
  products: {
    name: string;
    brand: string;
    rank?: string;
  }[];
}

function generateProductSlug(brand: string, name: string): string {
  return `${brand}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function extractPages(): Promise<PageData[]> {
  const pages: PageData[] = [];
  const categories = fs.readdirSync(CONTENT_DIR);

  for (const category of categories) {
    const categoryPath = path.join(CONTENT_DIR, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      const match = content.match(/^---\n([\s\S]*?)\n---/);
      if (!match) continue;

      try {
        const frontmatter = yaml.parse(match[1]);
        const slug = `${category}/${file.replace('.md', '')}`;

        pages.push({
          slug,
          category: frontmatter.category,
          title: frontmatter.title,
          metaDescription: frontmatter.metaDescription,
          products: frontmatter.products || [],
        });
      } catch (e) {
        console.error(`Failed to parse ${filePath}:`, e);
      }
    }
  }

  return pages;
}

async function syncPages() {
  console.log('Extracting pages from markdown...');
  const pages = await extractPages();
  console.log(`Found ${pages.length} pages\n`);

  for (const page of pages) {
    console.log(`Processing: ${page.slug}`);

    // Upsert recommendation page
    const { data: pageData, error: pageError } = await supabase
      .from('recommendation_pages')
      .upsert({
        slug: page.slug,
        category: page.category,
        title: page.title,
        meta_description: page.metaDescription,
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (pageError) {
      console.error(`  ✗ Failed to upsert page: ${pageError.message}`);
      continue;
    }

    console.log(`  ✓ Page: ${page.title}`);

    // Clear existing page_products for this page
    await supabase
      .from('page_products')
      .delete()
      .eq('page_id', pageData.id);

    // Link products to page
    for (let i = 0; i < page.products.length; i++) {
      const p = page.products[i];
      const productSlug = generateProductSlug(p.brand, p.name);

      // Find product in database
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('slug', productSlug)
        .single();

      if (productError || !product) {
        console.error(`    ✗ Product not found: ${p.brand} ${p.name} (${productSlug})`);
        continue;
      }

      // Create page_product link
      const { error: linkError } = await supabase
        .from('page_products')
        .insert({
          page_id: pageData.id,
          product_id: product.id,
          display_order: i,
          is_quick_answer: i === 0, // First product is quick answer
        });

      if (linkError) {
        console.error(`    ✗ Failed to link: ${linkError.message}`);
      } else {
        const quickAnswer = i === 0 ? ' (quick answer)' : '';
        console.log(`    ✓ Linked: ${p.brand} ${p.name}${quickAnswer}`);
      }
    }
  }

  console.log('\nSync complete!');
}

syncPages().catch(console.error);
