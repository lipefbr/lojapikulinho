'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MAX_ITEMS = 8

type RecentlyViewState = {
  slugs: string[]
  addViewed: (slug: string) => void
  clearAll: () => void
}

export const useRecentlyViewed = create<RecentlyViewState>()(
  persist(
    (set, get) => ({
      slugs: [],
      addViewed: (slug: string) => {
        const slugs = get().slugs.filter((s) => s !== slug)
        set({ slugs: [slug, ...slugs].slice(0, MAX_ITEMS) })
      },
      clearAll: () => set({ slugs: [] }),
    }),
    { name: 'pijulinho-recent' }
  )
)
