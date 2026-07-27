'use client'

import { create } from 'zustand'

type ProductCompareItem = {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  rating: number
  reviewCount: number
  category: string
  ageRange: string
  sizes: string[]
  colors: string[]
  image: string
}

type CompareState = {
  items: ProductCompareItem[]
  addItem: (item: ProductCompareItem) => void
  removeItem: (id: string) => void
  clearAll: () => void
  isOpen: boolean
  setOpen: (open: boolean) => void
}

const MAX_COMPARE = 4

export const useCompare = create<CompareState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      if (state.items.length >= MAX_COMPARE) return state
      if (state.items.find((i) => i.id === item.id)) return state
      return { items: [...state.items, item] }
    }),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  clearAll: () => set({ items: [] }),
  isOpen: false,
  setOpen: (isOpen) => set({ isOpen }),
}))
