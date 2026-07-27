'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import {
  CheckCircle,
  Package,
  ArrowRight,
  Copy,
  Truck,
  Heart,
  Sparkles,
  ShoppingBag,
  MapPin,
  CreditCard,
  Share2,
  Clock,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/* ───────── Confetti Dots ───────── */
const CONFETTI_COLORS = [
  'bg-tangerine',
  'bg-sun',
  'bg-grape',
  'bg-sky',
  'bg-mint',
  'bg-blush',
]

function ConfettiDot({
  color,
  delay,
  left,
  top,
  size,
}: {
  color: string
  delay: number
  left: number
  top: number
  size: number
}) {
  return (
    <span
      className={cn('absolute rounded-full animate-confetti-dot pointer-events-none', color)}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${3.5 + delay}s`,
        left: `${left}%`,
        top: `${top}%`,
        width: size,
        height: size,
        opacity: 0,
      }}
    />
  )
}

const CONFETTI_DOTS = Array.from({ length: 18 }, (_, i) => ({
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: i * 0.25,
  left: 5 + Math.random() * 90,
  top: 5 + Math.random() * 80,
  size: 6 + Math.random() * 10,
}))

/* ───────── Animated SVG Checkmark ───────── */
function AnimatedCheckmark() {
  return (
    <div className="relative mb-8">
      {/* Pulse ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-mint to-sky animate-success-ring opacity-50" />
      {/* Main circle */}
      <div className="relative grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-mint to-sky shadow-2xl">
        <svg className="animate-checkmark h-16 w-16" viewBox="0 0 52 52">
          <circle
            cx="26"
            cy="26"
            r="25"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <polyline
            points="16 27 22 33 36 19"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {/* Sparkle decorations */}
      <Sparkles className="absolute -right-4 -top-2 h-9 w-9 text-sun animate-wiggle" />
      <Star className="absolute -left-3 -bottom-1 h-7 w-7 text-blush animate-float-slow fill-blush" />
    </div>
  )
}

/* ───────── Order Timeline ───────── */
const TIMELINE_STEPS = [
  { label: 'Pedido confirmado', icon: CheckCircle, active: true },
  { label: 'Processando', icon: Clock, active: false },
  { label: 'Em separação', icon: Package, active: false },
  { label: 'Enviado', icon: Truck, active: false },
  { label: 'Entregue', icon: MapPin, active: false },
]

function OrderTimeline() {
  return (
    <div className="mt-8 w-full rounded-3xl border-2 border-border bg-white p-6 sticker-shadow">
      <h3 className="mb-5 text-center text-sm font-bold uppercase tracking-wide text-muted-foreground">
        Status do pedido
      </h3>
      <div className="relative flex items-center justify-between">
        {/* Progress bar background */}
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
        {/* Active progress bar */}
        <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-mint to-tangerine animate-timeline-progress" />

        {TIMELINE_STEPS.map((step, i) => {
          const Icon = step.icon
          return (
            <div
              key={i}
              className="animate-timeline-step relative z-10 flex flex-col items-center gap-2"
              style={{ animationDelay: `${0.2 + i * 0.12}s` }}
            >
              <div
                className={cn(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition-all',
                  step.active
                    ? 'border-mint bg-mint text-white shadow-lg shadow-mint/30'
                    : 'border-border bg-white text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  'text-center text-[10px] font-semibold leading-tight max-w-[64px]',
                  step.active ? 'text-mint' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ───────── Order Details Card ───────── */
function OrderDetailsCard({
  orderId,
  total,
}: {
  orderId: string
  total: string
}) {
  return (
    <div className="mt-5 w-full animate-scale-in rounded-3xl border-2 border-border bg-white p-6 sticker-shadow">
      {/* Order number + total */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Número do pedido
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge className="rounded-full bg-gradient-to-r from-tangerine to-grape px-3 py-1 text-xs font-bold text-white border-0 shadow-sm">
              {orderId}
            </Badge>
            <button
              onClick={() => {
                navigator.clipboard.writeText(orderId)
              }}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-border text-muted-foreground transition-all hover:border-tangerine hover:text-tangerine hover:scale-110"
              title="Copiar número do pedido"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {total && (
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Total
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold text-tangerine">
              {total}
            </p>
          </div>
        )}
      </div>

      {/* Details rows */}
      <div className="mt-5 space-y-3 border-t border-border pt-5">
        {/* Estimated delivery */}
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky/10 text-sky">
            <Truck className="h-5 w-5" />
          </span>
          <div className="text-left">
            <p className="text-sm font-bold text-plum">Previsão de entrega</p>
            <p className="text-xs text-muted-foreground">
              3 a 7 dias úteis após a confirmação do pagamento
            </p>
          </div>
        </div>
        {/* Payment method */}
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-grape/10 text-grape">
            <CreditCard className="h-5 w-5" />
          </span>
          <div className="text-left">
            <p className="text-sm font-bold text-plum">Forma de pagamento</p>
            <p className="text-xs text-muted-foreground">
              Pagamento digital seguro · Confirmação em até 24h
            </p>
          </div>
        </div>
        {/* Shipping address */}
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sun/10 text-sun">
            <MapPin className="h-5 w-5" />
          </span>
          <div className="text-left">
            <p className="text-sm font-bold text-plum">Endereço de entrega</p>
            <p className="text-xs text-muted-foreground">
              Endereço salvo na sua conta · Você pode alterar em "Meus pedidos"
            </p>
          </div>
        </div>
        {/* Updates notification */}
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint/10 text-mint">
            <Package className="h-5 w-5" />
          </span>
          <div className="text-left">
            <p className="text-sm font-bold text-plum">Acompanhe seu pedido</p>
            <p className="text-xs text-muted-foreground">
              Receba atualizações por email e na sua conta Pijulinho
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────── CTA Cards ───────── */
function CtaCards({ orderId }: { orderId: string }) {
  const cards = [
    {
      icon: ShoppingBag,
      emoji: '🛍️',
      label: 'Continuar comprando',
      description: 'Descubra novos looks incríveis',
      href: '/produtos',
      color: 'from-tangerine to-sun',
      textColor: 'text-white',
      hoverBg: 'hover:shadow-tangerine/30',
    },
    {
      icon: Package,
      emoji: '📦',
      label: 'Rastrear pedido',
      description: 'Acompanhe em tempo real',
      href: `/rastrear-pedido?order=${orderId}`,
      color: 'from-grape to-sky',
      textColor: 'text-white',
      hoverBg: 'hover:shadow-grape/30',
    },
    {
      icon: Heart,
      emoji: '❤️',
      label: 'Ver favoritos',
      description: 'Seus itens salvos estão aqui',
      href: '/minha-conta?tab=favoritos',
      color: 'from-blush to-tangerine',
      textColor: 'text-white',
      hoverBg: 'hover:shadow-blush/30',
    },
  ]

  return (
    <div className="mt-8 w-full animate-slide-up">
      <h3 className="mb-4 text-center font-display text-lg font-bold text-plum">
        O que fazer agora?
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <Link
              key={i}
              href={card.href}
              className="animate-bounce-in group rounded-3xl border-2 border-border bg-white p-4 text-center transition-all hover:scale-[1.03] hover:shadow-xl hover:border-tangerine/40 sticker-shadow"
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110">
                <span className="text-2xl">{card.emoji}</span>
              </div>
              <p className="text-sm font-bold text-plum">{card.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {card.description}
              </p>
              <ArrowRight className="mx-auto mt-2 h-4 w-4 text-tangerine transition-transform group-hover:translate-x-1" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/* ───────── Share Button ───────── */
function ShareButton() {
  const [shared, setShared] = useState(false)

  useEffect(() => {
    if (shared) {
      const t = setTimeout(() => setShared(false), 2500)
      return () => clearTimeout(t)
    }
  }, [shared])

  async function handleShare() {
    const message = 'Acabei de fazer um pedido na Pijulinho! 🦊🎉'
    const url = window.location.origin

    // Try native share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu pedido na Pijulinho 🦊',
          text: message,
          url,
        })
        setShared(true)
        return
      } catch {
        // User cancelled or API not supported, fall through
      }
    }

    // Fallback: WhatsApp link
    const encoded = encodeURIComponent(`${message}\n${url}`)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
    setShared(true)
  }

  return (
    <div className="mt-6 w-full animate-slide-up">
      <Button
        onClick={handleShare}
        variant="outline"
        className={cn(
          'w-full h-12 rounded-full border-2 text-base font-bold transition-all hover:scale-[1.02]',
          shared
            ? 'border-mint bg-mint/10 text-mint'
            : 'border-tangerine/30 text-plum hover:border-tangerine hover:bg-tangerine/5'
        )}
      >
        <Share2 className={cn('h-5 w-5 mr-2', shared ? 'text-mint' : 'text-tangerine')} />
        {shared ? 'Compartilhado! ✨' : 'Compartilhar no WhatsApp'}
      </Button>
    </div>
  )
}

/* ───────── Main Content ───────── */
function OrderConfirmedContent() {
  const sp = useSearchParams()
  const orderId = sp.get('pedido') || ''
  const total = sp.get('total') || ''

  return (
    <div className="relative min-h-screen bg-cream overflow-hidden">
      {/* Decorative confetti dots */}
      {CONFETTI_DOTS.map((dot, i) => (
        <ConfettiDot key={i} {...dot} />
      ))}

      {/* Subtle gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />

      <main className="relative mx-auto max-w-lg px-4 py-16 pb-24">
        <div className="animate-bounce-in flex flex-col items-center text-center">
          {/* ─── Success Header ─── */}
          <AnimatedCheckmark />

          <h1 className="animate-gradient-text font-display text-3xl font-extrabold sm:text-4xl leading-tight">
            Pedido confirmado!
          </h1>

          <p className="mt-3 animate-slide-up text-muted-foreground max-w-sm">
            Seu pedido foi recebido com sucesso. Vamos cuidar de tudo para que
            chegue rapidinho! 💛
          </p>

          {/* ─── Order Timeline ─── */}
          <OrderTimeline />

          {/* ─── Order Details ─── */}
          {orderId && <OrderDetailsCard orderId={orderId} total={total} />}

          {/* ─── CTA Cards ─── */}
          {orderId && <CtaCards orderId={orderId} />}

          {/* ─── Share Button ─── */}
          <ShareButton />

          {/* ─── Social proof footer ─── */}
          <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className="h-4 w-4 text-blush fill-current" />
            <span>
              Obrigado por escolher a{' '}
              <strong className="text-tangerine">Pijulinho</strong>! 🦊
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function PedidoConfirmadoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-tangerine border-t-transparent" />
        </div>
      }
    >
      <OrderConfirmedContent />
    </Suspense>
  )
}
