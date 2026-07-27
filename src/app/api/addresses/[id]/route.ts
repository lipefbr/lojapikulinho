import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, json, error } from '@/lib/api'

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const user = await requireUser()
  if (!user) return error('Não autenticado', 401)
  await db.address.deleteMany({ where: { id, userId: user.id } })
  return json({ ok: true })
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const user = await requireUser()
  if (!user) return error('Não autenticado', 401)
  const body = await req.json()
  if (body.isDefault) {
    await db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } })
  }
  const address = await db.address.updateMany({
    where: { id, userId: user.id },
    data: { ...body },
  })
  return json({ address })
}
