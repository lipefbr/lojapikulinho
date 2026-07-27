'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Truck, Package, Clock, CheckCircle2, Search, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const TIMELINE_STEPS = [
  { label: 'Pedido confirmado', icon: CheckCircle2 },
  { label: 'Processando', icon: Package },
  { label: 'Em separação', icon: Truck },
  { label: 'Enviado', icon: Truck },
  { label: 'Entregue', icon: CheckCircle2 },
]

export default function RastrearPedidoPage() {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [found, setFound] = useState(false)
  const [searched, setSearched] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setSearched(false)
    // Simulate API delay
    setTimeout(() => {
      setSearching(false)
      setSearched(true)
      // Always show a simulated result (simulated tracking experience)
      setFound(true)
    }, 1200)
  }

  // Simulated order data
  const orderDate = new Date()
  orderDate.setDate(orderDate.getDate() - 2)
  const orderDateStr = orderDate.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return (
    <div className="bg-cream min-h-screen flex flex-col animate-page-enter">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-tangerine via-sun to-tangerine py-12 md:py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/30 blur-3xl animate-float" />
          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/20 blur-3xl animate-float-slow" />
          <div className="absolute left-1/2 top-0 h-40 w-40 rounded-full bg-blush/20 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            Rastrear Pedido
          </h1>
          <p className="mt-2 text-white/80 text-sm md:text-base max-w-md mx-auto">
            Acompanhe em tempo real onde está o seu pedido Pijulinho
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="border-b border-border bg-white/60">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-plum transition-colors">Início</Link>
          <ArrowRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-plum">Rastrear Pedido</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
          {/* Search Form */}
          <div className="rounded-3xl border-2 border-border bg-white p-6 shadow-sm md:p-8">
            <h2 className="font-display text-lg font-bold text-plum mb-1">
              Digite seu e-mail ou número do pedido
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Informe o e-mail utilizado na compra ou o código do pedido para rastrear
            </p>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ex: seu@email.com ou PJL2025071200001BR"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 h-12 rounded-2xl border-2 border-border focus-visible:border-tangerine focus-visible:ring-tangerine/20"
                />
              </div>
              <Button
                type="submit"
                disabled={searching || !query.trim()}
                className="h-12 rounded-2xl bg-tangerine hover:bg-tangerine/90 text-white font-bold px-8 transition-all hover:shadow-lg hover:shadow-tangerine/25"
              >
                {searching ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Buscando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Rastrear
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Results */}
          {searching && (
            <div className="mt-8 flex flex-col items-center justify-center gap-4 py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-tangerine/30 border-t-tangerine" />
              <p className="text-sm text-muted-foreground">Buscando pedido...</p>
            </div>
          )}

          {searched && !found && (
            <div className="mt-8 rounded-3xl border-2 border-border bg-white p-6 md:p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blush/20">
                <Package className="h-8 w-8 text-blush" />
              </div>
              <h3 className="font-display text-lg font-bold text-plum">Pedido não encontrado</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Verifique o número e tente novamente.
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-full border-2 border-border hover:border-tangerine hover:text-tangerine"
                onClick={() => { setSearched(false); setFound(false) }}
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {searched && found && (
            <div className="mt-8 space-y-6">
              {/* Order Summary Card */}
              <div className="rounded-3xl border-2 border-border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-bold text-plum">Resumo do Pedido</h3>
                  <Badge className="bg-tangerine/10 text-tangerine border-tangerine/20 font-semibold">
                    Em separação
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pedido</p>
                    <p className="mt-0.5 font-bold text-plum">#PJL-78432</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Data</p>
                    <p className="mt-0.5 font-bold text-plum">{orderDateStr}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                    <p className="mt-0.5 font-bold text-tangerine">Em separação</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</p>
                    <p className="mt-0.5 font-bold text-plum">R$ 189,90</p>
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              <div className="rounded-3xl border-2 border-border bg-white p-6 shadow-sm">
                <h3 className="font-display text-lg font-bold text-plum mb-6">
                  Acompanhamento
                </h3>
                <div className="flex items-center justify-between px-1 py-2">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const stepNum = idx + 1
                    // 2 completed (1,2), 1 current (3), 2 pending (4,5)
                    const isCompleted = stepNum <= 2
                    const isActive = stepNum === 3
                    const StepIcon = step.icon
                    return (
                      <div key={stepNum} className="contents">
                        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                          <div className={cn(
                            'flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                            isCompleted && 'border-mint bg-mint text-white scale-100',
                            isActive && 'border-tangerine bg-tangerine text-white scale-110 shadow-lg shadow-tangerine/30 animate-pulse',
                            !isCompleted && !isActive && 'border-muted-foreground/25 text-muted-foreground/40 bg-white',
                          )}>
                            <StepIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                          </div>
                          <span className={cn(
                            'hidden sm:block text-[10px] font-semibold leading-tight text-center max-w-[70px]',
                            isCompleted && 'text-mint',
                            isActive && 'text-tangerine',
                            !isCompleted && !isActive && 'text-muted-foreground/40',
                          )}>
                            {step.label}
                          </span>
                        </div>
                        {idx < TIMELINE_STEPS.length - 1 && (
                          <div className={cn(
                            'h-0.5 flex-1 min-w-[8px] sm:min-w-[16px] mx-0.5 sm:mx-1 rounded-full transition-colors duration-300',
                            stepNum < 2 && 'bg-mint',
                            stepNum === 2 && 'bg-gradient-to-r from-mint to-tangerine',
                            stepNum >= 3 && 'bg-muted-foreground/15',
                          )} />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Delivery estimate & tracking number */}
                <div className="mt-8 space-y-3 rounded-2xl bg-tangerine/5 border border-tangerine/10 p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-tangerine flex-shrink-0" />
                    <p className="text-sm font-semibold text-plum">
                      Previsão de entrega: 15 a 20 de julho
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-tangerine flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Código de rastreio:{' '}
                      <span className="font-mono font-bold text-plum">PJL2025071200001BR</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Preview */}
              <div className="rounded-3xl border-2 border-border bg-white p-6 shadow-sm">
                <h3 className="font-display text-lg font-bold text-plum mb-4">
                  Itens do pedido
                </h3>
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-cream/50">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
                    <Image
                      src="/images/products/pijama-animais.webp"
                      alt="Pijama Animais"
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-plum text-sm truncate">Pijama Animais Infantil</p>
                    <p className="text-xs text-muted-foreground">Tamanho: 6 · Cor: Rosa</p>
                    <p className="text-xs text-muted-foreground">Qtd: 1</p>
                  </div>
                  <p className="font-bold text-plum text-sm">R$ 189,90</p>
                </div>
              </div>
            </div>
          )}

          {/* Help Section (shown before search) */}
          {!searched && !searching && (
            <div className="mt-8 rounded-3xl border-2 border-border bg-white p-6 md:p-8">
              <h3 className="font-display text-lg font-bold text-plum mb-4">
                Precisa de ajuda?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-cream/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tangerine/10">
                    <Search className="h-4 w-4 text-tangerine" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-plum">Onde encontro meu número do pedido?</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      O número do pedido foi enviado para o seu e-mail após a confirmação da compra.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-cream/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint/10">
                    <Truck className="h-4 w-4 text-mint" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-plum">Quanto tempo leva a entrega?</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Os pedidos são entregues em média de 5 a 10 dias úteis, dependendo da sua região.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-cream/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sun/20">
                    <Clock className="h-4 w-4 text-sun" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-plum">Quando o pedido é atualizado?</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      O rastreamento é atualizado a cada etapa: confirmação, separação, envio e entrega.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer spacer for sticky footer */}
      <div className="mt-auto" />
    </div>
  )
}
