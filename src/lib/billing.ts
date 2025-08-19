// Stripe pricing configuration
export const PRICING_CONFIG = {
  AUD: {
    monthly: {
      priceId: process.env.STRIPE_PRICE_MONTHLY_AUD || process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_AUD || '',
      amount: 1299, // $12.99 in cents
      currency: 'AUD',
      interval: 'month',
      trialDays: 14
    },
    yearly: {
      priceId: process.env.STRIPE_PRICE_YEARLY_AUD || process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY_AUD || '',
      amount: 12499, // $124.99 in cents
      currency: 'AUD', 
      interval: 'year',
      savings: '20%'
    },
    lifetime: {
      priceId: process.env.STRIPE_PRICE_LIFETIME_AUD || process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME_AUD || '',
      amount: 29900, // $299.00 in cents
      currency: 'AUD',
      interval: 'one-time'
    }
  },
  USD: {
    monthly: {
      priceId: process.env.STRIPE_PRICE_MONTHLY_USD || process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_USD || '',
      amount: 899, // ~$8.99 USD
      currency: 'USD',
      interval: 'month',
      trialDays: 14
    },
    yearly: {
      priceId: process.env.STRIPE_PRICE_YEARLY_USD || process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY_USD || '',
      amount: 8599, // ~$85.99 USD
      currency: 'USD',
      interval: 'year',
      savings: '20%'
    },
    lifetime: {
      priceId: process.env.STRIPE_PRICE_LIFETIME_USD || process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME_USD || '',
      amount: 20599, // ~$205.99 USD
      currency: 'USD',
      interval: 'one-time'
    }
  }
} as const

// Currency mapping by country
export const COUNTRY_TO_CURRENCY: Record<string, keyof typeof PRICING_CONFIG> = {
  AU: 'AUD',
  US: 'USD',
  GB: 'USD', // Use USD for UK if no GBP prices
  CA: 'USD',
  NZ: 'AUD',
  // Add more as needed
}

// Get pricing for user's country/currency
export function getPricingForCountry(countryCode?: string) {
  const currency = countryCode ? COUNTRY_TO_CURRENCY[countryCode] : 'AUD'
  return PRICING_CONFIG[currency] || PRICING_CONFIG.AUD
}

// Format currency display
export function formatPrice(amount: number, currency: string, locale?: string) {
  return new Intl.NumberFormat(locale || 'en-AU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount / 100)
}

// Check if user has active subscription
export function hasActiveSubscription(profile: any) {
  if (!profile) return false
  
  const { plan, subscription_status, current_period_end } = profile
  
  // Lifetime is always active
  if (plan === 'lifetime') return true
  
  // Check if subscription is active or trialing
  if (!['active', 'trialing'].includes(subscription_status)) return false
  
  // Check if not expired (for active subscriptions)
  if (subscription_status === 'active' && current_period_end) {
    return new Date(current_period_end) > new Date()
  }
  
  return subscription_status === 'trialing'
}

// Get subscription display info
export function getSubscriptionDisplayInfo(profile: any) {
  if (!profile) return { status: 'none', label: 'No subscription' }
  
  const { plan, subscription_status } = profile
  
  if (plan === 'lifetime') {
    return { status: 'lifetime', label: 'Lifetime Access' }
  }
  
  switch (subscription_status) {
    case 'active':
      return { status: 'active', label: `${plan} subscription (Active)` }
    case 'trialing':
      return { status: 'trialing', label: `${plan} subscription (Free Trial)` }
    case 'past_due':
      return { status: 'past_due', label: 'Payment Past Due' }
    case 'canceled':
      return { status: 'canceled', label: 'Subscription Canceled' }
    default:
      return { status: 'none', label: 'No subscription' }
  }
}
