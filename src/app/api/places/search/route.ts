import { NextRequest, NextResponse } from 'next/server'
import { Business } from '@/types/business'
import { deriveSellingPoints, formatPhoneNumber, extractSuburbFromAddress, extractPostcodeFromAddress, extractOwnerName } from '@/lib/utils'

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('GOOGLE_MAPS_API_KEY environment variable is required')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const type = searchParams.get('type')
    const pageToken = searchParams.get('pagetoken')

    // Build the search query - allow search with just type or just query
    let searchQuery = ''
    if (query && type) {
      searchQuery = `${type} ${query}`
    } else if (query) {
      searchQuery = query
    } else if (type) {
      searchQuery = type
    } else {
      return NextResponse.json({ error: 'Either query or type parameter is required' }, { status: 400 })
    }

    // Get location from request headers (passed from frontend)
    const locationHeader = request.headers.get('x-location')
    let location = { city: 'Cairns', region: 'QLD', country: 'Australia', coordinates: { lat: -16.9186, lng: 145.7781 } }
    
    if (locationHeader) {
      try {
        location = JSON.parse(locationHeader)
      } catch (error) {
        console.warn('Failed to parse location header:', error)
      }
    }

    // Construct the Places API URL
    const placesUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
    placesUrl.searchParams.set('query', `${searchQuery} ${location.city} ${location.region}`)
    placesUrl.searchParams.set('key', GOOGLE_MAPS_API_KEY!)
    placesUrl.searchParams.set('region', location.country === 'Australia' ? 'au' : 'us')
    placesUrl.searchParams.set('location', `${location.coordinates.lat},${location.coordinates.lng}`)
    placesUrl.searchParams.set('radius', '50000') // 50km radius
    placesUrl.searchParams.set('type', 'establishment')
    
    if (pageToken) {
      placesUrl.searchParams.set('pagetoken', pageToken)
    }

    console.log('Searching with URL:', placesUrl.toString())
    const response = await fetch(placesUrl.toString())
    
    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Google API response status:', data.status)
    console.log('Google API response:', JSON.stringify(data, null, 2))

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`)
    }

    // Transform the results and fetch additional details for each place
    const businesses: Business[] = await Promise.all(
      data.results?.map(async (place: any) => {
        // Fetch additional details for this place
        const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json')
        detailsUrl.searchParams.set('place_id', place.place_id)
        detailsUrl.searchParams.set('key', GOOGLE_MAPS_API_KEY!)
        detailsUrl.searchParams.set('fields', [
          'formatted_phone_number',
          'website',
          'url',
          'rating',
          'user_ratings_total'
        ].join(','))

        let placeDetails: any = {}
        try {
          const detailsResponse = await fetch(detailsUrl.toString())
          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json()
            if (detailsData.status === 'OK' && detailsData.result) {
              placeDetails = detailsData.result
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch details for ${place.place_id}:`, error)
        }

        const phoneFormatted = formatPhoneNumber(placeDetails.formatted_phone_number || place.formatted_phone_number)
        const suburb = extractSuburbFromAddress(place.formatted_address)
        const postcode = extractPostcodeFromAddress(place.formatted_address)
        const ownerName = extractOwnerName(place.name)
        
        const business: Business = {
          placeId: place.place_id,
          name: place.name,
          types: place.types || [],
          category: type || place.types?.[0],
          websiteUrl: placeDetails.website || place.website,
          googleUrl: placeDetails.url || place.url,
          phoneRaw: placeDetails.formatted_phone_number || place.formatted_phone_number,
          phoneFormatted,
          ownerName,
          address: place.formatted_address,
          suburb,
          postcode,
          rating: placeDetails.rating || place.rating,
          ratingCount: placeDetails.user_ratings_total || place.user_ratings_total,
          sellingPoints: deriveSellingPoints({
            websiteUrl: placeDetails.website || place.website,
            phoneFormatted,
            ratingCount: placeDetails.user_ratings_total || place.user_ratings_total,
            rating: placeDetails.rating || place.rating,
            name: place.name,
            address: place.formatted_address,
          }),
        }

        return business
      }) || []
    )

    return NextResponse.json({
      results: businesses,
      nextPageToken: data.next_page_token,
      status: data.status,
    })

  } catch (error) {
    console.error('Places search error:', error)
    return NextResponse.json(
      { error: 'Failed to search places' },
      { status: 500 }
    )
  }
}
