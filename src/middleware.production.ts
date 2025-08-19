// Production middleware with full Supabase integration
// Rename this file to middleware.ts after running npm install

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/supabase'

// Routes that require authentication
const PROTECTED_ROUTES = ['/app', '/dashboard']

// Routes that require active subscription  
const SUBSCRIPTION_ROUTES = ['/app']

// Public routes that don't require auth
const PUBLIC_ROUTES = ['/auth', '/pricing', '/api/stripe/webhook']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public routes and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/stripe/webhook') ||
    pathname.includes('.') ||
    PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  ) {
    return NextResponse.next()
  }

  // Create response object to modify cookies
  const response = NextResponse.next()
  
  // Create Supabase client for middleware
  const supabase = createMiddlewareClient<Database>({ req: request, res: response })
  
  try {
    // Get user session
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      // No authenticated user
      if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        // Redirect to auth page
        return NextResponse.redirect(new URL('/auth', request.url))
      }
      return response
    }

    // User is authenticated, check subscription for protected routes
    if (SUBSCRIPTION_ROUTES.some(route => pathname.startsWith(route))) {
      // Fetch user profile to check subscription status
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, subscription_status, current_period_end')
        .eq('id', user.id)
        .single()

      if (!profile) {
        // No profile found, redirect to auth
        return NextResponse.redirect(new URL('/auth', request.url))
      }

      // Check if user has active subscription
      const hasActiveAccess = checkActiveAccess(profile)
      
      if (!hasActiveAccess) {
        // Redirect to pricing page
        return NextResponse.redirect(new URL('/pricing', request.url))
      }
    }

    // Handle root path redirects
    if (pathname === '/') {
      // If authenticated, check subscription and redirect accordingly
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, subscription_status, current_period_end')
        .eq('id', user.id)
        .single()

      if (profile && checkActiveAccess(profile)) {
        return NextResponse.redirect(new URL('/app', request.url))
      } else {
        return NextResponse.redirect(new URL('/pricing', request.url))
      }
    }

    return response
    
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, redirect to auth
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
    return response
  }
}

// Helper function to check if user has active access
function checkActiveAccess(profile: any): boolean {
  if (!profile) return false
  
  const { plan, subscription_status, current_period_end } = profile
  
  // Lifetime is always active
  if (plan === 'lifetime' && subscription_status === 'active') {
    return true
  }
  
  // Check if subscription is active or trialing
  if (!['active', 'trialing'].includes(subscription_status)) {
    return false
  }
  
  // Check if not expired (for active subscriptions)
  if (subscription_status === 'active' && current_period_end) {
    return new Date(current_period_end) > new Date()
  }
  
  // Trialing users have access
  return subscription_status === 'trialing'
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
