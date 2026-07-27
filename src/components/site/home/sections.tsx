'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Quote, Truck, RefreshCcw, ShieldCheck, Ruler, Shirt, Sparkles, Tag, Heart } from 'lucide-react'
import { Whale, Giraffe, Cloud, Rainbow, ZigZag, Sparkle, Smiley, Pencil } from '../doodles'

/* ---------------- HIGHLIGHTS (3 cards) ---------------- */
export function Highlights() {
  const cards = [
    {
      bg: 'bg-mint',
      title: 'Explore nossa coleção colorida',
      desc: 'Cores vibrantes que combinam com a energia da criançada.',
      cta: 'Ver coleção',
      href: '/produtos',
      illustration: <Whale className="h-20 w-28" />,
      rotate: '-rotate-2',
    },
    {
      bg: 'bg-tangerine',
      title: 'Confira as novidades',
      desc: 'Peças novas chegando toda semana para você amar.',
      cta: 'Novidades',
      href: '/produtos?sort=recent',
      illustration: <Giraffe className="h-24 w-24" />,
      rotate: 'rotate-1',
    },
    {
      bg: 'bg-sky',
      title: 'Encontre o look perfeito',
      desc: 'Conjuntos prontos para qualquer ocasião e estação.',
      cta: 'Montar look',
      href: '/produtos?categoria=conjuntos',
      illustration: <Cloud className="h-20 w-32 text-white" />,
      rotate: '-rotate-1',
    },
  ]
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 lg:py-20">
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((c, i) => (
          <Link
            key={i}
            href={c.href}
            className={`group relative overflow-hidden rounded-[2rem] ${c.bg} p-6 text-white sticker-shadow transition-all hover:-translate-y-1 ${c.rotate}`}
          >
            <div className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/25 backdrop-blur transition-transform group-hover:rotate-45">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="mt-2 flex justify-center">{c.illustration}</div>
            <h3 className="mt-4 font-display text-xl font-bold leading-tight">{c.title}</h3>
            <p className="mt-1.5 text-sm text-white/85">{c.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-4 py-1.5 text-xs font-extrabold text-plum">
              {c.cta} <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ---------------- BRANDS marquee ---------------- */
export function Brands() {
  const brands = ['Mini Estrela', 'Pequeno Aventura', 'Tic Tac Kids', 'Algodão Doce', 'Coração Pipoca', 'Mundo Colorido', 'Fofuxo', 'Tamanho KK']
  const list = [...brands, ...brands]
  return (
    <section className="border-y-2 border-dashed border-border bg-cream py-8">
      <div className="mx-auto max-w-7xl px-4">
        <p className="mb-5 text-center font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Marcas que amamos
        </p>
        <div className="marquee-pause relative overflow-hidden">
          <div className="flex w-max animate-marquee items-center gap-10">
            {list.map((b, i) => (
              <span
                key={i}
                className="flex shrink-0 items-center gap-2 font-display text-xl font-bold text-plum/40 transition-colors hover:text-tangerine"
              >
                <Sparkle className="h-4 w-4 text-sun" />
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- PROMO banner ---------------- */
export function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 lg:py-20">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-tangerine via-sun to-tangerine p-8 sticker-shadow md:p-12">
        <Smiley className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 text-white/20 animate-wiggle" />
        <Pencil className="pointer-events-none absolute right-10 bottom-6 h-16 w-16 rotate-12 opacity-30" />
        <Sparkle className="pointer-events-none absolute left-6 top-6 h-8 w-8 text-white/40 animate-float" />
        <Rainbow className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-2 h-8 w-24 text-white/15" />

        <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/25 px-3 py-1 text-xs font-extrabold text-white backdrop-blur">
              <Tag className="h-3.5 w-3.5" /> CUPOM DA SEMANA
            </span>
            <h3 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              Ganhe 20% de desconto na primeira compra
            </h3>
            <p className="mt-2 text-white/85">
              Use o cupom <strong className="rounded-md bg-white px-2 py-0.5 text-tangerine">BEMVINDO20</strong> no carrinho e aproveite!
            </p>
            <CountdownTimer />
          </div>
          <Link
            href="/produtos"
            className="group inline-flex h-14 shrink-0 items-center gap-2 rounded-full bg-plum px-8 text-base font-bold text-cream transition-all hover:scale-105"
          >
            Usar cupom
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ---------------- BENEFITS ---------------- */
export function Benefits() {
  const items = [
    { icon: Truck, title: 'Entrega rápida', desc: 'Envio em 24h para todo o Brasil', color: 'text-sky', bg: 'bg-sky/10' },
    { icon: RefreshCcw, title: 'Troca fácil', desc: 'Até 30 dias para trocar sem custo', color: 'text-mint', bg: 'bg-mint/10' },
    { icon: ShieldCheck, title: 'Pagamento seguro', desc: 'Pix, cartão e boleto protegidos', color: 'text-tangerine', bg: 'bg-tangerine/10' },
  ]
  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((b) => (
          <div key={b.title} className="flex items-center gap-4 rounded-2xl border-2 border-border bg-white p-5 sticker-shadow">
            <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${b.bg} ${b.color}`}>
              <b.icon className="h-7 w-7" />
            </span>
            <div>
              <p className="font-display text-lg font-bold text-plum">{b.title}</p>
              <p className="text-sm text-muted-foreground">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------------- STATS / NUMBERS ---------------- */
function CounterAnimation({ target, suffix = '', prefix = '', decimals = 0 }: { target: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const duration = 2000
          const startTime = performance.now()

          function animate(currentTime: number) {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            const current = eased * target
            setCount(current)

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setCount(target)
            }
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  const display = decimals > 0 ? count.toFixed(decimals) : Math.round(count).toString()
  const formatted = decimals > 0
    ? display.replace('.', ',')
    : display.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return <span ref={ref}>{prefix}{formatted}{suffix}</span>
}

export function Stats() {
  const stats = [
    { value: 900, suffix: '+', prefix: '', label: 'Famílias felizes', icon: '👨‍👩‍👧', decimals: 0 },
    { value: 50000, suffix: '+', prefix: '', label: 'Produtos vendidos', icon: '📦', decimals: 0 },
    { value: 4.9, suffix: '', prefix: '', label: 'Nota média', icon: '⭐', decimals: 1 },
    { value: 30, suffix: '', prefix: '', label: 'Dias para troca', icon: '🔄', decimals: 0 },
  ]
  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-grape/30 bg-white px-4 py-1.5 text-xs font-bold text-grape">
            📊 Números que orgulham
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-plum sm:text-4xl">
            A confiança das <span className="hl-pink text-plum">famílias</span>
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group relative flex flex-col items-center gap-3 rounded-3xl border-2 border-border bg-cream/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-tangerine/10 hover:border-tangerine/30"
            >
              <span className="text-3xl">{s.icon}</span>
              <span className="font-display text-4xl font-extrabold text-tangerine">
                <CounterAnimation target={s.value} suffix={s.suffix} prefix={s.prefix} decimals={s.decimals} />
              </span>
              <span className="text-sm font-semibold text-plum">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- WHY CHOOSE ---------------- */
export function WhyChoose() {
  const features = [
    { icon: Ruler, title: 'Tamanhos inclusivos', desc: 'Do RN ao 14 anos, para todo corpo e fase da infância.' },
    { icon: Shirt, title: 'Materiais confortáveis', desc: 'Algodão macio, certified, que respeita a pele sensível.' },
    { icon: Sparkles, title: 'Estilo moderno', desc: 'Estampas exclusivas pensadas por designers infantis.' },
    { icon: Heart, title: 'Feito com carinho', desc: 'Cada peça é produzida com muito amor e cuidado.' },
  ]
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 lg:py-20">
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sun to-tangerine p-2 sticker-shadow">
          <div className="relative h-full min-h-[360px] overflow-hidden rounded-[2.2rem] bg-blush/20">
            <SafeImage src="/images/why-choose.png" alt="Mãe e filha felizes com roupas Pijulinho" sizes="(max-width:1024px) 100vw, 600px" emoji="👩‍👧" />
          </div>
          <Sparkle className="pointer-events-none absolute left-6 top-6 h-8 w-8 text-white animate-float" />
        </div>

        <div className="flex flex-col justify-center rounded-[2.5rem] bg-grape p-8 text-cream sticker-shadow lg:p-10">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-sun">
            <Rainbow className="h-4 w-4" /> Por que escolher a Pijulinho
          </span>
          <h3 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
            Pequenos detalhes que fazem <span className="text-sun">grandes diferenças</span>
          </h3>
          <div className="mt-6 space-y-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15 text-sun">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-lg font-bold">{f.title}</p>
                  <p className="text-sm text-cream/75">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- TESTIMONIALS ---------------- */
export function Testimonials() {
  const allReviews = [
    {
      name: 'Mariana Silva',
      role: 'Mãe da Helena, 3 anos',
      text: 'As roupas são lindas e de ótima qualidade! Minha filha ama as estampas e eu amo o conforto. Virou nossa loja favorita!',
      avatarBg: 'bg-blush',
      initials: 'MS',
      date: '2026-01-15',
    },
    {
      name: 'João Pereira',
      role: 'Pai do Bento, 5 anos',
      text: 'Comprei um conjunto e chegou super rápido. Tecido ótimo, cores vibrantes e o atendimento nota 10. Recomendo demais!',
      avatarBg: 'bg-sky',
      initials: 'JP',
      date: '2026-01-10',
    },
    {
      name: 'Patrícia Lima',
      role: 'Mãe da Laura, 4 anos',
      text: 'O vestido floral é um sonho! Lavou várias vezes e continua novinho. Já sou cliente fiel da Pijulinho 💛',
      avatarBg: 'bg-mint',
      initials: 'PL',
      date: '2026-01-05',
    },
    {
      name: 'Carla Mendes',
      role: 'Mãe do Theo, 2 anos',
      text: 'Pijamas mais fofos impossível! Meu bebê dorme confortável e feliz. E o cupom de boas-vindas foi um sucesso!',
      avatarBg: 'bg-sun',
      initials: 'CM',
      date: '2026-01-01',
    },
  ]
  const [filter, setFilter] = useState<'all' | 'recent'>('all')
  const reviews = filter === 'recent' ? [...allReviews].sort((a, b) => b.date.localeCompare(a.date)) : allReviews

  return (
    <section className="bg-cream py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-tangerine/30 bg-white px-4 py-1.5 text-xs font-bold text-tangerine">
            <Quote className="h-3.5 w-3.5" /> Depoimentos
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-plum sm:text-4xl">
            Famílias que já estão{' '}
            <span className="hl-pink text-plum">encantadas</span>
          </h2>
          <div className="mx-auto mt-3 w-40 text-tangerine">
            <ZigZag className="w-full" />
          </div>
          {/* Filter tabs */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white border-2 border-border p-1">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-300 ${
                filter === 'all'
                  ? 'bg-tangerine text-white shadow-md'
                  : 'text-plum/60 hover:text-plum'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-300 ${
                filter === 'recent'
                  ? 'bg-tangerine text-white shadow-md'
                  : 'text-plum/60 hover:text-plum'
              }`}
            >
              ⏰ As mais recentes
            </button>
          </div>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((r, i) => (
            <div
              key={`${r.name}-${filter}`}
              className="group relative flex flex-col rounded-3xl border-2 border-border bg-white p-6 sticker-shadow transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-tangerine/15 hover:border-tangerine/30"
              style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
            >
              {/* Quote mark decoration */}
              <div className="absolute -top-2 left-5 text-5xl font-serif leading-none text-tangerine/15 select-none">&ldquo;</div>
              {/* Gold stars */}
              <div className="relative mb-3 flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M12 2.5 L14.9 8.9 L22 9.8 L16.7 14.6 L18.2 21.5 L12 18 L5.8 21.5 L7.3 14.6 L2 9.8 L9.1 8.9 Z" />
                  </svg>
                ))}
              </div>
              <p className="relative flex-1 text-sm leading-relaxed text-plum/80">{r.text}</p>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                {/* Avatar initials */}
                <span className={`grid h-11 w-11 place-items-center rounded-full ${r.avatarBg} text-sm font-extrabold text-white shadow-sm`}>
                  {r.initials}
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-plum">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- FINAL CTA ---------------- */
export function FinalCta() {
  return (
    <section className="relative -mx-[calc(50%-50vw)] w-screen bg-gradient-to-br from-plum via-grape to-plum py-20 lg:py-28">
      {/* Floating decorative elements */}
      <Cloud className="pointer-events-none absolute left-8 top-8 h-20 w-28 text-white/10 animate-float" />
      <Cloud className="pointer-events-none absolute right-12 top-16 h-12 w-16 text-white/5 animate-float-slow" />
      <Rainbow className="pointer-events-none absolute right-8 bottom-12 h-20 w-28 opacity-60" />
      <Sparkle className="pointer-events-none absolute left-1/4 top-8 h-8 w-8 text-sun animate-float" />
      <Sparkle className="pointer-events-none absolute left-[15%] bottom-16 h-6 w-6 text-blush animate-float-slow" />
      <Sparkle className="pointer-events-none absolute right-1/3 bottom-20 h-10 w-10 text-sun/60 animate-float" />
      <Sparkle className="pointer-events-none absolute right-[20%] top-12 h-5 w-5 text-cream/30 animate-float-slow" />
      {/* Dot pattern overlay */}
      <div className="pointer-events-none absolute inset-0 dot-pattern opacity-[0.04]" />

      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <h2 className="font-display text-3xl font-bold text-cream sm:text-5xl lg:text-6xl">
          Deixe o estilo do seu filho mais{' '}
          <span className="hl-yellow text-plum">divertido!</span>
        </h2>
        <p className="mt-4 text-lg text-cream/80">
          Junte-se a mais de 900 famílias que já vestem alegria todos os dias com a Pijulinho.
        </p>
        {/* Social proof */}
        <p className="mt-3 text-sm font-semibold text-sun">
          Junte-se a 900+ familias que confiam na Pijulinho
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/produtos"
            className="group relative inline-flex h-16 items-center gap-2 rounded-full bg-tangerine px-10 text-lg font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,122,69,0.5)]"
          >
            <span className="absolute inset-0 rounded-full animate-pulse-glow bg-tangerine/20" />
            <span className="relative">Começar a comprar</span>
            <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/produtos?categoria=pijamas"
            className="inline-flex h-16 items-center gap-2 rounded-full border-2 border-cream/30 px-8 text-base font-bold text-cream hover:bg-white/10 transition-colors"
          >
            Ver pijamas
          </Link>
        </div>
      </div>
    </section>
  )
}

function SafeImage({ src, alt, sizes, emoji = '🎨' }: { src: string; alt: string; sizes: string; emoji?: string }) {
  const [ok, setOk] = useState(true)
  if (!ok) return <div className="flex h-full w-full items-center justify-center text-6xl">{emoji}</div>
  return (
    <>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      <img src={src} alt="" className="hidden" onError={() => setOk(false)} />
    </>
  )
}

function CountdownTimer() {
  // Countdown to end of this week (Sunday midnight)
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    function calc() {
      const now = new Date()
      const end = new Date(now)
      end.setDate(end.getDate() + (7 - end.getDay()))
      end.setHours(23, 59, 59, 999)
      const diff = Math.max(0, end.getTime() - now.getTime())
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const iv = setInterval(calc, 1000)
    return () => clearInterval(iv)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-mono">
      <span className="text-plum font-bold">⏰ Oferta termina em:</span>
      {[
        { v: timeLeft.d, l: 'D' },
        { v: timeLeft.h, l: 'H' },
        { v: timeLeft.m, l: 'M' },
        { v: timeLeft.s, l: 'S' },
      ].map((u, i) => (
        <span key={u.l} className="flex items-center gap-1">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-plum font-extrabold">
            {pad(u.v)}
          </span>
          {i < 3 && <span className="text-white/60 font-bold">:</span>}
        </span>
      ))}
    </div>
  )
}
