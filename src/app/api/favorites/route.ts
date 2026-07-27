import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { json, error, requireUser } from '@/lib/api'

export async function GET() {
  const user = await requireUser()
  if (!user) return json({ favorites: [] })
  const favorites = await db.favorite.findMany({
    where: { userId: user.id },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return json({
    favorites: favorites.map((f) => ({ id: f.id, product: f.product })),
  })
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    if (!user) return error('Não autenticado', 401)
    const body = await req.json()
    const { productId } = body
    if (!productId) return error('productId obrigatório', 422)
    const existing = await db.favorite.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    })
    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } })
      return json({ favorited: false })
    }
    await db.favorite.create({ data: { userId: user.id, productId } })
    return json({ favorited: true }, 201)
  } catch (e: any) {
    return error(e?.message, 500)
  }
}
