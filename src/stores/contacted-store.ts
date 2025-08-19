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
          // User changed, clear current data
          const userKey = `contacted-store-${userId}`
          const savedData = localStorage.getItem(userKey)
          let userContactedMap = new Map()
          
          if (savedData) {
            try {
              const parsed = JSON.parse(savedData)
              userContactedMap = new Map(parsed.contactedMap || [])
            } catch (error) {
              console.error('Error loading user contacted data:', error)
            }
          }
          
          return {
            currentUserId: userId,
            contactedMap: userContactedMap
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
        
        // Save to user-specific localStorage
        const userKey = `contacted-store-${state.currentUserId}`
        localStorage.setItem(userKey, JSON.stringify({
          contactedMap: Array.from(newMap.entries()),
          currentUserId: state.currentUserId
        }))
        
        return { contactedMap: newMap }
      }),
      
      uncontact: (placeId) => {
        try {
          set((state) => {
            if (!state.currentUserId) return state
            const newMap = new Map(state.contactedMap)
            newMap.delete(placeId)
            
            // Save to user-specific localStorage
            const userKey = `contacted-store-${state.currentUserId}`
            localStorage.setItem(userKey, JSON.stringify({
              contactedMap: Array.from(newMap.entries()),
              currentUserId: state.currentUserId
            }))
            
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
          
          // Save to user-specific localStorage
          const userKey = `contacted-store-${state.currentUserId}`
          localStorage.setItem(userKey, JSON.stringify({
            contactedMap: Array.from(newMap.entries()),
            currentUserId: state.currentUserId
          }))
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
      name: 'contacted-store',
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
