'use client'

import { useEffect, useState } from 'react'
import { ProductCard, type ProductCardData } from '@/components/site/product-card'
import { Sparkle, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-store'
import { toast } from 'sonner'
import { formatBRL } from '@/lib/types'

interface FrequentlyBoughtTogetherProps {
  currentProductId: string
  currentCategorySlug?: string
}

export function FrequentlyBoughtTogether({ currentProductId, currentCategorySlug }: FrequentlyBoughtTogetherProps) {
  const [products, setProducts] = useState<ProductCardData[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCart((s) => s.addItem)
  const setOpen = useCart((s) => s.setOpen)

  useEffect(() => {
    fetch(`/api/products?limit=4&category=${currentCategorySlug || ''}&exclude=${currentProductId}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts((data.products || []).slice(0, 3))
      })
      .finally(() => setLoading(false))
  }, [currentProductId, currentCategorySlug])

  if (loading || products.length === 0) return null

  const bundleTotal = products.reduce((sum, p) => sum + p.price, 0)
  const originalTotal = products.reduce((sum, p) => sum + (p.compareAtPrice || p.price), 0)
  const bundleDiscount = originalTotal > bundleTotal ? Math.round(((originalTotal - bundleTotal) / originalTotal) * 100) : 0

  function handleBuyAll() {
    products.forEach((p) => {
      addItem({
        productId: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        image: p.images[0] || '/images/products/placeholder.png',
        size: 'Único',
        color: p.colors?.[0] || 'Único',
      })
    })
    toast.success('Todos os itens foram adicionados ao carrinho! 🛒')
    setOpen(true)
  }

  return (
    <div className="rounded-3xl border-2 border-tangerine/20 bg-white dark:bg-card p-6 sticker-shadow">
      <div className="mb-4 flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-tangerine" />
        <h3 className="font-display text-xl font-bold text-plum dark:text-cream">
          Quem comprou também levou
        </h3>
        <Sparkle className="h-4 w-4 text-sun animate-float" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {products.map((p, i) => (
          <div key={p.id} className="relative">
            <div className="flex items-start gap-3">
              <div className="flex flex-1 flex-col">
                <ProductCard product={p} />
              </div>
            </div>
            {i < products.length - 1 && (
              <div className="hidden sm:flex absolute -right-3 top-1/2 z-10 h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-cream border-2 border-tangerine/30 text-tangerine text-sm font-bold">
                +
              </div>
            )}
          </div>
        ))}
      </div>

      {bundleDiscount > 0 && (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl bg-tangerine/5 border border-tangerine/20 p-4 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-plum dark:text-cream">
              Compre todos juntos e economize
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground line-through">{formatBRL(originalTotal)}</span>
              <span className="text-lg font-extrabold text-tangerine">{formatBRL(bundleTotal)}</span>
              <span className="rounded-full bg-tangerine px-2 py-0.5 text-xs font-bold text-white">-{bundleDiscount}%</span>
            </div>
          </div>
          <Button
            onClick={handleBuyAll}
            className="rounded-full bg-tangerine hover:bg-tangerine/90 px-6 animate-pulse-glow"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Comprar todos
          </Button>
        </div>
      )}
    </div>
  )
}
