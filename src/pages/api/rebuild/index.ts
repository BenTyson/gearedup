import type { APIRoute } from 'astro';
import { createAdminClient } from '@lib/supabase-admin';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  try {
    const supabase = createAdminClient(cookies);

    // Verify auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the Railway deploy hook URL from environment
    const webhookUrl = import.meta.env.RAILWAY_DEPLOY_HOOK_URL;

    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ error: 'Deploy hook not configured. Set RAILWAY_DEPLOY_HOOK_URL in environment variables.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Trigger the rebuild
    const response = await fetch(webhookUrl, {
      method: 'POST',
    });

    if (!response.ok) {
      const text = await response.text();
      return new Response(
        JSON.stringify({ error: `Failed to trigger rebuild: ${text}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Rebuild triggered successfully. The site will update in 2-3 minutes.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to trigger rebuild' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
