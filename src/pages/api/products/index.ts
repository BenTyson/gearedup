import type { APIRoute } from 'astro';
import { createAdminClient } from '@lib/supabase-admin';

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const supabase = createAdminClient(cookies);

    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ products: data, total: count }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch products' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createAdminClient(cookies);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();

    // Validate required fields
    const required = ['name', 'brand', 'category', 'price', 'amazon_url'];
    for (const field of required) {
      if (!body[field]) {
        return new Response(
          JSON.stringify({ error: `${field} is required` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: body.name,
        brand: body.brand,
        category: body.category,
        price: parseFloat(body.price),
        original_price: body.original_price ? parseFloat(body.original_price) : null,
        amazon_url: body.amazon_url,
        image_url: body.image_url || null,
        rating: body.rating ? parseFloat(body.rating) : null,
        review_count: body.review_count ? parseInt(body.review_count) : null,
        description: body.description || null,
        features: body.features || [],
        pros: body.pros || [],
        cons: body.cons || [],
        asin: body.asin || null,
      })
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ product: data }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create product' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
