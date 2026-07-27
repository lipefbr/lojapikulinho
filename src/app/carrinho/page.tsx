'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck, ShieldCheck, RefreshCcw, Sparkles, Shield, Package } from 'lucide-react'
import { useCart } from '@/lib/cart-store'
import { formatBRL } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Sparkle } from '@/components/site/doodles'
import { ProductCard, type ProductCardData } from '@/components/site/product-card'
import { LoyaltyPointsEarned } from '@/components/site/loyalty-badge'
import { toast } from 'sonner'

export default function CarrinhoPage() {
  const {
    items, coupon, removeItem, updateQuantity, restoreItem, clearLastRemoved,
    subtotal, discount, setCoupon, setOpen
  } = useCart()
  const [mounted, setMounted] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [crossSell, setCrossSell] = useState<ProductCardData[]>([])
  const router = useRouter()
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchCrossSell = useCallback(async () => {
    if (items.length === 0) return
    const excludeIds = items.map((i) => i.productId).join(',')
    try {
      const res = await fetch(`/api/products?featured=true&limit=4&exclude=${encodeURIComponent(excludeIds)}`)
      if (res.ok) {
        const data = await res.json()
        setCrossSell((data.products || []).slice(0, 4))
      }
    } catch {
      // silently ignore
    }
  }, [items])

  useEffect(() => { queueMicrotask(() => setMounted(true)) }, [])
  useEffect(() => { fetchCrossSell() }, [fetchCrossSell])


  const shipping = subtotal() >= 199 ? 0 : 19.9
  const total = subtotal() - discount() + shipping
  const freeShippingRemaining = Math.max(0, 199 - subtotal())
  const freeShippingProgress = Math.min(100, (subtotal() / 199) * 100)

  // Calculate delivery estimate (3-7 business days, skip weekends)
  function addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date)
    let added = 0
    while (added < days) {
      result.setDate(result.getDate() + 1)
      const day = result.getDay()
      if (day !== 0 && day !== 6) added++
    }
    return result
  }
  const today = new Date()
  const deliveryFrom = addBusinessDays(today, 3)
  const deliveryTo = addBusinessDays(today, 7)
  const formatDelivery = (d: Date) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  const sameMonth = deliveryFrom.getMonth() === deliveryTo.getMonth()
  const deliveryStr = sameMonth
    ? `${deliveryFrom.getDate()} a ${deliveryTo.getDate()} de ${deliveryFrom.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
    : `${deliveryFrom.getDate()} de ${deliveryFrom.toLocaleDateString('pt-BR', { month: 'long' })} a ${deliveryTo.getDate()} de ${deliveryTo.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setApplyingCoupon(true)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: subtotal() }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
        setCoupon(null)
      } else {
        setCoupon({ code: data.coupon.code, discountPercent: data.coupon.discountPercent, description: data.coupon.description })
        toast.success(`Cupom ${data.coupon.code} aplicado! ${data.coupon.discountPercent}% de desconto 🎉`)
      }
    } catch {
      toast.error('Erro ao validar cupom')
    } finally {
      setApplyingCoupon(false)
      setCouponInput('')
    }
  }

  function removeCoupon() {
    setCoupon(null)
    toast.info('Cupom removido')
  }

  function handleRemove(item: { id: string; name: string }) {
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current)
    }
    const removed = removeItem(item.id)
    if (!removed) return
    toast.success(`${removed.name} removido do carrinho`, {
      action: {
        label: 'Desfazer',
        onClick: () => {
          if (clearTimeoutRef.current) {
            clearTimeout(clearTimeoutRef.current)
          }
          restoreItem(removed)
        },
      },
      duration: 5000,
    })
    clearTimeoutRef.current = setTimeout(() => {
      clearLastRemoved()
    }, 5000)
  }

  if (!mounted) return <CartSkeleton />

  if (items.length === 0) {
    return (
      <div className="animate-page-enter flex flex-col items-center justify-center min-h-[60vh] bg-cream px-4 text-center">
        <span className="grid h-28 w-28 place-items-center rounded-full bg-secondary text-6xl animate-pulse-glow">🧺</span>
        <h1 className="mt-6 font-display text-2xl font-bold text-plum">Seu carrinho está vazio</h1>
        <p className="mt-1 text-muted-foreground">Que tal explorar nossas roupinhas coloridas?</p>
        <p className="mt-3 text-base font-bold text-tangerine">🎉 Que tal explorar nossas novidades?</p>
        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild className="bg-tangerine rounded-full h-12 px-8">
            <Link href="/produtos">Explorar produtos</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full h-12 px-8 border-2 border-tangerine/30 text-tangerine hover:bg-tangerine/5">
            <Link href="/produtos?destaque=true">Ver promoções</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="animate-page-enter mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-plum">Início</Link>
          <span>/</span>
          <span className="font-bold text-plum">Carrinho</span>
        </div>

        {/* Gradient Banner */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-tangerine via-sun to-blush p-5 sm:p-6 text-center text-white">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            🛍️ Carrinho <span className="inline-flex items-center justify-center ml-1 rounded-full bg-white/20 px-2.5 py-0.5 text-sm font-bold backdrop-blur-sm">
              {items.length} ite{items.length === 1 ? 'm' : 'ns'}
            </span>
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-3xl bg-white border-2 border-border p-4 transition-all hover:shadow-md">
                <Link
                  href={`/produto/${item.slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-secondary sm:h-32 sm:w-32"
                >
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="128px" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/produto/${item.slug}`} className="font-bold text-plum hover:text-tangerine transition-colors text-sm sm:text-base">
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[item.color, item.size !== 'Único' && `Tam ${item.size}`].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(item)}
                      className="text-muted-foreground hover:text-tangerine transition-colors p-1"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center gap-1 rounded-xl border-2 border-border bg-cream px-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white" aria-label="Diminuir">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white" aria-label="Aumentar">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-plum">{formatBRL(item.price * item.quantity)}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground">{formatBRL(item.price)} cada</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Link href="/produtos" className="inline-flex items-center gap-2 text-sm font-bold text-tangerine hover:underline mt-2">
              <ArrowRight className="h-4 w-4" /> Continuar comprando
            </Link>

            {/* Cross-sell recommendations */}
            {crossSell.length > 0 && (
              <section className="mt-10">
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles className="h-5 w-5 text-tangerine" />
                  <h2 className="font-display text-xl font-bold text-plum sm:text-2xl">Você também pode gostar</h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none lg:grid lg:grid-cols-4 lg:overflow-x-visible lg:pb-0">
                  {crossSell.map((product) => (
                    <div key={product.id} className="min-w-[220px] snap-start lg:min-w-0">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="animate-slide-up sticky top-36 rounded-3xl bg-white border-2 border-border p-6 sticker-shadow" style={{ animationDelay: '0.2s' }}>
              <h3 className="font-display text-xl font-bold text-plum">Resumo do pedido</h3>

              {/* Free shipping progress bar */}
              {freeShippingRemaining > 0 && (
                <div className="mt-4 rounded-2xl bg-cream/80 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-plum">🚚 Falta pouco para o frete grátis!</span>
                    <span className="text-xs font-bold text-tangerine">{formatBRL(freeShippingRemaining)}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-tangerine via-sun to-mint animate-progress-fill transition-all duration-500"
                      style={{ '--progress': `${freeShippingProgress}%` } as React.CSSProperties}
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] text-muted-foreground text-center">
                    Faltam <span className="font-bold text-tangerine">{formatBRL(freeShippingRemaining)}</span> para frete grátis
                  </p>
                </div>
              )}
              {freeShippingRemaining === 0 && (
                <div className="mt-4 rounded-2xl bg-mint/10 p-3 text-center">
                  <span className="text-sm font-bold text-mint">🎉 Frete grátis! Você economizou R$ 19,90</span>
                </div>
              )}

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({items.length} itens)</span>
                  <span className="font-semibold">{formatBRL(subtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span className={shipping === 0 ? 'font-semibold text-mint' : 'font-semibold'}>
                    {shipping === 0 ? 'Grátis' : formatBRL(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    🚚 Frete grátis para compras acima de R$ 199
                  </p>
                )}
                {/* Delivery estimate */}
                {items.length > 0 && (
                  <div className="flex items-start gap-2 rounded-xl bg-cream/80 p-3">
                    <span className="text-base leading-5">📅</span>
                    <div>
                      <p className="text-xs font-bold text-plum">Entrega estimada</p>
                      <p className="text-xs text-muted-foreground">{deliveryStr}</p>
                    </div>
                  </div>
                )}
                {discount() > 0 && (
                  <div className="flex justify-between text-mint font-semibold">
                    <span>Desconto ({coupon?.code})</span>
                    <span>-{formatBRL(discount())}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-plum">Total</span>
                  <span className="font-extrabold text-plum">{formatBRL(total)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ou 3x de {formatBRL(total / 3)} sem juros
                </p>
                {/* Loyalty points */}
                <LoyaltyPointsEarned subtotal={subtotal()} />
              </div>

              {/* Coupon */}
              <div className="mt-4">
                {coupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-mint/10 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Sparkle className="h-4 w-4 text-mint" />
                      <span className="text-sm font-bold text-mint">{coupon.code} ({coupon.discountPercent}%)</span>
                    </div>
                    <button onClick={removeCoupon} className="text-xs text-muted-foreground hover:text-tangerine">Remover</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Cupom de desconto"
                      className="rounded-xl border-2 text-sm"
                    />
                    <Button onClick={applyCoupon} disabled={applyingCoupon} variant="outline" className="rounded-xl border-2 text-sm shrink-0">
                      {applyingCoupon ? '...' : 'Aplicar'}
                    </Button>
                  </div>
                )}
              </div>

              <Button
                onClick={() => router.push('/checkout')}
                className="mt-5 w-full h-12 rounded-full bg-tangerine text-base font-bold text-white hover:bg-grape sticker-shadow"
              >
                Finalizar compra
              </Button>

              {/* Security badges */}
              <div className="mt-5 grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-cream/80 px-3 py-2.5">
                  <span className="text-base">🔒</span>
                  <span className="text-xs font-bold text-plum">Pagamento seguro</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-cream/80 px-3 py-2.5">
                  <span className="text-base">🚚</span>
                  <span className="text-xs font-bold text-plum">Entrega rápida</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-cream/80 px-3 py-2.5">
                  <span className="text-base">↩️</span>
                  <span className="text-xs font-bold text-plum">Troca em 30 dias</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CartSkeleton() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="rounded-3xl bg-white border-2 border-border p-4 h-32 skeleton-shimmer" />
            ))}
          </div>
          <div className="rounded-3xl bg-white border-2 border-border p-6 h-72 skeleton-shimmer" />
        </div>
      </div>
    </div>
  )
}
