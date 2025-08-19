'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the static landing page
    window.location.href = '/index.html'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2" style={{color: '#1a597c'}}>LumaLead.io</h1>
        <p style={{color: '#1a597c'}}>Loading...</p>
      </div>
    </div>
  )
}
