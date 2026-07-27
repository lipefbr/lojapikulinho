'use client'

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const STORAGE_KEY = "pijulinho-newsletter-dismissed"
const DISCOUNT_CODE = "BEMVINDO20"
const SHOW_DELAY_MS = 5000

export function NewsletterPopup() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true

    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed) return

    const timer = setTimeout(() => {
      setOpen(true)
    }, SHOW_DELAY_MS)

    return () => {
      clearTimeout(timer)
      mountedRef.current = false
    }
  }, [])

  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true")
    setOpen(false)
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!email.trim()) return

      setLoading(true)

      // Simulate API call
      setTimeout(() => {
        navigator.clipboard.writeText(DISCOUNT_CODE).catch(() => {
          // Clipboard API might fail in some contexts, that's okay
        })
        setSubmitted(true)
        setLoading(false)
      }, 800)
    },
    [email]
  )

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleDismiss()
    }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[420px] max-w-[calc(100%-2rem)] p-0 overflow-hidden border-0 bg-transparent shadow-none data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        onPointerDownOutside={handleDismiss}
        onEscapeKeyDown={handleDismiss}
      >
        {/* Floating decorative emojis */}
        <div className="absolute -top-3 -left-3 text-3xl animate-float select-none pointer-events-none z-10" style={{ animationDelay: "0s", '--rot': '-12deg' } as React.CSSProperties}>
          👗
        </div>
        <div className="absolute -top-2 -right-4 text-2xl animate-float select-none pointer-events-none z-10" style={{ animationDelay: "1.5s", '--rot': '15deg' } as React.CSSProperties}>
          🧸
        </div>
        <div className="absolute -bottom-2 -left-2 text-2xl animate-float select-none pointer-events-none z-10" style={{ animationDelay: "0.8s", '--rot': '8deg' } as React.CSSProperties}>
          ⭐
        </div>
        <div className="absolute -bottom-1 -right-3 text-3xl animate-float select-none pointer-events-none z-10" style={{ animationDelay: "2.2s", '--rot': '-10deg' } as React.CSSProperties}>
          🎁
        </div>

        {/* Main card */}
        <div className="relative rounded-3xl overflow-hidden sticker-shadow">
          {/* Gradient accent strip at top */}
          <div className="h-2 bg-gradient-to-r from-tangerine via-sun to-blush" />

          <div className="bg-cream px-6 pb-6 pt-5">
            {!submitted ? (
              <>
                <DialogHeader className="text-center mb-4">
                  <DialogTitle className="font-display text-xl sm:text-2xl text-plum leading-tight">
                    🎉 Ganhe 20% OFF na sua primeira compra!
                  </DialogTitle>
                  <DialogDescription className="text-plum/70 text-sm mt-2">
                    Cadastre seu e-mail e receba um cupom exclusivo.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <Input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl border-border/60 bg-white text-plum placeholder:text-plum/40 text-center text-base"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full h-11 bg-tangerine hover:bg-tangerine/90 text-white font-bold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      "Quero meu desconto!"
                    )}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="mx-auto mt-3 text-plum/50 hover:text-plum/70 text-xs underline-offset-2 hover:underline transition-colors"
                >
                  Talvez depois
                </button>
              </>
            ) : (
              <div className="animate-bounce-in text-center py-4">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="font-display text-lg text-plum font-bold mb-1">
                  Cupom <span className="text-gradient">{DISCOUNT_CODE}</span> copiado!
                </h3>
                <p className="text-plum/60 text-sm mb-4">
                  Use no checkout e aproveite 20% de desconto ✨
                </p>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full h-11 bg-grape hover:bg-grape/90 text-white font-bold rounded-full transition-colors text-sm sm:text-base"
                >
                  Vamos às compras! 🛒
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
