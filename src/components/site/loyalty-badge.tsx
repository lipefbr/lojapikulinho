'use client'

import { Gift, Star, Trophy, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface LoyaltyBadgeProps {
  points: number
  className?: string
  showAnimation?: boolean
}

const TIERS = [
  { threshold: 0, label: 'Novo', color: 'text-muted-foreground', bg: 'bg-secondary', icon: Star },
  { threshold: 100, label: 'Bronze', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: Star },
  { threshold: 500, label: 'Prata', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', icon: Trophy },
  { threshold: 1000, label: 'Ouro', color: 'text-tangerine', bg: 'bg-tangerine/10 border-tangerine/30', icon: Trophy },
  { threshold: 2500, label: 'Diamante', color: 'text-sky', bg: 'bg-sky/10 border-sky/30', icon: Sparkles },
]

function getTier(points: number) {
  return [...TIERS].reverse().find(t => points >= t.threshold) || TIERS[0]
}

function getNextTier(points: number) {
  return TIERS.find(t => t.threshold > points)
}

export function LoyaltyBadge({ points, className, showAnimation = false }: LoyaltyBadgeProps) {
  const tier = getTier(points)
  const next = getNextTier(points)
  const Icon = tier.icon
  const progress = next ? ((points - tier.threshold) / (next.threshold - tier.threshold)) * 100 : 100

  return (
    <div className={cn('rounded-2xl border p-4', tier.bg, className)}>
      <div className="flex items-center gap-3 mb-3">
        {showAnimation ? (
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Icon className={cn('h-8 w-8', tier.color)} />
          </motion.div>
        ) : (
          <Icon className={cn('h-8 w-8', tier.color)} />
        )}
        <div>
          <p className={cn('font-display text-lg font-bold', tier.color)}>{tier.label}</p>
          <p className="text-xs text-muted-foreground">
            {points.toLocaleString('pt-BR')} pontos acumulados
          </p>
        </div>
      </div>

      {next && (
        <div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
            <span>{tier.label}</span>
            <span className="font-bold">{next.label}</span>
          </div>
          <div className="h-2 rounded-full bg-white/60 overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-tangerine to-grape"
            />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Faltam <span className="font-bold">{(next.threshold - points).toLocaleString('pt-BR')}</span> pontos para {next.label}
          </p>
        </div>
      )}
    </div>
  )
}

export function LoyaltyPointsEarned({ subtotal }: { subtotal: number }) {
  const points = Math.floor(subtotal * 10) // 10 points per R$1 spent
  const tier = getTier(points)
  const next = getNextTier(points)

  return (
    <div className="flex items-center gap-2 rounded-xl bg-grape/10 px-3 py-2.5">
      <Gift className="h-4 w-4 text-grape" />
      <div>
        <p className="text-xs font-bold text-plum">
          +{points.toLocaleString('pt-BR')} pontos com esta compra! 🎉
        </p>
        {next && (
          <p className="text-[10px] text-muted-foreground">
            Faltam {(next.threshold - points).toLocaleString('pt-BR')} para o nível {next.label}
          </p>
        )}
      </div>
    </div>
  )
}

export function LoyaltyInfoTooltip() {
  return (
    <div className="space-y-2 text-xs text-muted-foreground">
      <p className="font-bold text-plum text-sm">Como funciona?</p>
      <div className="space-y-1.5">
        {TIERS.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <t.icon className={cn('h-4 w-4 shrink-0', t.color)} />
            <span className="font-semibold">{t.label}</span>
            <span>— {i === 0 ? 'Recém-cadastado' : `${t.threshold.toLocaleString('pt-BR')}+ pontos`}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-lg bg-cream p-2 text-[11px] leading-relaxed">
        💡 <strong>10 pontos</strong> a cada R$1 gasto. Resgate por descontos exclusivos!
      </div>
    </div>
  )
}
