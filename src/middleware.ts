import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

// Routes that require authentication
const PROTECTED_ROUTES = ['/app', '/dashboard']

// Public routes that don't require auth
const PUBLIC_ROUTES = ['/auth', '/pricing', '/api', '/setup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Handle root path - redirect based on auth status
  if (pathname === '/') {
    return NextResponse.next() // Let the home page handle the routing
  }

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  try {
    // Create supabase client for server-side auth checking
    const response = NextResponse.next()
    const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs')
    const supabase = createServerComponentClient({ cookies: () => cookies() })
    
    const { data: { session } } = await supabase.auth.getSession()
    
    // Check if route requires authentication
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      if (!session) {
        // Not authenticated - redirect to auth
        return NextResponse.redirect(new URL('/auth', request.url))
      }
      
      // User is authenticated, check subscription status for app routes
      if (pathname.startsWith('/app')) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan, subscription_status')
          .eq('id', session.user.id)
          .single()
        
        // Check if user has active plan
        const hasActivePlan = profile && (
          profile.plan === 'lifetime' || 
          ['active', 'trialing'].includes(profile.subscription_status)
        )
        
        if (!hasActivePlan) {
          // Authenticated but no active plan - redirect to pricing
          return NextResponse.redirect(new URL('/pricing', request.url))
        }
      }
    }
    
    return response
  } catch (error) {
    // If there's an error with auth checking, allow the request to continue
    // The individual pages will handle auth as fallback
    console.error('Middleware auth error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
