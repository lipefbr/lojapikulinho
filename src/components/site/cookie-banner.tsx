'use client'

import { useState, useEffect } from 'react'
import { X, Cookie } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const STORAGE_KEY = 'pijulinho-cookies-accepted'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const timer = setTimeout(() => setVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-out',
      visible ? 'translate-y-0' : 'translate-y-full'
    )}>
      <div className="mx-auto max-w-7xl px-4 pb-4">
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-border bg-white p-4 shadow-xl backdrop-blur sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-plum">
            <Cookie className="h-6 w-6 text-tangerine shrink-0" />
            <p>
              Usamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa{' '}
              <Link href="#" className="font-bold text-tangerine hover:underline">Política de Privacidade</Link>.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={accept}
              className="h-10 rounded-full bg-tangerine px-5 text-sm font-bold text-white transition-all hover:bg-grape hover:scale-105"
            >
              Aceitar
            </button>
            <button
              onClick={accept}
              className="h-10 w-10 grid place-items-center rounded-full border-2 border-border text-muted-foreground hover:bg-secondary transition-colors"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
