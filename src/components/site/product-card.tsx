'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Plus, Eye, GitCompareArrows } from 'lucide-react'
import { useCompare } from '@/lib/compare-store'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCart } from '@/lib/cart-store'
import { useAuth } from './favorites-provider'
import { StarRating } from './star-rating'
import { Heart as HeartDoodle } from './doodles'
import { formatBRL } from '@/lib/types'
import { useQuickView } from '@/lib/quick-view-store'
import { cn } from '@/lib/utils'

export type ProductCardData = {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  images: string[]
  rating: number
  reviewCount: number
  category?: { slug: string; name: string; color: string } | null
  colors?: string[]
  stock?: number
  gender?: string
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const addItem = useCart((s) => s.addItem)
  const { user, isFavorite, toggleFavorite } = useAuth()
  const compareAdd = useCompare((s) => s.addItem)
  const compareItems = useCompare((s) => s.items)
  const [imgOk, setImgOk] = useState(true)

  const quickView = useQuickView((s) => s.setOpenSlug)
  const fav = isFavorite(product.id)
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
        )
      : 0

  const colorMap: Record<string, string> = {
    Amarelo: '#FFC83D',
    Laranja: '#FF7A45',
    Verde: '#5CC9A7',
    Rosa: '#FF8FB8',
    Roxo: '#7C5CE0',
    Azul: '#4FA8E0',
    'Azul Claro': '#9FD4F0',
    'Verde Menta': '#8FE3CB',
    Colorido: 'linear-gradient(45deg,#FF7A45,#FFC83D,#5CC9A7,#4FA8E0)',
    'Rosa Claro': '#FFD0E0',
  }

  function handleAdd() {
    const firstColor = product.colors?.[0] || 'Único'
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/images/products/placeholder.png',
      size: 'Único',
      color: firstColor,
    })
    toast.success(`${product.name} adicionado ao carrinho!`)
  }

  function handleFav(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.info('Faça login para favoritar')
      return
    }
    toggleFavorite(product.id)
  }

  const isComparing = compareItems.some((c) => c.id === product.id)

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (isComparing) {
      useCompare.getState().removeItem(product.id)
      toast.info('Removido da comparação')
    } else {
      compareAdd({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        rating: product.rating,
        reviewCount: product.reviewCount,
        category: product.category?.name || '',
        ageRange: '',
        sizes: [],
        colors: product.colors || [],
        image: product.images[0] || '/images/products/placeholder.png',
      })
      toast.success('Adicionado à comparação!')
    }
  }

  return (
    <div className="shimmer-sweep card-tilt group relative flex flex-col rounded-3xl bg-white dark:bg-card border-2 border-tangerine/30 p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-tangerine/10 hover:border-tangerine/60 sticker-shadow">
      <Link
        href={`/produto/${product.slug}`}
        className="relative block overflow-hidden rounded-2xl bg-secondary"
      >
        <div className="aspect-square w-full">
          {imgOk ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center gap-2"
              style={{ background: `${product.category?.color || '#FFC83D'}18` }}
            >
              <span className="text-5xl drop-shadow-md" style={{ filter: 'saturate(1.2)' }}>
                {product.category?.slug === 'vestidos' ? '👗' : product.category?.slug === 'pijamas' ? '🌙' : product.category?.slug === 'calcados' ? '👟' : product.category?.slug === 'acessorios' ? '🎩' : product.category?.slug === 'calcas-e-shorts' ? '👖' : product.category?.slug === 'conjuntos' ? '👔' : '👕'}
              </span>
              <span className="text-[10px] font-bold text-plum/50">{product.category?.name || ''}</span>
            </div>
          )}
          <img
            src={product.images[0]}
            alt=""
            className="hidden"
            onError={() => setImgOk(false)}
          />
        </div>

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); quickView(product.slug) }}
          aria-label="Visualização rápida"
          className="absolute left-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full border-2 bg-white/90 backdrop-blur text-plum/50 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 hover:text-tangerine border-border"
        >
          <Eye className="h-4 w-4" />
        </button>

        {discount > 0 && (
          <span className="animate-badge-bounce absolute left-12 top-2 rounded-full bg-tangerine px-2.5 py-1 text-xs font-extrabold text-white shadow">
            -{discount}%
          </span>
        )}
        {(product.stock !== undefined && product.stock <= 5 && product.stock > 0) && (
          <span className="absolute right-2 top-2 z-20 rounded-full bg-tangerine px-2.5 py-1 text-[10px] font-extrabold text-white shadow">
            🔥 Últimas {product.stock} unidades!
          </span>
        )}
        {(product.stock !== undefined && product.stock === 0) && (
          <span className="absolute right-2 top-2 z-20 rounded-full bg-gray-500 px-2.5 py-1 text-[10px] font-extrabold text-white shadow">
            Esgotado
          </span>
        )}
        {product.rating >= 4.8 && (product.stock === undefined || product.stock > 0) && (
          <span className="absolute right-2 top-2 rounded-full bg-sun px-2 py-1 text-[10px] font-extrabold text-plum shadow flex items-center gap-1">
            ★ TOP
          </span>
        )}
        {/* Compare button */}
        <button
          onClick={handleCompare}
          aria-label="Comparar"
          className={cn(
            'absolute left-2 bottom-2 z-10 grid h-9 w-9 place-items-center rounded-full border-2 bg-white/90 backdrop-blur transition-all opacity-0 group-hover:opacity-100 hover:scale-110 border-border',
            isComparing && 'opacity-100 border-tangerine text-tangerine bg-tangerine/10'
          )}
        >
          <GitCompareArrows className={cn('h-4 w-4', isComparing && 'fill-current')} />
        </button>
      </Link>

      <button
        onClick={handleFav}
        aria-label="Favoritar"
        className={cn(
          'absolute right-4 top-12 z-10 grid h-9 w-9 place-items-center rounded-full border-2 bg-white/90 backdrop-blur transition-all hover:scale-110',
          fav ? 'border-blush text-blush' : 'border-border text-plum/50 hover:text-tangerine'
        )}
      >
        <Heart className={cn('h-4 w-4', fav && 'fill-current')} />
      </button>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
        {product.category && (
          <span
            className="mb-1 text-[11px] font-bold uppercase tracking-wide"
            style={{ color: product.category.color }}
          >
            {product.category.name}
          </span>
        )}
        <Link href={`/produto/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-plum hover:text-tangerine transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5">
          <StarRating rating={product.rating} count={product.reviewCount} />
        </div>

        {product.colors && product.colors.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c}
                className="h-3.5 w-3.5 rounded-full border border-plum/10"
                style={{ background: colorMap[c] || '#ccc' }}
                title={c}
              />
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <div className="text-xs text-muted-foreground line-through">
                {formatBRL(product.compareAtPrice)}
              </div>
            )}
            <div className="text-lg font-extrabold text-plum">
              {formatBRL(product.price)}
            </div>
            <div className="text-[11px] text-muted-foreground">
              ou 3x de {formatBRL(product.price / 3)}
            </div>
          </div>
          <button
            onClick={handleAdd}
            aria-label={`Adicionar ${product.name} ao carrinho`}
            className="animate-pulse-glow grid h-11 w-11 shrink-0 place-items-center rounded-full bg-tangerine text-white shadow-md transition-all duration-300 hover:bg-grape hover:scale-110 active:scale-95 hover:shadow-lg hover:shadow-grape/25"
          >
            <Plus className="h-5 w-5" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  )
}
