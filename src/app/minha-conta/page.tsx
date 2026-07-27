'use client'

import { useEffect, useState, Suspense, Fragment } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, MapPin, Heart, User, LogOut, Plus, Trash2, Star, Bell,
  ChevronRight, ChevronDown, Calendar, CreditCard, CheckCircle, Clock, Truck, Box, CircleCheck, RefreshCw
} from 'lucide-react'
import { useAuth } from '@/components/site/favorites-provider'
import { useCart } from '@/lib/cart-store'
import { formatBRL } from '@/lib/types'
import { ProductCard, type ProductCardData } from '@/components/site/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MaskedInput } from '@/components/ui/masked-input'
import { Label } from '@/components/ui/label'
import { maskCEP } from '@/lib/input-masks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Sparkle } from '@/components/site/doodles'
import { LoyaltyBadge } from '@/components/site/loyalty-badge'

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RO','RR','RS','SC','SP','SE','TO']

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: 'bg-sun text-plum', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-mint text-white', icon: CheckCircle },
  processing: { label: 'Processando', color: 'bg-sky text-white', icon: Package },
  shipped: { label: 'Enviado', color: 'bg-grape text-white', icon: Truck },
  delivered: { label: 'Entregue', color: 'bg-tangerine text-white', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: Clock },
}

const TIMELINE_STEPS = [
  { label: 'Pedido confirmado', icon: CheckCircle },
  { label: 'Processando', icon: RefreshCw },
  { label: 'Em separação', icon: Box },
  { label: 'Enviado', icon: Truck },
  { label: 'Entregue', icon: CircleCheck },
]

function getOrderStepInfo(status: string) {
  switch (status) {
    case 'pending': return { completedUpTo: 0, activeStep: 1 }
    case 'confirmed': return { completedUpTo: 1, activeStep: null }
    case 'processing': return { completedUpTo: 1, activeStep: 2 }
    case 'shipped': return { completedUpTo: 3, activeStep: 4 }
    case 'delivered': return { completedUpTo: 5, activeStep: null }
    default: return { completedUpTo: 0, activeStep: 1 }
  }
}



type NotifyEntry = { email: string; date: string; productId: string }

function parseNotifyStorage(raw: string | null): NotifyEntry[] {
  if (!raw) return []
  try {
    const obj = JSON.parse(raw) as Record<string, string | { email: string; date: string }>
    return Object.entries(obj).map(([productId, val]) => {
      if (typeof val === 'string') {
        return { email: val, date: '', productId }
      }
      return { email: val.email, date: val.date || '', productId }
    })
  } catch {
    return []
  }
}

function OrderTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 px-1 py-2 text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">Pedido cancelado</span>
      </div>
    )
  }
  const { completedUpTo, activeStep } = getOrderStepInfo(status)
  return (
    <div className="flex items-center justify-between px-1 py-2">
      {TIMELINE_STEPS.map((step, idx) => {
        const stepNum = idx + 1
        const isCompleted = stepNum <= completedUpTo
        const isActive = stepNum === activeStep
        const StepIcon = step.icon
        return (
          <Fragment key={stepNum}>
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className={cn(
                'flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 transition-all duration-300',
                isCompleted && 'border-mint bg-mint text-white scale-100',
                isActive && 'border-tangerine bg-tangerine text-white scale-110 shadow-md shadow-tangerine/30',
                !isCompleted && !isActive && 'border-muted-foreground/25 text-muted-foreground/40 bg-white',
              )}>
                <StepIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                stepNum < completedUpTo && 'bg-mint',
                stepNum === completedUpTo && activeStep && 'bg-gradient-to-r from-mint to-tangerine',
                stepNum < activeStep && !isCompleted && 'bg-muted-foreground/15',
                stepNum > (activeStep || completedUpTo) && 'bg-muted-foreground/15',
              )} />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
function MinhaContaContent() {
  const { user, addresses, favorites, refresh, refreshFavorites, loading, isFavorite, toggleFavorite } = useAuth()
  const router = useRouter()
  const sp = useSearchParams()
  const tab = sp.get('tab') || 'pedidos'

  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [favProducts, setFavProducts] = useState<ProductCardData[]>([])
  const [favLoading, setFavLoading] = useState(false)
  const [notifications, setNotifications] = useState<NotifyEntry[]>([])
  const [productNames, setProductNames] = useState<Record<string, string>>({})
  const [notifLoading, setNotifLoading] = useState(false)

  // Protect
  useEffect(() => {
    if (!loading && !user) router.replace('/login?redirect=/minha-conta')
  }, [user, loading, router])

  // Load tab data
  useEffect(() => {
    if (!user) return
    if (tab === 'pedidos') { queueMicrotask(() => setOrdersLoading(true)); fetch('/api/orders').then(r => r.json()).then(d => setOrders(d.orders || [])).finally(() => setOrdersLoading(false)) }
    if (tab === 'favoritos') { queueMicrotask(() => setFavLoading(true)); fetch('/api/favorites').then(r => r.json()).then(d => { setFavProducts((d.favorites || []).map((f: any) => ({ ...f.product, category: f.product.category }))) }).finally(() => setFavLoading(false)) }
    if (tab === 'notificacoes') {
      queueMicrotask(() => setNotifLoading(true))
      const raw = localStorage.getItem('pijulinho-notify')
      const entries = parseNotifyStorage(raw)
      queueMicrotask(() => setNotifications(entries))
      if (entries.length > 0) {
        fetch('/api/products')
          .then(r => r.json())
          .then(d => {
            const map: Record<string, string> = {}
            for (const p of (d.products || [])) {
              map[p.id] = p.name
            }
            setProductNames(map)
          })
          .finally(() => setNotifLoading(false))
      } else {
        queueMicrotask(() => setNotifLoading(false))
      }
    }
  }, [tab, user])

  function cancelNotification(productId: string) {
    const raw = localStorage.getItem('pijulinho-notify')
    const obj = raw ? JSON.parse(raw) : {}
    delete obj[productId]
    localStorage.setItem('pijulinho-notify', JSON.stringify(obj))
    setNotifications(prev => prev.filter(n => n.productId !== productId))
    toast.success('Notificação cancelada! 🔔')
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    await refresh()
    toast.success('Você saiu da sua conta.')
    router.push('/')
  }

  if (loading) return <MinhaContaSkeleton />
  if (!user) return null

  const first = user.name.charAt(0).toUpperCase()
  const gravatar = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(user.name)}`

  return (
    <div className="bg-cream min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-grape to-plum px-4 py-10 text-cream">
        <Sparkle className="pointer-events-none absolute right-8 top-4 h-8 w-8 text-sun animate-float" />
        <div className="relative mx-auto flex max-w-5xl items-center gap-6">
          <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full bg-tangerine text-3xl font-bold text-white shadow-lg">
            {first}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Olá, {user.name}! 💛</h1>
            <p className="mt-0.5 text-cream/80">{user.email}</p>
            <Badge variant="secondary" className="mt-1 bg-sun/20 text-sun border-0">Cliente Pijulinho</Badge>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="border-cream/30 text-cream hover:bg-cream/10 rounded-full hidden sm:flex"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <Tabs value={tab} onValueChange={(v) => router.replace(`/minha-conta?tab=${v}`, { scroll: false })}>
          <TabsList className="w-full justify-start rounded-full bg-white border-2 border-border h-12 p-1 overflow-x-auto scroll-pretty">
            <TabsTrigger value="pedidos" className="rounded-full font-bold gap-1"><Package className="h-4 w-4 hidden sm:inline" /> Pedidos</TabsTrigger>
            <TabsTrigger value="enderecos" className="rounded-full font-bold gap-1"><MapPin className="h-4 w-4 hidden sm:inline" /> Endereços</TabsTrigger>
            <TabsTrigger value="favoritos" className="rounded-full font-bold gap-1"><Heart className="h-4 w-4 hidden sm:inline" /> Favoritos</TabsTrigger>
            <TabsTrigger value="dados" className="rounded-full font-bold gap-1"><User className="h-4 w-4 hidden sm:inline" /> Dados</TabsTrigger>
            <TabsTrigger value="notificacoes" className="rounded-full font-bold gap-1"><Bell className="h-4 w-4 hidden sm:inline" /> Notificações</TabsTrigger>
          </TabsList>

          {/* Loyalty Program Card */}
          <div className="mt-4">
            <LoyaltyBadge points={orders.reduce((sum, o) => sum + o.total * 10, 0)} showAnimation />
          </div>

          {/* Pedidos */}
          <TabsContent value="pedidos" className="mt-6">
            {ordersLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}</div>
            ) : orders.length === 0 ? (
              <EmptyState icon={Package} emoji="📦" title="Nenhum pedido ainda" description="Quando você fizer um pedido, ele aparecerá aqui." ctaLink="/produtos" ctaText="Explorar produtos" />
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const st = STATUS_MAP[order.status] || STATUS_MAP.pending
                  const StatusIcon = st.icon
                  return (
                    <div key={order.id} className="rounded-3xl bg-white border-2 border-border p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-plum">
                            <Package className="h-4 w-4" />
                            #{order.id.slice(-8)}
                          </div>
                          <Badge className={cn('gap-1 border-0', st.color)}>
                            <StatusIcon className="h-3.5 w-3.5" /> {st.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {order.items?.map((it: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-secondary">
                              {it.image && <Image src={it.image} alt={it.name} fill className="object-cover" sizes="48px" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-semibold text-plum">{it.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {it.quantity}x {formatBRL(it.price)}
                                {it.size && it.size !== 'Único' && ` · ${it.size}`}
                                {it.color && ` · ${it.color}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CreditCard className="h-3.5 w-3.5" />
                          {order.paymentMethod?.toUpperCase()}
                        </div>
                        <span className="font-extrabold text-plum">{formatBRL(order.total)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Endereços */}
          <TabsContent value="enderecos" className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-plum">Seus endereços</h3>
              <AddAddressDialog onAdded={refresh}>
                <Button size="sm" className="bg-tangerine rounded-full gap-1 text-sm"><Plus className="h-4 w-4" /> Adicionar</Button>
              </AddAddressDialog>
            </div>
            {addresses.length === 0 ? (
              <EmptyState icon={MapPin} emoji="📍" title="Nenhum endereço cadastrado" description="Adicione um endereço para agilizar suas compras." ctaText="" />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((a) => (
                  <div key={a.id} className="rounded-3xl bg-white border-2 border-border p-5">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="font-bold">{a.label}</Badge>
                      {a.isDefault && <Badge className="bg-mint text-white border-0">Padrão</Badge>}
                      <button onClick={async () => { await fetch(`/api/addresses/${a.id}`, { method: 'DELETE' }); await refresh(); toast.success('Endereço removido') }} className="text-muted-foreground hover:text-tangerine"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <p className="font-semibold text-plum text-sm">{a.recipient}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {a.street}, {a.number}{a.complement ? ` — ${a.complement}` : ''}<br />
                      {a.district} — {a.city}/{a.state}<br />
                      CEP: {a.zip}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Favoritos */}
          <TabsContent value="favoritos" className="mt-6">
            {favLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[1,2,3,4].map(i => (<Skeleton key={i} className="aspect-[3/4] rounded-3xl" />))}</div>
            ) : favProducts.length === 0 ? (
              <EmptyState icon={Heart} emoji="❤️" title="Nenhum favorito ainda" description="Toque no ❤️ dos produtos que você ama." ctaLink="/produtos" ctaText="Ver produtos" />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {favProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </TabsContent>

          {/* Dados */}
          <TabsContent value="dados" className="mt-6">
            <div className="rounded-3xl bg-white border-2 border-border p-6">
              <h3 className="font-display text-lg font-bold text-plum mb-4">Meus dados</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Nome', value: user.name },
                  { label: 'E-mail', value: user.email },
                  { label: 'CPF', value: user.cpf || 'Não informado' },
                  { label: 'Telefone', value: user.phone || 'Não informado' },
                ].map((f) => (
                  <div key={f.label}>
                    <Label className="text-muted-foreground">{f.label}</Label>
                    <div className="mt-1 h-10 rounded-xl border-2 border-border bg-secondary px-3 flex items-center text-sm font-medium text-plum">
                      {f.value}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Para alterar seus dados, entre em contato conosco pelo e-mail oi@pijulinho.com.br.
              </p>
            </div>
            <div className="mt-4 rounded-3xl bg-white border-2 border-border p-6">
              <h3 className="font-display text-lg font-bold text-plum mb-4">Estatísticas</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-2xl bg-secondary p-4">
                  <p className="text-2xl font-extrabold text-plum">{orders.length}</p>
                  <p className="text-xs text-muted-foreground">Pedidos</p>
                </div>
                <div className="rounded-2xl bg-secondary p-4">
                  <p className="text-2xl font-extrabold text-plum">{favorites.length}</p>
                  <p className="text-xs text-muted-foreground">Favoritos</p>
                </div>
                <div className="rounded-2xl bg-secondary p-4">
                  <p className="text-2xl font-extrabold text-tangerine">{addresses.length}</p>
                  <p className="text-xs text-muted-foreground">Endereços</p>
                </div>
              </div>
            </div>
            <Button onClick={logout} variant="outline" className="mt-4 border-tangerine text-tangerine hover:bg-tangerine/10 rounded-full sm:hidden">
              <LogOut className="h-4 w-4 mr-2" /> Sair da conta
            </Button>
          </TabsContent>

          {/* Notificações */}
          <TabsContent value="notificacoes" className="mt-6">
            {notifLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => (<Skeleton key={i} className="h-24 rounded-xl" />))}</div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-5xl">🎉</span>
                <Bell className="mt-4 h-12 w-12 text-tangerine/40" />
                <h3 className="mt-4 font-display text-xl font-bold text-plum">Você não tem notificações ativas</h3>
                <p className="mt-1 text-muted-foreground max-w-sm">Quando um produto voltar ao estoque, você será avisado por e-mail.</p>
                <Button asChild className="mt-4 bg-tangerine rounded-full"><Link href="/produtos">Ver produtos</Link></Button>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-display text-lg font-bold text-plum mb-2">Avisos de estoque</h3>
                {notifications.map((n) => (
                  <div key={n.productId} className="rounded-xl bg-cream border-2 border-tangerine/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-plum truncate">{productNames[n.productId] || 'Produto não encontrado'}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Bell className="h-3 w-3" />
                          {n.email}
                        </span>
                        {n.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(n.date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-full border-tangerine/40 text-tangerine hover:bg-tangerine hover:text-white"
                      onClick={() => cancelNotification(n.productId)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, emoji, title, description, ctaLink, ctaText }: { icon: any; emoji: string; title: string; description: string; ctaLink?: string; ctaText?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl">{emoji}</span>
      <h3 className="mt-4 font-display text-xl font-bold text-plum">{title}</h3>
      <p className="mt-1 text-muted-foreground max-w-sm">{description}</p>
      {ctaLink && ctaText && (
        <Button asChild className="mt-4 bg-tangerine rounded-full"><Link href={ctaLink}>{ctaText}</Link></Button>
      )}
    </div>
  )
}

function AddAddressDialog({ children, onAdded }: { children: React.ReactNode; onAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ recipient: '', label: 'Casa', street: '', number: '', complement: '', district: '', city: '', state: '', zip: '', isDefault: false })
  const [submitting, setSubmitting] = useState(false)

  function update(field: string, value: string | boolean) { setForm((f) => ({ ...f, [field]: value })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) { toast.error(data.error); return }
      toast.success('Endereço adicionado! 📍')
      setOpen(false)
      setForm({ recipient: '', label: 'Casa', street: '', number: '', complement: '', district: '', city: '', state: '', zip: '', isDefault: false })
      onAdded()
    } catch { toast.error('Erro ao salvar endereço') } finally { setSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg bg-cream max-h-[90vh] overflow-y-auto scroll-pretty">
        <DialogHeader><DialogTitle className="font-display text-xl text-plum">Novo endereço</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Destinatário *</Label><Input value={form.recipient} onChange={(e) => update('recipient', e.target.value)} /></div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.label} onValueChange={(v) => update('label', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Casa">Casa</SelectItem><SelectItem value="Trabalho">Trabalho</SelectItem><SelectItem value="Outro">Outro</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>CEP *</Label><MaskedInput mask={maskCEP} value={form.zip} onChange={(raw) => update('zip', raw)} /></div>
          <div><Label>Rua *</Label><Input value={form.street} onChange={(e) => update('street', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Número *</Label><Input value={form.number} onChange={(e) => update('number', e.target.value)} /></div>
            <div><Label>Complemento</Label><Input value={form.complement} onChange={(e) => update('complement', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Bairro *</Label><Input value={form.district} onChange={(e) => update('district', e.target.value)} /></div>
            <div><Label>Cidade *</Label><Input value={form.city} onChange={(e) => update('city', e.target.value)} /></div>
          </div>
          <div>
            <Label>Estado *</Label>
            <Select value={form.state} onValueChange={(v) => update('state', v)}>
              <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
              <SelectContent>{UFS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-tangerine rounded-full">{submitting ? 'Salvando...' : 'Salvar endereço'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function MinhaContaSkeleton() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="h-40 bg-muted" />
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-4">
        <Skeleton className="h-12 rounded-full" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    </div>
  )
}

export default function MinhaContaPage() {
  return (
    <Suspense fallback={<MinhaContaSkeleton />}>
      <MinhaContaContent />
    </Suspense>
  )
}