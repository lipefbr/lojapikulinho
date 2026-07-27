'use client'

import { useState } from 'react'
import { Gift, X, Sparkles, Heart, Star, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatBRL } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

const WRAP_OPTIONS = [
  { id: 'none', name: 'Sem embrulho', price: 0, emoji: '📦', color: '' },
  { id: 'basic', name: 'Embalagem básica', price: 5.90, emoji: '🎁', color: 'bg-tangerine/10 border-tangerine/30' },
  { id: 'premium', name: 'Embalagem premium', price: 12.90, emoji: '🎀', color: 'bg-grape/10 border-grape/30' },
  { id: 'luxury', name: 'Caixa especial com laço', price: 24.90, emoji: '✨', color: 'bg-sun/20 border-sun/40' },
]

const CARD_STYLES = [
  { id: 'birthday', name: 'Aniversário', emoji: '🎂', preview: 'Feliz aniversário! Que seu dia seja repleto de alegria!' },
  { id: 'christmas', name: 'Natal', emoji: '🎄', preview: 'Boas festas! Que o Natal traga muita felicidade!' },
  { id: 'congrats', name: 'Parabéns', emoji: '🎉', preview: 'Parabéns! Você merece o melhor!' },
  { id: 'love', name: 'Com carinho', emoji: '❤️', preview: 'Com muito amor e carinho para você!' },
  { id: 'custom', name: 'Personalizado', emoji: '✍️', preview: '' },
]

export function GiftOptions({ onChange }: { onChange: (data: GiftData) => void }) {
  const [wrap, setWrap] = useState('none')
  const [card, setCard] = useState('none')
  const [message, setMessage] = useState('')
  const [showCardSelector, setShowCardSelector] = useState(false)

  function handleWrapChange(id: string) {
    setWrap(id)
    const selected = WRAP_OPTIONS.find(w => w.id === id)
    onChange({ wrapId: id, wrapPrice: selected?.price || 0, cardId: card, message })
  }

  function handleCardChange(id: string) {
    setCard(id)
    if (id !== 'none') {
      setShowCardSelector(true)
      const selected = CARD_STYLES.find(c => c.id === id)
      if (selected && selected.preview) {
        setMessage(selected.preview)
      } else {
        setMessage('')
      }
    } else {
      setShowCardSelector(false)
      setMessage('')
    }
    onChange({ wrapId: wrap, wrapPrice: WRAP_OPTIONS.find(w => w.id === wrap)?.price || 0, cardId: id, message: id === 'none' ? '' : message })
  }

  function handleMessageChange(text: string) {
    setMessage(text)
    onChange({ wrapId: wrap, wrapPrice: WRAP_OPTIONS.find(w => w.id === wrap)?.price || 0, cardId: card, message: text })
  }

  return (
    <div className="space-y-4">
      {/* Gift Wrap */}
      <div>
        <Label className="flex items-center gap-2 font-display text-base font-bold text-plum mb-3">
          <Gift className="h-4 w-4 text-tangerine" />
          Embalagem para presente
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {WRAP_OPTIONS.map((opt) => (
            <motion.button
              key={opt.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleWrapChange(opt.id)}
              className={cn(
                'relative flex items-center gap-2.5 rounded-2xl border-2 p-3 text-left transition-all',
                wrap === opt.id
                  ? 'border-tangerine bg-tangerine/10 shadow-sm'
                  : 'border-border bg-white hover:border-tangerine/30'
              )}
            >
              <span className="text-xl">{opt.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-plum truncate">{opt.name}</p>
                {opt.price > 0 && (
                  <p className="text-[11px] text-muted-foreground">+{formatBRL(opt.price)}</p>
                )}
              </div>
              {wrap === opt.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 grid h-4 w-4 place-items-center rounded-full bg-tangerine"
                >
                  <X className="h-2.5 w-2.5 text-white" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Card Message */}
      <div>
        <button
          onClick={() => handleCardChange(card === 'none' ? 'birthday' : 'none')}
          className="flex items-center gap-2 text-sm font-bold text-plum hover:text-tangerine transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          {card === 'none' ? 'Adicionar cartão com mensagem' : 'Remover cartão'}
        </button>

        <AnimatePresence>
          {card !== 'none' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3">
                {/* Card style selector */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {CARD_STYLES.filter(c => c.id !== 'none').map((style) => (
                    <button
                      key={style.id}
                      onClick={() => handleCardChange(style.id)}
                      className={cn(
                        'flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all',
                        card === style.id
                          ? 'bg-grape text-white shadow-sm'
                          : 'bg-white text-plum border border-border hover:border-grape/40'
                      )}
                    >
                      <span>{style.emoji}</span> {style.name}
                    </button>
                  ))}
                </div>

                {/* Message textarea */}
                <Textarea
                  value={message}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  placeholder="Escreva sua mensagem especial aqui... 💝"
                  maxLength={200}
                  className="rounded-2xl border-2 bg-cream min-h-[80px] text-sm"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-[10px] text-muted-foreground">
                    Máximo 200 caracteres
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {message.length}/200
                  </p>
                </div>

                {/* Message preview */}
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 rounded-2xl border-2 border-dashed border-grape/30 bg-gradient-to-br from-grape/5 to-blush/5 p-4"
                  >
                    <div className="flex items-center gap-1 mb-2">
                      <PartyPopper className="h-4 w-4 text-tangerine" />
                      <span className="text-xs font-bold text-plum">Prévia do cartão</span>
                    </div>
                    <div className="rounded-xl bg-white p-3 shadow-sm border border-grape/10">
                      <p className="text-sm italic text-plum/80 leading-relaxed">
                        &ldquo;{message}&rdquo;
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export interface GiftData {
  wrapId: string
  wrapPrice: number
  cardId: string
  message: string
}
