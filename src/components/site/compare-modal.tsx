'use client'

import { X, GitCompareArrows, Star, Truck, ShieldCheck, Sparkles } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCompare } from '@/lib/compare-store'
import { formatBRL } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'

export function CompareModal() {
  const { items, removeItem, clearAll, isOpen, setOpen } = useCompare()

  if (items.length === 0) return null

  return (
    <>
      {/* Floating compare bar */}
      <div className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 md:bottom-6 animate-slide-up">
        <div className="flex items-center gap-3 rounded-2xl border-2 border-tangerine/30 bg-white px-4 py-3 shadow-xl backdrop-blur">
          <GitCompareArrows className="h-5 w-5 text-tangerine" />
          <span className="hidden sm:inline text-sm font-bold text-plum">
            Comparando {items.length} {items.length === 1 ? 'produto' : 'produtos'}
          </span>
          <span className="sm:hidden text-sm font-bold text-plum">{items.length}</span>

          {/* Thumbnails */}
          <div className="flex items-center gap-1.5">
            {items.map((item) => (
              <div key={item.id} className="group relative">
                <div className="relative h-9 w-9 overflow-hidden rounded-lg border-2 border-tangerine/40 bg-secondary">
                  <Image src={item.image} alt={item.name} fill sizes="36px" className="object-cover" />
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-tangerine text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={() => setOpen(true)}
            size="sm"
            className="rounded-full bg-tangerine text-white hover:bg-grape"
          >
            Comparar
          </Button>
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-tangerine transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Compare dialog */}
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto p-0 rounded-3xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-border bg-white px-6 py-4 rounded-t-3xl">
            <div className="flex items-center gap-2">
              <GitCompareArrows className="h-5 w-5 text-tangerine" />
              <h2 className="font-display text-xl font-bold text-plum">Comparar Produtos</h2>
              <Badge variant="secondary" className="bg-tangerine/10 text-tangerine">{items.length}</Badge>
            </div>
            <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-tangerine">
              Limpar tudo
            </button>
          </div>

          <div className="p-6">
            {/* Product headers */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: '160px repeat(' + items.length + ', 1fr)' }}>
              <div />
              {items.map((item) => (
                <div key={item.id} className="flex flex-col items-center gap-3">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-secondary">
                    <Image src={item.image} alt={item.name} fill sizes="200px" className="object-cover" />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-plum hover:bg-tangerine hover:text-white transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Link
                    href={`/produto/${item.slug}`}
                    className="text-center font-display text-sm font-bold text-plum hover:text-tangerine transition-colors line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <div className="text-center">
                    <span className="text-lg font-extrabold text-tangerine">{formatBRL(item.price)}</span>
                    {item.compareAtPrice && item.compareAtPrice > item.price && (
                      <span className="block text-xs text-muted-foreground line-through">{formatBRL(item.compareAtPrice)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison rows */}
            <div className="space-y-1 rounded-2xl border-2 border-border overflow-hidden">
              {[
                { label: 'Categoria', key: 'category', icon: Sparkles },
                { label: 'Faixa etária', key: 'ageRange', icon: Truck },
                { label: 'Tamanhos', key: 'sizes', icon: ShieldCheck },
                { label: 'Cores', key: 'colors', icon: Sparkles },
                { label: 'Avaliação', key: 'rating', icon: Star },
              ].map((row, i) => (
                <div
                  key={row.key}
                  className="grid gap-4 border-b border-border last:border-b-0"
                  style={{ gridTemplateColumns: '160px repeat(' + items.length + ', 1fr)' }}
                >
                  <div className={`flex items-center gap-2 px-4 py-3 font-bold text-sm ${i % 2 === 0 ? 'bg-cream' : 'bg-white'}`}>
                    <row.icon className="h-4 w-4 text-tangerine" />
                    {row.label}
                  </div>
                  {items.map((item) => (
                    <div key={item.id} className={`px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-cream' : 'bg-white'}`}>
                      {row.key === 'rating' ? (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="font-bold">{item.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({item.reviewCount})</span>
                        </div>
                      ) : row.key === 'sizes' || row.key === 'colors' ? (
                        <div className="flex flex-wrap gap-1">
                          {(item as any)[row.key]?.slice(0, 4).map((v: string) => (
                            <Badge key={v} variant="secondary" className="text-[10px]">{v}</Badge>
                          ))}
                          {(item as any)[row.key]?.length > 4 && (
                            <span className="text-xs text-muted-foreground">+{(item as any)[row.key].length - 4}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">{(item as any)[row.key] || '—'}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Add to cart buttons */}
            <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: '160px repeat(' + items.length + ', 1fr)' }}>
              <div />
              {items.map((item) => (
                <Link key={item.id} href={`/produto/${item.slug}`}>
                  <Button className="w-full rounded-full bg-tangerine hover:bg-grape text-white">
                    Ver produto
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
