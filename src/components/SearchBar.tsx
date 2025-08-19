'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BUSINESS_TYPES } from '@/data/business-types'
import { useResultsStore } from '@/stores/results-store'
import { useExcludeStore } from '@/stores/exclude-store'
import { useLocationStore } from '@/stores/location-store'

interface SearchBarProps {
  onSearchComplete?: () => void
}

export function SearchBar({ onSearchComplete }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [businessType, setBusinessType] = useState('all')
  const [isSearching, setIsSearching] = useState(false)
  
  const { 
    setResults, 
    setLoading, 
    setNextPageToken, 
    setSearchParams,
    clearResults,
    getCachedResults,
    setCachedResults,
    searchParams 
  } = useResultsStore()
  
  const { excludeSet } = useExcludeStore()
  const { city, region, country, coordinates } = useLocationStore()

  const handleSearch = async () => {
    // Allow search with just business type, no text required
    if (!query.trim() && businessType === 'all') return

    const searchQuery = query.trim()
    const searchType = businessType !== 'all' ? businessType : ''

    setIsSearching(true)
    setLoading(true)
    clearResults()

    try {
      // Check cache first
      const cachedResult = getCachedResults(searchQuery, searchType)
      
      if (cachedResult) {
        console.log('Using cached results for:', searchQuery, searchType)
        
        // Filter out excluded businesses from cache
                const filteredResults = cachedResult.results.filter((business: any) =>
          !excludeSet.has(business.placeId)
        )
        
        setResults(filteredResults)
        setNextPageToken(cachedResult.nextPageToken)
        setSearchParams({ query: searchQuery, businessType })
        
        // Switch to results tab after successful search
        onSearchComplete?.()
        
        setIsSearching(false)
        setLoading(false)
        return
      }

      // No cache hit - make API call
      console.log('Making fresh API call for:', searchQuery, searchType)
      
      const params = new URLSearchParams()
      
      // Add query if provided
      if (searchQuery) {
        params.set('query', searchQuery)
      }
      
      // Add business type if selected
      if (searchType) {
        params.set('type', searchType)
      }

      const response = await fetch(`/api/places/search?${params}`, {
        headers: {
          'x-location': JSON.stringify({
            city,
            region,
            country,
            coordinates: coordinates || { lat: -16.9186, lng: 145.7781 }
          })
        }
      })
      
      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      
      // Cache the raw results (before filtering)
      setCachedResults(searchQuery, searchType, data.results, data.nextPageToken)
      
      // Filter out excluded businesses
      const filteredResults = data.results.filter((business: any) => 
        !excludeSet.has(business.placeId)
      )

      setResults(filteredResults)
      setNextPageToken(data.nextPageToken)
      setSearchParams({ query: searchQuery, businessType })
      
      // Switch to results tab after successful search
      onSearchComplete?.()
      
    } catch (error) {
      console.error('Search error:', error)
      // You could add a toast notification here
    } finally {
      setIsSearching(false)
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-6 bg-card rounded-lg border">
      <div className="flex-1">
        <Input
          placeholder="Search for businesses (e.g., 'bakery', 'real estate')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full"
        />
      </div>
      
      <div className="w-full sm:w-48">
        <Select value={businessType} onValueChange={setBusinessType}>
          <SelectTrigger>
            <SelectValue placeholder="Business type (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {BUSINESS_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
             <Button 
         onClick={handleSearch} 
         disabled={isSearching || (!query.trim() && businessType === 'all')}
         className="w-full sm:w-auto"
       >
        {isSearching ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Search
          </>
        )}
      </Button>
    </div>
  )
}
