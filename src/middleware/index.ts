import { defineMiddleware } from 'astro:middleware';
import { createServerClient } from '@supabase/ssr';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;

  // Only protect /admin/* routes (except login)
  if (!url.pathname.startsWith('/admin') || url.pathname === '/admin/login') {
    return next();
  }

  // Also allow API routes to handle their own auth
  if (url.pathname.startsWith('/api/auth/')) {
    return next();
  }

  // Create Supabase server client
  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => {
          return Object.entries(cookies.get).map(([name, cookie]) => ({
            name,
            value: cookie?.value || '',
          }));
        },
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return redirect('/admin/login');
  }

  // Optional: Check for admin role/email whitelist
  const allowedEmails = import.meta.env.ADMIN_EMAILS?.split(',') || [];
  if (allowedEmails.length > 0 && !allowedEmails.includes(session.user.email || '')) {
    return redirect('/admin/login?error=unauthorized');
  }

  // Attach user and supabase client to context for use in pages
  context.locals.user = session.user;
  context.locals.supabase = supabase;

  return next();
});
