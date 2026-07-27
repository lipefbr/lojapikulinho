import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { json, error } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, subtotal } = body
    if (!code) return error('Informe o cupom', 422)
    const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } })
    if (!coupon || !coupon.active) return error('Cupom inválido', 404)
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return error('Cupom expirado', 400)
    if (coupon.usedCount >= coupon.maxUses) return error('Cupom esgotado', 400)
    const value = Number(subtotal || 0)
    const discount = (value * coupon.discountPercent) / 100
    return json({
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        description: coupon.description,
      },
      discount,
    })
  } catch (e: any) {
    return error(e?.message, 500)
  }
}
