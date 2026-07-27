'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SlidersHorizontal, X, Search, ChevronRight, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ProductCard, type ProductCardData } from '@/components/site/product-card'
import { Cloud, Sparkle } from '@/components/site/doodles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Cat = { id: string; name: string; slug: string; color: string }

const SORTS = [
  { value: 'relevancia', label: 'Relevância' },
  { value: 'popular', label: 'Mais vendidos' },
  { value: 'recent', label: 'Lançamentos' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'rating', label: 'Melhor avaliados' },
]

const AGE_RANGES = [
  { value: '0-1', label: 'Bebê (0-1 ano)', emoji: '👶' },
  { value: '1-3', label: '1-3 anos', emoji: '🧒' },
  { value: '4-6', label: '4-6 anos', emoji: '👦' },
  { value: '7-10', label: '7-10 anos', emoji: '👧' },
  { value: '11-14', label: '11-14 anos', emoji: '🧑' },
]

const GENDERS = [
  { value: 'menina', label: 'Menina', emoji: '🎀' },
  { value: 'menino', label: 'Menino', emoji: '🚀' },
  { value: 'unissex', label: 'Unissex', emoji: '🌈' },
]

const PRICE_RANGES = [
  { value: '0-50', label: 'Até R$50', emoji: '💰' },
  { value: '50-100', label: 'R$50 - R$100', emoji: '💎' },
  { value: '100-150', label: 'R$100 - R$150', emoji: '✨' },
  { value: '150-9999', label: 'Acima de R$150', emoji: '👑' },
]

const PRODUCTS_PER_PAGE = 6

