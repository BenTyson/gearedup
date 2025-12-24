import type { APIRoute } from 'astro';
import { createAdminClient } from '@lib/supabase-admin';

export const prerender = false;

// GET: Fetch all products linked to a page with their details
export const GET: APIRoute = async ({ params, cookies }) => {
  try {
    const supabase = createAdminClient(cookies);
    const { pageId } = params;

    if (!pageId) {
      return new Response(
        JSON.stringify({ error: 'Page ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get linked products with order
    const { data: links, error: linksError } = await supabase
      .from('page_products')
      .select(`
        id,
        display_order,
        is_featured,
        custom_description,
        product_id,
        products (
          id,
          name,
          brand,
          category,
          price,
          rating,
          image_url,
          asin
        )
      `)
      .eq('page_id', pageId)
      .order('display_order', { ascending: true });

    if (linksError) {
      return new Response(
        JSON.stringify({ error: linksError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the page's category to show available products
    const { data: page } = await supabase
      .from('recommendation_pages')
      .select('category')
      .eq('id', pageId)
      .single();

    // Get all products in the same category that aren't already linked
    const linkedProductIds = links?.map(l => l.product_id) || [];

    let availableQuery = supabase
      .from('products')
      .select('id, name, brand, category, price, rating, image_url, asin')
      .order('name', { ascending: true });

    if (page?.category) {
      availableQuery = availableQuery.eq('category', page.category);
    }

    if (linkedProductIds.length > 0) {
      availableQuery = availableQuery.not('id', 'in', `(${linkedProductIds.join(',')})`);
    }

    const { data: available, error: availableError } = await availableQuery;

    if (availableError) {
      return new Response(
        JSON.stringify({ error: availableError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        linked: links || [],
        available: available || [],
        category: page?.category,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch page products' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST: Add a product to the page
export const POST: APIRoute = async ({ params, request, cookies }) => {
  try {
    const supabase = createAdminClient(cookies);
    const { pageId } = params;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!pageId) {
      return new Response(
        JSON.stringify({ error: 'Page ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { product_id, is_featured, custom_description } = body;

    if (!product_id) {
      return new Response(
        JSON.stringify({ error: 'Product ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the current max order
    const { data: existing } = await supabase
      .from('page_products')
      .select('display_order')
      .eq('page_id', pageId)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = (existing?.[0]?.display_order || 0) + 1;

    const { data, error } = await supabase
      .from('page_products')
      .insert({
        page_id: pageId,
        product_id,
        display_order: nextOrder,
        is_featured: is_featured || false,
        custom_description: custom_description || null,
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
      JSON.stringify({ link: data }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to add product to page' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// PUT: Update order or featured status
export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const supabase = createAdminClient(cookies);
    const { pageId } = params;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!pageId) {
      return new Response(
        JSON.stringify({ error: 'Page ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { links } = body;

    if (!links || !Array.isArray(links)) {
      return new Response(
        JSON.stringify({ error: 'Links array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update each link's order
    const updates = links.map((link: any, index: number) =>
      supabase
        .from('page_products')
        .update({
          display_order: index + 1,
          is_featured: link.is_featured || false,
          custom_description: link.custom_description || null,
        })
        .eq('id', link.id)
    );

    await Promise.all(updates);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to update page products' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// DELETE: Remove a product from the page
export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  try {
    const supabase = createAdminClient(cookies);
    const { pageId } = params;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!pageId) {
      return new Response(
        JSON.stringify({ error: 'Page ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { link_id } = body;

    if (!link_id) {
      return new Response(
        JSON.stringify({ error: 'Link ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error } = await supabase
      .from('page_products')
      .delete()
      .eq('id', link_id)
      .eq('page_id', pageId);

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to remove product from page' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
