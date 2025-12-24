import type { APIRoute } from 'astro';
import { createAdminClient } from '@lib/supabase-admin';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const supabase = createAdminClient(cookies);

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return new Response(
        JSON.stringify({ authenticated: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ authenticated: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
