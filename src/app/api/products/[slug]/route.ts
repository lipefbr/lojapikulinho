import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { serializeProduct, json, error } from '@/lib/api'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: { where: { approved: true }, orderBy: { createdAt: 'desc' }, take: 20 },
    },
  })
  if (!product) return error('Produto não encontrado', 404)
  const related = await db.product.findMany({
    where: { categoryId: product.categoryId, slug: { not: product.slug }, active: true },
    take: 4,
    include: { category: true },
  })
  return json({ product: serializeProduct(product), reviews: product.reviews, related: related.map(serializeProduct) })
}
