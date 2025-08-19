import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Business, ContactState } from '@/types/business'

interface ContactedState {
  contactedMap: Map<string, Business>
  currentUserId: string | null
  
  // Actions
  setUserId: (userId: string | null) => void
  markContacted: (business: Business, contactState: ContactState) => void
  uncontact: (placeId: string) => void
  updateContactedNotes: (placeId: string, notes: string) => void
  getContactedBusinesses: () => Business[]
  isContacted: (placeId: string) => boolean
  clearUserData: () => void
}

export const useContactedStore = create<ContactedState>()(
  persist(
    (set, get) => ({
      contactedMap: new Map(),
      currentUserId: null,
      
      setUserId: (userId) => set((state) => {
        if (state.currentUserId !== userId) {
          // User changed, clear current data and load new user's data
          return {
            currentUserId: userId,
            contactedMap: new Map() // Will be populated from localStorage if exists
          }
        }
        return { currentUserId: userId }
      }),
      
      markContacted: (business, contactState) => set((state) => {
        if (!state.currentUserId) return state
        const newMap = new Map(state.contactedMap)
        newMap.set(business.placeId, {
          ...business,
          contact: contactState,
        })
        return { contactedMap: newMap }
      }),
      
      uncontact: (placeId) => {
        try {
          set((state) => {
            if (!state.currentUserId) return state
            const newMap = new Map(state.contactedMap)
            newMap.delete(placeId)
            return { contactedMap: newMap }
          })
        } catch (error) {
          console.error('Error in uncontact:', error)
        }
      },
      
      updateContactedNotes: (placeId, notes) => set((state) => {
        if (!state.currentUserId) return state
        const newMap = new Map(state.contactedMap)
        const business = newMap.get(placeId)
        if (business) {
          newMap.set(placeId, { ...business, notes })
        }
        return { contactedMap: newMap }
      }),
      
      getContactedBusinesses: () => {
        const { contactedMap, currentUserId } = get()
        if (!currentUserId) return []
        return Array.from(contactedMap.values())
      },
      
      isContacted: (placeId) => {
        const { contactedMap, currentUserId } = get()
        if (!currentUserId) return false
        return contactedMap.has(placeId)
      },
      
      clearUserData: () => set(() => ({
        contactedMap: new Map(),
        currentUserId: null
      })),
    }),
    {
      name: (state) => `contacted-store-${state?.currentUserId || 'anonymous'}`,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        contactedMap: Array.from(state.contactedMap.entries()),
        currentUserId: state.currentUserId
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.contactedMap = new Map(state.contactedMap || [])
        }
      },
    }
  )
)
