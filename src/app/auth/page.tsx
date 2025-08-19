'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AuthForm } from '@/components/auth/AuthForm'

function AuthPage() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') as 'signin' | 'signup' || 'signin'
  
  return <AuthForm mode={mode} />
}

export default function AuthPageWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPage />
    </Suspense>
  )
}