function ProductsContent() {
  const sp = useSearchParams()
  const router = useRouter()
  const initCat = sp.get('categoria') || ''
  const initSearch = sp.get('busca') || ''
  const initSort = sp.get('sort') || 'relevancia'
  const isFeatured = sp.get('destaque') === 'true'
  const favoritosParam = sp.get('favoritos') || ''
  const sharedFavoriteIds = favoritosParam ? favoritosParam.split(',').filter(Boolean) : []

  const [products, setProducts] = useState<ProductCardData[]>([])
  const [categories, setCategories] = useState<Cat[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCat, setActiveCat] = useState(initCat)
  const [search, setSearch] = useState(initSearch)
  const [searchInput, setSearchInput] = useState(initSearch)
  const [sort, setSort] = useState(initSort)
  const [filterOpen, setFilterOpen] = useState(false)
  const [ageRange, setAgeRange] = useState('')
  const [gender, setGender] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState('')
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    const p = new URLSearchParams()
    if (activeCat) p.set('categoria', activeCat)
    if (search) p.set('busca', search)
    if (sort && sort !== 'relevancia') p.set('sort', sort)
    if (isFeatured) p.set('destaque', 'true')
    const qs = p.toString()
    router.replace(`/produtos${qs ? '?' + qs : ''}`, { scroll: false })
  }, [activeCat, search, sort, isFeatured, router])

  useEffect(() => {
    queueMicrotask(() => setLoading(true))
    requestAnimationFrame(() => setVisibleCount(PRODUCTS_PER_PAGE))
    const params = new URLSearchParams()
    if (activeCat) params.set('category', activeCat)
    if (search) params.set('search', search)
    if (sort && sort !== 'relevancia') params.set('sort', sort)
    if (isFeatured) params.set('featured', 'true')
    if (ageRange) params.set('ageRange', ageRange)
    if (gender) params.set('gender', gender)
    if (priceRange) params.set('priceRange', priceRange)
    if (sharedFavoriteIds.length > 0) params.set('ids', sharedFavoriteIds.join(','))

    Promise.all([
      fetch(`/api/products?${params}`).then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.products || [])
        setCategories(catRes.categories || [])
      })
      .finally(() => setLoading(false))
  }, [activeCat, search, sort, isFeatured, ageRange, gender, priceRange, sharedFavoriteIds])

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  function clearFilters() {
    setActiveCat('')
    setSearch('')
    setSearchInput('')
    setSort('relevancia')
    setAgeRange('')
    setGender('')
    setPriceRange('')
  }

  function clearFilter(filter: string) {
    switch (filter) {
      case 'cat': setActiveCat(''); break
      case 'search': setSearch(''); setSearchInput(''); break
      case 'sort': setSort('relevancia'); break
      case 'age': setAgeRange(''); break
      case 'gender': setGender(''); break
      case 'price': setPriceRange(''); break
    }
  }

  function loadMore() {
    setLoadingMore(true)
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PRODUCTS_PER_PAGE, products.length))
      setLoadingMore(false)
    }, 400)
  }

  const hasFilters = activeCat || search || (sort && sort !== 'relevancia') || ageRange || gender || priceRange
  const visibleProducts = products.slice(0, visibleCount)
  const hasMore = visibleCount < products.length

  const activeFilterChips = [
    ...(activeCat ? [{ key: 'cat', label: categories.find((c) => c.slug === activeCat)?.name || activeCat }] : []),
    ...(search ? [{ key: 'search', label: `Busca: "${search}"` }] : []),
    ...(sort && sort !== 'relevancia' ? [{ key: 'sort', label: SORTS.find((s) => s.value === sort)?.label || sort }] : []),
    ...(ageRange ? [{ key: 'age', label: AGE_RANGES.find((a) => a.value === ageRange)?.label || ageRange }] : []),
    ...(gender ? [{ key: 'gender', label: GENDERS.find((g) => g.value === gender)?.label || gender }] : []),
    ...(priceRange ? [{ key: 'price', label: PRICE_RANGES.find((p) => p.value === priceRange)?.label || priceRange }] : []),
  ]

  return (
    <div className="bg-cream min-h-screen">
      {/* Hero banner */}
      <div className="relative overflow-hidden animate-hero-gradient py-10">
        <Cloud className="pointer-events-none absolute -left-4 -top-4 h-24 w-36 text-white/20" />
        <Cloud className="pointer-events-none absolute right-4 -bottom-6 h-16 w-24 text-white/10 animate-float-slow" />
        <Sparkle className="pointer-events-none absolute right-8 top-4 h-8 w-8 text-white/40 animate-float" />
        <Sparkle className="pointer-events-none absolute left-1/3 top-2 h-5 w-5 text-white/25 animate-float-slow" style={{ '--rot': '15deg' } as React.CSSProperties} />
        <Sparkle className="pointer-events-none absolute right-1/4 bottom-3 h-6 w-6 text-white/20 animate-float" style={{ '--rot': '-10deg', animationDelay: '2s' } as React.CSSProperties} />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Link href="/" className="hover:text-white">Início</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-bold text-white">Produtos</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            {isFeatured ? 'Destaques' : search ? `Busca: "${search}"` : 'Nossa Lojinha'}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            {!loading && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-bold text-white">
                <Sparkles className="h-3 w-3" />
                {products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
              </span>
            )}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs text-white font-bold">
                🆕 Novidades toda semana
              </span>
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs text-white font-bold">
                🎁 Primeira compra com desconto
              </span>
            </div>
          </div>
        </div>
      </div>

      {sharedFavoriteIds.length > 0 && (
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-3 rounded-2xl bg-tangerine/10 border-2 border-tangerine/20 p-4">
            <span className="text-2xl">💕</span>
            <div>
              <p className="text-sm font-bold text-plum">Favoritos compartilhados com você!</p>
              <p className="text-xs text-muted-foreground">Estes são os produtos favoritos de alguém especial na Pijulinho</p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* toolbar */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={submitSearch} className="flex flex-1 gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="O que você procura?"
                className="rounded-full border-2 bg-white pl-9"
              />
            </div>
            <Button type="submit" size="sm" className="bg-tangerine rounded-full hover:bg-tangerine/90">Buscar</Button>
          </form>
          <div className="flex items-center gap-2">
            {/* Mobile filter toggle */}
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full border-2 lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-1" /> Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-cream p-0">
                <SheetHeader className="border-b border-border p-5">
                  <SheetTitle className="font-display text-xl text-tangerine">Filtros</SheetTitle>
                </SheetHeader>
                <div className="p-5 space-y-6">
                  <FilterCategories categories={categories} active={activeCat} onSelect={(s) => { setActiveCat(s); setFilterOpen(false) }} />
                  <FilterSort sort={sort} onSort={setSort} />
                </div>
              </SheetContent>
            </Sheet>

            <FilterSort sort={sort} onSort={setSort} />

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-tangerine hover:bg-tangerine/10">
                <X className="h-4 w-4 mr-1" /> Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterChips.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 animate-slide-up">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => clearFilter(chip.key)}
                className="inline-flex items-center gap-1 rounded-full bg-white border border-tangerine/30 px-3 py-1 text-xs font-semibold text-plum hover:bg-tangerine/10 hover:border-tangerine/50 transition-all"
              >
                {chip.label}
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        {/* Desktop sidebar + grid */}
        <div className="flex gap-6">
          {/* sidebar desktop */}
          <aside className="hidden w-52 shrink-0 lg:block">
            <div className="sticky top-36 space-y-4">
              <h3 className="font-display text-base font-bold text-plum">Categorias</h3>
              <FilterCategories categories={categories} active={activeCat} onSelect={setActiveCat} />
            </div>
          </aside>

          {/* products grid */}
          <div className="flex-1">
            {/* Age, Gender & Price filter chips */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1.5 text-sm font-bold text-plum hover:text-tangerine transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {showFilters ? 'Menos filtros' : 'Mais filtros'}
                  <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', showFilters && 'rotate-90')} />
                </button>
              </div>
              {showFilters && (
                <div className="space-y-3 animate-slide-up">
                  {/* Age range chips */}
                  <div>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Faixa etária</p>
                    <div className="flex flex-wrap gap-2">
                      {AGE_RANGES.map((a) => (
                        <button
                          key={a.value}
                          onClick={() => setAgeRange(ageRange === a.value ? '' : a.value)}
                          className={cn(
                            'flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all',
                            ageRange === a.value
                              ? 'bg-tangerine text-white sticker-shadow'
                              : 'bg-white text-plum border border-border hover:border-tangerine/40'
                          )}
                        >
                          <span>{a.emoji}</span> {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Gender chips */}
                  <div>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Gênero</p>
                    <div className="flex flex-wrap gap-2">
                      {GENDERS.map((g) => (
                        <button
                          key={g.value}
                          onClick={() => setGender(gender === g.value ? '' : g.value)}
                          className={cn(
                            'flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all',
                            gender === g.value
                              ? 'bg-grape text-white sticker-shadow'
                              : 'bg-white text-plum border border-border hover:border-grape/40'
                          )}
                        >
                          <span>{g.emoji}</span> {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Price range chips */}
                  <div>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Faixa de preço</p>
                    <div className="flex flex-wrap gap-2">
                      {PRICE_RANGES.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setPriceRange(priceRange === p.value ? '' : p.value)}
                          className={cn(
                            'flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all',
                            priceRange === p.value
                              ? 'bg-mint text-white sticker-shadow'
                              : 'bg-white text-plum border border-border hover:border-mint/40'
                          )}
                        >
                          <span>{p.emoji}</span> {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="scroll-pretty mb-6 flex gap-2 overflow-x-auto pb-2">
              {[
                { slug: '', name: 'Todos', color: '#FF7A45' },
                ...categories,
              ].map((c) => (
                <button
                  key={c.slug || 'todos'}
                  onClick={() => setActiveCat(c.slug)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition-all ${
                    activeCat === c.slug
                      ? 'text-white sticker-shadow'
                      : 'bg-white text-plum hover:bg-secondary border border-border'
                  }`}
                  style={activeCat === c.slug ? { backgroundColor: c.color || '#FF7A45' } : undefined}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-3xl bg-white border-2 border-border p-3">
                    <Skeleton className="aspect-square rounded-2xl w-full" />
                    <Skeleton className="h-4 w-3/4 mt-3" />
                    <Skeleton className="h-3 w-1/2 mt-2" />
                    <Skeleton className="h-5 w-1/3 mt-3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="animate-bounce-in text-7xl">🧸</span>
                <h3 className="mt-4 font-display text-xl font-bold text-plum">Nenhum produto encontrado</h3>
                <p className="mt-2 text-muted-foreground max-w-sm">Tente outros filtros ou busque por outro termo. Estamos sempre adicionando novos produtos!</p>
                <div className="mt-4 flex gap-3">
                  <Button onClick={clearFilters} className="bg-tangerine rounded-full hover:bg-tangerine/90">Limpar filtros</Button>
                  <Link href="/produtos">
                    <Button variant="outline" className="rounded-full border-2 hover:bg-secondary">Ver novidades ✨</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
                  {visibleProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                {/* Load More Button */}
                {hasMore && (
                  <div className="mt-8 flex flex-col items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {visibleCount} de {products.length} produtos
                    </p>
                    <Button
                      onClick={loadMore}
                      disabled={loadingMore}
                      variant="outline"
                      size="lg"
                      className="rounded-full border-2 border-tangerine text-tangerine hover:bg-tangerine hover:text-white px-8 transition-all duration-300 hover:shadow-lg hover:shadow-tangerine/20"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Carregar mais ({products.length - visibleCount} restantes)
                        </>
                      )}
                    </Button>
                  </div>
                )}
                {!hasMore && products.length > PRODUCTS_PER_PAGE && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      ✅ Todos os {products.length} produtos carregados
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterCategories({ categories, active, onSelect }: { categories: Cat[]; active: string; onSelect: (s: string) => void }) {
  return (
    <div className="space-y-1.5">
      <button
        onClick={() => onSelect('')}
        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
          !active ? 'bg-plum text-cream' : 'text-plum hover:bg-white'
        }`}
      >
        <span className="h-3 w-3 rounded-full bg-tangerine" /> Todos
      </button>
      {categories.map((c) => (
        <button
          key={c.slug}
          onClick={() => onSelect(c.slug)}
          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
            active === c.slug ? 'bg-plum text-cream' : 'text-plum hover:bg-white'
          }`}
        >
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
          {c.name}
          <Badge variant="secondary" className="ml-auto text-[10px]">{c._count?.products || 0}</Badge>
        </button>
      ))}
    </div>
  )
}

function FilterSort({ sort, onSort }: { sort: string; onSort: (s: string) => void }) {
  return (
    <Select value={sort} onValueChange={onSort}>
      <SelectTrigger className="w-[180px] rounded-full border-2 bg-white">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        {SORTS.map((s) => (
          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default function ProdutosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <ProductsContent />
    </Suspense>
  )
}
