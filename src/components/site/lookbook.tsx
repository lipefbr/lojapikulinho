'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkle, Heart, ArrowRight, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LookbookItem {
  id: string
  title: string
  description: string
  image: string
  tags: string[]
  productCount: number
  gradient: string
}

const LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: 'summer-fun',
    title: 'Verão Divertido',
    description: 'Looks frescos e coloridos para os dias quentes 🌞',
    image: '/images/kid-girl.png',
    tags: ['Conjunto Verão', 'Shorts', 'Camiseta'],
    productCount: 4,
    gradient: 'from-tangerine/90 to-sun/90',
  },
  {
    id: 'winter-cozy',
    title: 'Inverno Aconchegante',
    description: 'Moletom, jaquetas e muito conforto ❄️',
    image: '/images/kid-boy.png',
    tags: ['Moletom', 'Jaqueta', 'Leg'],
    productCount: 3,
    gradient: 'from-grape/90 to-sky/90',
  },
  {
    id: 'party-style',
    title: 'Estilo de Festa',
    description: 'Vestidos e conjuntos especiais para celebrar 🎉',
    image: '/images/kid-baby.png',
    tags: ['Vestido', 'Conjunto', 'Acessórios'],
    productCount: 5,
    gradient: 'from-blush/90 to-grape/90',
  },
  {
    id: 'sleep-time',
    title: 'Hora do Sono',
    description: 'Pijamas fofos para sonhos doces 🌙',
    image: '/images/why-choose.png',
    tags: ['Pijama', 'Conjunto', 'Camisola'],
    productCount: 3,
    gradient: 'from-sky/90 to-mint/90',
  },
]

export function LookbookSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % LOOKBOOK_ITEMS.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused])

  const active = LOOKBOOK_ITEMS[activeIndex]

  return (
    <section className="py-12">
      <div className="flex items-center gap-2 mb-6">
        <Sparkle className="h-5 w-5 text-tangerine" />
        <h2 className="font-display text-2xl font-bold text-plum sm:text-3xl">
          Inspiração do Dia
        </h2>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="relative aspect-[16/9] sm:aspect-[3/1] lg:aspect-[4/1] overflow-hidden"
          >
            {/* Background */}
            <div className={cn('absolute inset-0 bg-gradient-to-r', active.gradient)}>
              <div className="absolute inset-0 bg-[url('/images/dot-pattern.svg')] opacity-10" />
            </div>

            {/* Image on the right */}
            <div className="absolute right-0 top-0 h-full w-1/3 sm:w-1/2 lg:w-2/5">
              <Image
                src={active.image}
                alt={active.title}
                fill
                className="object-cover object-top opacity-60"
                priority={false}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
              <div className={cn('absolute inset-0 bg-gradient-to-r', active.gradient, 'to-transparent opacity-60')} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-10 lg:px-16 py-8 max-w-lg">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="font-display text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
                  {active.title}
                </h3>
                <p className="mt-2 text-sm text-white/80 sm:text-base">
                  {active.description}
                </p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {active.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href="/produtos"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-plum shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  Ver {active.productCount} produtos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>

            {/* Decorative floating elements */}
            <div className="absolute left-[10%] top-[15%] opacity-20">
              <Heart className="h-8 w-8 text-white animate-float" />
            </div>
            <div className="absolute right-[35%] bottom-[20%] opacity-20">
              <Sparkle className="h-6 w-6 text-white animate-float-slow" style={{ animationDelay: '1s' } as React.CSSProperties} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {LOOKBOOK_ITEMS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === activeIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/70'
              )}
              aria-label={`Lookbook ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
