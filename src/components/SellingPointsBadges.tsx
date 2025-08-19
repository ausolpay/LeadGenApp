'use client'

import { Badge } from '@/components/ui/badge'
import { SellingPoint } from '@/types/business'

interface SellingPointsBadgesProps {
  sellingPoints: SellingPoint[]
}

const sellingPointConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; tooltip: string }> = {
  'no-website': {
    label: 'No Website',
    variant: 'destructive',
    tooltip: 'Business has no website'
  },
  'facebook-only': {
    label: 'Facebook Only',
    variant: 'secondary',
    tooltip: 'Only has Facebook/Instagram page'
  },
  'likely-outdated': {
    label: 'Likely Outdated',
    variant: 'outline',
    tooltip: 'Website may be outdated (HTTP, low activity)'
  },
  'no-phone': {
    label: 'No Phone',
    variant: 'destructive',
    tooltip: 'No phone number available'
  },
  'low-ratings': {
    label: 'Low Ratings',
    variant: 'outline',
    tooltip: 'Rating below 3.5 stars'
  },
  'no-reviews': {
    label: 'No Reviews',
    variant: 'outline',
    tooltip: 'Very few or no reviews'
  },
  'old-business': {
    label: 'Established',
    variant: 'default',
    tooltip: 'Long-established business'
  },
  'home-based': {
    label: 'Home Based',
    variant: 'secondary',
    tooltip: 'Home-based business'
  },
  'mobile-business': {
    label: 'Mobile',
    variant: 'secondary',
    tooltip: 'Mobile or traveling business'
  },
  'seasonal-business': {
    label: 'Seasonal',
    variant: 'outline',
    tooltip: 'Seasonal business'
  },
  'weekend-only': {
    label: 'Weekend Only',
    variant: 'outline',
    tooltip: 'Weekend-only operations'
  },
  'cash-only': {
    label: 'Cash Only',
    variant: 'outline',
    tooltip: 'Cash-only business'
  },
  'no-social-media': {
    label: 'No Social Media',
    variant: 'outline',
    tooltip: 'No social media presence'
  },
  'runs-ads': {
    label: 'Runs Ads',
    variant: 'default',
    tooltip: 'Likely running online advertising campaigns (UTM tracking detected)'
  }
}

export function SellingPointsBadges({ sellingPoints }: SellingPointsBadgesProps) {
  if (sellingPoints.length === 0) {
    return <span className="text-muted-foreground text-sm">-</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {sellingPoints.map((point) => {
        const config = sellingPointConfig[point]
        if (!config) {
          console.warn(`Unknown selling point: ${point}`)
          return null
        }
        return (
          <Badge
            key={point}
            variant={config.variant}
            className="text-xs"
            title={config.tooltip}
          >
            {config.label}
          </Badge>
        )
      })}
    </div>
  )
}
