import { NextRequest, NextResponse } from 'next/server'
import { Business } from '@/types/business'
import { deriveSellingPoints, formatPhoneNumber, extractSuburbFromAddress, extractPostcodeFromAddress } from '@/lib/utils'

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('GOOGLE_MAPS_API_KEY environment variable is required')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get('placeId')

    if (!placeId) {
      return NextResponse.json({ error: 'placeId parameter is required' }, { status: 400 })
    }

    // Construct the Places Details API URL with field masking to minimize cost
    const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    detailsUrl.searchParams.set('place_id', placeId)
    detailsUrl.searchParams.set('key', GOOGLE_MAPS_API_KEY!)
    detailsUrl.searchParams.set('fields', [
      'name',
      'types',
      'formatted_address',
      'formatted_phone_number',
      'website',
      'url',
      'rating',
      'user_ratings_total',
      'opening_hours',
      'business_status'
    ].join(','))

    const response = await fetch(detailsUrl.toString())
    
    if (!response.ok) {
      throw new Error(`Places Details API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== 'OK') {
      throw new Error(`Places Details API error: ${data.status} - ${data.error_message || 'Unknown error'}`)
    }

    const place = data.result
    const phoneFormatted = formatPhoneNumber(place.formatted_phone_number)
    const suburb = extractSuburbFromAddress(place.formatted_address)
    const postcode = extractPostcodeFromAddress(place.formatted_address)

    const business: Business = {
      placeId: place.place_id,
      name: place.name,
      types: place.types || [],
      websiteUrl: place.website,
      googleUrl: place.url,
      phoneRaw: place.formatted_phone_number,
      phoneFormatted,
      address: place.formatted_address,
      suburb,
      postcode,
      rating: place.rating,
      ratingCount: place.user_ratings_total,
      sellingPoints: deriveSellingPoints({
        websiteUrl: place.website,
        ratingCount: place.user_ratings_total,
        rating: place.rating,
      }),
    }

    return NextResponse.json(business)

  } catch (error) {
    console.error('Places details error:', error)
    return NextResponse.json(
      { error: 'Failed to get place details' },
      { status: 500 }
    )
  }
}
