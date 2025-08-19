import { create } from 'zustand'
import { Business, ContactState } from '@/types/business'
import { createClientSupabaseClient } from '@/lib/supabase'

interface ContactedState {
  contactedMap: Map<string, Business>
  currentUserId: string | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setUserId: (userId: string | null) => Promise<void>
  markContacted: (business: Business, contactState: ContactState) => Promise<void>
  uncontact: (placeId: string) => Promise<void>
  updateContactedNotes: (placeId: string, notes: string) => Promise<void>
  getContactedBusinesses: () => Business[]
  isContacted: (placeId: string) => boolean
  clearUserData: () => void
  loadUserData: () => Promise<void>
}

export const useContactedStore = create<ContactedState>()((set, get) => ({
  contactedMap: new Map(),
  currentUserId: null,
  isLoading: false,
  error: null,
  
  setUserId: async (userId) => {
    if (get().currentUserId === userId) return
    
    set({ currentUserId: userId, contactedMap: new Map(), error: null })
    
    if (userId) {
      await get().loadUserData()
    }
  },
  
  loadUserData: async () => {
    const { currentUserId } = get()
    if (!currentUserId) return
    
    set({ isLoading: true, error: null })
    
    try {
      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase
        .from('contacted_businesses')
        .select('*')
        .eq('user_id', currentUserId)
      
      if (error) {
        console.error('Error loading contacted businesses:', error)
        set({ error: error.message, isLoading: false })
        return
      }
      
      const contactedMap = new Map<string, Business>()
      data?.forEach((row) => {
        const business: Business = {
          ...row.raw, // Use raw jsonb data for full business object
          notes: row.notes,
          contact: {
            called: row.called,
            emailed: row.emailed,
            contactedAt: row.contacted_at,
            contactedVia: row.called && row.emailed ? 'both' : 
                         row.called ? 'called' : 
                         row.emailed ? 'emailed' : undefined
          }
        }
        contactedMap.set(row.place_id, business)
      })
      
      set({ contactedMap, isLoading: false })
    } catch (error) {
      console.error('Error loading contacted businesses:', error)
      set({ error: 'Failed to load contacted businesses', isLoading: false })
    }
  },
  
  markContacted: async (business, contactState) => {
    const { currentUserId } = get()
    if (!currentUserId) return
    
    set({ isLoading: true, error: null })
    
    try {
      const supabase = createClientSupabaseClient()
      const { error } = await supabase
        .from('contacted_businesses')
        .upsert({
          user_id: currentUserId,
          place_id: business.placeId,
          name: business.name,
          notes: business.notes || '',
          called: contactState.called || false,
          emailed: contactState.emailed || false,
          contacted_at: contactState.contactedAt || new Date().toISOString(),
          raw: business, // Store full business object in raw jsonb column
        })
      
      if (error) {
        console.error('Error marking business as contacted:', error)
        set({ error: error.message, isLoading: false })
        return
      }
      
      // Update local state
      const newMap = new Map(get().contactedMap)
      newMap.set(business.placeId, {
        ...business,
        contact: contactState,
      })
      
      set({ contactedMap: newMap, isLoading: false })
    } catch (error) {
      console.error('Error marking business as contacted:', error)
      set({ error: 'Failed to mark business as contacted', isLoading: false })
    }
  },
  
  uncontact: async (placeId) => {
    const { currentUserId } = get()
    if (!currentUserId) return
    
    set({ isLoading: true, error: null })
    
    try {
      const supabase = createClientSupabaseClient()
      const { error } = await supabase
        .from('contacted_businesses')
        .delete()
        .eq('user_id', currentUserId)
        .eq('place_id', placeId)
      
      if (error) {
        console.error('Error uncontacting business:', error)
        set({ error: error.message, isLoading: false })
        return
      }
      
      // Update local state
      const newMap = new Map(get().contactedMap)
      newMap.delete(placeId)
      
      set({ contactedMap: newMap, isLoading: false })
    } catch (error) {
      console.error('Error uncontacting business:', error)
      set({ error: 'Failed to uncontact business', isLoading: false })
    }
  },
  
  updateContactedNotes: async (placeId, notes) => {
    const { currentUserId } = get()
    if (!currentUserId) return
    
    try {
      const supabase = createClientSupabaseClient()
      const { error } = await supabase
        .from('contacted_businesses')
        .update({ notes })
        .eq('user_id', currentUserId)
        .eq('place_id', placeId)
      
      if (error) {
        console.error('Error updating notes:', error)
        set({ error: error.message })
        return
      }
      
      // Update local state
      const newMap = new Map(get().contactedMap)
      const business = newMap.get(placeId)
      if (business) {
        newMap.set(placeId, { ...business, notes })
        set({ contactedMap: newMap })
      }
    } catch (error) {
      console.error('Error updating notes:', error)
      set({ error: 'Failed to update notes' })
    }
  },
  
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
    currentUserId: null,
    isLoading: false,
    error: null
  })),
}))
