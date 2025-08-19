import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Business, ContactState } from '@/types/business'

interface ContactedState {
  contactedMap: Map<string, Business>
  
  // Actions
  markContacted: (business: Business, contactState: ContactState) => void
  uncontact: (placeId: string) => void
  updateContactedNotes: (placeId: string, notes: string) => void
  getContactedBusinesses: () => Business[]
  isContacted: (placeId: string) => boolean
}

export const useContactedStore = create<ContactedState>()(
  persist(
    (set, get) => ({
      contactedMap: new Map(),
      
      markContacted: (business, contactState) => set((state) => {
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
            const newMap = new Map(state.contactedMap)
            newMap.delete(placeId)
            return { contactedMap: newMap }
          })
        } catch (error) {
          console.error('Error in uncontact:', error)
        }
      },
      
      updateContactedNotes: (placeId, notes) => set((state) => {
        const newMap = new Map(state.contactedMap)
        const business = newMap.get(placeId)
        if (business) {
          newMap.set(placeId, { ...business, notes })
        }
        return { contactedMap: newMap }
      }),
      
      getContactedBusinesses: () => {
        const { contactedMap } = get()
        return Array.from(contactedMap.values())
      },
      
      isContacted: (placeId) => {
        const { contactedMap } = get()
        return contactedMap.has(placeId)
      },
    }),
    {
      name: 'contacted-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        contactedMap: Array.from(state.contactedMap.entries())
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.contactedMap = new Map(state.contactedMap || [])
        }
      },
    }
  )
)
