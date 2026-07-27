'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { ProductCard, type ProductCardData } from '../product-card'
import { cn } from '@/lib/utils'

type Cat = { id: string; name: string; slug: string; color: string }

export function FeaturedProducts({
  products,
  categories,
}: {
  products: ProductCardData[]
  categories: Cat[]
}) {
  const [active, setActive] = useState<string>('todos')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tabs = useMemo(() => {
    return [
      { slug: 'todos', name: 'Todos', color: '#FF7A45' },
      ...categories.map((c) => ({ slug: c.slug, name: c.name, color: c.color })),
    ]
  }, [categories])

  const filtered = useMemo(() => {
    if (active === 'todos') return products
    return products.filter((p) => p.category?.slug === active)
  }, [products, active])

  // Auto-scroll on mobile
  useEffect(() => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current)
    autoScrollRef.current = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        const maxScroll = scrollWidth - clientWidth
        if (scrollLeft >= maxScroll - 5) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          scrollRef.current.scrollBy({ left: clientWidth * 0.8, behavior: 'smooth' })
        }
      }
    }, 4000)
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current)
    }
  }, [filtered.length])

  function checkScroll() {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      checkScroll()
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [filtered.length])

  function scrollBy(direction: 'left' | 'right') {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -280 : 280, behavior: 'smooth' })
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 lg:py-20">
      <div className="flex flex-col items-center text-center">
        <span className="animate-bounce-in inline-flex items-center gap-2 rounded-full border-2 border-tangerine/30 bg-white px-4 py-1.5 text-xs font-bold text-tangerine">
          <Sparkles className="h-3.5 w-3.5" /> Nossa lojinha
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold text-plum sm:text-4xl lg:text-5xl">
          Produtos que as crianças <span className="hl-yellow">amam</span>
        </h2>
        <p className="mt-3 max-w-xl text-plum/70">
          Selecionamos as peças mais queridas para o guarda-roupa colorido dos pequenos.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {filtered.length} produto{filtered.length !== 1 ? 's' : ''} · Deslize para ver mais ➡️
        </p>
      </div>

      {/* category tabs */}
      <div className="scroll-pretty mt-8 flex justify-start gap-2 overflow-x-auto pb-2 sm:justify-center">
        {tabs.map((t) => (
          <button
            key={t.slug}
            onClick={() => setActive(t.slug)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all duration-200',
              active === t.slug
                ? 'text-white sticker-shadow scale-105'
                : 'bg-white text-plum hover:bg-secondary hover:scale-105'
            )}
            style={active === t.slug ? { backgroundColor: t.color } : undefined}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Product carousel (mobile) + Grid (desktop) */}
      <div className="relative mt-8">
        {/* Mobile carousel */}
        <div
          ref={scrollRef}
          className="scroll-pretty flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory lg:hidden lg:overflow-x-visible"
        >
          {filtered.map((p) => (
            <div key={p.id} className="min-w-[55%] max-w-[200px] shrink-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        {/* Desktop grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* Scroll arrows (mobile) */}
        {canScrollLeft && (
          <button
            onClick={() => scrollBy('left')}
            className="absolute left-1 top-1/2 z-10 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-border/50 text-plum lg:hidden"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scrollBy('right')}
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-border/50 text-plum lg:hidden"
            aria-label="Próximo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/produtos"
          className="group btn-gradient-hover inline-flex h-12 items-center gap-2 rounded-full border-2 border-plum px-7 text-sm font-bold text-plum transition-all hover:bg-plum hover:text-cream hover:shadow-lg"
        >
          Ver todos os produtos
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  )
}
