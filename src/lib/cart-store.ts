'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Coupon } from './types'

type LastRemoved = {
  item: CartItem
}

type CartState = {
  items: CartItem[]
  coupon: Coupon | null
  isOpen: boolean
  lastRemoved: LastRemoved | null
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (id: string) => CartItem | undefined
  restoreItem: (item: CartItem) => void
  clearLastRemoved: () => void
  updateQuantity: (id: string, quantity: number) => void
  clear: () => void
  setCoupon: (coupon: Coupon | null) => void
  setOpen: (open: boolean) => void
  count: () => number
  subtotal: () => number
  discount: () => number
  total: () => number
}

function makeId(item: { productId: string; size: string; color: string }) {
  return `${item.productId}-${item.size}-${item.color}`
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isOpen: false,
      lastRemoved: null,
      addItem: (item, quantity = 1) => {
        const id = makeId(item)
        const items = [...get().items]
        const existing = items.find((i) => i.id === id)
        if (existing) {
          existing.quantity = Math.min(existing.quantity + quantity, item.stock ?? 99)
        } else {
          items.push({ ...item, id, quantity })
        }
        set({ items, isOpen: true })
      },
      removeItem: (id) => {
        const removed = get().items.find((i) => i.id === id)
        if (removed) {
          set({ items: get().items.filter((i) => i.id !== id), lastRemoved: { item: removed } })
        }
        return removed
      },
      restoreItem: (item) => {
        const items = [...get().items]
        const existing = items.find((i) => i.id === item.id)
        if (existing) {
          existing.quantity += item.quantity
        } else {
          items.push(item)
        }
        set({ items, lastRemoved: null })
      },
      clearLastRemoved: () => set({ lastRemoved: null }),
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          const removed = get().items.find((i) => i.id === id)
          if (removed) {
            set({ items: get().items.filter((i) => i.id !== id), lastRemoved: { item: removed } })
          }
          return
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(quantity, i.stock ?? 99) } : i
          ),
        })
      },
      clear: () => set({ items: [], coupon: null }),
      setCoupon: (coupon) => set({ coupon }),
      setOpen: (isOpen) => set({ isOpen }),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      discount: () => {
        const coupon = get().coupon
        if (!coupon) return 0
        return (get().subtotal() * coupon.discountPercent) / 100
      },
      total: () => get().subtotal() - get().discount(),
    }),
    { name: 'kidshop-cart' }
  )
)
