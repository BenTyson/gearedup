import { supabase, type Product, type PageProduct } from './supabase';
import type { Product as MarkdownProduct } from '@content/config';

const AFFILIATE_TAG = 'bentropy-20';

/**
 * Transform a database product into the format expected by components
 * This bridges the DB schema to the existing component props
 */
export function toComponentProduct(product: Product): MarkdownProduct {
  return {
    name: product.name,
    brand: product.brand,
    price: product.current_price || 0,
    affiliateUrl: getAffiliateUrl(product),
    image: getProductImage(product),
    pros: product.pros || [],
    cons: product.cons || [],
    bestFor: product.best_for || '',
    verdict: product.verdict || '',
    rank: product.rank || undefined,
  };
}

/**
 * Get all products for a category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products_with_prices')
    .select('*')
    .eq('category', category)
    .order('name');

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

/**
 * Get products for a specific recommendation page
 */
export async function getProductsForPage(pageSlug: string): Promise<PageProduct[]> {
  // First get the page
  const { data: page, error: pageError } = await supabase
    .from('recommendation_pages')
    .select('id')
    .eq('slug', pageSlug)
    .single();

  if (pageError || !page) {
    console.error('Page not found:', pageSlug);
    return [];
  }

  // Then get products linked to this page
  const { data, error } = await supabase
    .from('page_products')
    .select(`
      display_order,
      is_quick_answer,
      product:products_with_prices(*)
    `)
    .eq('page_id', page.id)
    .order('display_order');

  if (error) {
    console.error('Error fetching page products:', error);
    return [];
  }

  return (data || []).map(row => ({
    product: row.product as unknown as Product,
    display_order: row.display_order,
    is_quick_answer: row.is_quick_answer,
  }));
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products_with_prices')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

/**
 * Generate affiliate URL for a product
 */
export function getAffiliateUrl(product: Product): string {
  if (product.asin) {
    return `https://www.amazon.com/dp/${product.asin}?tag=${AFFILIATE_TAG}`;
  }
  // Fallback to search URL
  const searchQuery = encodeURIComponent(`${product.brand} ${product.name}`);
  return `https://www.amazon.com/s?k=${searchQuery}&tag=${AFFILIATE_TAG}`;
}

/**
 * Get placeholder image URL
 */
export function getProductImage(product: Product): string {
  if (product.image_url) {
    return product.image_url;
  }
  return 'https://placehold.co/400x400/e2e8f0/475569?text=Product';
}

/**
 * Format price for display
 */
export function formatPrice(price: number | null): string {
  if (price === null) return 'Check price';
  return `$${price.toFixed(0)}`;
}

/**
 * Get all recommendation pages
 */
export async function getAllPages(): Promise<{ slug: string; category: string }[]> {
  const { data, error } = await supabase
    .from('recommendation_pages')
    .select('slug, category')
    .order('category')
    .order('slug');

  if (error) {
    console.error('Error fetching pages:', error);
    return [];
  }

  return data || [];
}

/**
 * Get pages for a specific category
 */
export async function getPagesByCategory(category: string): Promise<{ slug: string; title: string }[]> {
  const { data, error } = await supabase
    .from('recommendation_pages')
    .select('slug, title')
    .eq('category', category)
    .order('title');

  if (error) {
    console.error('Error fetching category pages:', error);
    return [];
  }

  return data || [];
}
