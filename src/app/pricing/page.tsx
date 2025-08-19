'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, Zap, Crown, Star, Search, Users, FileText, Shield, User, CreditCard, Settings, LogOut } from 'lucide-react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { PRICING_CONFIG, formatPrice } from '@/lib/billing'
import { detectUserCountry, getCurrencyForCountry, formatCurrency, hasNativePricing, getConvertedPrice } from '@/lib/currency'

function PricingPageContent() {
  const [loading, setLoading] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [userCountry, setUserCountry] = useState('AU')
  const [currencyInfo, setCurrencyInfo] = useState(getCurrencyForCountry('AU'))
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    // Check for success/cancel messages
    if (searchParams.get('success')) {
      setMessage({ type: 'success', text: 'Payment successful! Welcome to Cairns Prospect Finder!' })
    } else if (searchParams.get('canceled')) {
      setMessage({ type: 'error', text: 'Payment was canceled. Please try again.' })
    }

    // Detect user's country and currency
    const detectedCountry = detectUserCountry()
    setUserCountry(detectedCountry)
    setCurrencyInfo(getCurrencyForCountry(detectedCountry))

    // Get user session and profile
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(profileData)
      }
    }
    
    getUser()
  }, [searchParams, supabase])

  const handlePurchase = async (planType: 'monthly' | 'yearly' | 'lifetime') => {
    // Redirect to auth if not logged in
    if (!user) {
      router.push(`/auth?redirect_to=${encodeURIComponent('/pricing')}`)
      return
    }

    setLoading(planType)
    setMessage(null)

    try {
      // Get the appropriate pricing based on user's currency
      const pricing = hasNativePricing(currencyInfo.currency) 
        ? PRICING_CONFIG[currencyInfo.currency as keyof typeof PRICING_CONFIG]
        : PRICING_CONFIG.AUD

      const plan = pricing[planType]
      
      if (!plan || !plan.priceId) {
        setMessage({ 
          type: 'error', 
          text: `Pricing configuration issue. Please contact support.` 
        })
        console.error('Missing priceId for plan:', planType, 'currency:', currencyInfo.currency)
        setLoading(null)
        return
      }

      const mode = planType === 'lifetime' ? 'payment' : 'subscription'
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          mode,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Purchase error:', error)
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
    } finally {
      setLoading(null)
    }
  }

  // Get pricing for display
  const displayPricing = hasNativePricing(currencyInfo.currency) 
    ? PRICING_CONFIG[currencyInfo.currency as keyof typeof PRICING_CONFIG]
    : PRICING_CONFIG.AUD

  // Helper to format price with currency info
  const formatDisplayPrice = (amount: number, currency: string) => {
    if (hasNativePricing(currencyInfo.currency)) {
      return formatCurrency(amount, currency, currencyInfo.locale)
    } else {
      // Show converted estimate
      const converted = getConvertedPrice(amount, 'AUD', currencyInfo.currency)
      return `~${formatCurrency(converted, currencyInfo.currency, currencyInfo.locale)} (charged in AUD)`
    }
  }

  // Check if user has active subscription
  const hasActiveSubscription = profile && 
    (profile.plan === 'lifetime' || 
     ['active', 'trialing'].includes(profile.subscription_status))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-blue-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.href = 'https://www.lumalead.io/'}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: '#1a597c'}}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span className="text-2xl font-bold" style={{color: '#1a597c'}}>LumaLead.io</span>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-gray-200" style={{color: '#1a597c'}}>
                {currencyInfo.currency} (Detected)
              </Badge>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8 border border-white">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt="Profile" />
                        <AvatarFallback className="text-white" style={{backgroundColor: '#1a597c'}}>
                          {user.email?.charAt(0)?.toUpperCase() || 'U'}
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
                    <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard/billing')}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard/account')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={async () => {
                      await supabase.auth.signOut()
                      router.push('/auth')
                    }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => router.push('/auth')} variant="outline">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" style={{color: '#1a597c'}}>
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Find and manage business prospects with LumaLead.io
          </p>
          
          {!hasNativePricing(currencyInfo.currency) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Currency Notice:</strong> Prices shown are estimates in {currencyInfo.currency}. 
                You will be charged in AUD. Final amount may vary based on exchange rates.
              </p>
            </div>
          )}

          {profile?.plan === 'lifetime' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto mb-6">
              <div className="flex items-center justify-center">
                <Crown className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-green-800 font-semibold">You have Lifetime Access!</span>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        {message && (
          <div className={`max-w-2xl mx-auto mb-8 p-4 rounded-lg ${
            message.type === 'error' 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Monthly Plan */}
          <Card className="relative rounded-2xl shadow-lg bg-white/70 backdrop-blur border-blue-200">
            <CardHeader className="text-center pb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Monthly</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {formatDisplayPrice(displayPricing.monthly.amount, displayPricing.monthly.currency)}
                </span>
                <span className="text-gray-600">/month</span>
              </div>
              <Badge variant="secondary" className="mt-2">14-day free trial</Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Unlimited business searches</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Contact management</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Notes and lead tracking</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Export functionality</span>
                </li>
              </ul>
              <Button 
                className="w-full" 
                onClick={() => handlePurchase('monthly')}
                disabled={loading === 'monthly' || profile?.plan === 'lifetime'}
              >
                {loading === 'monthly' ? 'Processing...' : 
                 profile?.plan === 'lifetime' ? 'Already have Lifetime' :
                 'Start Free Trial'}
              </Button>
            </CardContent>
          </Card>

          {/* Yearly Plan */}
          <Card className="relative rounded-2xl shadow-lg bg-white/70 backdrop-blur border-blue-300 scale-105">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 text-white">Most Popular</Badge>
            </div>
            <CardHeader className="text-center pb-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Yearly</CardTitle>
              <CardDescription>Best value for professionals</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {formatDisplayPrice(displayPricing.yearly.amount, displayPricing.yearly.currency)}
                </span>
                <span className="text-gray-600">/year</span>
              </div>
              <Badge variant="secondary" className="mt-2">Save 20%</Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Everything in Monthly</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Advanced filtering</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Save {displayPricing.yearly.savings} vs monthly</span>
                </li>
              </ul>
              <Button 
                className="w-full" 
                onClick={() => handlePurchase('yearly')}
                disabled={loading === 'yearly' || profile?.plan === 'lifetime'}
              >
                {loading === 'yearly' ? 'Processing...' : 
                 profile?.plan === 'lifetime' ? 'Already have Lifetime' :
                 'Get Yearly Plan'}
              </Button>
            </CardContent>
          </Card>

          {/* Lifetime Plan */}
          <Card className="relative rounded-2xl shadow-lg bg-white/70 backdrop-blur border-blue-200">
            <CardHeader className="text-center pb-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl">Lifetime</CardTitle>
              <CardDescription>One-time payment, forever access</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {formatDisplayPrice(displayPricing.lifetime.amount, displayPricing.lifetime.currency)}
                </span>
                <span className="text-gray-600"> once</span>
              </div>
              <Badge variant="secondary" className="mt-2">Best Value</Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Everything in Yearly</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">Lifetime updates</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">VIP support</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-sm">No recurring payments</span>
                </li>
              </ul>
              <Button 
                className="w-full" 
                variant={profile?.plan === 'lifetime' ? 'secondary' : 'default'}
                onClick={() => handlePurchase('lifetime')}
                disabled={loading === 'lifetime' || profile?.plan === 'lifetime'}
              >
                {loading === 'lifetime' ? 'Processing...' : 
                 profile?.plan === 'lifetime' ? 'You have this!' :
                 'Get Lifetime Access'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Everything you need to grow your business
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Smart Search</h4>
              <p className="text-sm text-gray-600">
                Find businesses by type, location, and custom criteria
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Contact Management</h4>
              <p className="text-sm text-gray-600">
                Track calls, emails, and notes for each prospect
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Export Reports</h4>
              <p className="text-sm text-gray-600">
                Generate professional reports for printing and sharing
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
              <h4 className="font-semibold mb-2">Secure & Private</h4>
              <p className="text-sm text-gray-600">
                Your data is encrypted and stored securely
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700">Loading pricing...</p>
        </div>
      </div>
    }>
      <PricingPageContent />
    </Suspense>
  )
}
