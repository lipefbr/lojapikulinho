'use client'

import { useState, useCallback } from 'react'
import { Ruler, X, Check, ChevronRight, ChevronLeft, Baby, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'

interface SizeResult {
  size: string
  confidence: string
  message: string
  details: string
}

const STEPS = [
  {
    id: 'age',
    question: 'Qual a idade da criança?',
    subtext: 'Isso nos ajuda a estimar o tamanho ideal',
    options: [
      { value: '0-1', label: '0 a 1 ano', emoji: '👶', desc: 'Bebê' },
      { value: '1-2', label: '1 a 2 anos', emoji: '🧒', desc: 'Crescendo rápido' },
      { value: '2-3', label: '2 a 3 anos', emoji: '🧒', desc: 'Primeiros passos' },
      { value: '3-4', label: '3 a 4 anos', emoji: '👦', desc: 'Ativo e curioso' },
      { value: '4-6', label: '4 a 6 anos', emoji: '👧', desc: 'Pré-escolar' },
      { value: '6-8', label: '6 a 8 anos', emoji: '🧑', desc: 'Escolar' },
      { value: '8-10', label: '8 a 10 anos', emoji: '🧑', desc: 'Crescendo' },
      { value: '10-12', label: '10 a 12 anos', emoji: '🧒', desc: 'Pré-adolescente' },
    ],
  },
  {
    id: 'height',
    question: 'Qual a altura aproximada?',
    subtext: 'Se não souber, pule esta etapa',
    options: [
      { value: '70-80', label: '70–80 cm', emoji: '📏', desc: 'Bebê pequeno' },
      { value: '80-92', label: '80–92 cm', emoji: '📏', desc: 'Bebê grande' },
      { value: '92-98', label: '92–98 cm', emoji: '📐', desc: 'Toddler' },
      { value: '98-104', label: '98–104 cm', emoji: '📐', desc: 'Pequeno' },
      { value: '104-116', label: '104–116 cm', emoji: '📏', desc: 'Médio' },
      { value: '116-128', label: '116–128 cm', emoji: '📏', desc: 'Grande' },
      { value: '128-140', label: '128–140 cm', emoji: '📏', desc: 'Extra grande' },
      { value: '140-152', label: '140–152 cm', emoji: '📏', desc: 'Adolescente' },
    ],
  },
  {
    id: 'weight',
    question: 'E o peso aproximado?',
    subtext: 'Também opcional, mas ajuda bastante!',
    options: [
      { value: '7-10', label: '7–10 kg', emoji: '⚖️', desc: 'Levinho' },
      { value: '10-13', label: '10–13 kg', emoji: '⚖️', desc: 'Médio' },
      { value: '13-16', label: '13–16 kg', emoji: '⚖️', desc: 'Forte' },
      { value: '16-20', label: '16–20 kg', emoji: '⚖️', desc: 'Saúde' },
      { value: '20-25', label: '20–25 kg', emoji: '⚖️', desc: 'Crescido' },
      { value: '25-32', label: '25–32 kg', emoji: '⚖️', desc: 'Grande' },
      { value: '32-40', label: '32–40 kg', emoji: '⚖️', desc: 'Muito grande' },
      { value: '40+', label: '40+ kg', emoji: '⚖️', desc: 'Adolescente' },
    ],
  },
  {
    id: 'bodyType',
    question: 'Como é o corpo da criança?',
    subtext: 'Isso ajuda a ajustar o caimento',
    options: [
      { value: 'slim', label: 'Magrinho', emoji: '🦒', desc: 'Mais fino' },
      { value: 'average', label: 'Normal', emoji: '🐻', desc: 'Padrão' },
      { value: 'chubby', label: 'Gordinho', emoji: '🐼', desc: 'Mais rechonchudo' },
      { value: 'tall', label: 'Alto', emoji: '🦒', desc: 'Acima da média' },
    ],
  },
  {
    id: 'preference',
    question: 'Prefência de caimento?',
    subtext: 'Como você gosta que a roupa fique?',
    options: [
      { value: 'just-right', label: 'No tamanho exato', emoji: '✨', desc: 'Sem folga extra' },
      { value: 'room-to-grow', label: 'Com folga para crescer', emoji: '🌱', desc: 'Mais espaço' },
      { value: 'oversized', label: 'Mais largo/estiloso', emoji: '🎨', desc: 'Look moderno' },
    ],
  },
]

function calculateSize(answers: Record<string, string>): SizeResult {
  const age = answers.age
  const height = answers.height
  const weight = answers.weight
  const body = answers.bodyType || 'average'
  const pref = answers.preference || 'just-right'

  // Base size from age
  let baseSize = ''
  let confidence = 'média'
  let details = ''

  const AGE_SIZE_MAP: Record<string, string> = {
    '0-1': '2', '1-2': '4', '2-3': '6', '3-4': '8',
    '4-6': '10', '6-8': '12', '8-10': '14', '10-12': '16',
  }

  const HEIGHT_SIZE_MAP: Record<string, string> = {
    '70-80': '2', '80-92': '4', '92-98': '6', '98-104': '8',
    '104-116': '10', '116-128': '12', '128-140': '14', '140-152': '16',
  }

  const WEIGHT_SIZE_MAP: Record<string, string> = {
    '7-10': '2', '10-13': '4', '13-16': '6', '16-20': '8',
    '20-25': '10', '25-32': '12', '32-40': '14', '40+': '16',
  }

  const SIZE_NAMES: Record<string, string> = {
    '2': '2 (PP)', '4': '4 (P)', '6': '6 (M)', '8': '8 (M/G)',
    '10': '10 (G)', '12': '12 (G/GG)', '14': '14 (GG)', '16': '16 (XG)',
  }

  baseSize = AGE_SIZE_MAP[age] || '6'

  // Cross-reference with height if provided
  if (height && height !== 'skip') {
    const heightSize = HEIGHT_SIZE_MAP[height]
    if (heightSize) {
      const baseNum = parseInt(baseSize)
      const heightNum = parseInt(heightSize)
      if (Math.abs(baseNum - heightNum) <= 1) {
        confidence = 'alta'
        details = 'Idade e altura convergem bem!'
      } else if (heightNum > baseNum) {
        baseSize = heightSize
        details = 'Altura indica tamanho maior que a idade'
      } else {
        details = 'Altura indica tamanho menor que a idade'
      }
    }
  }

  // Cross-reference with weight if provided
  if (weight && weight !== 'skip') {
    const weightSize = WEIGHT_SIZE_MAP[weight]
    if (weightSize) {
      const baseNum = parseInt(baseSize)
      const weightNum = parseInt(weightSize)
      if (weightNum > baseNum + 1) {
        // Chubby kid might need bigger size
        baseSize = String(Math.round((baseNum + weightNum) / 2))
        details = details ? `${details}. Peso sugere tamanho maior.` : 'Peso sugere ajuste de tamanho.'
      } else if (weightNum < baseNum - 1) {
        // Slim kid might need smaller size
        baseSize = String(Math.round((baseNum + weightNum) / 2))
        details = details ? `${details}. Peso sugere tamanho menor.` : 'Peso sugere ajuste de tamanho.'
      } else if (!details) {
        confidence = 'alta'
        details = 'Peso confirma o tamanho da faixa etária.'
      }
    }
  }

  // Body type adjustment
  if (body === 'slim' || body === 'chubby') {
    const num = parseInt(baseSize)
    if (body === 'slim' && num > 2) {
      baseSize = String(num - 1)
      details = `${details || ''} Corpo magrinho: recomendamos um tamanho menor.`.trim()
    } else if (body === 'chubby') {
      baseSize = String(num + 1)
      details = `${details || ''} Corpo gordinho: recomendamos um tamanho maior.`.trim()
    }
  }

  // Preference adjustment
  if (pref === 'room-to-grow') {
    const num = parseInt(baseSize)
    if (num < 16) baseSize = String(num + 1)
    details = `${details || ''} Adicionamos +1 para folga de crescimento.`.trim()
  } else if (pref === 'oversized') {
    const num = parseInt(baseSize)
    if (num < 14) baseSize = String(num + 2)
    details = `${details || ''} Estilo oversized: adicionamos +2 ao tamanho.`.trim()
  }

  if (!details) {
    details = 'Baseado apenas na idade. Para resultado mais preciso, preencha todos os campos!'
    confidence = 'baixa'
  }

  const sizeName = SIZE_NAMES[baseSize] || baseSize

  const messages = [
    'Tamanho perfeito para seu pequeno! 🎯',
    'Encontramos o tamanho ideal! ✨',
    'Recomendamos este tamanho com base nas suas respostas! 🌟',
    'Achamos o caimento perfeito! 🧸',
  ]

  return {
    size: sizeName,
    confidence,
    message: messages[Math.floor(Math.random() * messages.length)],
    details,
  }
}

function SizeQuizContent({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<SizeResult | null>(null)

  const step = STEPS[currentStep]

  const selectOption = useCallback((value: string) => {
    const newAnswers = { ...answers, [step.id]: value }
    setAnswers(newAnswers)

    // Auto-advance after a brief delay
    setTimeout(() => {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        setResult(calculateSize(newAnswers))
      }
    }, 300)
  }, [answers, step.id, currentStep])

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const reset = () => {
    setCurrentStep(0)
    setAnswers({})
    setResult(null)
  }

  return (
    <div className="px-2">
      {/* Progress bar */}
      {!result && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-2">
            <span>Passo {currentStep + 1} de {STEPS.length}</span>
            <span>{Math.round(((currentStep + 1) / STEPS.length) * 100)}%</span>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-tangerine to-grape"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-display text-xl font-bold text-plum text-center mb-1">
              {step.question}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-5">
              {step.subtext}
            </p>

            <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto scroll-pretty pr-1">
              {step.options.map((opt) => (
                <motion.button
                  key={opt.value}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => selectOption(opt.value)}
                  className={cn(
                    'relative flex flex-col items-center gap-1 rounded-2xl border-2 p-4 text-center transition-all',
                    answers[step.id] === opt.value
                      ? 'border-tangerine bg-tangerine/10 shadow-md'
                      : 'border-border bg-white hover:border-tangerine/40 hover:shadow-sm'
                  )}
                >
                  {answers[step.id] === opt.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <Check className="h-4 w-4 text-tangerine" />
                    </motion.div>
                  )}
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="text-sm font-bold text-plum">{opt.label}</span>
                  <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
                </motion.button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                disabled={currentStep === 0}
                className="text-muted-foreground"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectOption('skip')}
                className="text-muted-foreground text-xs"
              >
                Pular
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="text-center"
          >
            {/* Result Card */}
            <div className="mx-auto mb-6 max-w-[260px] rounded-3xl border-2 border-tangerine/30 bg-gradient-to-br from-cream to-white p-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mb-3"
              >
                <Ruler className="mx-auto h-10 w-10 text-tangerine" />
              </motion.div>

              <p className="text-sm font-semibold text-muted-foreground mb-1">Tamanho recomendado</p>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
                className="font-display text-4xl font-extrabold text-tangerine"
              >
                {result.size}
              </motion.p>

              <div className="mt-3 flex items-center justify-center gap-2">
                <span className={cn(
                  'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold',
                  result.confidence === 'alta'
                    ? 'bg-mint/20 text-mint'
                    : result.confidence === 'média'
                    ? 'bg-sun/20 text-tangerine'
                    : 'bg-grape/20 text-grape'
                )}>
                  Confiança: {result.confidence}
                </span>
              </div>
            </div>

            <p className="text-sm font-bold text-plum mb-2">{result.message}</p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[300px] mx-auto mb-6">
              {result.details}
            </p>

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                className="rounded-full border-2"
              >
                <RotateCcw className="h-4 w-4 mr-1" /> Refazer
              </Button>
              <Button
                size="sm"
                onClick={onClose}
                className="rounded-full bg-tangerine"
              >
                Entendi! ✨
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function SizeQuizButton({ className }: { className?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('rounded-full border-2 gap-1.5', className)}
        >
          <Ruler className="h-4 w-4" />
          Qual meu tamanho?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl text-tangerine">
            <Baby className="h-5 w-5" />
            Guia de Tamanhos Inteligente
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Responda algumas perguntas rápidas e encontramos o tamanho perfeito! 🧸
          </DialogDescription>
        </DialogHeader>
        <SizeQuizContent onClose={() => {}} />
      </DialogContent>
    </Dialog>
  )
}
