import { create } from 'zustand'

interface UserState {
  currentUserId: string | null
  setCurrentUserId: (userId: string | null) => void
  getCurrentUserId: () => string | null
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUserId: null,
  setCurrentUserId: (userId) => set({ currentUserId: userId }),
  getCurrentUserId: () => get().currentUserId,
}))
