'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Trash2, Share2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useUI } from '@/lib/ui-store'
import { useAuth } from './favorites-provider'
import { useCart } from '@/lib/cart-store'
import { formatBRL } from '@/lib/types'
import { toast } from 'sonner'

type FavoriteProduct = {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  images: string
  stock: number
}

export function WishlistDrawer() {
  const wishlistOpen = useUI((s) => s.wishlistOpen)
  const setWishlistOpen = useUI((s) => s.setWishlistOpen)
  const { user, toggleFavorite, refreshFavorites } = useAuth()
  const addItem = useCart((s) => s.addItem)
  const [items, setItems] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(false)

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setItems([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/favorites', { cache: 'no-store' })
      const data = await res.json()
      setItems(
        (data.favorites || []).map((f: { product: Record<string, unknown> }) => {
          const p = f.product as { id: string; name: string; slug: string; price: number; compareAtPrice: number | null; images: string[] | string; stock: number }
          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            images: Array.isArray(p.images) ? p.images.join(',') : (p.images || ''),
            stock: p.stock,
          }
        })
      )
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (wishlistOpen) fetchFavorites()
  }, [wishlistOpen, fetchFavorites])

  async function handleRemove(productId: string) {
    await toggleFavorite(productId)
    await refreshFavorites()
    setItems((prev) => prev.filter((p) => p.id !== productId))
  }

  function handleAddToCart(product: FavoriteProduct) {
    const imagesArr = product.images.split(',').map((s) => s.trim()).filter(Boolean)
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: imagesArr[0] || '',
      size: 'Único',
      color: 'Único',
    }, 1)
  }

  function firstImage(images: string) {
    const arr = images.split(',').map((s) => s.trim()).filter(Boolean)
    return arr[0] || ''
  }

  async function handleShareWishlist() {
    const ids = items.map((p) => p.id).join(',')
    const baseUrl = window.location.origin
    const url = `${baseUrl}/produtos?favoritos=${ids}`
    const text = 'Confira meus produtos favoritos na Pijulinho!'
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Meus favoritos Pijulinho', text, url })
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link dos favoritos copiado!')
    }
  }

  return (
    <Sheet open={wishlistOpen} onOpenChange={setWishlistOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-cream overflow-hidden">
        {/* Gradient tangerine header */}
        <SheetHeader className="relative bg-gradient-to-r from-tangerine to-[#FF9A6C] text-white p-5 rounded-b-3xl">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg font-bold text-white">
              <Heart className="h-5 w-5 fill-white" />
              Meus favoritos
              {items.length > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/25 px-1.5 text-xs font-bold text-white">
                  {items.length}
                </span>
              )}
            </SheetTitle>
            {items.length > 0 && (
              <button
                onClick={handleShareWishlist}
                className="grid h-8 w-8 place-items-center rounded-full border-2 border-white/40 text-white transition-colors hover:bg-white/20"
                aria-label="Compartilhar favoritos"
              >
                <Share2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scroll-pretty p-4 space-y-3" style={{ maxHeight: 'calc(100vh - 100px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-tangerine border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="mb-4 text-5xl">💜</span>
              <p className="text-base font-bold text-plum">Nenhum favorito ainda</p>
              <p className="mt-1 text-sm text-plum/60">
                Toque no ❤️ nos produtos para salvar aqui
              </p>
              <Link
                href="/produtos"
                onClick={() => setWishlistOpen(false)}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-tangerine px-5 text-sm font-bold text-white hover:bg-tangerine/90 transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                Explorar produtos
              </Link>
            </div>
          ) : (
            items.map((product) => {
              const img = firstImage(product.images)
              return (
                <div
                  key={product.id}
                  className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm border border-border/50"
                >
                  {/* Product image */}
                  <Link
                    href={`/produto/${product.slug}`}
                    onClick={() => setWishlistOpen(false)}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary"
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-2xl">🧸</span>
                    )}
                  </Link>

                  {/* Product info */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <Link
                        href={`/produto/${product.slug}`}
                        onClick={() => setWishlistOpen(false)}
                        className="line-clamp-2 text-sm font-bold text-plum hover:text-tangerine transition-colors"
                      >
                        {product.name}
                      </Link>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-sm font-extrabold text-tangerine">
                          {formatBRL(product.price)}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-xs text-plum/40 line-through">
                            {formatBRL(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5">
                      <Button
                        size="sm"
                        className="h-7 rounded-full bg-tangerine px-3 text-xs font-bold text-white hover:bg-tangerine/90"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingBag className="mr-1 h-3 w-3" />
                        Adicionar
                      </Button>
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="grid h-7 w-7 place-items-center rounded-full text-plum/40 hover:bg-red-50 hover:text-red-500 transition-colors"
                        aria-label="Remover dos favoritos"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
