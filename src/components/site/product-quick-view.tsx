'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StarRating } from './star-rating'
import { useQuickView } from '@/lib/quick-view-store'
import { useCart } from '@/lib/cart-store'
import { formatBRL } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const COLOR_MAP: Record<string, string> = {
  Amarelo: '#FFC83D', Laranja: '#FF7A45', Verde: '#5CC9A7', Rosa: '#FF8FB8',
  Roxo: '#7C5CE0', Azul: '#4FA8E0', 'Azul Claro': '#9FD4F0', 'Verde Menta': '#8FE3CB',
  Colorido: 'linear-gradient(45deg,#FF7A45,#FFC83D,#5CC9A7,#4FA8E0)', 'Rosa Claro': '#FFD0E0',
}

type Product = {
  id: string; name: string; slug: string; description: string; price: number
  compareAtPrice: number | null; images: string[]; sizes: string[]; colors: string[]
  ageRange: string | null; category: { slug: string; name: string; color: string } | null
  stock: number; rating: number; reviewCount: number; featured: boolean
}

export function ProductQuickView() {
  const openSlug = useQuickView((s) => s.openSlug)
  const close = useQuickView((s) => s.close)
  const addItem = useCart((s) => s.addItem)
  const setOpen = useCart((s) => s.setOpen)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [qty, setQty] = useState(1)
  const [imgOk, setImgOk] = useState(true)
  const [imgLoaded, setImgLoaded] = useState(false)

  const fetchProduct = useCallback(() => {
    if (!openSlug) return
    setLoading(true)
    setImgOk(true)
    setImgLoaded(false)
    setQty(1)
    fetch(`/api/products/${openSlug}`)
      .then((r) => r.json())
      .then((data) => {
        const p = data.product || null
        setProduct(p)
        if (p?.sizes?.[0]) setSelectedSize(p.sizes[0])
        else setSelectedSize('')
        if (p?.colors?.[0]) setSelectedColor(p.colors[0])
        else setSelectedColor('')
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [openSlug])

  useEffect(() => {
    const id = requestAnimationFrame(fetchProduct)
    return () => cancelAnimationFrame(id)
  }, [fetchProduct])

  const discount =
    product && product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
        )
      : 0

  function handleAddCart() {
    if (!product) return
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0] || '',
        size: selectedSize,
        color: selectedColor,
      },
      qty
    )
    toast.success(`${product.name} adicionado ao carrinho! 🎉`)
    setOpen(true)
    close()
  }

  return (
    <Dialog open={!!openSlug} onOpenChange={(open) => { if (!open) close() }}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'inset-0 top-0 left-0 translate-x-0 translate-y-0 h-full w-full max-w-full rounded-none border-none p-0 data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100',
          'md:inset-auto md:top-[50%] md:left-[50%] md:translate-x-[-50%] md:translate-y-[-50%] md:h-auto md:max-h-[90vh] md:max-w-3xl md:rounded-3xl md:border-2 md:border-border md:p-0 md:data-[state=open]:zoom-in-95 md:data-[state=closed]:zoom-out-95'
        )}
      >
        <DialogTitle className="sr-only">
          {product?.name || 'Visualização rápida do produto'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Modal de visualização rápida do produto
        </DialogDescription>

        {loading && <QuickViewSkeleton />}

        {!loading && product && (
          <div className="flex flex-col md:grid md:grid-cols-2 md:max-h-[90vh]">
            {/* Image section */}
            <div className="relative aspect-square md:aspect-auto md:min-h-0 overflow-hidden md:rounded-l-3xl">
              <div className="relative h-full w-full">
                {imgOk ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width:768px) 100vw, 50vw"
                    className={cn(
                      'object-cover transition-opacity duration-300',
                      imgLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    onLoad={() => setImgLoaded(true)}
                  />
                ) : (
                  <div
                    className="flex h-full w-full flex-col items-center justify-center gap-2 bg-cream"
                    style={{ background: `${product.category?.color || '#FFC83D'}18` }}
                  >
                    <span className="text-6xl drop-shadow-md">
                      {product.category?.slug === 'vestidos'
                        ? '👗'
                        : product.category?.slug === 'pijamas'
                        ? '🌙'
                        : product.category?.slug === 'calcados'
                        ? '👟'
                        : product.category?.slug === 'acessorios'
                        ? '🎩'
                        : product.category?.slug === 'calcas-e-shorts'
                        ? '👖'
                        : product.category?.slug === 'conjuntos'
                        ? '👔'
                        : '👕'}
                    </span>
                  </div>
                )}
                <img
                  src={product.images[0]}
                  alt=""
                  className="hidden"
                  onError={() => setImgOk(false)}
                />
                {!imgLoaded && imgOk && (
                  <Skeleton className="absolute inset-0" />
                )}
                {discount > 0 && (
                  <span className="absolute left-3 top-3 rounded-full bg-tangerine px-2.5 py-1 text-xs font-extrabold text-white shadow-lg">
                    -{discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Details section */}
            <ScrollArea className="flex-1 md:max-h-[90vh]">
              <div className="flex flex-col gap-4 bg-cream p-5 md:p-6 md:rounded-r-3xl">
                {/* Close button inside */}
                <button
                  onClick={close}
                  aria-label="Fechar"
                  className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/80 backdrop-blur border border-border text-plum/60 transition hover:bg-white hover:text-plum md:right-4 md:top-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>

                {product.category && (
                  <span
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: product.category.color }}
                  >
                    {product.category.name}
                  </span>
                )}

                <h2 className="font-display text-xl font-bold text-plum md:text-2xl pr-6">
                  {product.name}
                </h2>

                {/* Rating */}
                <StarRating
                  rating={product.rating}
                  count={product.reviewCount}
                  showValue
                  size="md"
                />

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-extrabold text-plum">
                    {formatBRL(product.price)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatBRL(product.compareAtPrice)}
                      </span>
                      <span className="rounded-full bg-tangerine/10 px-2 py-0.5 text-xs font-bold text-tangerine">
                        -{discount}%
                      </span>
                    </>
                  )}
                </div>
                <p className="-mt-2 text-xs text-muted-foreground">
                  ou 3x de {formatBRL(product.price / 3)} sem juros
                </p>

                {/* Description snippet */}
                <p className="text-sm leading-relaxed text-plum/80 line-clamp-3">
                  {product.description}
                </p>

                {/* Size selector */}
                {product.sizes.length > 1 && (
                  <div>
                    <p className="mb-2 text-sm font-bold text-plum">Tamanho</p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={cn(
                            'h-9 min-w-9 rounded-xl border-2 px-2.5 text-sm font-bold transition-all',
                            selectedSize === s
                              ? 'border-plum bg-plum text-cream'
                              : 'border-border bg-white text-plum hover:border-plum/40'
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color selector */}
                {product.colors.length > 1 && (
                  <div>
                    <p className="mb-2 text-sm font-bold text-plum">
                      Cor:{' '}
                      <span className="text-muted-foreground font-normal">
                        {selectedColor}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          title={c}
                          className={cn(
                            'h-9 w-9 rounded-full border-2 transition-all',
                            selectedColor === c
                              ? 'ring-2 ring-plum ring-offset-2'
                              : 'border-border hover:scale-110'
                          )}
                          style={{ background: COLOR_MAP[c] || '#ccc' }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity selector */}
                <div>
                  <p className="mb-2 text-sm font-bold text-plum">Quantidade</p>
                  <div className="inline-flex items-center gap-1 rounded-xl border-2 border-border bg-white px-1">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
                      aria-label="Diminuir"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{qty}</span>
                    <button
                      onClick={() => setQty(Math.min(product.stock, qty + 1))}
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
                      aria-label="Aumentar"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    onClick={handleAddCart}
                    className="h-12 w-full rounded-full bg-tangerine text-base font-bold text-white hover:bg-grape sticker-shadow"
                  >
                    Adicionar ao carrinho
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 w-full rounded-full border-2 border-plum/20 text-plum font-semibold hover:bg-plum/5"
                    onClick={close}
                  >
                    <Link href={`/produto/${product.slug}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver detalhes completos
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}

        {!loading && !product && (
          <div className="flex flex-col items-center justify-center gap-3 bg-cream rounded-3xl p-12 text-center">
            <span className="text-5xl">😔</span>
            <p className="font-bold text-plum">Produto não encontrado</p>
            <Button variant="outline" className="mt-2 rounded-full" onClick={close}>
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function QuickViewSkeleton() {
  return (
    <div className="flex flex-col md:grid md:grid-cols-2 md:max-h-[90vh]">
      <Skeleton className="aspect-square md:aspect-auto md:rounded-l-3xl" />
      <div className="flex flex-col gap-4 bg-cream p-5 md:p-6 md:rounded-r-3xl">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-14 rounded-xl" />
          <Skeleton className="h-9 w-14 rounded-xl" />
          <Skeleton className="h-9 w-14 rounded-xl" />
          <Skeleton className="h-9 w-14 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-full" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    </div>
  )
}
