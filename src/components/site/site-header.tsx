'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, Search, ShoppingBag, Heart, User, X, LogOut, Package, MapPin, Sparkles, Sun, Moon } from 'lucide-react'
import { SearchAutocomplete } from './search-autocomplete'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { useCart } from '@/lib/cart-store'
import { useUI } from '@/lib/ui-store'
import { useAuth } from './favorites-provider'
import { useTheme } from './theme-provider'
import { WishlistDrawer } from './wishlist-drawer'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const NAV = [
  { href: '/', label: 'Início' },
  { href: '/produtos', label: 'Produtos' },
  { href: '/produtos?categoria=vestidos', label: 'Vestidos' },
  { href: '/produtos?categoria=conjuntos', label: 'Conjuntos' },
  { href: '/produtos?destaque=true', label: 'Destaques' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const cartCount = useCart((s) => s.count())
  const setOpen = useCart((s) => s.setOpen)
  const { user, favorites, refresh } = useAuth()
  const setWishlistOpen = useUI((s) => s.setWishlistOpen)
  const { theme, toggleTheme, mounted } = useTheme()
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Sync with the global UI store so the mobile bottom nav can open this sheet.
  const searchOpen = useUI((s) => s.searchOpen)
  const setSearchOpen = useUI((s) => s.setSearchOpen)

  useEffect(() => {
    if (searchOpen && !mobileOpen) {
      const id = requestAnimationFrame(() => {
        setMobileOpen(true)
        setSearchOpen(false)
      })
      return () => cancelAnimationFrame(id)
    }
  }, [searchOpen, mobileOpen, setSearchOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = search.trim()
    if (!q) return
    router.push(`/produtos?busca=${encodeURIComponent(q)}`)
    setMobileOpen(false)
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    await refresh()
    toast.success('Você saiu da sua conta.')
    router.push('/')
  }

  return (
    <>
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b transition-all',
        scrolled
          ? 'border-border/80 bg-cream/90 backdrop-blur-md shadow-sm'
          : 'border-transparent bg-cream/70 backdrop-blur'
      )}
    >
      {/* announcement bar */}
      <div className="bg-grape text-white text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-sun" />
          <span>Frete grátis acima de R$ 199 + cupom <strong className="text-sun">BEMVINDO20</strong> = 20% OFF na 1ª compra</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:gap-6">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
              <Menu className="h-6 w-6 text-plum" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] bg-cream p-0">
            <SheetHeader className="border-b border-border p-5">
              <SheetTitle className="font-display text-2xl text-tangerine">Pijulinho</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-4">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl px-4 py-3 text-base font-bold text-plum hover:bg-white"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="mt-2 px-4">
              <form onSubmit={submitSearch} className="flex gap-2">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="border-2 bg-white"
                />
                <Button type="submit" size="icon" className="bg-tangerine">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-tangerine text-white text-2xl shadow-md rotate-3">
            🦊
          </span>
          <span className="font-display text-2xl font-bold text-plum">
            Piju<span className="text-tangerine">linho</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => {
            const active = pathname === n.href
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-bold transition-colors',
                  active ? 'bg-plum text-cream' : 'text-plum hover:bg-white'
                )}
              >
                {n.label}
              </Link>
            )
          })}
        </nav>

        {/* Search (desktop) */}
        <div className="ml-auto hidden md:block w-64 lg:w-72">
          <SearchAutocomplete
            value={search}
            onChange={setSearch}
            onSearch={(q) => {
              if (q) router.push(`/produtos?busca=${encodeURIComponent(q)}`)
            }}
            placeholder="O que você procura?"
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="hidden md:inline-flex relative h-10 w-10 place-items-center rounded-full hover:bg-white dark:hover:bg-secondary transition-colors"
          aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
          <Sun
            className={cn(
              'absolute h-5 w-5 text-plum transition-all duration-500',
              mounted && theme === 'dark'
                ? 'rotate-0 scale-100 opacity-100'
                : '-rotate-90 scale-0 opacity-0'
            )}
          />
          <Moon
            className={cn(
              'absolute h-5 w-5 text-plum transition-all duration-500',
              mounted && theme === 'light'
                ? 'rotate-0 scale-100 opacity-100'
                : 'rotate-90 scale-0 opacity-0'
            )}
          />
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto md:ml-2">
          <button
            onClick={() => setWishlistOpen(true)}
            className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-white transition-colors"
            aria-label="Favoritos"
          >
            <Heart className="h-5 w-5 text-plum" />
            {favorites.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-blush px-1 text-[11px] font-extrabold text-white">
                {favorites.length > 99 ? '99+' : favorites.length}
              </span>
            )}
          </button>

          {user ? (
            <UserMenu user={user} onLogout={logout} />
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex h-10 items-center gap-1.5 rounded-full bg-plum px-4 text-sm font-bold text-cream hover:bg-grape transition-colors"
            >
              <User className="h-4 w-4" />
              Entrar
            </Link>
          )}

          <button
            onClick={() => setOpen(true)}
            className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-white transition-colors"
            aria-label="Carrinho"
          >
            <ShoppingBag className="h-5 w-5 text-plum" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-tangerine px-1 text-[11px] font-extrabold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
      </header>

      {/* Wishlist Drawer */}
      <WishlistDrawer />
    </>
  )
}

function UserMenu({ user, onLogout }: { user: { name: string }; onLogout: () => void }) {
  const first = user.name.charAt(0).toUpperCase()
  return (
    <div className="group relative">
      <button className="grid h-10 w-10 place-items-center rounded-full bg-grape text-white font-bold hover:bg-plum transition-colors">
        {first}
      </button>
      <div className="invisible absolute right-0 top-11 z-50 w-56 translate-y-1 rounded-2xl border-2 border-border bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="border-b border-border px-3 py-2">
          <p className="text-xs text-muted-foreground">Olá,</p>
          <p className="truncate text-sm font-bold text-plum">{user.name}</p>
        </div>
        <Link href="/minha-conta" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-plum hover:bg-secondary">
          <Package className="h-4 w-4" /> Meus pedidos
        </Link>
        <Link href="/minha-conta?tab=enderecos" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-plum hover:bg-secondary">
          <MapPin className="h-4 w-4" /> Endereços
        </Link>
        <Link href="/minha-conta?tab=favoritos" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-plum hover:bg-secondary">
          <Heart className="h-4 w-4" /> Favoritos
        </Link>
        <button onClick={onLogout} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-tangerine hover:bg-secondary">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>
    </div>
  )
}
