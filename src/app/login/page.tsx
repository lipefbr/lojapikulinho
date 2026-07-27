'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LogIn, UserPlus, ArrowRight, Lock, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/components/site/favorites-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MaskedInput } from '@/components/ui/masked-input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { maskCPF, maskPhone } from '@/lib/input-masks'
import { Rainbow, Sparkle, Smiley, Pencil, Cloud, ZigZag } from '@/components/site/doodles'
import { toast } from 'sonner'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const { user, refresh, loading } = useAuth()
  const router = useRouter()
  const sp = useSearchParams()
  const redirect = sp.get('redirect') || '/minha-conta'

  const [mode, setMode] = useState<Mode>('login')
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotSending, setForgotSending] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', cpf: '', phone: '',
  })

  useEffect(() => {
    if (!loading && user) router.replace(redirect)
  }, [user, loading, redirect, router])

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setError('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (mode === 'register' && form.password !== form.confirmPassword) {
      setError('As senhas não conferem')
      setSubmitting(false)
      return
    }
    if (mode === 'register' && form.password.length < 6) {
      setError('A senha deve ter ao menos 6 caracteres')
      setSubmitting(false)
      return
    }
    if (mode === 'login') {
      if (!form.email || !form.password) { setError('Preencha todos os campos'); setSubmitting(false); return }
    }

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, cpf: form.cpf || null, phone: form.phone || null }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }

      await refresh()
      toast.success(mode === 'login' ? 'Bem-vindo de volta! 💛' : 'Conta criada com sucesso! 🎉')
      router.push(redirect)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex relative overflow-hidden">
      {/* Gradient mesh background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-blush/20 blur-3xl" />
        <div className="absolute right-[20%] top-0 h-48 w-48 rounded-full bg-sun/20 blur-3xl" />
        <div className="absolute left-[30%] bottom-10 h-56 w-56 rounded-full bg-sky/15 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-grape/10 blur-3xl" />
      </div>

      {/* Floating emoji decorations (desktop only) */}
      <span className="pointer-events-none absolute left-[8%] top-[15%] hidden md:block text-3xl animate-float" style={{ animationDelay: '0s' }} aria-hidden="true">🔒</span>
      <span className="pointer-events-none absolute right-[12%] top-[10%] hidden md:block text-2xl animate-float-slow" style={{ animationDelay: '1.5s' }} aria-hidden="true">👶</span>
      <span className="pointer-events-none absolute left-[15%] bottom-[20%] hidden md:block text-3xl animate-float" style={{ animationDelay: '0.8s' }} aria-hidden="true">👕</span>
      <span className="pointer-events-none absolute right-[8%] bottom-[25%] hidden md:block text-2xl animate-float-slow" style={{ animationDelay: '2s' }} aria-hidden="true">🌟</span>
      <span className="pointer-events-none absolute left-[45%] top-[8%] hidden md:block text-2xl animate-float" style={{ animationDelay: '1.2s' }} aria-hidden="true">💝</span>

      {/* Left form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8 relative z-10">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-tangerine text-white text-2xl shadow-md rotate-3">🦊</span>
            <span className="font-display text-2xl font-bold text-plum">Piju<span className="text-tangerine">linho</span></span>
          </Link>

          <div className="animate-bounce-in rounded-[2rem] border-2 border-border bg-white p-6 sm:p-8 sticker-shadow">
            {/* Mode toggle */}
            <div className="flex rounded-full bg-secondary p-1">
              <button
                onClick={() => { setMode('login'); setError('') }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold transition-all ${
                  mode === 'login' ? 'bg-plum text-cream' : 'text-plum hover:text-plum'
                }`}
              >
                <LogIn className="h-4 w-4" /> Entrar
              </button>
              <button
                onClick={() => { setMode('register'); setError('') }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold transition-all ${
                  mode === 'register' ? 'bg-plum text-cream' : 'text-plum hover:text-plum'
                }`}
              >
                <UserPlus className="h-4 w-4" /> Criar conta
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="mt-5 space-y-4">
              {mode === 'register' && (
                <div>
                  <Label>Nome completo *</Label>
                  <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Seu nome" className="mt-1.5" />
                </div>
              )}
              <div>
                <Label>E-mail *</Label>
                <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="seu@email.com" className="mt-1.5" />
              </div>
              <div>
                <Label>Senha *</Label>
                <div className="relative mt-1.5">
                  <Input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : 'Sua senha'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-plum"
                    aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {mode === 'register' && (
                <>
                  <div>
                    <Label>Confirmar senha *</Label>
                    <Input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Repita a senha" className="mt-1.5" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>CPF <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                      <MaskedInput mask={maskCPF} value={form.cpf} onChange={(raw) => update('cpf', raw)} placeholder="000.000.000-00" className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Telefone <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                      <MaskedInput mask={maskPhone} value={form.phone} onChange={(raw) => update('phone', raw)} placeholder="(00) 00000-0000" className="mt-1.5" />
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-full bg-tangerine text-base font-bold text-white hover:bg-grape sticker-shadow"
              >
                {submitting ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar minha conta'}
              </Button>
            </form>

            {mode === 'login' && (
              <div className="mt-4 text-center">
                <button onClick={() => { setForgotOpen(true); setForgotSent(false); setForgotEmail(''); }} className="text-sm text-muted-foreground hover:text-tangerine">
                  Esqueci minha senha
                </button>
                <p className="mt-3 text-sm text-muted-foreground">
                  Não tem conta?{' '}
                  <button onClick={() => setMode('register')} className="font-bold text-tangerine hover:underline">
                    Cadastre-se aqui
                  </button>
                </p>
              </div>
            )}
            {mode === 'register' && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Já tem conta?{' '}
                <button onClick={() => setMode('login')} className="font-bold text-tangerine hover:underline">
                  Entrar
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right panel (desktop only) */}
      <div className="relative z-10 hidden lg:flex lg:w-[45%] items-center justify-center overflow-hidden bg-gradient-to-br from-grape via-tangerine to-sun p-12">
        <Smiley className="pointer-events-none absolute left-12 top-12 h-16 w-16 text-sun/30 animate-float" />
        <Pencil className="pointer-events-none absolute right-12 top-24 h-12 w-12 text-cream/30 rotate-12" />
        <Sparkle className="pointer-events-none absolute left-20 bottom-20 h-10 w-10 text-cream/30 animate-float-slow" />
        <Cloud className="pointer-events-none absolute right-16 bottom-16 h-20 w-28 text-cream/15" />
        <Rainbow className="pointer-events-none absolute left-1/3 bottom-8 h-12 w-32 text-cream/20" />

        <div className="relative text-center text-white max-w-sm">
          <span className="text-7xl">🦊</span>
          <h2 className="mt-6 font-display text-3xl font-bold">Bem-vindo à família Pijulinho!</h2>
          <p className="mt-3 text-cream/90 leading-relaxed">
            Vista seus pequenos com alegria e estilo colorido.
          </p>
          <div className="mt-6 space-y-3 text-sm">
            {['🎁 20% de desconto na 1ª compra', '🚚 Frete grátis acima de R$199', '🔄 Troca fácil em 30 dias'].map((b) => (
              <p key={b} className="bg-white/15 rounded-full px-4 py-2 inline-block backdrop-blur">{b}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={(open) => { setForgotOpen(open); if (!open) { setForgotSent(false); setForgotEmail(''); } }}>
        <DialogContent className="rounded-3xl max-w-sm mx-auto p-6 sm:p-8">
          {forgotSent ? (
            <div className="flex flex-col items-center text-center py-4">
              <div className="animate-in zoom-in-50 duration-500">
                <CheckCircle2 className="h-16 w-16 text-mint" strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-plum">E-mail enviado!</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Enviamos um e-mail para <span className="font-semibold text-plum">{forgotEmail}</span> com instruções para redefinir sua senha.
              </p>
              <button
                onClick={() => setForgotOpen(false)}
                className="mt-6 text-sm font-bold text-tangerine hover:underline"
              >
                Voltar ao login
              </button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-plum">
                  <Lock className="h-5 w-5 text-tangerine" />
                  Recuperar senha
                </DialogTitle>
                <DialogDescription className="text-muted-foreground leading-relaxed">
                  Informe o e-mail cadastrado na sua conta. Enviaremos um link para você redefinir sua senha.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-5 space-y-4">
                <div>
                  <Label>E-mail *</Label>
                  <Input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="mt-1.5"
                    disabled={forgotSending}
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
                      toast.error('Por favor, informe um e-mail válido')
                      return
                    }
                    setForgotSending(true)
                    // Simulated flow
                    await new Promise((r) => setTimeout(r, 1500))
                    setForgotSending(false)
                    setForgotSent(true)
                  }}
                  disabled={forgotSending}
                  className="w-full h-12 rounded-full bg-tangerine text-base font-bold text-white hover:bg-grape sticker-shadow"
                >
                  {forgotSending ? 'Enviando...' : 'Enviar link'}
                </Button>
                <button
                  onClick={() => setForgotOpen(false)}
                  className="block w-full text-center text-sm text-muted-foreground hover:text-tangerine"
                >
                  Voltar ao login
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
