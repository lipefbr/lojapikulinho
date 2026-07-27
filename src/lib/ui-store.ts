'use client'

import { create } from 'zustand'

type UIState = {
  /** Controls the mobile search/menu sheet opened from the header or bottom nav. */
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  toggleSearch: () => void
  /** Controls the wishlist drawer opened from the header heart icon. */
  wishlistOpen: boolean
  setWishlistOpen: (open: boolean) => void
}

export const useUI = create<UIState>((set) => ({
  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
  wishlistOpen: false,
  setWishlistOpen: (wishlistOpen) => set({ wishlistOpen }),
}))
