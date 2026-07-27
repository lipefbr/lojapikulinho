'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowUp, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const RADIUS = 20
const STROKE = 2.5
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function FloatingButtons() {
  const [showTop, setShowTop] = useState(false)
  const [scrollPercent, setScrollPercent] = useState(0)

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const percent = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0
    setScrollPercent(percent)
    setShowTop(scrollY > 400)
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(handleScroll)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const dashOffset = CIRCUMFERENCE * (1 - scrollPercent)

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3 lg:bottom-6 lg:right-6">
      {/* Back to top with progress ring */}
      <button
        onClick={scrollToTop}
        aria-label="Voltar ao topo"
        className={cn(
          'relative grid h-12 w-12 place-items-center rounded-full bg-white border-2 border-border shadow-lg transition-all duration-300 hover:bg-tangerine hover:border-tangerine hover:text-white hover:scale-110',
          showTop ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
        )}
      >
        <ArrowUp className="h-5 w-5" />
        <svg className="absolute inset-0 -rotate-90 pointer-events-none" width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r={RADIUS} fill="none" stroke="currentColor" strokeWidth={STROKE} className="text-border/50" />
          <circle cx="24" cy="24" r={RADIUS} fill="none" stroke="#FF7A45" strokeWidth={STROKE} strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset} className="transition-[stroke-dashoffset] duration-150 ease-out" />
        </svg>
      </button>

      {/* WhatsApp */}
      <div className="animate-bounce-in" style={{ animationDelay: '1s', opacity: 0, animationFillMode: 'forwards' }}>
        <a
          href="https://wa.me/5511999990000?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20os%20produtos%20da%20Pijulinho%20%F0%9F%A6%8A"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Fale conosco pelo WhatsApp"
          title="Fale conosco pelo WhatsApp! 💬"
          className="group relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        >
          <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
          <span className="pointer-events-none absolute -top-10 right-0 whitespace-nowrap rounded-xl bg-plum px-3 py-1.5 text-xs font-bold text-cream shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Fale conosco pelo WhatsApp! 💬
          </span>
        </a>
      </div>
    </div>
  )
}
