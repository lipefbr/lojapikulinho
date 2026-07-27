'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Home, LayoutGrid, Search, Heart, ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-store'
import { useUI } from '@/lib/ui-store'
import { useAuth } from './favorites-provider'
import { cn } from '@/lib/utils'

type NavItem = {
  key: string
  label: string
  icon: typeof Home
  href?: string
  onClick?: () => void
  isActive?: (pathname: string) => boolean
  badge?: number
  badgeColor?: string
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const cartCount = useCart((s) => s.count())
  const setCartOpen = useCart((s) => s.setOpen)
  const setSearchOpen = useUI((s) => s.setSearchOpen)
  const { user, favorites } = useAuth()

  const [favCount, setFavCount] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setFavCount(favorites?.length || 0))
    return () => cancelAnimationFrame(id)
  }, [favorites])

  // Badge bounce animation when cart count changes
  const [badgeBounce, setBadgeBounce] = useState(false)
  const prevCountRef = useRef(cartCount)

  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      const id = requestAnimationFrame(() => setBadgeBounce(true))
      const timer = setTimeout(() => setBadgeBounce(false), 300)
      return () => { cancelAnimationFrame(id); clearTimeout(timer) }
    }
    prevCountRef.current = cartCount
  }, [cartCount])

  const items: NavItem[] = [
    {
      key: 'home',
      label: 'Início',
      icon: Home,
      href: '/',
      isActive: (p) => p === '/',
    },
    {
      key: 'produtos',
      label: 'Produtos',
      icon: LayoutGrid,
      href: '/produtos',
      isActive: (p) => p.startsWith('/produtos') || p.startsWith('/produto/'),
    },
    {
      key: 'busca',
      label: 'Buscar',
      icon: Search,
      onClick: () => setSearchOpen(true),
      isActive: () => false,
    },
    {
      key: 'favoritos',
      label: 'Favoritos',
      icon: Heart,
      href: user ? '/minha-conta?tab=favoritos' : '/login',
      isActive: (p) => p.startsWith('/minha-conta'),
      badge: favCount || undefined,
      badgeColor: 'bg-blush',
    },
    {
      key: 'sacola',
      label: 'Sacola',
      icon: ShoppingBag,
      onClick: () => setCartOpen(true),
      isActive: () => false,
      badge: cartCount,
    },
  ]

  return (
    <>
      {/* Spacer so content doesn't hide behind the fixed nav on mobile */}
      <div aria-hidden className="h-16 lg:hidden" />

      <nav
        aria-label="Navegação rápida"
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 lg:hidden',
          'bg-cream/95 backdrop-blur-md',
          'shadow-[0_-4px_20px_-8px_rgba(59,42,74,0.18)]',
          'pb-[env(safe-area-inset-bottom)]'
        )}
      >
        {/* Top gradient highlight line: tangerine to grape */}
        <div
          className="h-[1px] w-full"
          style={{
            background: 'linear-gradient(to right, #FF7A45, #3B2A4A)',
          }}
        />

        <ul className="mx-auto flex max-w-md items-stretch justify-around px-2">
          {items.map((item) => {
            const Icon = item.icon
            const active = item.isActive?.(pathname) ?? false

            const inner = (
              <span className="relative flex flex-col items-center justify-center gap-0.5 py-2">
                {/* Gradient glow behind active item */}
                {active && (
                  <span className="pointer-events-none absolute -inset-x-4 -top-1 -bottom-1 rounded-full bg-gradient-to-b from-tangerine/15 to-transparent" />
                )}
                <span
                  className={cn(
                    'relative grid h-9 w-9 place-items-center rounded-2xl',
                    'transition-all duration-300 ease-out',
                    'group-active:scale-[0.92] group-active:transition-transform group-active:duration-100',
                    active
                      ? 'bg-tangerine text-white scale-105 shadow-md shadow-tangerine/30'
                      : 'text-plum/70 group-active:bg-tangerine/10'
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.6 : 2.2} />
                  {item.badge ? (
                    <span
                      className={cn(
                        'absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-extrabold text-white ring-2 ring-cream',
                        item.badgeColor || 'bg-tangerine',
                        badgeBounce && 'animate-[badge-bounce_300ms_ease-in-out]'
                      )}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-bold leading-none transition-colors duration-300',
                    active ? 'text-tangerine' : 'text-plum/70 group-active:text-tangerine'
                  )}
                >
                  {item.label}
                </span>
                {/* Active dot indicator (iOS-style) */}
                {active && (
                  <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-tangerine" />
                )}
              </span>
            )

            const baseClass = cn(
              'group relative flex flex-1 flex-col items-center justify-center rounded-2xl transition-colors'
            )

            if (item.onClick) {
              return (
                <li key={item.key} className="flex-1">
                  <button
                    type="button"
                    onClick={item.onClick}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={baseClass}
                  >
                    {inner}
                  </button>
                </li>
              )
            }

            return (
              <li key={item.key} className="flex-1">
                <Link
                  href={item.href ?? '/'}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={baseClass}
                >
                  {inner}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
