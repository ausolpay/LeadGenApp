'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, User, CreditCard, Settings, LogOut, Crown, ExternalLink, Calendar, DollarSign } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'

export default function BillingPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        
        // Get user profile with billing info
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        }
      } else {
        router.push('/auth')
      }
    }
    getUser()
  }, [router, supabase])

  const handleManageBilling = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to access billing portal')
      }

      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer')
      } else {
        throw new Error('No portal URL received')
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to access billing portal' })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const getUserInitials = (email: string) => {
    return email?.charAt(0)?.toUpperCase() || 'U'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'lifetime': return 'bg-yellow-100 text-yellow-800'
      case 'yearly': return 'bg-green-100 text-green-800'
      case 'monthly': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'trialing': return 'bg-blue-100 text-blue-800'
      case 'past_due': return 'bg-red-100 text-red-800'
      case 'canceled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  const hasActiveSubscription = profile && 
    (profile.plan === 'lifetime' || 
     ['active', 'trialing'].includes(profile.subscription_status))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-blue-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-blue-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-blue-900">Billing</h1>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 border border-white">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt="Profile" />
                                          <AvatarFallback className="text-white" style={{backgroundColor: '#1a597c'}}>
                        {getUserInitials(user.email)}
                      </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{profile?.full_name || user.email}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    {profile?.plan === 'lifetime' && (
                      <Badge variant="secondary" className="text-xs">Lifetime</Badge>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/app')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to App
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/account')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Messages */}
          {message && (
            <div className={`p-4 rounded-lg ${
              message.type === 'error' 
                ? 'bg-red-50 border border-red-200 text-red-700' 
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* Current Plan */}
          <Card className="rounded-2xl shadow-lg bg-white/70 backdrop-blur border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-900">Current Plan</CardTitle>
                  <CardDescription>
                    Manage your subscription and billing details
                  </CardDescription>
                </div>
                {profile?.plan && (
                  <Badge className={`capitalize ${getPlanBadgeColor(profile.plan)}`}>
                    {profile.plan === 'lifetime' && <Crown className="w-3 h-3 mr-1" />}
                    {profile.plan}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Lifetime Plan */}
              {profile?.plan === 'lifetime' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center justify-center mb-4">
                    <Crown className="w-8 h-8 text-yellow-600 mr-3" />
                    <div>
                      <h3 className="text-xl font-bold text-yellow-900">Lifetime Access</h3>
                      <p className="text-yellow-700">You have permanent access to all features</p>
                    </div>
                  </div>
                  <p className="text-sm text-yellow-600 text-center">
                    No active subscription. You retain full access to all features forever.
                  </p>
                </div>
              )}

              {/* Subscription Plan */}
              {profile?.plan && profile.plan !== 'lifetime' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Plan Status</span>
                    </div>
                    <div className="pl-6">
                      <Badge className={`capitalize ${getStatusBadgeColor(profile.subscription_status)}`}>
                        {profile.subscription_status === 'trialing' && `${profile.trial_days_left || 0} days left in trial`}
                        {profile.subscription_status === 'active' && 'Active'}
                        {profile.subscription_status === 'past_due' && 'Past Due'}
                        {profile.subscription_status === 'canceled' && 'Canceled'}
                      </Badge>
                    </div>
                  </div>

                  {profile.current_period_end && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">
                          {profile.subscription_status === 'trialing' ? 'Trial Ends' : 
                           profile.subscription_status === 'active' ? 'Renews On' : 'Expired On'}
                        </span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm text-gray-600">
                          {formatDate(profile.current_period_end)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* No Plan */}
              {!profile?.plan && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">No Active Plan</h3>
                  <p className="text-blue-700 mb-4">Choose a plan to start using Cairns Prospect Finder</p>
                  <Button onClick={() => router.push('/pricing')} className="bg-blue-600 hover:bg-blue-700">
                    View Pricing Plans
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              {hasActiveSubscription && profile.plan !== 'lifetime' && (
                <div className="pt-4 border-t">
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={handleManageBilling}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {loading ? 'Opening...' : 'Manage Billing'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/pricing')}
                    >
                      Change Plan
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Billing is managed securely through Stripe. Changes take effect immediately.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Information */}
          {profile?.plan === 'lifetime' && (
            <Card className="rounded-2xl shadow-lg bg-white/70 backdrop-blur border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Billing History</CardTitle>
                <CardDescription>
                  View your payment history and invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    You have lifetime access with no recurring payments.
                  </p>
                  {profile.stripe_customer_id && (
                    <Button 
                      variant="outline"
                      onClick={handleManageBilling}
                      disabled={loading}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Purchase History
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Back to App */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.push('/app')}
              className="text-blue-600 border-blue-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
