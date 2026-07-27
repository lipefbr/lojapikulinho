'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Heart, Truck, RefreshCcw, ShieldCheck, ChevronRight, ChevronLeft, Star, MessageSquare, Share2, Ruler, Maximize2, X, Bell, Zap, Sparkles, ChevronDown } from 'lucide-react'
import { ProductCard, type ProductCardData } from '@/components/site/product-card'
import { StarRating } from '@/components/site/star-rating'
import { useCart } from '@/lib/cart-store'
import { useRecentlyViewed } from '@/lib/recently-viewed-store'
import { useAuth } from '@/components/site/favorites-provider'
import { formatBRL } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sparkle, Cloud } from '@/components/site/doodles'
import { SizeQuizButton } from '@/components/site/size-quiz'
import { ProductBundles } from '@/components/site/product-bundles'
import { FrequentlyBoughtTogether } from '@/components/site/frequently-bought'
import { LoyaltyPointsEarned } from '@/components/site/loyalty-badge'
import { StockNotification } from '@/components/site/stock-notification'

const COLOR_MAP: Record<string, string> = {
  Amarelo: '#FFC83D', Laranja: '#FF7A45', Verde: '#5CC9A7', Rosa: '#FF8FB8',
  Roxo: '#7C5CE0', Azul: '#4FA8E0', 'Azul Claro': '#9FD4F0', 'Verde Menta': '#8FE3CB',
  Colorido: 'linear-gradient(45deg,#FF7A45,#FFC83D,#5CC9A7,#4FA8E0)', 'Rosa Claro': '#FFD0E0',
}

const SIZE_CHART = [
  { size: '2', age: '1-2 anos', height: '86-92', chest: '48-52' },
  { size: '4', age: '2-3 anos', height: '92-98', chest: '50-54' },
  { size: '6', age: '3-4 anos', height: '98-104', chest: '52-56' },
  { size: '8', age: '5-6 anos', height: '104-116', chest: '54-58' },
  { size: '10', age: '7-8 anos', height: '116-128', chest: '58-64' },
  { size: '12', age: '9-10 anos', height: '128-140', chest: '62-68' },
  { size: '14', age: '11-12 anos', height: '140-152', chest: '66-74' },
]

type Product = {
  id: string; name: string; slug: string; description: string; price: number;
  compareAtPrice: number | null; images: string[]; sizes: string[]; colors: string[];
  ageRange: string | null; category: { slug: string; name: string; color: string } | null;
  stock: number; rating: number; reviewCount: number; featured: boolean;
}
type Review = { id: string; authorName: string; rating: number; comment: string; createdAt: string }

