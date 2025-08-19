import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Business, Filters, SortOption, SearchParams } from '@/types/business'

interface CachedSearchResult {
  results: Business[]
  nextPageToken?: string
  timestamp: number
}

interface SearchCache {
  [key: string]: CachedSearchResult
}

interface ResultsState {
  results: Business[]
  allResults: Business[] // Store all results for pagination
  filters: Filters
  sort: SortOption
  searchParams: SearchParams
  isLoading: boolean
  isLoadingMore: boolean
  nextPageToken?: string
  currentPage: number
  resultsPerPage: number
  totalPages: number
  hasMoreResults: boolean
  searchCache: SearchCache // Not persisted - clears on refresh
  
  // Actions
  setResults: (results: Business[]) => void
  addResults: (results: Business[]) => void
  setFilters: (filters: Partial<Filters>) => void
  setSort: (sort: SortOption) => void
  setSearchParams: (params: Partial<SearchParams>) => void
  setLoading: (loading: boolean) => void
  setLoadingMore: (loading: boolean) => void
  setNextPageToken: (token?: string) => void
  setCurrentPage: (page: number) => void
  loadMoreResults: () => Promise<void>
  clearResults: () => void
  updateBusinessNotes: (placeId: string, notes: string) => void
  getCacheKey: (query: string, businessType: string) => string
  getCachedResults: (query: string, businessType: string) => CachedSearchResult | null
  setCachedResults: (query: string, businessType: string, results: Business[], nextPageToken?: string) => void
}

const defaultFilters: Filters = {
  suburbs: [],
  postcodes: [],
  hasMobile: false,
  hasOffice: false,
  noWebsite: false,
  facebookOnly: false,
  likelyOutdated: false,
  sellingPoints: [],
}

const defaultSearchParams: SearchParams = {
  query: '',
  businessType: '',
}

export const useResultsStore = create<ResultsState>()(
  persist(
    (set, get) => ({
      results: [],
      allResults: [],
      filters: defaultFilters,
      sort: 'most-active',
      searchParams: defaultSearchParams,
      isLoading: false,
      isLoadingMore: false,
      nextPageToken: undefined,
      currentPage: 1,
      resultsPerPage: 20,
      totalPages: 1,
      hasMoreResults: false,
      searchCache: {}, // Not persisted - session only
      
      setResults: (results) => set({ 
        results: results.slice(0, 20), // Show first page
        allResults: results,
        currentPage: 1,
        totalPages: Math.ceil(results.length / 20),
        hasMoreResults: false
      }),
      
      addResults: (newResults) => set((state) => {
        const allResults = [...state.allResults, ...newResults]
        const totalPages = Math.ceil(allResults.length / state.resultsPerPage)
        const startIndex = (state.currentPage - 1) * state.resultsPerPage
        const endIndex = startIndex + state.resultsPerPage
        const currentPageResults = allResults.slice(startIndex, endIndex)
        
        return {
          allResults,
          results: currentPageResults,
          totalPages,
          hasMoreResults: state.nextPageToken !== undefined
        }
      }),
      
      setFilters: (filters) => set((state) => ({ 
        filters: { ...state.filters, ...filters } 
      })),
      
      setSort: (sort) => set({ sort }),
      
      setSearchParams: (params) => set((state) => ({ 
        searchParams: { ...state.searchParams, ...params } 
      })),
      
      setLoading: (isLoading) => set({ isLoading }),
      setLoadingMore: (isLoadingMore) => set({ isLoadingMore }),
      setNextPageToken: (nextPageToken) => set({ nextPageToken, hasMoreResults: !!nextPageToken }),
      
      setCurrentPage: (page) => set((state) => {
        const startIndex = (page - 1) * state.resultsPerPage
        const endIndex = startIndex + state.resultsPerPage
        const currentPageResults = state.allResults.slice(startIndex, endIndex)
        
        return {
          currentPage: page,
          results: currentPageResults
        }
      }),
      
      loadMoreResults: async () => {
        const state = get()
        if (!state.nextPageToken || state.isLoadingMore) return
        
        set({ isLoadingMore: true })
        
        try {
          const params = new URLSearchParams()
          if (state.searchParams.query) {
            params.set('query', state.searchParams.query)
          }
          if (state.searchParams.businessType) {
            params.set('type', state.searchParams.businessType)
          }
          params.set('pagetoken', state.nextPageToken)
          
          const response = await fetch(`/api/places/search?${params}`, {
            headers: {
              'x-location': JSON.stringify({
                city: 'Cairns',
                region: 'QLD', 
                country: 'Australia',
                coordinates: { lat: -16.9186, lng: 145.7781 }
              })
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            const { addResults, setNextPageToken, setCachedResults } = get()
            
            // Update cache with new combined results
            const currentCache = get().getCachedResults(state.searchParams.query, state.searchParams.businessType || '')
            if (currentCache) {
              const combinedResults = [...currentCache.results, ...data.results]
              setCachedResults(state.searchParams.query, state.searchParams.businessType || '', combinedResults, data.nextPageToken)
            }
            
            addResults(data.results)
            setNextPageToken(data.nextPageToken)
          }
        } catch (error) {
          console.error('Error loading more results:', error)
        } finally {
          set({ isLoadingMore: false })
        }
      },
      
      clearResults: () => set({ 
        results: [], 
        allResults: [],
        nextPageToken: undefined,
        currentPage: 1,
        totalPages: 1,
        hasMoreResults: false
      }),
      
      getCacheKey: (query: string, businessType: string) => {
        return `${query.trim().toLowerCase()}_${businessType.toLowerCase()}`
      },
      
      getCachedResults: (query: string, businessType: string) => {
        const { searchCache, getCacheKey } = get()
        const key = getCacheKey(query, businessType)
        const cached = searchCache[key]
        
        if (cached) {
          // Check if cache is still fresh (within 10 minutes)
          const now = Date.now()
          const cacheAge = now - cached.timestamp
          const maxAge = 10 * 60 * 1000 // 10 minutes
          
          if (cacheAge < maxAge) {
            return cached
          } else {
            // Remove stale cache
            const newCache = { ...searchCache }
            delete newCache[key]
            set({ searchCache: newCache })
          }
        }
        
        return null
      },
      
      setCachedResults: (query: string, businessType: string, results: Business[], nextPageToken?: string) => {
        const { searchCache, getCacheKey } = get()
        const key = getCacheKey(query, businessType)
        
        const newCache = {
          ...searchCache,
          [key]: {
            results,
            nextPageToken,
            timestamp: Date.now()
          }
        }
        
        set({ searchCache: newCache })
      },
      
      updateBusinessNotes: (placeId, notes) => set((state) => ({
        results: state.results.map(business => 
          business.placeId === placeId 
            ? { ...business, notes } 
            : business
        ),
        allResults: state.allResults.map(business => 
          business.placeId === placeId 
            ? { ...business, notes } 
            : business
        )
      })),
    }),
    {
      name: 'results-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filters: state.filters,
        sort: state.sort,
        searchParams: state.searchParams,
        // searchCache is NOT persisted - clears on refresh
      }),
    }
  )
)
