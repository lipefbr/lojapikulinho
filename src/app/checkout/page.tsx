'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CreditCard, QrCode, FileText, CheckCircle, Truck, ShieldCheck, Lock, Eye, Globe, BadgeCheck, Barcode } from 'lucide-react'
import { useCart } from '@/lib/cart-store'
import { useAuth } from '@/components/site/favorites-provider'
import { formatBRL } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MaskedInput } from '@/components/ui/masked-input'
import { Label } from '@/components/ui/label'
import { maskCPF, maskPhone, maskCEP } from '@/lib/input-masks'
import { RadioGroup } from '@/components/ui/radio-group'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { GiftOptions } from '@/components/site/gift-options'
import type { GiftData } from '@/components/site/gift-options'
import { LoyaltyPointsEarned } from '@/components/site/loyalty-badge'
const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RO','RR','RS','SC','SP','SE','TO']

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-tangerine border-t-transparent" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}

function CheckoutContent() {
  const { items, coupon, subtotal, discount, clear, setOpen } = useCart()
  const { user, addresses } = useAuth()
  const router = useRouter()
  const sp = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(sp.get('ok') || null)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [activeStep, setActiveStep] = useState(1)
  const contactRef = useRef<HTMLDivElement>(null)
  const addressRef = useRef<HTMLDivElement>(null)
  const paymentRef = useRef<HTMLDivElement>(null)

  const [giftData, setGiftData] = useState<GiftData>({ wrapId: 'none', wrapPrice: 0, cardId: 'none', message: '' })

  const shipping = subtotal() >= 199 ? 0 : 19.9
  const total = subtotal() - discount() + shipping + giftData.wrapPrice

  const [form, setForm] = useState({
    name: '', email: '', cpf: '', phone: '',
    recipient: '', zip: '', street: '', number: '', complement: '', district: '', city: '', state: '',
    useSavedAddress: false,
  })
  const [paymentMethod, setPaymentMethod] = useState('pix')

  useEffect(() => { queueMicrotask(() => setMounted(true)) }, [])

  useEffect(() => {
    if (user && mounted) {
      setForm((f) => ({
        ...f,
        name: user.name || '',
        email: user.email || '',
        cpf: user.cpf || '',
        phone: user.phone || '',
        recipient: user.name || '',
        useSavedAddress: addresses.length > 0,
      }))
    }
  }, [user, addresses, mounted])

  useEffect(() => { if (sp.get('ok')) setOrderId(sp.get('ok')) }, [sp])

  function updateForm(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  // IntersectionObserver for step tracking
  const sectionRefs = [
    { ref: contactRef, step: 1 },
    { ref: addressRef, step: 2 },
    { ref: paymentRef, step: 3 },
  ]

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    sectionRefs.forEach(({ ref, step }) => {
      if (!ref.current) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveStep(step)
          }
        },
        { threshold: 0.4 }
      )
      observer.observe(ref.current)
      observers.push(observer)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  // Mark steps as completed when fields are filled
  useEffect(() => {
    const newCompleted = new Set<number>()
    if (form.name.trim() && form.email.trim() && form.cpf.trim()) {
      newCompleted.add(1)
    }
    if (form.recipient.trim() && form.street.trim() && form.number.trim() && form.zip.trim() && form.city.trim() && form.state.trim()) {
      newCompleted.add(2)
    }
    if (paymentMethod) {
      newCompleted.add(3)
    }
    setCompletedSteps(newCompleted)
  }, [form, paymentMethod])

  function loadSavedAddress(id: string) {
    const addr = addresses.find((a) => a.id === id)
    if (addr) {
      setForm((f) => ({
        ...f,
        recipient: addr.recipient, street: addr.street, number: addr.number,
        complement: addr.complement || '', district: addr.district, city: addr.city,
        state: addr.state, zip: addr.zip,
      }))
    }
  }

  function validate() {
    if (!form.name.trim()) { toast.error('Informe seu nome'); return false }
    if (!form.email.trim() || !form.email.includes('@')) { toast.error('Informe um e-mail válido'); return false }
    if (!form.cpf.trim() || form.cpf.replace(/\D/g, '').length < 11) { toast.error('Informe um CPF válido'); return false }
    if (!form.recipient.trim()) { toast.error('Informe o destinatário'); return false }
    if (!form.street.trim()) { toast.error('Informe a rua'); return false }
    if (!form.number.trim()) { toast.error('Informe o número'); return false }
    if (!form.district.trim()) { toast.error('Informe o bairro'); return false }
    if (!form.city.trim()) { toast.error('Informe a cidade'); return false }
    if (!form.state.trim()) { toast.error('Informe o estado'); return false }
    if (!form.zip.trim()) { toast.error('Informe o CEP'); return false }
    return true
  }

  async function submit() {
    if (items.length === 0) { toast.error('Carrinho vazio'); return }
    if (!validate()) return

    setSubmitting(true)
    try {
      const payload = {
        items: items.map((it) => ({
          productId: it.productId, name: it.name, price: it.price,
          quantity: it.quantity, size: it.size, color: it.color, image: it.image,
        })),
        subtotal: subtotal(), discount: discount(), shipping, total,
        couponCode: coupon?.code || null, paymentMethod,
        guestEmail: user ? null : form.email,
        address: {
          recipient: form.recipient, street: form.street, number: form.number,
          complement: form.complement || null, district: form.district,
          city: form.city, state: form.state, zip: form.zip, label: 'Entrega',
        },
      }
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.error) { toast.error(data.error); return }
      const oid = data.order?.id
      clear()
      toast.success('Pedido confirmado! 🎉')
      const params = new URLSearchParams({ pedido: oid, total: formatBRL(total) })
      router.push(`/pedido-confirmado?${params}`)
    } catch {
      toast.error('Erro ao processar pedido. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) return <CheckoutSkeleton />

  if (orderId) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-mint text-5xl">🎉</div>
          <h1 className="mt-6 font-display text-3xl font-bold text-plum">Pedido confirmado!</h1>
          <p className="mt-2 text-plum/70">Obrigado por comprar com a gente. Seu pedido <strong>#{orderId.slice(-8)}</strong> foi recebido.</p>
          <p className="mt-1 text-sm text-muted-foreground">Você receberá um e-mail com os detalhes.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="bg-tangerine rounded-full"><Link href="/produtos">Continuar comprando</Link></Button>
            {user && (
              <Button asChild variant="outline" className="rounded-full border-2"><Link href="/minha-conta?tab=pedidos">Meus pedidos</Link></Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0 && !orderId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-cream px-4 text-center">
        <span className="text-6xl">🧺</span>
        <h1 className="mt-4 font-display text-2xl font-bold text-plum">Seu carrinho está vazio</h1>
        <Button asChild className="mt-4 bg-tangerine rounded-full"><Link href="/produtos">Ver produtos</Link></Button>
      </div>
    )
  }

  const pixCode = `00020126580014br.gov.bcb.pix0136${Date.now().toString(36)}5204000053039865802BR5925PIJULINHO LTDA6009SAOPAULO62070503***63041D3D`

  return (
    <div className="animate-page-enter bg-cream min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-plum">Início</Link><span>/</span>
          <Link href="/carrinho" className="hover:text-plum">Carrinho</Link><span>/</span>
          <span className="font-bold text-plum">Checkout</span>
        </div>

        {/* Hero Banner */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-grape via-plum to-grape p-5 sm:p-6 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #FFD23F 1px, transparent 1px), radial-gradient(circle at 80% 50%, #FF6B35 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          <h1 className="font-display text-2xl font-bold sm:text-3xl relative z-10">
            🛒 Finalizar compra
          </h1>
          <p className="mt-1 text-sm text-white/80 relative z-10">Quase lá! Revise seus dados e finalize o pedido</p>
        </div>

        {/* Step indicator - dynamic with completion tracking */}
        <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4 rounded-2xl bg-white border-2 border-border p-4">
          {[
            { step: 1, label: 'Dados', icon: '📋' },
            { step: 2, label: 'Endereço', icon: '📍' },
            { step: 3, label: 'Pagamento', icon: '💳' },
            { step: 4, label: 'Confirmar', icon: '✅' },
          ].map((s) => {
            const isComplete = completedSteps.has(s.step)
            const isActive = activeStep === s.step
            return (
              <div key={s.step} className="flex items-center gap-2">
                <div className={cn(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg font-bold transition-all duration-500 ease-out',
                  isComplete && 'bg-mint text-white scale-110',
                  !isComplete && isActive && 'bg-tangerine text-white scale-105 ring-4 ring-tangerine/20',
                  !isComplete && !isActive && 'bg-secondary text-plum'
                )}>
                  {isComplete ? <CheckCircle className="h-5 w-5" /> : s.icon}
                </div>
                <span className={cn(
                  'text-sm font-semibold hidden sm:inline transition-colors duration-500',
                  isComplete && 'text-mint',
                  !isComplete && isActive && 'text-tangerine',
                  !isComplete && !isActive && 'text-plum/50'
                )}>
                  {s.label}
                </span>
                {s.step < 4 && (
                  <div className={cn(
                    'hidden h-4 w-6 border-b-2 border-dashed sm:block transition-colors duration-500',
                    completedSteps.has(s.step) ? 'border-mint' : 'border-muted-foreground/30'
                  )} />
                )}
              </div>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <section ref={contactRef} className="overflow-hidden rounded-3xl bg-white border-2 border-border">
              <div className="h-1 rounded-t-3xl bg-gradient-to-r from-tangerine to-sun" />
              <div className="p-6">
              <h2 className="font-display text-xl font-bold text-plum">Seus dados</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div><Label>Nome completo *</Label><Input value={form.name} onChange={(e) => updateForm('name', e.target.value)} /></div>
                <div><Label>E-mail *</Label><Input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} /></div>
                <div><Label>CPF *</Label><MaskedInput mask={maskCPF} value={form.cpf} onChange={(raw) => updateForm('cpf', raw)} placeholder="000.000.000-00" /></div>
                <div><Label>Telefone</Label><MaskedInput mask={maskPhone} value={form.phone} onChange={(raw) => updateForm('phone', raw)} placeholder="(00) 00000-0000" /></div>
              </div>
              </div>
            </section>

            {/* Address */}
            <section ref={addressRef} className="overflow-hidden rounded-3xl bg-white border-2 border-border">
              <div className="h-1 rounded-t-3xl bg-gradient-to-r from-tangerine to-sun" />
              <div className="p-6">
              <h2 className="font-display text-xl font-bold text-plum">Endereço de entrega</h2>
              {addresses.length > 0 && (
                <div className="mt-3 space-y-2">
                  <RadioGroup value={form.useSavedAddress ? 'saved' : 'new'} onValueChange={(v) => setForm((f) => ({ ...f, useSavedAddress: v === 'saved' }))}>
                    {addresses.map((a) => (
                      <label key={a.id} className="flex items-center gap-3 cursor-pointer rounded-2xl border-2 border-border p-3 hover:border-tangerine/40 transition-colors">
                        <input type="radio" name="savedAddr" value={a.id} className="accent-plum" onChange={() => loadSavedAddress(a.id)} defaultChecked={a.isDefault} />
                        <div className="text-sm"><p className="font-bold">{a.label}: {a.recipient}</p><p className="text-muted-foreground">{a.street}, {a.number} — {a.city}/{a.state}</p></div>
                      </label>
                    ))}
                    <label className="flex items-center gap-3 cursor-pointer rounded-2xl border-2 border-dashed border-border p-3">
                      <input type="radio" name="savedAddr" value="new" className="accent-plum" onChange={() => setForm((f) => ({ ...f, useSavedAddress: false }))} />
                      <span className="text-sm font-semibold">Usar outro endereço</span>
                    </label>
                  </RadioGroup>
                </div>
              )}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div><Label>Destinatário *</Label><Input value={form.recipient} onChange={(e) => updateForm('recipient', e.target.value)} /></div>
                <div><Label>CEP *</Label><MaskedInput mask={maskCEP} value={form.zip} onChange={(raw) => updateForm('zip', raw)} /></div>
                <div className="sm:col-span-2"><Label>Rua *</Label><Input value={form.street} onChange={(e) => updateForm('street', e.target.value)} /></div>
                <div><Label>Número *</Label><Input value={form.number} onChange={(e) => updateForm('number', e.target.value)} /></div>
                <div><Label>Complemento</Label><Input value={form.complement} onChange={(e) => updateForm('complement', e.target.value)} /></div>
                <div><Label>Bairro *</Label><Input value={form.district} onChange={(e) => updateForm('district', e.target.value)} /></div>
                <div><Label>Cidade *</Label><Input value={form.city} onChange={(e) => updateForm('city', e.target.value)} /></div>
                <div>
                  <Label>Estado *</Label>
                  <Select value={form.state} onValueChange={(v) => updateForm('state', v)}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>{UFS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              </div>
            </section>

            {/* Payment */}
            <section ref={paymentRef} className="overflow-hidden rounded-3xl bg-white border-2 border-border">
              <div className="h-1 rounded-t-3xl bg-gradient-to-r from-tangerine to-sun" />
              <div className="p-6">
              <h2 className="font-display text-xl font-bold text-plum">Forma de pagamento</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { value: 'pix', icon: Barcode, label: 'Pix', desc: '5% OFF', color: 'text-mint', gradient: 'from-mint/10 to-sky/5', helper: '5% de desconto • Aprovação instantânea' },
                  { value: 'cartao', icon: CreditCard, label: 'Cartão', desc: 'Até 6x', color: 'text-sky', gradient: 'from-sky/10 to-grape/5', helper: 'Até 6x sem juros • Proteção comprador' },
                  { value: 'boleto', icon: FileText, label: 'Boleto', desc: '1x', color: 'text-tangerine', gradient: 'from-tangerine/10 to-sun/5', helper: '1-2 dias para compensar • Sem juros' },
                ].map((p) => {
                  const isSelected = paymentMethod === p.value
                  return (
                  <label key={p.value} className={cn(
                    'group/card flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all duration-300 hover:scale-[1.02]',
                    isSelected
                      ? `border-tangerine bg-gradient-to-br ${p.gradient} scale-[1.02] shadow-md shadow-tangerine/10`
                      : 'border-border hover:border-tangerine/40 hover:bg-secondary/50'
                  )}>
                    <input type="radio" value={p.value} className="sr-only" />
                    <div className="relative">
                      <p.icon className={cn('h-8 w-8 transition-transform duration-300', isSelected && 'scale-110', p.color)} />
                      {isSelected && (
                        <span className="animate-check-pop absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-mint text-white">
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-plum text-sm">{p.label}</span>
                    <span className="text-xs text-muted-foreground">{p.desc}</span>
                    <span className="text-[10px] text-muted-foreground/70 text-center leading-tight">{p.helper}</span>
                  </label>
                  )
                })}
              </RadioGroup>

              {paymentMethod === 'pix' && (
                <div className="mt-4 rounded-2xl border-2 border-dashed border-mint/40 bg-mint/5 p-6 text-center">
                  <QrCode className="mx-auto h-10 w-10 text-mint" />
                  <h3 className="mt-2 font-display font-bold text-plum">Pague com Pix</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Escaneie o QR Code ou copie o código abaixo:</p>
                  <div className="mt-3 rounded-xl bg-white border border-border p-3 text-xs font-mono break-all text-plum max-h-20 overflow-y-auto scroll-pretty">
                    {pixCode}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2 rounded-full" onClick={() => { navigator.clipboard.writeText(pixCode); toast.success('Código copiado!') }}>
                    Copiar código
                  </Button>
                </div>
              )}
              {paymentMethod === 'cartao' && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2"><Label>Número do cartão</Label><Input placeholder="0000 0000 0000 0000" /></div>
                  <div><Label>Nome impresso</Label><Input placeholder="NOME NO CARTAO" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Validade</Label><Input placeholder="MM/AA" /></div>
                    <div><Label>CVV</Label><Input placeholder="000" /></div>
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Parcelas</Label>
                    <Select defaultValue="1">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6].map((i) => (
                          <SelectItem key={i} value={String(i)}>{i}x de {formatBRL(total / i)} {i > 1 ? 'sem juros' : 'à vista'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {paymentMethod === 'boleto' && (
                <div className="mt-4 rounded-2xl border-2 border-dashed border-tangerine/40 bg-tangerine/5 p-6 text-center">
                  <FileText className="mx-auto h-10 w-10 text-tangerine" />
                  <h3 className="mt-2 font-display font-bold text-plum">Boleto bancário</h3>
                  <p className="mt-1 text-sm text-muted-foreground">O boleto será gerado após a confirmação do pedido.</p>
                  <p className="mt-1 text-xs text-muted-foreground">Vencimento: 3 dias úteis. Prazo de baixa: 1-2 dias úteis.</p>
                </div>
              )}
              </div>
            </section>

            {/* Security section */}
            <section className="rounded-3xl bg-white border-2 border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-6 w-6 text-mint" />
                <h2 className="font-display text-xl font-bold text-plum">Comprando com segurança</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-mint/10">
                    <Lock className="h-5 w-5 text-mint" />
                  </div>
                  <span className="text-xs font-semibold text-plum">SSL Seguro</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky/10">
                    <Eye className="h-5 w-5 text-sky" />
                  </div>
                  <span className="text-xs font-semibold text-plum">Dados Protegidos</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-tangerine/10">
                    <BadgeCheck className="h-5 w-5 text-tangerine" />
                  </div>
                  <span className="text-xs font-semibold text-plum">Loja Verificada</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-grape/10">
                    <Globe className="h-5 w-5 text-grape" />
                  </div>
                  <span className="text-xs font-semibold text-plum">Google Safe</span>
                </div>
              </div>
            </section>

            {/* Gift Options */}
            <section className="mt-6 overflow-hidden rounded-3xl bg-white border-2 border-border p-6">
              <GiftOptions onChange={setGiftData} />
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-36 rounded-3xl bg-white border-2 border-border p-6 sticker-shadow">
              <h3 className="font-display text-xl font-bold text-plum">Resumo</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="space-y-2 max-h-48 overflow-y-auto scroll-pretty">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-secondary">
                        <Image src={it.image} alt={it.name} fill className="object-cover" sizes="40px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-plum">{it.name}</p>
                        <p className="text-xs text-muted-foreground">{it.quantity}x {formatBRL(it.price)}</p>
                      </div>
                      <span className="text-sm font-bold">{formatBRL(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatBRL(subtotal())}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Frete</span><span className={shipping === 0 ? 'text-mint font-semibold' : ''}>{shipping === 0 ? 'Grátis' : formatBRL(shipping)}</span></div>
                {discount() > 0 && (
                  <div className="flex justify-between text-mint font-semibold"><span>Desconto</span><span>-{formatBRL(discount())}</span></div>
                )}
                {giftData.wrapPrice > 0 && (
                  <div className="flex justify-between text-grape font-semibold"><span>🎁 Embrulho presente</span><span>+{formatBRL(giftData.wrapPrice)}</span></div>
                )}
                <Separator />
                <div className="flex justify-between text-lg"><span className="font-bold">Total</span><span className="font-extrabold text-plum">{formatBRL(total)}</span></div>
                <p className="text-xs text-muted-foreground">
                  ou 3x de {formatBRL(total / 3)} sem juros
                </p>
                {/* Loyalty points */}
                <LoyaltyPointsEarned subtotal={subtotal()} />
              </div>

              <Button
                onClick={submit}
                disabled={submitting}
                className="mt-5 w-full h-12 rounded-full bg-tangerine text-base font-bold text-white hover:bg-grape sticker-shadow transition-all duration-300 hover:shadow-lg hover:shadow-tangerine/25"
              >
                <Lock className={cn("h-4 w-4 mr-2 transition-transform duration-300", submitting && "animate-pulse")} />
                {submitting ? 'Processando...' : 'Finalizar pedido'}
              </Button>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-mint" /> Seguro</span>
                <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-sky" /> Rápido</span>
              </div>

              {/* Garantia Pijulinho badge */}
              <div className="mt-4 rounded-2xl bg-gradient-to-r from-mint/10 to-sky/10 border border-mint/20 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <p className="font-display text-sm font-bold text-plum">Garantia Pijulinho</p>
                    <p className="text-xs text-muted-foreground">Compra garantida — Troca grátis em 30 dias</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckoutSkeleton() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div className="h-8 w-48 skeleton-shimmer rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-white border-2 border-border p-6 h-48" />
            <div className="rounded-3xl bg-white border-2 border-border p-6 h-64" />
            <div className="rounded-3xl bg-white border-2 border-border p-6 h-48" />
          </div>
          <div className="rounded-3xl bg-white border-2 border-border p-6 h-80" />
        </div>
      </div>
    </div>
  )
}
