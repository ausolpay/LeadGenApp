'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLocationStore } from '@/stores/location-store'
import { COUNTRIES, getCountryByCode, getRegionsByCountry, searchCitiesByCountry, detectCountryFromTimezone } from '@/data/countries'
import { autoDetectLocation, validateLocation, type DetectedLocation } from '@/lib/location-detection'
import { MapPin, Globe, Building2, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function SetupPage() {
  const [countryCode, setCountryCode] = useState('')
  const [regionCode, setRegionCode] = useState('')
  const [city, setCity] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionStatus, setDetectionStatus] = useState<'none' | 'detecting' | 'success' | 'partial' | 'failed'>('none')
  const [citySuggestions, setCitySuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [validationStatus, setValidationStatus] = useState<'none' | 'valid' | 'invalid'>('none')
  
  const { setLocation } = useLocationStore()
  const router = useRouter()

  // Get current country and region objects
  const selectedCountry = getCountryByCode(countryCode)
  const availableRegions = selectedCountry ? selectedCountry.regions : []
  const selectedRegion = availableRegions.find(r => r.code === regionCode)

  // Auto-detect location on component mount (once per session)
  useEffect(() => {
    const SESSION_KEY = 'location-detection-result'
    const DETECTION_ATTEMPTED_KEY = 'location-detection-attempted'
    
    const detectLocation = async () => {
      // Check if we already have a cached result for this session
      const cachedResult = sessionStorage.getItem(SESSION_KEY)
      const detectionAttempted = sessionStorage.getItem(DETECTION_ATTEMPTED_KEY)
      
      if (cachedResult) {
        console.log('Using cached location detection result')
        const cached = JSON.parse(cachedResult)
        
        if (cached.success && cached.data) {
          setCountryCode(cached.data.countryCode)
          setRegionCode(cached.data.regionCode || '')
          setCity(cached.data.city || '')
          setDetectionStatus(cached.partial ? 'partial' : 'success')
        } else {
          // Use cached failure result
          setCountryCode(cached.fallbackCountry || 'AU')
          setRegionCode(cached.fallbackRegion || 'QLD') 
          setCity(cached.fallbackCity || 'Cairns')
          setDetectionStatus('failed')
        }
        return
      }
      
      // If we already attempted detection in this session, don't try again
      if (detectionAttempted === 'true') {
        console.log('Location detection already attempted this session')
        setDetectionStatus('failed')
        setCountryCode('AU')
        setRegionCode('QLD')
        setCity('Cairns')
        return
      }

      console.log('Starting fresh location detection...')
      setIsDetecting(true)
      setDetectionStatus('detecting')
      
      // Mark that we've attempted detection
      sessionStorage.setItem(DETECTION_ATTEMPTED_KEY, 'true')

      try {
        const detected = await autoDetectLocation()
        
        if (detected && detected.country && detected.countryCode) {
          console.log('Location detection successful:', detected)
          
          // Find matching region
          const country = getCountryByCode(detected.countryCode)
          let regionCode = ''
          
          if (country) {
            const region = country.regions.find(r => 
              r.name.toLowerCase() === detected.region.toLowerCase() ||
              r.code.toLowerCase() === detected.regionCode.toLowerCase()
            )
            if (region) {
              regionCode = region.code
            }
          }
          
          // Set detected values
          setCountryCode(detected.countryCode)
          setRegionCode(regionCode)
          setCity(detected.city || '') // City might be empty but that's ok
          setDetectionStatus(detected.city ? 'success' : 'partial')
          
          // Cache successful result
          sessionStorage.setItem(SESSION_KEY, JSON.stringify({
            success: true,
            partial: !detected.city, // Flag if city is missing
            data: {
              countryCode: detected.countryCode,
              regionCode,
              city: detected.city || ''
            }
          }))
          
        } else {
          console.log('Location detection failed - no valid data returned')
          
          // Fallback to timezone-based country detection
          const fallbackCountry = detectCountryFromTimezone()
          setCountryCode(fallbackCountry)
          setDetectionStatus('failed')
          
          // Cache failed result
          sessionStorage.setItem(SESSION_KEY, JSON.stringify({
            success: false,
            fallbackCountry,
            fallbackRegion: fallbackCountry === 'AU' ? 'QLD' : '',
            fallbackCity: fallbackCountry === 'AU' ? 'Cairns' : ''
          }))
        }
      } catch (error) {
        console.error('Location detection error:', error)
        
        // Set default to Australia
        setCountryCode('AU')
        setRegionCode('QLD')
        setCity('Cairns')
        setDetectionStatus('failed')
        
        // Cache failed result
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({
          success: false,
          fallbackCountry: 'AU',
          fallbackRegion: 'QLD',
          fallbackCity: 'Cairns'
        }))
      } finally {
        setIsDetecting(false)
      }
    }

    detectLocation()
  }, [])

  // Update city suggestions when country changes
  useEffect(() => {
    if (countryCode) {
      const suggestions = searchCitiesByCountry(countryCode, '')
      setCitySuggestions(suggestions)
    }
  }, [countryCode])

  // Validate location when inputs change (only validate after user stops typing for 2 seconds)
  useEffect(() => {
    const validateCurrentLocation = async () => {
      if (city && selectedRegion && selectedCountry && city.length >= 2) {
        setValidationStatus('none')
        
        try {
          const validation = await validateLocation(
            city, 
            selectedRegion.name, 
            selectedCountry.name
          )
          
          setValidationStatus(validation.isValid ? 'valid' : 'invalid')
        } catch (error) {
          console.error('Validation error:', error)
          // Don't show error state for validation failures
          setValidationStatus('none')
        }
      } else {
        setValidationStatus('none')
      }
    }

    const timeoutId = setTimeout(validateCurrentLocation, 2000) // Longer debounce: 2 seconds
    return () => clearTimeout(timeoutId)
  }, [city, selectedRegion, selectedCountry])

  const handleCountryChange = (value: string) => {
    setCountryCode(value)
    setRegionCode('') // Reset region when country changes
    setCity('') // Reset city when country changes
  }

  const handleRegionChange = (value: string) => {
    setRegionCode(value)
    setCity('') // Reset city when region changes
  }

  const handleCityChange = (value: string) => {
    setCity(value)
    
    // Update suggestions based on input
    if (countryCode && value.length > 0) {
      const suggestions = searchCitiesByCountry(countryCode, value)
      setCitySuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity)
    setShowSuggestions(false)
  }

  const handleRetryDetection = async () => {
    // Clear session cache to force new detection
    sessionStorage.removeItem('location-detection-result')
    sessionStorage.removeItem('location-detection-attempted')
    
    setIsDetecting(true)
    setDetectionStatus('detecting')
    setCountryCode('')
    setRegionCode('')
    setCity('')
    
    console.log('Manual retry: Starting fresh location detection...')
    
    try {
      const detected = await autoDetectLocation()
      
      if (detected && detected.country && detected.countryCode) {
        console.log('Manual retry: Location detection successful:', detected)
        
        // Find matching region
        const country = getCountryByCode(detected.countryCode)
        let regionCode = ''
        
        if (country) {
          const region = country.regions.find(r => 
            r.name.toLowerCase() === detected.region.toLowerCase() ||
            r.code.toLowerCase() === detected.regionCode.toLowerCase()
          )
          if (region) {
            regionCode = region.code
          }
        }
        
        // Set detected values
        setCountryCode(detected.countryCode)
        setRegionCode(regionCode)
        setCity(detected.city || '')
        setDetectionStatus(detected.city ? 'success' : 'partial')
        
        // Cache successful result
        sessionStorage.setItem('location-detection-result', JSON.stringify({
          success: true,
          partial: !detected.city,
          data: {
            countryCode: detected.countryCode,
            regionCode,
            city: detected.city || ''
          }
        }))
        
      } else {
        console.log('Manual retry: Location detection failed')
        const fallbackCountry = detectCountryFromTimezone()
        setCountryCode(fallbackCountry)
        setDetectionStatus('failed')
      }
    } catch (error) {
      console.error('Manual retry: Location detection error:', error)
      setCountryCode('AU')
      setRegionCode('QLD')
      setCity('Cairns')
      setDetectionStatus('failed')
    } finally {
      setIsDetecting(false)
      sessionStorage.setItem('location-detection-attempted', 'true')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!selectedCountry || !selectedRegion) {
        throw new Error('Please select a valid country and region')
      }

      // Try to validate and get coordinates, but don't block if it fails
      let coordinates: { lat: number; lng: number } | undefined
      
      try {
        const validation = await validateLocation(city, selectedRegion.name, selectedCountry.name)
        if (validation.isValid && validation.coordinates) {
          coordinates = validation.coordinates
        }
      } catch (validationError) {
        console.log('Validation failed, proceeding without coordinates:', validationError)
      }

      setLocation({
        country: selectedCountry.name,
        region: selectedRegion.name,
        city,
        coordinates,
      })

      router.push('/app')
    } catch (error) {
      console.error('Error setting up location:', error)
      // Fallback - still save what we have
      if (selectedCountry && selectedRegion) {
        setLocation({ 
          country: selectedCountry.name, 
          region: selectedRegion.name, 
          city 
        })
        router.push('/app')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-2">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor: '#1a597c'}}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold" style={{color: '#1a597c'}}>LumaLead.io</span>
          </div>
          <CardTitle className="text-2xl font-bold" style={{color: '#1a597c'}}>Set up your location</CardTitle>
          <CardDescription style={{color: '#1a597c'}}>
            Choose your location to start finding prospects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Location Detection Status */}
          {isDetecting && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Detecting your location...</span>
              </div>
            </div>
          )}

          {!isDetecting && detectionStatus === 'success' && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Location detected automatically!</span>
              </div>
            </div>
          )}

          {!isDetecting && detectionStatus === 'partial' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle className="w-4 h-4" />
                <div>
                  <span className="text-sm">Country and region detected! Please enter your city.</span>
                  <p className="text-xs mt-1 opacity-75">
                    GPS location was successful but city could not be determined automatically.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isDetecting && detectionStatus === 'failed' && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between text-yellow-700">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <div>
                    <span className="text-sm">Could not detect location. Please enter manually.</span>
                    <p className="text-xs mt-1 opacity-75">
                      Check browser console (F12) for detailed error information.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetryDetection}
                  className="text-xs border-yellow-300 hover:bg-yellow-100 flex-shrink-0"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Country Selection */}
            <div className="space-y-2">
              <Label htmlFor="country" style={{color: '#1a597c'}}>
                <Globe className="w-4 h-4 inline mr-2" />
                Country
              </Label>
              <Select value={countryCode} onValueChange={handleCountryChange}>
                <SelectTrigger className="border-gray-200 focus:border-[#1a597c]">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Region Selection */}
            <div className="space-y-2">
              <Label htmlFor="region" style={{color: '#1a597c'}}>
                <Building2 className="w-4 h-4 inline mr-2" />
                {selectedCountry?.regionLabel || 'Region'}
              </Label>
              <Select 
                value={regionCode} 
                onValueChange={handleRegionChange}
                disabled={!countryCode}
              >
                <SelectTrigger className="border-gray-200 focus:border-[#1a597c]">
                  <SelectValue placeholder={`Select ${selectedCountry?.regionLabel?.toLowerCase() || 'region'}`} />
                </SelectTrigger>
                <SelectContent>
                  {availableRegions.map((region) => (
                    <SelectItem key={region.code} value={region.code}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* City Input with suggestions */}
            <div className="space-y-2">
              <Label htmlFor="city" style={{color: '#1a597c'}}>
                <MapPin className="w-4 h-4 inline mr-2" />
                City
                {validationStatus === 'valid' && (
                  <CheckCircle className="w-4 h-4 inline ml-2 text-green-500" />
                )}
                {validationStatus === 'invalid' && (
                  <AlertCircle className="w-4 h-4 inline ml-2 text-red-500" />
                )}
              </Label>
              <div className="relative">
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  onFocus={() => {
                    if (citySuggestions.length > 0) setShowSuggestions(true)
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow for clicks
                    setTimeout(() => setShowSuggestions(false), 200)
                  }}
                  placeholder="Enter your city"
                  className="border-gray-200 focus:border-[#1a597c]"
                  disabled={!regionCode}
                  required
                />
                
                {/* City Suggestions */}
                {showSuggestions && citySuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {citySuggestions
                      .filter(suggestion => 
                        city.length === 0 || suggestion.toLowerCase().includes(city.toLowerCase())
                      )
                      .slice(0, 8)
                      .map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 text-sm border-b border-gray-100 last:border-0"
                          onMouseDown={(e) => e.preventDefault()} // Prevent blur
                          onClick={() => handleCitySelect(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>
              
              {validationStatus === 'invalid' && (
                <p className="text-sm text-red-500">
                  City not found. Please check the spelling or try a nearby city.
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full text-white"
              style={{backgroundColor: '#1a597c'}}
              disabled={isLoading || !countryCode || !regionCode || !city}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Start Finding Prospects'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
