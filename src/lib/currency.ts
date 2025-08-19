// Currency detection and formatting utilities

export interface CountryInfo {
  country: string
  currency: string
  locale: string
}

// Detect user's country and preferred currency
export function detectUserCountry(): string {
  // Try to get country from various sources
  if (typeof window !== 'undefined') {
    // Client-side detection
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    
    // Map common Australian timezones
    if (timezone.includes('Australia')) return 'AU'
    
    // Map other common timezones
    if (timezone.includes('America/New_York') || timezone.includes('America/Los_Angeles')) return 'US'
    if (timezone.includes('Europe/London')) return 'GB'
    if (timezone.includes('Europe/')) return 'EU'
    
    // Fallback to language
    const language = navigator.language || 'en-AU'
    if (language.includes('en-AU')) return 'AU'
    if (language.includes('en-US')) return 'US'
    if (language.includes('en-GB')) return 'GB'
  }
  
  // Default to Australia
  return 'AU'
}

// Get currency info for country
export function getCurrencyForCountry(countryCode: string): CountryInfo {
  const countryMap: Record<string, CountryInfo> = {
    AU: { country: 'Australia', currency: 'AUD', locale: 'en-AU' },
    US: { country: 'United States', currency: 'USD', locale: 'en-US' },
    GB: { country: 'United Kingdom', currency: 'USD', locale: 'en-GB' }, // Use USD pricing for UK
    CA: { country: 'Canada', currency: 'USD', locale: 'en-CA' },
    NZ: { country: 'New Zealand', currency: 'AUD', locale: 'en-NZ' }, // Use AUD pricing for NZ
    EU: { country: 'Europe', currency: 'USD', locale: 'en-GB' },
  }
  
  return countryMap[countryCode] || countryMap.AU
}

// Format price with currency
export function formatCurrency(
  amount: number, 
  currency: string, 
  locale: string = 'en-AU'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount / 100)
}

// Calculate approximate conversions for display
export function getConvertedPrice(
  baseAmount: number, 
  baseCurrency: string, 
  targetCurrency: string
): number {
  // Simple conversion rates (in practice, use a real API)
  const rates: Record<string, Record<string, number>> = {
    AUD: {
      USD: 0.67,
      EUR: 0.62,
      GBP: 0.53,
    },
    USD: {
      AUD: 1.49,
      EUR: 0.92,
      GBP: 0.79,
    },
  }
  
  if (baseCurrency === targetCurrency) return baseAmount
  
  const rate = rates[baseCurrency]?.[targetCurrency]
  if (!rate) return baseAmount
  
  return Math.round(baseAmount * rate)
}

// Check if we have native pricing for a currency
export function hasNativePricing(currency: string): boolean {
  return ['AUD', 'USD'].includes(currency)
}
