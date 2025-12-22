#!/usr/bin/env npx tsx
/**
 * GearedUp Product Management CLI
 *
 * Usage:
 *   npx tsx scripts/products.ts add --name "Fiskars 45mm" --brand "Fiskars" --asin "B0001DSIVY" --category "quilting"
 *   npx tsx scripts/products.ts list --category "quilting"
 *   npx tsx scripts/products.ts verify --asin "B0001DSIVY"
 *   npx tsx scripts/products.ts import --file products.json
 *   npx tsx scripts/products.ts export --category "quilting"
 *   npx tsx scripts/products.ts generate-urls --category "quilting"
 */

import { Command } from 'commander';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || '';
const AFFILIATE_TAG = 'bentropy-20';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials. Set PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const program = new Command();

program
  .name('products')
  .description('GearedUp Product Management CLI')
  .version('1.0.0');

// Add a product
program
  .command('add')
  .description('Add a new product')
  .requiredOption('--name <name>', 'Product name')
  .requiredOption('--brand <brand>', 'Brand name')
  .requiredOption('--category <category>', 'Category slug')
  .option('--asin <asin>', 'Amazon ASIN')
  .option('--slug <slug>', 'URL slug (auto-generated if not provided)')
  .option('--best-for <bestFor>', 'Best for description')
  .option('--verdict <verdict>', 'Product verdict')
  .option('--rank <rank>', 'Rank: best-overall, best-budget, best-premium, runner-up')
  .option('--pros <pros>', 'Comma-separated pros')
  .option('--cons <cons>', 'Comma-separated cons')
  .action(async (options) => {
    const slug = options.slug || generateSlug(options.brand, options.name);

    // Insert product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        slug,
        name: options.name,
        brand: options.brand,
        category: options.category,
        best_for: options.bestFor,
        verdict: options.verdict,
        rank: options.rank,
        pros: options.pros ? options.pros.split(',').map((s: string) => s.trim()) : [],
        cons: options.cons ? options.cons.split(',').map((s: string) => s.trim()) : [],
      })
      .select()
      .single();

    if (productError) {
      console.error('Failed to add product:', productError.message);
      process.exit(1);
    }

    console.log(`✓ Added product: ${product.name} (${product.slug})`);

    // Add ASIN if provided
    if (options.asin) {
      const { error: asinError } = await supabase
        .from('product_asins')
        .insert({
          product_id: product.id,
          asin: options.asin,
          is_primary: true,
        });

      if (asinError) {
        console.error('Failed to add ASIN:', asinError.message);
      } else {
        console.log(`✓ Added ASIN: ${options.asin}`);
      }
    }
  });

// List products
program
  .command('list')
  .description('List products')
  .option('--category <category>', 'Filter by category')
  .action(async (options) => {
    let query = supabase
      .from('products_with_prices')
      .select('*')
      .order('category')
      .order('name');

    if (options.category) {
      query = query.eq('category', options.category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to list products:', error.message);
      process.exit(1);
    }

    console.log(`\nFound ${data.length} products:\n`);

    let currentCategory = '';
    for (const product of data) {
      if (product.category !== currentCategory) {
        currentCategory = product.category;
        console.log(`\n## ${currentCategory.toUpperCase()}`);
      }
      const price = product.current_price ? `$${product.current_price}` : 'N/A';
      const asin = product.asin || 'No ASIN';
      console.log(`  ${product.brand} ${product.name} | ${asin} | ${price}`);
    }
  });

// Verify an ASIN exists on Amazon
program
  .command('verify')
  .description('Verify an ASIN exists on Amazon')
  .requiredOption('--asin <asin>', 'Amazon ASIN to verify')
  .action(async (options) => {
    const asin = options.asin.toUpperCase();
    console.log(`Verifying ASIN: ${asin}...`);

    try {
      const response = await fetch(`https://www.amazon.com/dp/${asin}`, {
        method: 'HEAD',
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GearedUp/1.0)',
        },
      });

      // Amazon returns 200 for valid products, 301/302 for redirects to search
      if (response.status === 200) {
        console.log(`✓ ASIN ${asin} is valid`);

        // Update verified_at in database
        const { error } = await supabase
          .from('product_asins')
          .update({ verified_at: new Date().toISOString() })
          .eq('asin', asin);

        if (!error) {
          console.log('  Updated verification timestamp in database');
        }
      } else if (response.status === 301 || response.status === 302) {
        const location = response.headers.get('location');
        if (location?.includes('/s?')) {
          console.log(`✗ ASIN ${asin} redirects to search - likely invalid`);
        } else {
          console.log(`? ASIN ${asin} redirects to: ${location}`);
        }
      } else {
        console.log(`? ASIN ${asin} returned status ${response.status}`);
      }
    } catch (error) {
      console.error(`Failed to verify: ${error}`);
    }
  });

