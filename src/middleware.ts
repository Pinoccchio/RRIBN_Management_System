import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware to handle authentication and session management
 * This runs on every request to maintain user sessions and protect routes
 */

// Simple server-side logger for middleware
const log = {
  info: (msg: string, path?: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    console.log(`\x1b[2m[${timestamp}]\x1b[0m \x1b[36m🔒 MIDDLEWARE\x1b[0m | ${msg}${path ? ` \x1b[2m(${path})\x1b[0m` : ''}`);
  },
  warn: (msg: string, path?: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    console.log(`\x1b[2m[${timestamp}]\x1b[0m \x1b[33m⚠️  MIDDLEWARE\x1b[0m | ${msg}${path ? ` \x1b[2m(${path})\x1b[0m` : ''}`);
  },
  success: (msg: string, path?: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    console.log(`\x1b[2m[${timestamp}]\x1b[0m \x1b[32m✅ MIDDLEWARE\x1b[0m | ${msg}${path ? ` \x1b[2m(${path})\x1b[0m` : ''}`);
  },
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  log.info('Request received', path);
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  log.info('Checking authentication status', path);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    log.success(`Authenticated user found: ${user.id.substring(0, 8)}...`, path);
  } else {
    log.info('No authenticated user', path);
  }

  // Skip middleware for API routes - they handle auth via JSON responses
  const isApiRoute = path.startsWith('/api/');
  if (isApiRoute) {
    log.info('API route - Skipping middleware auth redirect', path);
    return supabaseResponse;
  }

  // Protected route patterns
  const protectedRoutes = ['/super-admin', '/admin', '/staff', '/reservist', '/profile', '/settings'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Redirect to sign in if accessing protected route without auth
  if (isProtectedRoute && !user) {
    log.warn('Unauthorized access to protected route - Redirecting to signin', path);

    // Create response that clears auth-related cookies
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/signin';
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);

    const response = NextResponse.redirect(redirectUrl);

    // Clear any stale auth cookies to prevent stuck sessions
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');

    return response;
  }

  // Role-based access control for dashboard routes
  if (user && isProtectedRoute) {
    // Fetch user's account data to get role
    const { data: account } = await supabase
      .from('accounts')
      .select('role, status')
      .eq('id', user.id)
      .single();

    if (account) {
      log.info(`User role: ${account.role}, Status: ${account.status}`, path);

      // Check if account is not active
      if (account.status !== 'active') {
        log.warn('Account not active - Redirecting to signin and clearing session', path);
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/signin';
        redirectUrl.searchParams.set('message', 'account_not_active');

        const response = NextResponse.redirect(redirectUrl);

        // Clear auth cookies for inactive accounts
        response.cookies.delete('sb-access-token');
        response.cookies.delete('sb-refresh-token');

        return response;
      }

      // Role-based route mapping
      const roleRouteMap: Record<string, string> = {
        'super_admin': '/super-admin',
        'admin': '/admin',
        'staff': '/staff',
        'reservist': '/reservist',
      };

      const userBasePath = roleRouteMap[account.role];

      // Check if user is accessing a route that doesn't match their role
      const isWrongDashboard = Object.values(roleRouteMap).some((route) =>
        path.startsWith(route) && route !== userBasePath
      );

      if (isWrongDashboard) {
        log.warn(`Role mismatch: ${account.role} user accessing ${path} - Redirecting to ${userBasePath}`, path);
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = userBasePath;
        return NextResponse.redirect(redirectUrl);
      }

      log.success('Role-based access granted', path);
    }
  }

  // Redirect authenticated users from auth pages to their role-specific dashboard
  const authRoutes = ['/signin', '/register'];
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isAuthRoute && user) {
    // Fetch user's account to determine their dashboard
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (account) {
      const roleRouteMap: Record<string, string> = {
        'super_admin': '/super-admin',
        'admin': '/admin',
        'staff': '/staff',
        'reservist': '/reservist',
      };

      const dashboardPath = roleRouteMap[account.role] || '/super-admin';
      log.info(`Authenticated ${account.role} accessing auth page - Redirecting to ${dashboardPath}`, path);
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = dashboardPath;
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect authenticated users from home page to their dashboard
  if (path === '/' && user) {
    // Fetch user's account to determine their dashboard
    const { data: account } = await supabase
      .from('accounts')
      .select('role')
      .eq('id', user.id)
      .single();

    if (account) {
      const roleRouteMap: Record<string, string> = {
        'super_admin': '/super-admin',
        'admin': '/admin',
        'staff': '/staff',
        'reservist': '/reservist',
      };

      const dashboardPath = roleRouteMap[account.role] || '/super-admin';
      log.info(`Authenticated ${account.role} on home page - Redirecting to ${dashboardPath}`, path);
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = dashboardPath;
      return NextResponse.redirect(redirectUrl);
    }
  }

  log.success('Request allowed', path);
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
