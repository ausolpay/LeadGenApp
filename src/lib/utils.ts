import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'
import { Business, SellingPoint } from "@/types/business"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function deriveSellingPoints(business: Partial<Business>): SellingPoint[] {
  const sellingPoints: SellingPoint[] = []
  
  // Website related
  if (!business.websiteUrl) {
    sellingPoints.push('no-website')
  }
  
  if (business.websiteUrl && (
    business.websiteUrl.includes('facebook.com') || 
    business.websiteUrl.includes('instagram.com')
  )) {
    sellingPoints.push('facebook-only')
  }
  
  // Check for advertising (UTM parameters indicate they run ads)
  if (business.websiteUrl) {
    const url = business.websiteUrl.toLowerCase()
    const hasUTM = url.includes('utm_') || 
                   url.includes('gclid=') || 
                   url.includes('fbclid=') || 
                   url.includes('msclkid=') ||
                   url.includes('campaign=') ||
                   url.includes('adgroup=') ||
                   url.includes('ad_id=')
    
    if (hasUTM) {
      sellingPoints.push('runs-ads')
    }
  }
  
  // More sophisticated outdated detection
  if (business.websiteUrl) {
    const url = business.websiteUrl.toLowerCase()
    
    // Check for HTTP (not HTTPS)
    if (url.startsWith('http://')) {
      sellingPoints.push('likely-outdated')
    }
    
    // Check for common outdated indicators
    const outdatedPatterns = [
      'under construction',
      'coming soon',
      'parked',
      'placeholder',
      'default',
      'welcome to nginx',
      'apache default page',
      'index of',
      'directory listing'
    ]
    
    // Check for very low activity (no reviews + low rating)
    if ((business.ratingCount ?? 0) <= 1 && (!business.rating || business.rating < 3.0)) {
      sellingPoints.push('likely-outdated')
    }
  }
  
  // Contact information
  if (!business.phoneFormatted && !business.phoneRaw) {
    sellingPoints.push('no-phone')
  }
  
  // Ratings and reviews
  if ((business.ratingCount ?? 0) <= 1 && !business.rating) {
    sellingPoints.push('no-reviews')
  }
  
  if (business.rating && business.rating < 3.5) {
    sellingPoints.push('low-ratings')
  }
  
  // Business characteristics (heuristics)
  if (business.name?.toLowerCase().includes('mobile') || 
      business.name?.toLowerCase().includes('on wheels') ||
      business.address?.toLowerCase().includes('mobile')) {
    sellingPoints.push('mobile-business')
  }
  
  if (business.name?.toLowerCase().includes('home') || 
      business.address?.toLowerCase().includes('home')) {
    sellingPoints.push('home-based')
  }
  
  // Old business indicators
  if (business.name?.toLowerCase().includes('established') ||
      business.name?.toLowerCase().includes('since') ||
      business.name?.toLowerCase().includes('est.')) {
    sellingPoints.push('old-business')
  }
  
  return sellingPoints
}

export function formatPhoneNumber(phoneRaw?: string): string | undefined {
  if (!phoneRaw) return undefined
  
  try {
    // Try to parse as Australian number
    const phoneNumber = parsePhoneNumber(phoneRaw, 'AU')
    if (isValidPhoneNumber(phoneNumber.number, 'AU')) {
      return phoneNumber.formatNational()
    }
  } catch {
    // If parsing fails, return the raw number
  }
  
  return phoneRaw
}

export function hasMobilePhone(phoneFormatted?: string): boolean {
  if (!phoneFormatted) return false
  
  // Remove spaces and normalize
  const phone = phoneFormatted.replace(/\s/g, '')
  
  // Check for mobile patterns: 04, +61 4, (+61) 4, +614, (+61)4
  return phone.startsWith('04') || 
         phone.startsWith('+614') || 
         phone.startsWith('(+61)4') ||
         phone.startsWith('+61 4') ||
         phone.startsWith('(+61) 4')
}

export function hasOfficePhone(phoneFormatted?: string): boolean {
  if (!phoneFormatted) return false
  
  // Remove spaces and normalize  
  const phone = phoneFormatted.replace(/\s/g, '')
  
  // Check for QLD office patterns: 07, (07)
  return phone.startsWith('07') || 
         phone.startsWith('(07)')
}

export function extractSuburbFromAddress(address: string): string | undefined {
  // Simple extraction - look for common Cairns suburbs
  const suburbs = [
    'Aeroglen', 'Bayview Heights', 'Bentley Park', 'Brinsmead', 'Bungalow',
    'Cairns City', 'Cairns North', 'Caravonica', 'Clifton Beach', 'Earlville',
    'Edge Hill', 'Edmonton', 'Freshwater', 'Gordonvale', 'Holloways Beach',
    'Kanimbla', 'Kewarra Beach', 'Machans Beach', 'Manoora', 'Manunda',
    'Mooroobool', 'Mount Sheridan', 'Palm Cove', 'Parramatta Park', 'Portsmith',
    'Redlynch', 'Smithfield', 'Stratford', 'Trinity Beach', 'Trinity Park',
    'Westcourt', 'Whitfield', 'Woree', 'Yorkeys Knob'
  ]
  
  for (const suburb of suburbs) {
    if (address.toLowerCase().includes(suburb.toLowerCase())) {
      return suburb
    }
  }
  
  return undefined
}

export function extractPostcodeFromAddress(address: string): string | undefined {
  // Extract 4-digit postcode pattern
  const postcodeMatch = address.match(/\b(486[89]|487[089])\b/)
  return postcodeMatch?.[1]
}

export function extractOwnerName(businessName: string): string | undefined {
  // Extract owner name from business names like "John's Bakery", "Smith & Co", etc.
  const patterns = [
    /^(.+?)'s\s/i, // John's Bakery
    /^(.+?)\s&\s/i, // Smith & Co
    /^(.+?)\s+and\s+/i, // Smith and Co
    /^(.+?)\s+family\s+/i, // Smith Family
    /^(.+?)\s+enterprises\s+/i, // Smith Enterprises
  ]
  
  for (const pattern of patterns) {
    const match = businessName.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  return undefined
}