// Import products from JSON
program
  .command('import')
  .description('Import products from JSON file')
  .requiredOption('--file <file>', 'Path to JSON file')
  .action(async (options) => {
    const filePath = path.resolve(options.file);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    const products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`Importing ${products.length} products...`);

    for (const p of products) {
      const slug = p.slug || generateSlug(p.brand, p.name);

      const { data: product, error: productError } = await supabase
        .from('products')
        .upsert({
          slug,
          name: p.name,
          brand: p.brand,
          category: p.category,
          best_for: p.bestFor,
          verdict: p.verdict,
          rank: p.rank,
          pros: p.pros || [],
          cons: p.cons || [],
        }, { onConflict: 'slug' })
        .select()
        .single();

      if (productError) {
        console.error(`  ✗ ${p.name}: ${productError.message}`);
        continue;
      }

      if (p.asin) {
        await supabase
          .from('product_asins')
          .upsert({
            product_id: product.id,
            asin: p.asin,
            is_primary: true,
          }, { onConflict: 'asin,marketplace' });
      }

      console.log(`  ✓ ${p.brand} ${p.name}`);
    }

    console.log('\nImport complete!');
  });

// Export products to JSON
program
  .command('export')
  .description('Export products to JSON')
  .option('--category <category>', 'Filter by category')
  .option('--output <file>', 'Output file path')
  .action(async (options) => {
    let query = supabase
      .from('products_with_prices')
      .select('*')
      .order('category')
      .order('name');

    if (options.category) {
      query = query.eq('category', options.category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to export:', error.message);
      process.exit(1);
    }

    const output = data.map(p => ({
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      category: p.category,
      asin: p.asin,
      bestFor: p.best_for,
      verdict: p.verdict,
      rank: p.rank,
      pros: p.pros,
      cons: p.cons,
      currentPrice: p.current_price,
      affiliateUrl: p.asin ? `https://www.amazon.com/dp/${p.asin}?tag=${AFFILIATE_TAG}` : null,
    }));

    const json = JSON.stringify(output, null, 2);

    if (options.output) {
      fs.writeFileSync(options.output, json);
      console.log(`Exported ${output.length} products to ${options.output}`);
    } else {
      console.log(json);
    }
  });

// Generate affiliate URLs for all products
program
  .command('generate-urls')
  .description('Generate affiliate URLs for products')
  .option('--category <category>', 'Filter by category')
  .action(async (options) => {
    let query = supabase
      .from('products_with_prices')
      .select('*')
      .order('category')
      .order('name');

    if (options.category) {
      query = query.eq('category', options.category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch products:', error.message);
      process.exit(1);
    }

    console.log('\n# Affiliate URLs\n');

    let currentCategory = '';
    for (const product of data) {
      if (product.category !== currentCategory) {
        currentCategory = product.category;
        console.log(`\n## ${currentCategory}`);
      }

      if (product.asin) {
        const url = `https://www.amazon.com/dp/${product.asin}?tag=${AFFILIATE_TAG}`;
        console.log(`${product.brand} ${product.name}:`);
        console.log(`  ${url}\n`);
      } else {
        console.log(`${product.brand} ${product.name}: NO ASIN\n`);
      }
    }
  });

// Helper: Generate slug from brand and name
function generateSlug(brand: string, name: string): string {
  return `${brand}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

program.parse();
