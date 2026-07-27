export type CartItem = {
  id: string
  productId: string
  slug: string
  name: string
  price: number
  image: string
  size: string
  color: string
  quantity: number
  stock?: number
}

export type Coupon = {
  code: string
  discountPercent: number
  description: string
}

export function parseList(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function starArray(rating: number): { filled: boolean; half: boolean }[] {
  return [1, 2, 3, 4, 5].map((i) => {
    if (rating >= i) return { filled: true, half: false }
    if (rating >= i - 0.5) return { filled: false, half: true }
    return { filled: false, half: false }
  })
}

export const CATEGORY_COLORS: Record<string, string> = {
  camisetas: '#F5A623',
  vestidos: '#E94B8B',
  conjuntos: '#7C5CE0',
  'calcas-e-shorts': '#4FA8E0',
  pijamas: '#F5D142',
  acessorios: '#5CC9A7',
  calcados: '#FF7849',
}

export function colorForCategory(slug: string): string {
  return CATEGORY_COLORS[slug] || '#F5A623'
}
