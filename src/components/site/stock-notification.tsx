'use client'

import { useState } from 'react'
import { Bell, CheckCircle, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface StockNotificationProps {
  stock: number
  productName: string
  productId?: string
}

export function StockNotification({ stock, productName }: StockNotificationProps) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  // Low stock warning (1-5 units)
  if (stock > 0 && stock <= 5) {
    return (
      <div className="animate-bounce-in rounded-2xl border-2 border-dashed border-tangerine/40 bg-tangerine/5 p-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tangerine opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-tangerine" />
          </span>
          <p className="text-sm font-bold text-tangerine">
            🔥 Últimas {stock} {stock === 1 ? 'unidade' : 'unidades'}!
          </p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Corre que está acabando! Garanta o seu antes que acabe.
        </p>
      </div>
    )
  }

  // Out of stock notification form
  if (stock === 0) {
    return (
      <div className="animate-bounce-in rounded-2xl border-2 border-dashed border-grape/30 bg-grape/5 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Bell className="h-5 w-5 text-grape" />
          <p className="text-sm font-bold text-grape">Produto esgotado</p>
        </div>
        {subscribed ? (
          <div className="flex items-center gap-2 rounded-xl bg-mint/10 p-3">
            <CheckCircle className="h-5 w-5 text-mint" />
            <div>
              <p className="text-sm font-semibold text-mint">Você será notificado!</p>
              <p className="text-xs text-muted-foreground">
                Enviaremos um e-mail quando {productName} estiver disponível.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs text-muted-foreground">
              Avise-me quando este produto estiver disponível novamente.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!email.includes('@')) return
                setSubmitting(true)
                setTimeout(() => {
                  setSubmitting(false)
                  setSubscribed(true)
                  toast.success('📧 Você será notificado quando o produto estiver disponível!')
                }, 1000)
              }}
              className="flex gap-2"
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="flex-1 rounded-xl border-2"
                required
              />
              <Button
                type="submit"
                disabled={submitting || !email.includes('@')}
                className="rounded-xl bg-tangerine hover:bg-tangerine/90 shrink-0"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
              </Button>
            </form>
          </>
        )}
      </div>
    )
  }

  return null
}
