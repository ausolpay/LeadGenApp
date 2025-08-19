// Location detection utilities

export interface DetectedLocation {
  country: string
  countryCode: string
  region: string
  regionCode: string
  city: string
  coordinates?: { lat: number; lng: number }
  formatted_address?: string
}

export interface GeolocationPosition {
  latitude: number
  longitude: number
}

// Get user's location using browser geolocation API
export function getUserGeolocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

// Reverse geocode coordinates to get location details
export async function reverseGeocode(lat: number, lng: number): Promise<DetectedLocation | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    )
    
    const data = await response.json()
    
    if (!data.results || data.results.length === 0) {
      return null
    }

    const result = data.results[0]
    const components = result.address_components

    let country = ''
    let countryCode = ''
    let region = ''
    let regionCode = ''
    let city = ''

    // Parse address components
    for (const component of components) {
      const types = component.types

      if (types.includes('country')) {
        country = component.long_name
        countryCode = component.short_name
      }
      
      if (types.includes('administrative_area_level_1')) {
        region = component.long_name
        regionCode = component.short_name
      }
      
      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        if (!city) city = component.long_name
      }
      
      if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
        city = component.long_name // Prefer more specific locality
      }
    }

    return {
      country,
      countryCode,
      region,
      regionCode,
      city,
      coordinates: { lat, lng },
      formatted_address: result.formatted_address
    }
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    return null
  }
}

// Get location using IP-based detection (fallback)
export async function getLocationByIP(): Promise<DetectedLocation | null> {
  try {
    // Using ipapi.co for IP-based location (free tier)
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()

    if (data.error) {
      throw new Error(data.reason || 'IP location failed')
    }

    return {
      country: data.country_name || '',
      countryCode: data.country_code || '',
      region: data.region || '',
      regionCode: data.region_code || '',
      city: data.city || '',
      coordinates: data.latitude && data.longitude ? {
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude)
      } : undefined
    }
  } catch (error) {
    console.error('IP-based location detection failed:', error)
    return null
  }
}

// Auto-detect user location with multiple fallbacks
export async function autoDetectLocation(): Promise<DetectedLocation | null> {
  console.log('Starting auto-detection...')
  
  try {
    // Method 1: Try browser geolocation + reverse geocoding
    try {
      console.log('Attempting GPS location...')
      const coords = await getUserGeolocation()
      console.log('GPS coordinates received:', coords)
      
      const location = await reverseGeocode(coords.latitude, coords.longitude)
      if (location && location.country && location.city) {
        console.log('Location detected via GPS:', location)
        return location
      } else {
        console.log('GPS reverse geocoding incomplete:', location)
      }
    } catch (error) {
      console.log('GPS location failed, trying IP-based detection:', error instanceof Error ? error.message : String(error))
    }

    // Method 2: Fallback to IP-based detection
    console.log('Attempting IP-based location...')
    const ipLocation = await getLocationByIP()
    if (ipLocation && ipLocation.country && ipLocation.city) {
      console.log('Location detected via IP:', ipLocation)
      return ipLocation
    } else {
      console.log('IP location incomplete:', ipLocation)
    }

    console.log('All location detection methods failed or returned incomplete data')
    return null
  } catch (error) {
    console.error('All location detection methods failed:', error)
    return null
  }
}

// Validate and standardize location using Google Geocoding
export async function validateLocation(city: string, region: string, country: string): Promise<{
  isValid: boolean
  coordinates?: { lat: number; lng: number }
  formatted_address?: string
  suggestions?: string[]
}> {
  try {
    // Check if API key is available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.log('Google Maps API key not available for validation')
      // Return valid by default if no API key (development mode)
      return { isValid: true }
    }

    const address = `${city}, ${region}, ${country}`
    console.log('Validating location:', address)
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    )
    
    const data = await response.json()
    console.log('Geocoding response:', data.status, data.results?.length || 0, 'results')
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0]
      console.log('Location validation successful:', result.formatted_address)
      return {
        isValid: true,
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        },
        formatted_address: result.formatted_address
      }
    } else if (data.status === 'ZERO_RESULTS') {
      console.log('No results found for location, trying fallback...')
      
      // Try just city + country as fallback
      const cityCountryResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(`${city}, ${country}`)}&key=${apiKey}`
      )
      const cityCountryData = await cityCountryResponse.json()
      
      if (cityCountryData.status === 'OK' && cityCountryData.results && cityCountryData.results.length > 0) {
        console.log('Fallback validation successful')
        const result = cityCountryData.results[0]
        return {
          isValid: true,
          coordinates: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng
          },
          formatted_address: result.formatted_address
        }
      } else {
        console.log('Both validation attempts failed')
        return {
          isValid: false,
          suggestions: cityCountryData.results?.slice(0, 3).map((r: any) => r.formatted_address) || []
        }
      }
    } else {
      console.log('Geocoding API error:', data.status, data.error_message)
      // For API errors, don't show as invalid - might be temporary
      return { isValid: true }
    }
  } catch (error) {
    console.error('Location validation failed:', error)
    // On network/other errors, don't block the user
    return { isValid: true }
  }
}

// Get timezone from coordinates
export function getTimezoneFromCoords(lat: number, lng: number): Promise<string> {
  return fetch(
    `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  )
    .then(response => response.json())
    .then(data => data.timeZoneId || Intl.DateTimeFormat().resolvedOptions().timeZone)
    .catch(() => Intl.DateTimeFormat().resolvedOptions().timeZone)
}
