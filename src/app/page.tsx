'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClientSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // User is authenticated, redirect to app
        router.push('/app')
      } else {
        // User is not authenticated, redirect to landing page
        router.push('/landing')
      }
    }
    
    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2" style={{color: '#1a597c'}}>LumaLead.io</h1>
        <p style={{color: '#1a597c'}}>Loading...</p>
      </div>
    </div>
  )
}
