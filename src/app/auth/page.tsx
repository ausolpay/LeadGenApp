import { Suspense } from 'react'
import { AuthForm } from '@/components/auth/AuthForm'

function AuthPage() {
  return <AuthForm />
}

export default function AuthPageWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPage />
    </Suspense>
  )
}
