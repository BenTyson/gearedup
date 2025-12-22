import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types based on our schema
export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  best_for: string | null;
  pros: string[];
  cons: string[];
  verdict: string | null;
  rank: 'best-overall' | 'best-budget' | 'best-premium' | 'runner-up' | null;
  asin: string | null;
  current_price: number | null;
  in_stock: boolean | null;
  image_url: string | null;
}

export interface RecommendationPage {
  id: string;
  slug: string;
  category: string;
  title: string;
  meta_description: string | null;
}

export interface PageProduct {
  product: Product;
  display_order: number;
  is_quick_answer: boolean;
}
