import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirect_to') || '/app'
  
  if (code) {
    const supabase = createRouteHandlerSupabaseClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        // Successful authentication - redirect to intended destination
        return NextResponse.redirect(new URL(redirectTo, request.url))
      }
    } catch (error) {
      console.error('Auth callback error:', error)
    }
  }

  // Authentication failed - redirect to auth page with error
  return NextResponse.redirect(new URL('/auth?error=auth_failed', request.url))
}
