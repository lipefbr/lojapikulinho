'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type SafeUser = {
  id: string
  name: string
  email: string
  cpf: string | null
  phone: string | null
  role: string
}

type AddressT = {
  id: string
  label: string
  recipient: string
  street: string
  number: string
  complement: string | null
  district: string
  city: string
  state: string
  zip: string
  isDefault: boolean
}

type AuthCtx = {
  user: SafeUser | null
  addresses: AddressT[]
  loading: boolean
  favorites: string[]
  isFavorite: (productId: string) => boolean
  toggleFavorite: (productId: string) => Promise<void>
  refresh: () => Promise<void>
  refreshFavorites: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null)
  const [addresses, setAddresses] = useState<AddressT[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      const data = await res.json()
      setUser(data.user || null)
      setAddresses(data.addresses || [])
    } catch {
      setUser(null)
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshFavorites = useCallback(async () => {
    try {
      const res = await fetch('/api/favorites', { cache: 'no-store' })
      const data = await res.json()
      if (Array.isArray(data.favorites)) {
        setFavorites(data.favorites.map((f: any) => f.productId))
      } else {
        setFavorites([])
      }
    } catch {
      setFavorites([])
    }
  }, [])

  useEffect(() => {
    refresh()
    refreshFavorites()
  }, [refresh, refreshFavorites])

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  )

  const toggleFavorite = useCallback(
    async (productId: string) => {
      // optimistic
      setFavorites((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      )
      try {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        })
      } catch {
        // revert handled on refresh
        refreshFavorites()
      }
    },
    [refreshFavorites]
  )

  return (
    <Ctx.Provider
      value={{ user, addresses, loading, favorites, isFavorite, toggleFavorite, refresh, refreshFavorites }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within FavoritesProvider')
  return ctx
}
