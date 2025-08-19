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
  const [detectionStatus, setDetectionStatus] = useState<'none' | 'detecting' | 'success' | 'failed'>('none')
  const [citySuggestions, setCitySuggestions] = useState<string[]>([])
  const [validationStatus, setValidationStatus] = useState<'none' | 'valid' | 'invalid'>('none')
  
  const { setLocation } = useLocationStore()
  const router = useRouter()

  // Get current country and region objects
  const selectedCountry = getCountryByCode(countryCode)
  const availableRegions = selectedCountry ? selectedCountry.regions : []
  const selectedRegion = availableRegions.find(r => r.code === regionCode)

  // Auto-detect location on component mount
  useEffect(() => {
    const detectLocation = async () => {
      setIsDetecting(true)
      setDetectionStatus('detecting')

      try {
        const detected = await autoDetectLocation()
        
        if (detected) {
          // Set detected values
          setCountryCode(detected.countryCode)
          
          // Find matching region
          const country = getCountryByCode(detected.countryCode)
          if (country) {
            const region = country.regions.find(r => 
              r.name.toLowerCase() === detected.region.toLowerCase() ||
              r.code.toLowerCase() === detected.regionCode.toLowerCase()
            )
            if (region) {
              setRegionCode(region.code)
            }
          }
          
          setCity(detected.city)
          setDetectionStatus('success')
        } else {
          // Fallback to timezone-based country detection
          const fallbackCountry = detectCountryFromTimezone()
          setCountryCode(fallbackCountry)
          setDetectionStatus('failed')
        }
      } catch (error) {
        console.error('Location detection failed:', error)
        // Set default to Australia
        setCountryCode('AU')
        setRegionCode('QLD')
        setCity('Cairns')
        setDetectionStatus('failed')
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

  // Validate location when inputs change
  useEffect(() => {
    const validateCurrentLocation = async () => {
      if (city && selectedRegion && selectedCountry) {
        setValidationStatus('none')
        
        const validation = await validateLocation(
          city, 
          selectedRegion.name, 
          selectedCountry.name
        )
        
        setValidationStatus(validation.isValid ? 'valid' : 'invalid')
      }
    }

    const timeoutId = setTimeout(validateCurrentLocation, 1000) // Debounce validation
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!selectedCountry || !selectedRegion) {
        throw new Error('Please select a valid country and region')
      }

      // Validate and get coordinates for the location
      const validation = await validateLocation(city, selectedRegion.name, selectedCountry.name)
      
      if (!validation.isValid) {
        throw new Error('Invalid location. Please check your city name.')
      }

      setLocation({
        country: selectedCountry.name,
        region: selectedRegion.name,
        city,
        coordinates: validation.coordinates,
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
          <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center" style={{backgroundColor: '#1a597c'}}>
            <Globe className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold" style={{color: '#1a597c'}}>LumaLead.io</CardTitle>
          <CardDescription style={{color: '#1a597c'}}>
            Set up your location to start finding prospects
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

          {!isDetecting && detectionStatus === 'failed' && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Couldn't detect location. Please enter manually.</span>
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
                  placeholder="Enter your city"
                  className="border-gray-200 focus:border-[#1a597c]"
                  disabled={!regionCode}
                  required
                />
                
                {/* City Suggestions */}
                {city.length > 0 && citySuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {citySuggestions
                      .filter(suggestion => suggestion.toLowerCase().includes(city.toLowerCase()))
                      .slice(0, 5)
                      .map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
                          onClick={() => setCity(suggestion)}
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
              disabled={isLoading || !countryCode || !regionCode || !city || validationStatus === 'invalid'}
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
