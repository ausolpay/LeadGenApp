import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ExcludeState {
  excludeSet: Set<string>
  
  // Actions
  addToExclude: (placeId: string) => void
  removeFromExclude: (placeId: string) => void
  isExcluded: (placeId: string) => boolean
  clearExclude: () => void
}

export const useExcludeStore = create<ExcludeState>()(
  persist(
    (set, get) => ({
      excludeSet: new Set(),
      
      addToExclude: (placeId) => set((state) => {
        const newSet = new Set(state.excludeSet)
        newSet.add(placeId)
        return { excludeSet: newSet }
      }),
      
      removeFromExclude: (placeId) => {
        try {
          set((state) => {
            const newSet = new Set(state.excludeSet)
            newSet.delete(placeId)
            return { excludeSet: newSet }
          })
        } catch (error) {
          console.error('Error in removeFromExclude:', error)
        }
      },
      
      isExcluded: (placeId) => {
        const { excludeSet } = get()
        return excludeSet.has(placeId)
      },
      
      clearExclude: () => set({ excludeSet: new Set() }),
    }),
    {
      name: 'exclude-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        excludeSet: Array.from(state.excludeSet)
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.excludeSet = new Set(state.excludeSet || [])
        }
      },
    }
  )
)