export default function ProdutoPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const addItem = useCart((s) => s.addItem)
  const addViewed = useRecentlyViewed((s) => s.addViewed)
  const setOpen = useCart((s) => s.setOpen)
  const { user, isFavorite, toggleFavorite } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [related, setRelated] = useState<ProductCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [failedImgs, setFailedImgs] = useState<Set<number>>(new Set())
  const [loadedImgs, setLoadedImgs] = useState<Set<number>>(new Set())
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  // Crossfade: displayedImg lags behind activeImg with a fade transition
  const [displayedImg, setDisplayedImg] = useState(0)
  const [imgFading, setImgFading] = useState(false)

  // Swipe gesture
  const touchStartRef = useRef<number | null>(null)
  const swipeDeltaRef = useRef(0)
  const [swipeDelta, setSwipeDelta] = useState(0)

  // Thumbnail auto-scroll refs
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Size recommendation helper
  const [sizeHelperOpen, setSizeHelperOpen] = useState(false)
  const [sizeHelperAge, setSizeHelperAge] = useState('')
  const [sizeHelperHeight, setSizeHelperHeight] = useState('')
  const [sizeHelperBuild, setSizeHelperBuild] = useState('')

  // image zoom
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null)

  function handleImageMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }
  function handleImageMouseEnter() { setZoomPos({ x: 50, y: 50 }) }
  function handleImageMouseLeave() { setZoomPos(null) }

  // Swipe gesture handlers
  function handleTouchStart(e: React.TouchEvent) {
    touchStartRef.current = e.touches[0].clientX
    swipeDeltaRef.current = 0
    setSwipeDelta(0)
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartRef.current === null) return
    const delta = e.touches[0].clientX - touchStartRef.current
    swipeDeltaRef.current = delta
    setSwipeDelta(delta)
  }
  function handleTouchEnd() {
    if (touchStartRef.current === null) return
    touchStartRef.current = null
    if (product && Math.abs(swipeDeltaRef.current) > 50) {
      if (swipeDeltaRef.current > 0) {
        setActiveImg((i) => (i - 1 + product.images.length) % product.images.length)
      } else {
        setActiveImg((i) => (i + 1) % product.images.length)
      }
    }
    swipeDeltaRef.current = 0
    setSwipeDelta(0)
  }

  // review form
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewName, setReviewName] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const fetchProduct = useCallback(() => {
    setLoading(true)
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data.product || null)
        setActiveImg(0)
        setDisplayedImg(0)
        setImgFading(false)
        setFailedImgs(new Set())
        setLoadedImgs(new Set())
        if (data.product) addViewed(slug)
        setReviews(data.reviews || [])
        setRelated(data.related || [])
        if (data.product?.sizes?.[0]) setSelectedSize(data.product.sizes[0])
        if (data.product?.colors?.[0]) setSelectedColor(data.product.colors[0])
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug, addViewed])

  useEffect(() => { fetchProduct() }, [fetchProduct])

  // Crossfade effect: fade out, swap displayedImg, fade in
  useEffect(() => {
    if (activeImg === displayedImg || imgFading) return
    setImgFading(true)
    const t = setTimeout(() => {
      setDisplayedImg(activeImg)
      setImgFading(false)
    }, 300)
    return () => clearTimeout(t)
  }, [activeImg, displayedImg, imgFading])

  // Thumbnail auto-scroll
  useEffect(() => {
    if (!product) return
    const el = thumbRefs.current[activeImg]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [activeImg, product])

  // Lightbox keyboard navigation (Escape handled by Radix Dialog)
  useEffect(() => {
    if (!lightboxOpen || !product) return
    const total = product.images.length
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setActiveImg((i) => (i - 1 + total) % total)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setActiveImg((i) => (i + 1) % total)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, product])

  const fav = product ? isFavorite(product.id) : false
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifySuccess, setNotifySuccess] = useState(false)
  const isOutOfStock = product ? product.stock === 0 : false

  useEffect(() => {
    if (!product) return
    try {
      const stored = localStorage.getItem('pijulinho-notify')
      if (stored) {
        const map: Record<string, string> = JSON.parse(stored)
        if (map[product.id]) setNotifySuccess(true)
      }
    } catch { /* ignore */ }
  }, [product])

  async function handleShare() {
    if (!product) return
    const url = `${window.location.origin}/produto/${product.slug}`
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url })
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado!')
    }
  }

  function handleAddCart() {
    if (!product) return
    addItem({
      productId: product.id, slug: product.slug, name: product.name,
      price: product.price, image: product.images[0] || '',
      size: selectedSize, color: selectedColor,
    }, qty)
    toast.success(`${product.name} adicionado ao carrinho! 🎉`)
    setOpen(true)
  }

  function handleQuickBuy() {
    if (!product) return
    addItem({
      productId: product.id, slug: product.slug, name: product.name,
      price: product.price, image: product.images[0] || '',
      size: selectedSize, color: selectedColor,
    }, qty)
    router.push('/checkout')
  }

  function handleFav() {
    if (!product) return
    if (!user) { toast.info('Faça login para favoritar'); return }
    toggleFavorite(product.id)
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!product || !reviewComment.trim()) return
    setSubmittingReview(true)
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id, rating: reviewRating,
          comment: reviewComment, authorName: reviewName || user?.name || 'Cliente',
        }),
      })
      toast.success('Avaliação enviada! Obrigado 💛')
      setReviewComment('')
      setReviewName('')
      fetchProduct()
    } catch {
      toast.error('Erro ao enviar avaliação')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Size recommendation logic
  const sizeHelperSelections = [sizeHelperAge, sizeHelperHeight, sizeHelperBuild].filter(Boolean).length
  const recommendedSize = (() => {
    if (sizeHelperSelections < 2) return null
    const ageMap: Record<string, string[]> = {
      '1-2 anos': ['2'],
      '3-5 anos': ['4', '6', '8'],
      '6-8 anos': ['8', '10'],
      '9-12 anos': ['12', '14'],
    }
    const heightMap: Record<string, string[]> = {
      'até 1m': ['2', '4'],
      '1m-1.2m': ['6', '8'],
      '1.2m-1.5m': ['10', '12'],
      'acima de 1.5m': ['12', '14'],
    }
    const buildOffset: Record<string, number> = { 'Magro': -1, 'Mediano': 0 }
    const ageSizes = ageMap[sizeHelperAge] || []
    const heightSizes = heightMap[sizeHelperHeight] || []
    const offset = buildOffset[sizeHelperBuild] ?? 0
    const allSizes = SIZE_CHART.map(s => Number(s.size))
    let candidates = ageSizes.length > 0 && heightSizes.length > 0
      ? ageSizes.filter(s => heightSizes.includes(s))
      : ageSizes.length > 0 ? ageSizes : heightSizes
    if (candidates.length === 0) {
      const ageIdx = ageSizes.length > 0 ? allSizes.indexOf(Number(ageSizes[Math.floor(ageSizes.length / 2)])) : 3
      const heightIdx = heightSizes.length > 0 ? allSizes.indexOf(Number(heightSizes[Math.floor(heightSizes.length / 2)])) : 3
      const avgIdx = Math.round((ageIdx + heightIdx) / 2)
      const finalIdx = Math.max(0, Math.min(allSizes.length - 1, avgIdx + offset))
      return String(allSizes[finalIdx])
    }
    const midIdx = Math.floor(candidates.length / 2)
    const picked = Number(candidates[midIdx]) + offset
    const clamped = Math.max(2, Math.min(14, picked))
    return String(clamped)
  })()

  if (loading) return <ProductSkeleton />
  if (!product) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <span className="text-6xl">😔</span>
      <h1 className="mt-4 font-display text-2xl font-bold text-plum">Produto não encontrado</h1>
      <p className="mt-1 text-muted-foreground">Esse produto não existe ou foi removido.</p>
      <Button asChild className="mt-4 bg-tangerine rounded-full">
        <Link href="/produtos">Ver produtos</Link>
      </Button>
    </div>
  )

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const prevImgIdx = (displayedImg - 1 + product.images.length) % product.images.length
  const nextImgIdx = (displayedImg + 1) % product.images.length

  return (
    <div className="bg-cream min-h-screen">
      {/* breadcrumbs */}
      <div className="border-b border-border bg-white/60">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-plum">Início</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/produtos" className="hover:text-plum">Produtos</Link>
          {product.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={`/produtos?categoria=${product.category.slug}`} className="hover:text-plum" style={{ color: product.category.color }}>
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-plum truncate">{product.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              onMouseMove={handleImageMouseMove}
              onMouseEnter={handleImageMouseEnter}
              onMouseLeave={handleImageMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              aria-label="Ampliar imagem"
              className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-3xl border-2 border-border bg-secondary sticker-shadow"
            >
              {failedImgs.has(displayedImg) ? (
                <div
                  className="flex h-full w-full flex-col items-center justify-center gap-2"
                  style={{ background: `${product.category?.color || '#FFC83D'}18` }}
                >
                  <span className="text-7xl drop-shadow-md" style={{ filter: 'saturate(1.2)' }}>
                    {product.category?.slug === 'vestidos' ? '👗' : product.category?.slug === 'pijamas' ? '🌙' : product.category?.slug === 'calcados' ? '👟' : product.category?.slug === 'acessorios' ? '🎩' : product.category?.slug === 'calcas-e-shorts' ? '👖' : product.category?.slug === 'conjuntos' ? '👔' : '👕'}
                  </span>
                  <span className="text-xs font-bold text-plum/50">{product.category?.name || ''}</span>
                </div>
              ) : (
                <>
                  {/* Swipe peek: previous image edge (left) */}
                  {swipeDelta > 20 && !failedImgs.has(prevImgIdx) && (
                    <div
                      className="absolute inset-0 z-0"
                      style={{ transform: `translateX(${-100 + swipeDelta * 0.3}px)`, opacity: Math.min(1, swipeDelta / 80) }}
                    >
                      <Image src={product.images[prevImgIdx]} alt="" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
                    </div>
                  )}
                  {/* Swipe peek: next image edge (right) */}
                  {swipeDelta < -20 && !failedImgs.has(nextImgIdx) && (
                    <div
                      className="absolute inset-0 z-0"
                      style={{ transform: `translateX(${100 + swipeDelta * 0.3}px)`, opacity: Math.min(1, Math.abs(swipeDelta) / 80) }}
                    >
                      <Image src={product.images[nextImgIdx]} alt="" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
                    </div>
                  )}
                  <div
                    className="relative z-[1] h-full w-full"
                    style={{
                      transform: swipeDelta !== 0 ? `translateX(${swipeDelta}px)` : undefined,
                      transition: swipeDelta === 0 ? 'transform 0.3s ease' : 'none',
                    }}
                  >
                    <Image
                      src={product.images[displayedImg]}
                      alt={product.name}
                      fill
                      priority={displayedImg === 0}
                      sizes="(max-width:1024px) 100vw, 50vw"
                      className={cn(
                        'object-cover transition-opacity duration-300 group-hover:scale-105',
                        loadedImgs.has(displayedImg) && !imgFading ? 'opacity-100' : 'opacity-0'
                      )}
                      onLoad={() => setLoadedImgs((prev) => new Set(prev).add(displayedImg))}
                    />
                    <img
                      src={product.images[displayedImg]}
                      alt=""
                      className="hidden"
                      onError={() => setFailedImgs((prev) => new Set(prev).add(displayedImg))}
                    />
                  </div>
                  {/* Shimmer loading skeleton */}
                  {(!loadedImgs.has(displayedImg) || imgFading) && (
                    <div className="absolute inset-0 z-[2] rounded-3xl bg-secondary skeleton-shimmer pointer-events-none" />
                  )}
                </>
              )}
              {discount > 0 && (
                <span className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-tangerine px-3 py-1.5 text-sm font-extrabold text-white shadow-lg">
                  -{discount}%
                </span>
              )}
              {isOutOfStock && (
                <span className={cn(
                  'pointer-events-none absolute left-4 z-10 rounded-full bg-blush px-3 py-1.5 text-sm font-extrabold text-white shadow-lg',
                  discount > 0 ? 'top-14' : 'top-4'
                )}>
                  Esgotado
                </span>
              )}
              <span className="pointer-events-none absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-plum opacity-0 shadow-md backdrop-blur transition-opacity group-hover:opacity-100">
                <Maximize2 className="h-4 w-4" />
              </span>
            </button>

            {/* Image Zoom Panel (desktop only) */}
            {zoomPos && !failedImgs.has(displayedImg) && loadedImgs.has(displayedImg) && (
              <div
                className="hidden lg:block absolute left-full top-0 ml-4 w-[400px] h-[400px] rounded-2xl overflow-hidden border-2 border-border bg-secondary z-50 pointer-events-none shadow-xl"
                aria-hidden="true"
              >
                <img
                  src={product.images[displayedImg]}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{
                    transform: 'scale(2)',
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }}
                />
              </div>
            )}

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto scroll-pretty pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    ref={(el) => { thumbRefs.current[idx] = el }}
                    type="button"
                    onClick={() => setActiveImg(idx)}
                    aria-label={`Ver imagem ${idx + 1}`}
                    aria-current={activeImg === idx}
                    className={cn(
                      'relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-border bg-secondary transition-all',
                      activeImg === idx
                        ? 'border-tangerine ring-2 ring-tangerine/30'
                        : 'hover:border-tangerine/40 hover:opacity-90'
                    )}
                  >
                    {failedImgs.has(idx) ? (
                      <span className="flex h-full w-full items-center justify-center text-xl">
                        {product.category?.slug === 'vestidos' ? '👗' : product.category?.slug === 'pijamas' ? '🌙' : product.category?.slug === 'calcados' ? '👟' : product.category?.slug === 'acessorios' ? '🎩' : product.category?.slug === 'calcas-e-shorts' ? '👖' : product.category?.slug === 'conjuntos' ? '👔' : '👕'}
                      </span>
                    ) : (
                      <Image
                        src={img}
                        alt={`${product.name} — imagem ${idx + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Lightbox */}
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
              <DialogContent
                showCloseButton={false}
                className="left-0 top-0 flex h-screen w-screen max-w-none translate-x-0 translate-y-0 items-center justify-center gap-0 rounded-none border-0 bg-black/95 p-0 shadow-none sm:max-w-none"
              >
                <DialogTitle className="sr-only">{product.name}</DialogTitle>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  aria-label="Fechar"
                  className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </button>
                {product.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i - 1 + product.images.length) % product.images.length) }}
                      aria-label="Imagem anterior"
                      className="absolute left-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveImg((i) => (i + 1) % product.images.length) }}
                      aria-label="Próxima imagem"
                      className="absolute right-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
                <div className="relative h-[85vh] w-[90vw]">
                  {failedImgs.has(displayedImg) ? (
                    <div className="flex h-full w-full items-center justify-center text-[10rem]">
                      <span>
                        {product.category?.slug === 'vestidos' ? '👗' : product.category?.slug === 'pijamas' ? '🌙' : product.category?.slug === 'calcados' ? '👟' : product.category?.slug === 'acessorios' ? '🎩' : product.category?.slug === 'calcas-e-shorts' ? '👖' : product.category?.slug === 'conjuntos' ? '👔' : '👕'}
                      </span>
                    </div>
                  ) : (
                    <Image
                      src={product.images[displayedImg]}
                      alt={product.name}
                      fill
                      sizes="90vw"
                      className={cn(
                        'object-contain transition-opacity duration-300',
                        loadedImgs.has(displayedImg) && !imgFading ? 'opacity-100' : 'opacity-0'
                      )}
                      onLoad={() => setLoadedImgs((prev) => new Set(prev).add(displayedImg))}
                    />
                  )}
                  {(!loadedImgs.has(displayedImg) || imgFading) && !failedImgs.has(displayedImg) && (
                    <div className="absolute inset-0 bg-white/5 skeleton-shimmer" />
                  )}
                </div>
                {product.images.length > 1 && (
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <div className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
                      {activeImg + 1} / {product.images.length}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/50">
                      <span className="rounded-full bg-white/10 px-2.5 py-1 backdrop-blur">← → para navegar</span>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 backdrop-blur">ESC para fechar</span>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.category && (
              <span className="text-sm font-bold uppercase tracking-wide" style={{ color: product.category.color }}>
                {product.category.name}
              </span>
            )}
            <h1 className="mt-1 font-display text-2xl font-bold text-plum sm:text-3xl">{product.name}</h1>

            <div className="mt-2">
              <StarRating rating={product.rating} showValue count={product.reviewCount} size="md" />
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-plum">{formatBRL(product.price)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{formatBRL(product.compareAtPrice)}</span>
                  <span className="rounded-full bg-tangerine/10 px-2 py-0.5 text-xs font-bold text-tangerine">
                    -{discount}%
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              ou 3x de {formatBRL(product.price / 3)} sem juros
            </p>

            <p className="mt-4 text-sm leading-relaxed text-plum/80">{product.description}</p>

            {/* Size selector */}
            {product.sizes.length > 1 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-plum">Tamanho</p>
                  <Dialog open={sizeGuideOpen} onOpenChange={setSizeGuideOpen}>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-1 text-xs font-semibold text-tangerine hover:text-tangerine/80 transition-colors">
                        <Ruler className="h-3.5 w-3.5" />
                        Tabela de tamanhos
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 font-display text-xl text-plum">
                          <Ruler className="h-5 w-5 text-tangerine" />
                          Guia de Tamanhos
                        </DialogTitle>
                      </DialogHeader>
                      <div className="rounded-xl overflow-hidden border-2 border-border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-plum text-cream">
                              <th className="px-4 py-2.5 text-left font-bold">Tamanho</th>
                              <th className="px-4 py-2.5 text-left font-bold">Idade</th>
                              <th className="px-4 py-2.5 text-left font-bold">Altura (cm)</th>
                              <th className="px-4 py-2.5 text-left font-bold">Peito (cm)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {SIZE_CHART.map((row, i) => (
                              <tr key={row.size} className={cn(i % 2 === 0 ? 'bg-white' : 'bg-secondary/50')}>
                                <td className="px-4 py-2.5 font-bold text-plum">{row.size}</td>
                                <td className="px-4 py-2.5 text-plum/80">{row.age}</td>
                                <td className="px-4 py-2.5 text-plum/80">{row.height}</td>
                                <td className="px-4 py-2.5 text-plum/80">{row.chest}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <SizeQuizButton className="w-full mt-3" />
                      <p className="mt-2 text-xs text-muted-foreground text-center">
                        💡 As medidas podem variar levemente entre os modelos.
                      </p>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={cn(
                        'h-10 min-w-10 rounded-xl border-2 px-3 text-sm font-bold transition-all',
                        selectedSize === s
                          ? 'border-plum bg-plum text-cream'
                          : 'border-border bg-white text-plum hover:border-plum/40'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Size Recommendation Helper */}
                <Collapsible open={sizeHelperOpen} onOpenChange={setSizeHelperOpen} className="mt-3">
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center gap-2 text-xs font-semibold text-plum/70 hover:text-plum transition-colors">
                      <Ruler className="h-3.5 w-3.5" />
                      Qual tamanho ideal?
                      <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', sizeHelperOpen && 'rotate-180')} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-3 rounded-2xl border-2 border-dashed border-mint/40 bg-mint/5 p-4 space-y-3">
                      {/* Age */}
                      <div>
                        <p className="text-xs font-bold text-plum mb-1.5">Idade da criança</p>
                        <div className="flex flex-wrap gap-1.5">
                          {['1-2 anos', '3-5 anos', '6-8 anos', '9-12 anos'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setSizeHelperAge(sizeHelperAge === opt ? '' : opt)}
                              className={cn(
                                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border-2',
                                sizeHelperAge === opt
                                  ? 'border-mint bg-mint text-white'
                                  : 'border-border bg-white text-plum hover:border-mint/40'
                              )}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Height */}
                      <div>
                        <p className="text-xs font-bold text-plum mb-1.5">Altura</p>
                        <div className="flex flex-wrap gap-1.5">
                          {['até 1m', '1m-1.2m', '1.2m-1.5m', 'acima de 1.5m'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setSizeHelperHeight(sizeHelperHeight === opt ? '' : opt)}
                              className={cn(
                                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border-2',
                                sizeHelperHeight === opt
                                  ? 'border-mint bg-mint text-white'
                                  : 'border-border bg-white text-plum hover:border-mint/40'
                              )}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Build */}
                      <div>
                        <p className="text-xs font-bold text-plum mb-1.5">Corpo</p>
                        <div className="flex flex-wrap gap-1.5">
                          {['Magro', 'Mediano'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setSizeHelperBuild(sizeHelperBuild === opt ? '' : opt)}
                              className={cn(
                                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border-2',
                                sizeHelperBuild === opt
                                  ? 'border-mint bg-mint text-white'
                                  : 'border-border bg-white text-plum hover:border-mint/40'
                              )}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Recommendation */}
                      {recommendedSize && (
                        <div className="pt-2 border-t border-mint/20">
                          <Badge className="bg-mint/15 text-mint border-mint/30 text-sm px-3 py-1.5 rounded-full gap-1.5">
                            <Sparkles className="h-4 w-4" />
                            Recomendamos: Tam {recommendedSize}
                          </Badge>
                          <p className="mt-1.5 text-[11px] text-muted-foreground">Baseado nas medidas informadas</p>
                          {product.sizes.includes(recommendedSize) && (
                            <button
                              type="button"
                              onClick={() => setSelectedSize(recommendedSize)}
                              className="mt-2 text-xs font-bold text-mint hover:text-mint/80 transition-colors underline underline-offset-2"
                            >
                              Selecionar Tam {recommendedSize}
                            </button>
                          )}
                        </div>
                      )}
                      {sizeHelperSelections > 0 && sizeHelperSelections < 2 && (
                        <p className="text-[11px] text-muted-foreground italic">
                          Selecione mais {2 - sizeHelperSelections} {sizeHelperSelections === 1 ? 'opção' : 'opções'} para ver a recomendação
                        </p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Stock notification */}
            <StockNotification stock={product.stock} productName={product.name} productId={product.id} />

            {/* Color selector */}
            {product.colors.length > 1 && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-bold text-plum">Cor: <span className="text-muted-foreground font-normal">{selectedColor}</span></p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      title={c}
                      className={cn(
                        'h-10 w-10 rounded-full border-2 transition-all',
                        selectedColor === c ? 'ring-2 ring-plum ring-offset-2' : 'border-border hover:scale-110'
                      )}
                      style={{ background: COLOR_MAP[c] || '#ccc' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-5">
              <p className="mb-2 text-sm font-bold text-plum">Quantidade</p>
              <div className="inline-flex items-center gap-1 rounded-xl border-2 border-border bg-white px-1">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-secondary" aria-label="Diminuir">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-bold">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-secondary" aria-label="Aumentar">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            {isOutOfStock ? (
              <div className="mt-6 rounded-xl bg-blush/10 border border-blush/30 p-5">
                {notifySuccess ? (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="text-3xl">📧</span>
                    <p className="text-sm font-bold text-plum">Pronto! Avisaremos quando <span className="text-blush">{product.name}</span> estiver disponível 📧</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <Bell className="h-5 w-5 text-blush" />
                      <p className="text-sm font-bold text-plum">Produto esgotado</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">Informe seu e-mail e avisaremos assim que o produto estiver disponível novamente.</p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (!notifyEmail.trim() || !product) return
                        try {
                          const stored = localStorage.getItem('pijulinho-notify')
                          const map: Record<string, string> = stored ? JSON.parse(stored) : {}
                          map[product.id] = notifyEmail.trim()
                          localStorage.setItem('pijulinho-notify', JSON.stringify(map))
                          setNotifySuccess(true)
                          toast.success('Notificação registrada com sucesso!')
                        } catch {
                          toast.error('Erro ao salvar notificação')
                        }
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        type="email"
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                        className="flex-1 rounded-xl border-2 border-blush/30 bg-white text-sm focus-visible:ring-blush/30"
                      />
                      <Button
                        type="submit"
                        className="shrink-0 rounded-xl bg-blush text-white font-bold text-sm hover:bg-blush/90 transition-colors"
                      >
                        <Bell className="h-4 w-4 mr-1.5" />
                        Avisar
                      </Button>
                    </form>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-6 flex items-center gap-3">
                <Button
                  onClick={handleAddCart}
                  className="flex-1 h-14 rounded-full bg-tangerine text-base font-bold text-white hover:bg-grape sticker-shadow"
                >
                  Adicionar ao carrinho
                </Button>
                <Button
                  onClick={handleQuickBuy}
                  className="h-14 rounded-full bg-grape text-base font-bold text-white hover:bg-grape/90 shrink-0 sticker-shadow"
                >
                  <Zap className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Comprar agora</span>
                </Button>
                <Button
                  onClick={handleFav}
                  variant="outline"
                  className={cn(
                    'h-14 w-14 rounded-full border-2 shrink-0',
                    fav ? 'border-blush text-blush' : 'border-border text-plum'
                  )}
                  aria-label="Favoritar"
                >
                  <Heart className={cn('h-5 w-5', fav && 'fill-current')} />
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="h-14 w-14 rounded-full border-2 border-border text-plum shrink-0"
                  aria-label="Compartilhar"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Loyalty points earned */}
            <div className="mt-4">
              <LoyaltyPointsEarned subtotal={product.price * qty} />
            </div>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: 'Frete grátis acima de R$199' },
                { icon: RefreshCcw, label: 'Troca em 30 dias' },
                { icon: ShieldCheck, label: 'Pagamento seguro' },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1 rounded-2xl bg-white border border-border p-3 text-center">
                  <b.icon className="h-5 w-5 text-tangerine" />
                  <span className="text-[11px] font-semibold text-plum">{b.label}</span>
                </div>
              ))}
            </div>

            {product.ageRange && (
              <span className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-plum">
                📏 Faixa etária: {product.ageRange}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="descricao">
            <TabsList className="w-full justify-start rounded-full bg-white border-2 border-border h-12 p-1">
              <TabsTrigger value="descricao" className="rounded-full font-bold">Descrição</TabsTrigger>
              <TabsTrigger value="avaliacoes" className="rounded-full font-bold">Avaliações ({reviews.length})</TabsTrigger>
              <TabsTrigger value="entrega" className="rounded-full font-bold">Entrega & Troca</TabsTrigger>
            </TabsList>
            <TabsContent value="descricao" className="mt-6 rounded-3xl border-2 border-border bg-white p-6">
              <p className="leading-relaxed text-plum/80">{product.description}</p>
              <div className="mt-4 flex flex-wrap gap-4">
                <span className="text-sm"><strong>Cores:</strong> {product.colors.join(', ')}</span>
                <span className="text-sm"><strong>Tamanhos:</strong> {product.sizes.join(', ')}</span>
              </div>
            </TabsContent>
            <TabsContent value="avaliacoes" className="mt-6 space-y-4">
              {/* Ratings Histogram */}
              {(() => {
                const counts = [0, 0, 0, 0, 0]
                reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++ })
                const total = counts.reduce((a, b) => a + b, 0)
                const dist = total > 0 ? counts.map(c => Math.round((c / total) * 100)) : [70, 20, 7, 2, 1]
                return (
                  <div className="rounded-2xl bg-white border-2 border-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-plum">Distribuição das avaliações</h4>
                      <span className="text-sm text-muted-foreground">{total} {total === 1 ? 'avaliação' : 'avaliações'}</span>
                    </div>
                    <div className="space-y-1.5">
                      {[5, 4, 3, 2, 1].map(star => (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-sm font-bold text-plum w-8 text-right shrink-0">{star}★</span>
                          <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-tangerine transition-all duration-500"
                              style={{ width: dist[star - 1] + '%' }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground w-9 text-right shrink-0">{dist[star - 1]}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
              {/* Review form */}
              <div className="rounded-3xl border-2 border-dashed border-tangerine/40 bg-tangerine/5 p-6">
                <h4 className="font-display text-lg font-bold text-plum">Deixe sua avaliação</h4>
                <form onSubmit={submitReview} className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5].map((i) => (
                      <button key={i} type="button" onClick={() => setReviewRating(i)} className="transition-transform hover:scale-125">
                        <Star className={cn('h-6 w-6', i <= reviewRating ? 'text-sun fill-sun' : 'text-muted-foreground')} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">{reviewRating}/5</span>
                  </div>
                  {!user && (
                    <input
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="Seu nome"
                      className="h-10 w-full rounded-xl border-2 border-border bg-white px-3 text-sm"
                    />
                  )}
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Escreva sua avaliação..."
                    rows={3}
                    className="w-full rounded-xl border-2 border-border bg-white px-3 py-2 text-sm resize-none"
                  />
                  <Button type="submit" disabled={submittingReview || !reviewComment.trim()} className="bg-tangerine rounded-full">
                    {submittingReview ? 'Enviando...' : 'Enviar avaliação'}
                  </Button>
                </form>
              </div>
              {/* Reviews list */}
              {reviews.length === 0 ? (
                <div className="rounded-3xl bg-white border-2 border-border p-8 text-center">
                  <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 font-bold text-plum">Nenhuma avaliação ainda</p>
                  <p className="text-sm text-muted-foreground">Seja o primeiro a avaliar!</p>
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="rounded-3xl bg-white border-2 border-border p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-blush text-plum font-bold text-sm">
                          {r.authorName.charAt(0)}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-plum">{r.authorName}</p>
                          <StarRating rating={r.rating} size="sm" />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-plum/80">{r.comment}</p>
                  </div>
                ))
              )}
            </TabsContent>
            <TabsContent value="entrega" className="mt-6 rounded-3xl border-2 border-border bg-white p-6">
              <div className="space-y-4 text-sm text-plum/80">
                <div>
                  <h4 className="font-bold text-plum">🚚 Entrega</h4>
                  <p className="mt-1">Entregamos em todo o Brasil via transportadoras parceiras. Prazo de 3 a 7 dias úteis para regiões metropolitanas, e até 12 dias úteis para outras localidades.</p>
                  <p className="mt-1"><strong className="text-plum">Frete grátis</strong> para compras acima de R$ 199,00.</p>
                </div>
                <div>
                  <h4 className="font-bold text-plum">🔄 Troca e Devolução</h4>
                  <p className="mt-1">Você tem até 30 dias para solicitar troca ou devolução. O produto deve estar sem uso, com etiquetas intactas e embalagem original.</p>
                  <p className="mt-1">A troca é grátis para tamanhos diferentes. Para devolução, o frete de devolução é por nossa conta.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-6 font-display text-2xl font-bold text-plum">Você também vai amar 💛</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Frequently Bought Together */}
        <div className="mt-8">
          <FrequentlyBoughtTogether
            currentProductId={product.id}
            currentCategorySlug={product.category?.slug}
          />
        </div>

        {/* Product Bundles */}
        <div className="mt-8">
          <ProductBundles currentProductId={product.id} />
        </div>
      </div>

      {/* Sticky Add-to-Cart Bar (mobile only) */}
      {!isOutOfStock && (
        <div className="fixed bottom-16 left-0 right-0 z-30 md:hidden animate-slide-up bg-cream/95 backdrop-blur border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-lg font-extrabold text-plum truncate">{formatBRL(product.price)}</p>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <p className="text-xs text-muted-foreground line-through">{formatBRL(product.compareAtPrice)}</p>
              )}
            </div>
            <div className="flex items-center gap-1 rounded-xl border-2 border-border bg-white px-1">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary" aria-label="Diminuir">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-bold">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary" aria-label="Aumentar">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={handleAddCart}
              className="shrink-0 rounded-full bg-tangerine px-5 py-2.5 text-sm font-bold text-white hover:bg-grape transition-colors sticker-shadow"
            >
              Adicionar ao carrinho
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square rounded-3xl skeleton-shimmer" />
          <div className="space-y-4">
            <div className="h-4 w-24 skeleton-shimmer rounded-lg" />
            <div className="h-8 w-3/4 skeleton-shimmer rounded-lg" />
            <div className="h-4 w-32 skeleton-shimmer rounded-lg" />
            <div className="h-10 w-48 skeleton-shimmer rounded-lg" />
            <div className="h-20 w-full skeleton-shimmer rounded-lg" />
            <div className="h-12 w-full skeleton-shimmer rounded-full" />
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 skeleton-shimmer rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
