'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Mail } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'

export default function ConfirmPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const confirmUser = async () => {
      try {
        // Get current session to check if user is already confirmed
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user?.email_confirmed_at) {
          setStatus('success')
          setMessage('Your email has been confirmed! You can now access your account.')
          
          // Redirect to app after a short delay
          setTimeout(() => {
            router.push('/app')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Email confirmation failed or link has expired.')
        }
      } catch (error) {
        console.error('Confirmation error:', error)
        setStatus('error')
        setMessage('An error occurred during email confirmation.')
      }
    }

    confirmUser()
  }, [supabase, router])

  const handleResendConfirmation = async () => {
    const email = searchParams.get('email')
    if (!email) {
      setMessage('No email address provided for resending confirmation.')
      return
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (error) {
        setMessage(`Error resending confirmation: ${error.message}`)
      } else {
        setMessage('Confirmation email sent! Please check your inbox.')
      }
    } catch (error) {
      setMessage('An error occurred while resending confirmation email.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            )}
            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="w-16 h-16 text-red-600" />
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && 'Confirming your email...'}
            {status === 'success' && 'Email Confirmed!'}
            {status === 'error' && 'Confirmation Failed'}
          </CardTitle>
          
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'success' && (
            <Button 
              onClick={() => router.push('/app')} 
              className="w-full"
            >
              Continue to App
            </Button>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button 
                onClick={handleResendConfirmation}
                variant="outline" 
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Resend Confirmation Email
              </Button>
              
              <Button 
                onClick={() => router.push('/auth')} 
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
