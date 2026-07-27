'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Sparkles, Tag, Gift, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/lib/cart-store'
import { formatBRL } from '@/lib/types'
import type { ProductCardData } from '@/components/site/product-card'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface BundleItem {
  productId: string
  slug: string
  name: string
  price: number
  image: string
  discount: number
}

interface Bundle {
  id: string
  name: string
  emoji: string
  description: string
  items: BundleItem[]
  totalOriginal: number
  totalBundle: number
  savingsPercent: number
}

const SUGGESTED_BUNDLES: Bundle[] = [
  {
    id: 'casual-kid',
    name: 'Look Casual Completo',
    emoji: '👕',
    description: 'Camiseta + Shorts + Boné para o dia a dia',
    items: [
      { productId: 'camiseta-estampada', slug: 'camiseta-estampada', name: 'Camiseta Estampada', price: 49.90, image: '/images/products/camiseta-estampada.png', discount: 0 },
      { productId: 'shorts-colorido', slug: 'shorts-colorido', name: 'Shorts Colorido', price: 59.90, image: '/images/products/shorts-colorido.png', discount: 0 },
      { productId: 'bone-colorido', slug: 'bone-colorido', name: 'Boné Colorido', price: 39.90, image: '/images/products/bone-colorido.png', discount: 0 },
    ],
    totalOriginal: 149.70,
    totalBundle: 119.90,
    savingsPercent: 20,
  },
  {
    id: 'night-time',
    name: 'Kit Pijama + Boné',
    emoji: '🌙',
    description: 'Pijama divertido + Boné para manhã',
    items: [
      { productId: 'pijama-animais', slug: 'pijama-animais', name: 'Pijama Animais', price: 89.90, image: '/images/products/pijama-animais.png', discount: 0 },
      { productId: 'bone-colorido', slug: 'bone-colorido', name: 'Boné Colorido', price: 39.90, image: '/images/products/bone-colorido.png', discount: 0 },
    ],
    totalOriginal: 129.80,
    totalBundle: 99.90,
    savingsPercent: 23,
  },
  {
    id: 'winter-bundle',
    name: 'Kit Inverno Especial',
    emoji: '🧥',
    description: 'Jaqueta + Conjunto Moletom para o frio',
    items: [
      { productId: 'jaqueta-jeans', slug: 'jaqueta-jeans', name: 'Jaqueta Jeans', price: 129.90, image: '/images/products/jaqueta-jeans.png', discount: 0 },
      { productId: 'conjunto-moletom', slug: 'conjunto-moletom', name: 'Conjunto Moletom', price: 109.90, image: '/images/products/conjunto-moletom.png', discount: 0 },
    ],
    totalOriginal: 239.80,
    totalBundle: 189.90,
    savingsPercent: 21,
  },
  {
    id: 'party-girl',
    name: 'Look Festivo Menina',
    emoji: '👗',
    description: 'Vestido + Calça Leg para festas',
    items: [
      { productId: 'vestido-arcoiris', slug: 'vestido-arcoiris', name: 'Vestido Arco-Íris', price: 79.90, image: '/images/products/vestido-arcoiris.png', discount: 0 },
      { productId: 'calca-leg', slug: 'calca-leg', name: 'Calça Leg', price: 59.90, image: '/images/products/calca-leg.png', discount: 0 },
    ],
    totalOriginal: 139.80,
    totalBundle: 109.90,
    savingsPercent: 21,
  },
]

export function ProductBundles({ currentProductId }: { currentProductId?: string }) {
  const bundles = SUGGESTED_BUNDLES.filter(
    b => !currentProductId || !b.items.some(item => item.productId === currentProductId)
  )

  if (bundles.length === 0) return null

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 mb-5">
        <Gift className="h-5 w-5 text-tangerine" />
        <h2 className="font-display text-xl font-bold text-plum sm:text-2xl">
          Combos Especiais
        </h2>
        <Badge className="bg-grape text-white text-[10px]">Economize até 25%</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {bundles.slice(0, 4).map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} />
        ))}
      </div>
    </section>
  )
}

function BundleCard({ bundle }: { bundle: Bundle }) {
  const addItem = useCart(s => s.addItem)
  const [added, setAdded] = useState(false)

  function addBundleToCart() {
    for (const item of bundle.items) {
      addItem({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        price: bundle.totalBundle / bundle.items.length, // Split the bundle price evenly
        image: item.image,
        size: 'Único',
        color: 'Padrão',
        quantity: 1,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  const savings = bundle.totalOriginal - bundle.totalBundle

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-3xl border-2 border-border bg-white p-4 transition-all hover:shadow-lg hover:border-tangerine/30 overflow-hidden"
    >
      {/* Savings badge */}
      <div className="absolute top-3 right-3 z-10">
        <Badge className="bg-tangerine text-white font-extrabold text-xs px-2.5 py-1 shadow-md">
          <Tag className="h-3 w-3 mr-1" />
          -{bundle.savingsPercent}%
        </Badge>
      </div>

      {/* Bundle header */}
      <div className="mb-3 pr-16">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{bundle.emoji}</span>
          <div>
            <h3 className="font-display text-base font-bold text-plum">{bundle.name}</h3>
            <p className="text-xs text-muted-foreground">{bundle.description}</p>
          </div>
        </div>
      </div>

      {/* Bundle items */}
      <div className="flex items-center gap-2 mb-4">
        {bundle.items.map((item, i) => (
          <div key={item.productId} className="relative flex-1">
            <Link
              href={`/produto/${item.slug}`}
              className="block aspect-square overflow-hidden rounded-2xl bg-secondary border-2 border-border group-hover:border-tangerine/30 transition-colors"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={120}
                height={120}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement!.innerHTML = '<div class="grid h-full w-full place-items-center bg-gradient-to-br from-tangerine/20 to-grape/20 text-3xl">👕</div>'
                }}
              />
            </Link>
            {i < bundle.items.length - 1 && (
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 z-10 grid h-6 w-6 place-items-center rounded-full bg-white border-2 border-border text-tangerine">
                <Plus className="h-3.5 w-3.5" />
              </div>
            )}
            <p className="mt-1 text-center text-[10px] font-semibold text-muted-foreground truncate">{item.name}</p>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground line-through">
            {formatBRL(bundle.totalOriginal)}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl font-extrabold text-tangerine">
              {formatBRL(bundle.totalBundle)}
            </span>
            <span className="text-xs font-bold text-mint">
              Economize {formatBRL(savings)}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {added ? (
            <motion.div
              key="added"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-mint"
            >
              <Check className="h-5 w-5 text-white" />
            </motion.div>
          ) : (
            <motion.div key="button" initial={{ scale: 1 }} exit={{ scale: 0 }}>
              <Button
                size="sm"
                onClick={addBundleToCart}
                className="rounded-full bg-tangerine hover:bg-grape gap-1.5"
              >
                <ShoppingCart className="h-4 w-4" />
                Comprar combo
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
