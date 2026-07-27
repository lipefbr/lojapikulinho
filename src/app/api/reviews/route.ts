import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { json, error } from '@/lib/api'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  const where: any = { approved: true }
  if (productId) where.productId = productId
  const reviews = await db.review.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return json({ reviews })
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await req.json()
    const { productId, rating, comment, authorName } = body
    if (!productId || !rating || !comment) {
      return error('Dados incompletos', 422)
    }
    const review = await db.review.create({
      data: {
        productId,
        userId: user?.id || null,
        authorName: authorName || user?.name || 'Cliente',
        rating: Number(rating),
        comment,
      },
    })
    // update product rating aggregate
    const agg = await db.review.aggregate({
      where: { productId, approved: true },
      _avg: { rating: true },
      _count: true,
    })
    await db.product.update({
      where: { id: productId },
      data: { rating: agg._avg.rating || 5, reviewCount: agg._count },
    })
    return json({ review }, 201)
  } catch (e: any) {
    return error(e?.message, 500)
  }
}
