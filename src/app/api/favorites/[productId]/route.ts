import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, json, error } from '@/lib/api'

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ productId: string }> }) {
  const { productId } = await ctx.params
  const user = await requireUser()
  if (!user) return error('Não autenticado', 401)
  await db.favorite.deleteMany({ where: { userId: user.id, productId } })
  return json({ ok: true })
}
