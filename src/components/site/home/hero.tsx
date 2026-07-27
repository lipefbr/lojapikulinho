'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Sparkles, Star, Users, Heart, Truck } from 'lucide-react'
import { ScribbleUnderline, Sparkle, Smiley, Pencil, Rainbow, StarIcon } from '../doodles'

const FLOATING_EMOJIS = [
  { emoji: '🌟', className: 'left-[6%] top-[18%]', animation: 'animate-float', size: 'text-3xl sm:text-4xl' },
  { emoji: '⭐', className: 'right-[8%] top-[12%]', animation: 'animate-float-slow', size: 'text-2xl sm:text-3xl' },
  { emoji: '🦋', className: 'left-[12%] bottom-[28%]', animation: 'animate-float-slow', size: 'text-3xl sm:text-4xl' },
  { emoji: '🌈', className: 'right-[5%] bottom-[22%]', animation: 'animate-float', size: 'text-3xl sm:text-4xl' },
  { emoji: '🎈', className: 'left-[80%] top-[45%]', animation: 'animate-float-slow', size: 'text-2xl sm:text-3xl' },
  { emoji: '✨', className: 'left-[20%] top-[10%]', animation: 'animate-float', size: 'text-xl sm:text-2xl' },
]

const TRUST_BADGES = [
  { icon: Heart, label: '900+ Famílias Felizes', color: 'text-blush' },
  { icon: Star, label: '4.9 ★ Avaliação', color: 'text-sun' },
  { icon: Truck, label: 'Entrega em 3-7 dias', color: 'text-mint' },
]

const TYPEWRITER_PHRASES = [
  'Roupas confortáveis e cheias de alegria ✨',
  'Cores vibrantes para cada brincadeira 🎨',
  'Estilo que acompanha cada sorriso 💛',
]

