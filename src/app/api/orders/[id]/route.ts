import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, json, error } from '@/lib/api'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const user = await requireUser()
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, payment: true, address: true },
  })
  if (!order) return error('Pedido não encontrado', 404)
  if (user && order.userId && order.userId !== user.id) {
    return error('Acesso negado', 403)
  }
  return json({ order })
}
