'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocationStore } from '@/stores/location-store'
import { MapPin, Globe, Building2 } from 'lucide-react'

export default function SetupPage() {
  const [country, setCountry] = useState('Australia')
  const [region, setRegion] = useState('QLD')
  const [city, setCity] = useState('Cairns')
  const [isLoading, setIsLoading] = useState(false)
  
  const { setLocation } = useLocationStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get coordinates for the location
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(`${city}, ${region}, ${country}`)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      
      const response = await fetch(geocodeUrl)
      const data = await response.json()
      
      let coordinates: { lat: number; lng: number; } | undefined = undefined
      if (data.results && data.results[0]) {
        const location = data.results[0].geometry.location
        coordinates = { lat: location.lat, lng: location.lng }
      }

      setLocation({
        country,
        region,
        city,
        coordinates,
      })

      router.push('/')
    } catch (error) {
      console.error('Error setting up location:', error)
      // Fallback without coordinates
      setLocation({ country, region, city })
      router.push('/')
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country" style={{color: '#1a597c'}}>
                <Globe className="w-4 h-4 inline mr-2" />
                Country
              </Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., Australia"
                className="border-gray-200 focus:border-[#1a597c]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="region" style={{color: '#1a597c'}}>
                <Building2 className="w-4 h-4 inline mr-2" />
                State/Region
              </Label>
              <Input
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g., QLD"
                className="border-gray-200 focus:border-[#1a597c]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city" style={{color: '#1a597c'}}>
                <MapPin className="w-4 h-4 inline mr-2" />
                City
              </Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Cairns"
                className="border-gray-200 focus:border-[#1a597c]"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full text-white"
              style={{backgroundColor: '#1a597c'}}
              disabled={isLoading}
            >
              {isLoading ? 'Setting up...' : 'Start Finding Prospects'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
