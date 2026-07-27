'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, Tag, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatBRL } from '@/lib/types'

type Suggestion = {
  type: 'product' | 'category'
  slug: string
  name: string
  price?: number
  image?: string
  category?: string
  categoryColor?: string
  color?: string
}

export function SearchAutocomplete({
  value,
  onChange,
  onSearch,
  className,
  placeholder = 'O que você procura?',
}: {
  value: string
  onChange: (v: string) => void
  onSearch: (q: string) => void
  className?: string
  placeholder?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSuggestions(data.suggestions || [])
      setOpen(data.suggestions?.length > 0)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fetchSuggestions(value), 250)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, fetchSuggestions])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(s: Suggestion) {
    setOpen(false)
    onChange('')
    if (s.type === 'product') {
      router.push(`/produto/${s.slug}`)
    } else {
      router.push(`/produtos?categoria=${s.slug}`)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setOpen(false)
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      handleSelect(suggestions[activeIndex])
      return
    }
    onSearch(value.trim())
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    }
  }

  const categorySuggestions = suggestions.filter((s) => s.type === 'category')
  const productSuggestions = suggestions.filter((s) => s.type === 'product')

  return (
    <div ref={ref} className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              'w-full rounded-full border-2 bg-white pl-9 pr-9 py-2 text-sm transition-all',
              'focus:outline-none focus:ring-2 focus:ring-tangerine/30 focus:border-tangerine',
              open && 'rounded-b-none rounded-t-full border-b-0'
            )}
          />
          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); setSuggestions([]); setOpen(false); inputRef.current?.focus() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-plum transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {loading && (
            <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-tangerine" />
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 rounded-b-2xl border-2 border-t-0 border-border bg-white shadow-xl overflow-hidden animate-slide-up">
          {/* Category suggestions */}
          {categorySuggestions.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Categorias</p>
              {categorySuggestions.map((s) => (
                <button
                  key={`cat-${s.slug}`}
                  onClick={() => handleSelect(s)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                    'hover:bg-cream text-plum'
                  )}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white" style={{ backgroundColor: s.color || '#FF7A45' }}>
                    <Tag className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-semibold">{s.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">Ver todos →</span>
                </button>
              ))}
            </div>
          )}

          {/* Product suggestions */}
          {productSuggestions.length > 0 && (
            <div className={cn('p-2', categorySuggestions.length > 0 && 'border-t border-border')}>
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Produtos</p>
              {productSuggestions.map((s, i) => {
                const globalIndex = categorySuggestions.length + i
                return (
                  <button
                    key={`prod-${s.slug}`}
                    onClick={() => handleSelect(s)}
                    onMouseEnter={() => setActiveIndex(globalIndex)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                      activeIndex === globalIndex ? 'bg-tangerine/10' : 'hover:bg-cream text-plum'
                    )}
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {s.image ? (
                        <Image src={s.image} alt={s.name} fill sizes="40px" className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg" style={{ background: `${s.categoryColor}18` }}>
                          👕
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="truncate font-semibold text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.category}</p>
                    </div>
                    <span className="shrink-0 font-extrabold text-sm text-tangerine">{formatBRL(s.price || 0)}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-border bg-cream/50 px-3 py-2">
            <button
              onClick={() => { setOpen(false); onSearch(value.trim()) }}
              className="flex w-full items-center justify-center gap-1.5 text-xs font-bold text-tangerine hover:text-grape transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              Ver todos os resultados para &ldquo;{value}&rdquo;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
