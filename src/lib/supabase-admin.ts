import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export function createAdminClient(cookies: AstroCookies) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => {
          const allCookies: { name: string; value: string }[] = [];
          // Get all cookies from the request
          const cookieHeader = cookies.get('sb-auth-token');
          if (cookieHeader) {
            allCookies.push({ name: 'sb-auth-token', value: cookieHeader.value });
          }
          return allCookies;
        },
        setAll: (cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, {
              path: '/',
              secure: import.meta.env.PROD,
              httpOnly: true,
              sameSite: 'lax',
              ...options,
            });
          });
        },
      },
    }
  );
}

// Helper to get session from request
export async function getSession(cookies: AstroCookies) {
  const supabase = createAdminClient(cookies);
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  return session;
}

// Helper to check if user is authenticated
export async function requireAuth(cookies: AstroCookies) {
  const session = await getSession(cookies);

  if (!session) {
    return { authenticated: false, session: null };
  }

  // Optional: Check allowed emails
  const allowedEmails = import.meta.env.ADMIN_EMAILS?.split(',') || [];
  if (allowedEmails.length > 0 && !allowedEmails.includes(session.user.email || '')) {
    return { authenticated: false, session: null };
  }

  return { authenticated: true, session };
}
