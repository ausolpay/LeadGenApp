'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { CAIRNS_SUBURBS, CAIRNS_POSTCODES } from '@/data/locations'
import { useResultsStore } from '@/stores/results-store'
import { SellingPoint } from '@/types/business'
import { cn } from '@/lib/utils'

export function FiltersBar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { filters, setFilters, sort, setSort } = useResultsStore()
  
  // Ensure filters object has all required properties
  const safeFilters = {
    suburbs: filters?.suburbs || [],
    postcodes: filters?.postcodes || [],
    hasMobile: filters?.hasMobile || false,
    hasOffice: filters?.hasOffice || false,
    noWebsite: filters?.noWebsite || false,
    facebookOnly: filters?.facebookOnly || false,
    likelyOutdated: filters?.likelyOutdated || false,
    sellingPoints: filters?.sellingPoints || [],
  }

  const clearFilters = () => {
    setFilters({
      suburbs: [],
      postcodes: [],
      hasMobile: false,
      hasOffice: false,
      noWebsite: false,
      facebookOnly: false,
      likelyOutdated: false,
      sellingPoints: [],
    })
  }

  const hasActiveFilters = Object.values(safeFilters).some(value => 
    Array.isArray(value) ? value.length > 0 : value === true
  )

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters & Sort</span>
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Location Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Suburbs</label>
              <Select
                value="placeholder"
                                 onValueChange={(value) => {
                   if (value && value !== 'placeholder' && !safeFilters.suburbs.includes(value)) {
                     setFilters({ suburbs: [...safeFilters.suburbs, value] })
                   }
                 }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add suburb" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled>Add suburb</SelectItem>
                  {CAIRNS_SUBURBS.map((suburb) => (
                    <SelectItem key={suburb} value={suburb}>
                      {suburb}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                             {safeFilters.suburbs.length > 0 && (
                 <div className="flex flex-wrap gap-1">
                   {safeFilters.suburbs.map((suburb) => (
                    <span
                      key={suburb}
                      className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1"
                    >
                      {suburb}
                      <button
                                                 onClick={() => setFilters({
                           suburbs: safeFilters.suburbs.filter(s => s !== suburb)
                         })}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Postcodes</label>
              <Select
                value="placeholder"
                                 onValueChange={(value) => {
                   if (value && value !== 'placeholder' && !safeFilters.postcodes.includes(value)) {
                     setFilters({ postcodes: [...safeFilters.postcodes, value] })
                   }
                 }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add postcode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled>Add postcode</SelectItem>
                  {CAIRNS_POSTCODES.map((postcode) => (
                    <SelectItem key={postcode} value={postcode}>
                      {postcode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                             {safeFilters.postcodes.length > 0 && (
                 <div className="flex flex-wrap gap-1">
                   {safeFilters.postcodes.map((postcode) => (
                    <span
                      key={postcode}
                      className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1"
                    >
                      {postcode}
                      <button
                                                 onClick={() => setFilters({
                           postcodes: safeFilters.postcodes.filter(p => p !== postcode)
                         })}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Phone Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Type</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                                     <Checkbox
                     id="hasMobile"
                     checked={safeFilters.hasMobile}
                     onCheckedChange={(checked) => 
                       setFilters({ hasMobile: checked as boolean })
                     }
                   />
                  <label htmlFor="hasMobile" className="text-sm">
                    Has mobile (04...)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                                     <Checkbox
                     id="hasOffice"
                     checked={safeFilters.hasOffice}
                     onCheckedChange={(checked) => 
                       setFilters({ hasOffice: checked as boolean })
                     }
                   />
                  <label htmlFor="hasOffice" className="text-sm">
                    Has office (07...)
                  </label>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sort} onValueChange={(value: any) => setSort(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="most-active">Most active</SelectItem>
                  <SelectItem value="name-asc">A → Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selling Points Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Selling Points</label>
            <div className="grid grid-cols-2 gap-2">
                             {[
                 { id: 'no-website', label: 'No Website' },
                 { id: 'facebook-only', label: 'Facebook Only' },
                 { id: 'likely-outdated', label: 'Likely Outdated' },
                 { id: 'no-phone', label: 'No Phone' },
                 { id: 'low-ratings', label: 'Low Ratings' },
                 { id: 'no-reviews', label: 'No Reviews' },
                 { id: 'old-business', label: 'Established' },
                 { id: 'home-based', label: 'Home Based' },
                 { id: 'mobile-business', label: 'Mobile' },
                 { id: 'runs-ads', label: 'Runs Ads' },
               ].map((point) => (
                <div key={point.id} className="flex items-center space-x-2">
                                     <Checkbox
                     id={point.id}
                     checked={safeFilters.sellingPoints.includes(point.id as any)}
                     onCheckedChange={(checked) => {
                       if (checked) {
                         setFilters({ sellingPoints: [...safeFilters.sellingPoints, point.id as any] })
                       } else {
                         setFilters({ sellingPoints: safeFilters.sellingPoints.filter(s => s !== point.id) })
                       }
                     }}
                   />
                  <label htmlFor={point.id} className="text-sm">{point.label}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
