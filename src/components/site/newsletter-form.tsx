'use client'

import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [shakeError, setShakeError] = useState(false)

  function validateEmail(e: string): boolean {
    if (!e) { setErrorMsg('Informe seu e-mail'); triggerShake(); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setErrorMsg('E-mail inválido'); triggerShake(); return false }
    setErrorMsg('')
    return true
  }

  function triggerShake() {
    setShakeError(true)
    setTimeout(() => setShakeError(false), 500)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateEmail(email)) return

    setStatus('loading')
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800))
    setStatus('success')
    toast.success('Inscrição confirmada! 🎉 Confira sua caixa de entrada.')
    setTimeout(() => {
      setEmail('')
      setStatus('idle')
    }, 4000)
  }

  if (status === 'success') {
    return (
      <div className="mt-4 flex items-center gap-2">
        <span className="animate-success-bounce grid h-10 w-10 place-items-center rounded-full bg-mint text-white shadow-lg shadow-mint/30">
          <CheckCircle className="h-5 w-5" />
        </span>
        <span className="text-sm font-semibold text-mint">
          Inscrito com sucesso! <span className="inline-block animate-bounce-in">🎉</span>
        </span>
      </div>
    )
  }

  return (
    <form className="mt-4" onSubmit={submit}>
      <div className="flex items-center gap-2">
        <label className="text-xs font-bold uppercase tracking-wide text-cream/60">Newsletter</label>
        <span className="relative flex h-2 w-2">
          <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-mint" />
        </span>
        <span className="text-[10px] text-mint/70 font-medium">Ao vivo</span>
      </div>
      <div className="mt-2 flex gap-2">
        <div className={cn('relative flex-1', shakeError && 'animate-shake')}>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errorMsg) setErrorMsg('')
            }}
            onBlur={() => email && validateEmail(email)}
            placeholder="Seu e-mail"
            disabled={status === 'loading'}
            className={cn(
              'h-10 w-full rounded-full border-0 bg-white/10 px-4 pr-3 text-sm text-cream placeholder:text-cream/50 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-sun',
              errorMsg && 'ring-2 ring-destructive',
              'disabled:opacity-50'
            )}
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-r from-tangerine to-grape text-white shadow-md transition-all hover:scale-105 hover:shadow-lg hover:shadow-tangerine/25 active:scale-95 disabled:opacity-50"
          aria-label="Inscrever"
        >
          <Send className={cn('h-4 w-4', status === 'loading' && 'animate-pulse')} />
        </button>
      </div>
      {/* Helper text */}
      <p className="mt-2 text-[11px] text-cream/50 font-medium">
        Ofertas exclusivas para a criançada 🎨
      </p>
      {/* Social proof */}
      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-cream/40">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-mint opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-mint" />
        </span>
        <span><strong className="text-cream/60">12.3k</strong> pessoas assinaram esta semana</span>
      </div>
      {/* Inline validation message */}
      {errorMsg && (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive animate-slide-up">
          <AlertCircle className="h-3 w-3" />
          {errorMsg}
        </p>
      )}
      {!errorMsg && (
        <p className="mt-1.5 text-[10px] text-cream/40">
          Receba ofertas exclusivas e novidades por e-mail.
        </p>
      )}
    </form>
  )
}
