'use client'

import { create } from 'zustand'

type QuickViewState = {
  openSlug: string | null
  setOpenSlug: (slug: string | null) => void
  close: () => void
}

export const useQuickView = create<QuickViewState>()((set) => ({
  openSlug: null,
  setOpenSlug: (slug) => set({ openSlug: slug }),
  close: () => set({ openSlug: null }),
}))
