import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface LocationState {
  country: string
  region: string
  city: string
  coordinates: { lat: number; lng: number } | null
  
  // Actions
  setLocation: (location: { country: string; region: string; city: string; coordinates?: { lat: number; lng: number } }) => void
  resetLocation: () => void
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      country: '',
      region: '',
      city: '',
      coordinates: null,
      
      setLocation: (location) => set({
        country: location.country,
        region: location.region,
        city: location.city,
        coordinates: location.coordinates || null,
      }),
      
      resetLocation: () => set({
        country: '',
        region: '',
        city: '',
        coordinates: null,
      }),
    }),
    {
      name: 'location-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
