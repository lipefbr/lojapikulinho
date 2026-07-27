'use client'

import { useEffect, useState } from 'react'
import { History, X } from 'lucide-react'
import { ProductCard, type ProductCardData } from '@/components/site/product-card'
import { useRecentlyViewed } from '@/lib/recently-viewed-store'

export function RecentlyViewed() {
  const slugs = useRecentlyViewed((s) => s.slugs)
  const clearAll = useRecentlyViewed((s) => s.clearAll)
  const [products, setProducts] = useState<ProductCardData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (slugs.length === 0) {
        setProducts([])
        return
      }
      setLoading(true)
      fetch('/api/products')
        .then((r) => r.json())
        .then((data) => {
          const all: ProductCardData[] = data.products || []
          const filtered = slugs
            .map((slug) => all.find((p: ProductCardData) => p.slug === slug))
            .filter((p): p is ProductCardData => !!p)
          setProducts(filtered)
        })
        .catch(() => setProducts([]))
        .finally(() => setLoading(false))
    })
    return () => cancelAnimationFrame(id)
  }, [slugs])

  if (!loading && products.length === 0) return null

  return (
    <section className="py-10 bg-cream">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="h-6 w-6 text-tangerine" />
            <h2 className="font-display text-2xl font-bold text-plum">Vistos recentemente</h2>
          </div>
          {products.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-plum transition-colors"
              aria-label="Limpar historico"
            >
              <X className="h-4 w-4" />
              Limpar
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-[200px] max-w-[200px] animate-pulse">
                <div className="aspect-square rounded-2xl bg-secondary" />
                <div className="mt-3 h-4 w-3/4 rounded bg-secondary" />
                <div className="mt-2 h-4 w-1/2 rounded bg-secondary" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scroll-pretty">
            {products.map((p) => (
              <div key={p.id} className="min-w-[200px] max-w-[200px]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
