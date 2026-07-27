'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag, X, Tag, Truck, Package } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-store'
import { formatBRL } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function CartDrawer() {
  const { items, isOpen, setOpen, updateQuantity, removeItem, restoreItem, clearLastRemoved, subtotal, discount, total, coupon } = useCart()
  const [mounted, setMounted] = useState(false)
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => { queueMicrotask(() => setMounted(true)) }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  function handleRemove(item: { id: string; name: string }) {
    // Clear any existing timeout
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

    // Clear lastRemoved after toast disappears
    clearTimeoutRef.current = setTimeout(() => {
      clearLastRemoved()
    }, 5000)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full max-w-md gap-0 bg-cream p-0 sm:max-w-md flex flex-col rounded-t-3xl overflow-hidden"
      >
        {/* Gradient accent stripe at top */}
        <div className="h-1 w-full bg-gradient-to-r from-tangerine via-sun to-tangerine shrink-0" />

        <SheetHeader className="flex-row items-center justify-between bg-gradient-to-r from-tangerine to-grape px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-display text-xl text-white">
            <ShoppingBag className="h-5 w-5" /> Sacola
            {mounted && items.length > 0 && (
              <span className="ml-1 text-sm font-normal text-white/80">({totalItems} {totalItems === 1 ? 'item' : 'itens'})</span>
            )}
          </SheetTitle>
          <button onClick={() => setOpen(false)} className="text-white/90 hover:text-white transition-colors" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </SheetHeader>

        {!mounted || items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="animate-bounce-in relative">
              <span className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-secondary to-tangerine/10 text-6xl shadow-inner">🛍️</span>
            </div>
            <div className="space-y-2">
              <p className="font-display text-xl font-bold text-plum">Seu carrinho está vazio</p>
              <p className="text-sm text-muted-foreground">Que tal explorar nossas roupinhas coloridas?</p>
            </div>
            <Button asChild className="bg-tangerine text-white hover:bg-grape rounded-full shadow-md transition-all hover:shadow-lg hover:shadow-tangerine/25">
              <Link href="/produtos" onClick={() => setOpen(false)}>
                <Package className="h-4 w-4 mr-2" />
                Ver produtos
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping progress bar */}
            <div className="px-4 pt-4">
              <FreeShippingBar subtotal={subtotal()} />
            </div>
            <div className="scroll-pretty flex-1 overflow-y-auto px-4 pb-4 space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex gap-3 rounded-2xl bg-white border-2 border-border p-3 animate-slide-up',
                    `stagger-${Math.min(index + 1, 6)}`
                  )}
                  style={{ opacity: 0, animationFillMode: 'forwards' }}
                >
                  <Link
                    href={`/produto/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary"
                  >
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/produto/${item.slug}`}
                        onClick={() => setOpen(false)}
                        className="line-clamp-2 text-sm font-bold text-plum hover:text-tangerine transition-colors"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => handleRemove(item)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.color && <span>{item.color}</span>}
                      {item.color && item.size !== 'Único' && <span> · Tam {item.size}</span>}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 rounded-full border-2 border-border bg-cream p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="grid h-7 w-7 place-items-center rounded-full hover:bg-white transition-colors"
                          aria-label="Diminuir"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="grid h-7 w-7 place-items-center rounded-full hover:bg-white transition-colors"
                          aria-label="Aumentar"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-extrabold text-plum">{formatBRL(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-border bg-white p-4 space-y-3">
              {coupon && (
                <div className="flex items-center gap-2 rounded-xl bg-mint/15 px-3 py-2 text-sm">
                  <Tag className="h-4 w-4 text-mint" />
                  <span className="font-bold text-mint">Cupom {coupon.code}</span>
                  <span className="ml-auto text-xs text-muted-foreground">-{formatBRL(discount())}</span>
                </div>
              )}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatBRL(subtotal())}</span>
                </div>
                {discount() > 0 && (
                  <div className="flex justify-between text-mint font-semibold">
                    <span>Desconto</span>
                    <span>-{formatBRL(discount())}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-plum pt-1">
                  <span>Total</span>
                  <span>{formatBRL(total())}</span>
                </div>
              </div>
              <Button asChild className="w-full rounded-full bg-tangerine text-white hover:bg-grape h-12 text-base font-bold shadow-md transition-all hover:shadow-lg hover:shadow-tangerine/25">
                <Link href="/checkout" onClick={() => setOpen(false)}>Finalizar compra</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full rounded-full text-plum hover:bg-secondary">
                <Link href="/carrinho" onClick={() => setOpen(false)}>Ver carrinho completo</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

const FREE_SHIPPING_THRESHOLD = 199
const SHIPPING_COST = 19.9

function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const progress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1)
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal
  const isComplete = subtotal >= FREE_SHIPPING_THRESHOLD

  return (
    <div className="rounded-2xl bg-secondary p-3">
      <div className="flex items-center gap-2 mb-2">
        <Truck className={cn('h-4 w-4 transition-colors duration-500', isComplete ? 'text-mint' : 'text-tangerine')} />
        <span className="text-xs font-bold text-plum">
          {isComplete
            ? '🎉 Frete grátis! Você economizou R$19,90'
            : `Faltam ${formatBRL(remaining)} para frete grátis! 🚚`}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white shadow-inner">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out shadow-sm',
            isComplete
              ? 'bg-gradient-to-r from-mint to-sky'
              : 'bg-gradient-to-r from-tangerine to-sun'
          )}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  )
}