function TypewriterText() {
  const [displayed, setDisplayed] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const currentPhrase = TYPEWRITER_PHRASES[phraseIndex]

    function tick() {
      if (!isDeleting) {
        // Typing
        if (displayed.length < currentPhrase.length) {
          setDisplayed(currentPhrase.slice(0, displayed.length + 1))
          timeoutRef.current = setTimeout(tick, 50 + Math.random() * 40)
        } else {
          // Finished typing — pause 2s then start deleting
          timeoutRef.current = setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        // Deleting
        if (displayed.length > 0) {
          setDisplayed(currentPhrase.slice(0, displayed.length - 1))
          timeoutRef.current = setTimeout(tick, 30)
        } else {
          setIsDeleting(false)
          setPhraseIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length)
        }
      }
    }

    tick()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [displayed, phraseIndex, isDeleting])

  return (
    <span className="animate-blink-cursor">
      {displayed}
    </span>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="animate-hero-gradient pointer-events-none absolute inset-0 opacity-[0.12]" />
      <div className="relative bg-cream/90">
        {/* Decorative bg blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-20 h-72 w-72 rounded-full bg-blush/30 blur-2xl" />
          <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-sky/20 blur-3xl" />
          <div className="absolute left-1/2 top-0 h-40 w-40 rounded-full bg-sun/30 blur-2xl" />
        </div>

        {/* Floating emoji decorations */}
        {FLOATING_EMOJIS.map((item, i) => (
          <span
            key={i}
            className={`pointer-events-none absolute ${item.className} hidden ${item.animation} md:block ${item.size}`}
            style={{ animationDelay: `${i * 0.8}s` }}
            aria-hidden="true"
          >
            {item.emoji}
          </span>
        ))}

        {/* Floating doodles (existing) */}
        <Sparkle className="pointer-events-none absolute left-[4%] top-[35%] hidden h-6 w-6 text-sun/60 animate-float md:block" />
        <Smiley className="pointer-events-none absolute right-[15%] top-[25%] hidden h-10 w-10 text-mint/60 animate-float-slow md:block" />
        <Pencil className="pointer-events-none absolute left-[18%] bottom-[18%] hidden h-10 w-10 rotate-12 text-grape/40 animate-float md:block" />
        <Sparkle className="pointer-events-none absolute right-[3%] bottom-[35%] hidden h-8 w-8 text-grape/40 animate-float md:block" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 lg:py-24">
          <div className="flex flex-col items-center text-center">
            <span className="animate-bounce-in inline-flex items-center gap-2 rounded-full border-2 border-tangerine/30 bg-white px-4 py-1.5 text-xs font-bold text-tangerine sticker-shadow">
              <Sparkles className="h-3.5 w-3.5" /> Coleção Verão Colorida chegou!
            </span>

            <h1
              className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.05] text-plum sm:text-5xl lg:text-6xl"
              style={{ textShadow: '0 2px 20px rgba(255, 122, 69, 0.15)' }}
            >
              Vista seus pequenos com{' '}
              <span className="relative inline-block">
                <span className="hl-yellow">confiança</span>
              </span>{' '}
              e estilo{' '}
              <span className="relative inline-block text-tangerine">
                colorido!
                <ScribbleUnderline className="absolute -bottom-2 left-0 h-3 text-tangerine" />
              </span>
            </h1>

            {/* Static subtitle for mobile, typewriter for desktop */}
            <p className="mt-6 max-w-2xl text-base text-plum/70 sm:text-lg md:hidden">
              Roupas confortáveis, estilosas e cheias de alegria — pensadas para acompanhar
              cada descoberta, brincadeira e sorriso da infância.
            </p>
            <p className="mt-6 hidden md:block max-w-2xl text-base text-plum/70 sm:text-lg lg:text-lg">
              <TypewriterText />
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/produtos"
                className="animate-pulse-glow group inline-flex h-16 w-full items-center justify-center gap-2 rounded-full bg-tangerine px-10 text-lg font-bold text-white sticker-shadow transition-all hover:bg-grape hover:scale-105 sm:w-auto"
              >
                Comprar agora
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/produtos"
                className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border-2 border-tangerine/30 bg-white/80 px-8 text-base font-bold text-tangerine backdrop-blur-sm transition-all hover:border-tangerine hover:bg-tangerine/5 hover:scale-105 sm:w-auto"
              >
                Ver coleção
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Trust Badges Row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {TRUST_BADGES.map((badge, i) => {
                const Icon = badge.icon
                return (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full border border-plum/10 bg-white/70 px-3.5 py-2 backdrop-blur-sm sm:px-5 sm:py-2.5"
                  >
                    <Icon className={`h-4 w-4 ${badge.color}`} />
                    <span className="text-xs font-bold text-plum/80 sm:text-sm">
                      {badge.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Hero image */}
          <div className="relative mt-14 lg:mt-16">
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border-4 border-white bg-gradient-to-br from-sun/30 via-blush/20 to-sky/20 sticker-shadow">
              <HeroImage src="/images/hero-kids.png" alt="Crianças felizes usando roupas coloridas Pijulinho" />
            </div>

            {/* Floating badge cards */}
            <div className="absolute -left-2 top-1/2 hidden -translate-y-1/2 rotate-[-6deg] rounded-2xl bg-white p-3 sticker-shadow lg:flex lg:flex-col lg:items-center lg:gap-1">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-mint text-white">
                <Users className="h-5 w-5" />
              </span>
              <span className="text-sm font-extrabold text-plum">900+</span>
              <span className="text-[10px] text-muted-foreground">famílias felizes</span>
            </div>
            <div className="absolute -right-2 bottom-6 hidden rotate-[6deg] rounded-2xl bg-white p-3 sticker-shadow lg:flex lg:flex-col lg:items-center lg:gap-1">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sun text-plum">
                <Star className="h-5 w-5" />
              </span>
              <span className="text-sm font-extrabold text-plum">4.9/5</span>
              <span className="text-[10px] text-muted-foreground">avaliações</span>
            </div>
          </div>

          {/* Kid polaroid strip */}
          <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-6">
            {[
              { img: '/images/kid-girl.png', color: 'bg-blush', name: 'Aninha, 4 anos', tag: 'Vestido Floral', emoji: '👧' },
              { img: '/images/kid-boy.png', color: 'bg-sun', name: 'Bento, 5 anos', tag: 'Conjunto Verão', emoji: '👦' },
              { img: '/images/kid-baby.png', color: 'bg-mint', name: 'Léo, 1 ano', tag: 'Body Estampado', emoji: '👶' },
            ].map((k, i) => (
              <div
                key={i}
                className={`group relative ${k.color} rounded-3xl p-2 sticker-shadow transition-transform hover:-rotate-2 hover:scale-[1.02]`}
                style={{ transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/40">
                  <KidImage src={k.img} alt={k.name} emoji={k.emoji} />
                </div>
                <div className="px-2 py-1.5 text-center">
                  <p className="font-display text-xs font-bold text-plum sm:text-sm">{k.name}</p>
                  <p className="text-[10px] text-plum/60 sm:text-xs">{k.tag}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroImage({ src, alt }: { src: string; alt: string }) {
  const [ok, setOk] = useState(true)
  if (!ok) return <div className="aspect-[16/9] w-full flex items-center justify-center text-6xl bg-gradient-to-br from-sun/20 via-blush/10 to-sky/20">🎨</div>
  return (
    <>
      <div className="aspect-[16/9] w-full relative">
        <Image src={src} alt={alt} fill priority sizes="(max-width:1024px) 100vw, 1024px" className="object-cover" />
      </div>
      <img src={src} alt="" className="hidden" onError={() => setOk(false)} />
    </>
  )
}

function KidImage({ src, alt, emoji }: { src: string; alt: string; emoji: string }) {
  const [ok, setOk] = useState(true)
  if (!ok) return <div className="flex h-full w-full items-center justify-center text-6xl">{emoji}</div>
  return (
    <>
      <Image src={src} alt={alt} fill sizes="(max-width:768px) 33vw, 300px" className="object-cover" />
      <img src={src} alt="" className="hidden" onError={() => setOk(false)} />
    </>
  )
}