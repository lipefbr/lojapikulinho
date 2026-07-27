import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { json } from '@/lib/api'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  if (!q || q.length < 2) return json({ suggestions: [] })

  const products = await db.product.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
      ],
    },
    include: { category: true },
    orderBy: { reviewCount: 'desc' },
    take: 6,
  })

  const categories = await db.category.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { slug: { contains: q } },
      ],
    },
    take: 3,
  })

  const suggestions = products.map((p) => ({
    type: 'product' as const,
    slug: p.slug,
    name: p.name,
    price: p.price,
    image: p.images.split(',')[0]?.trim() || '',
    category: p.category?.name || '',
    categoryColor: p.category?.color || '#FF7A45',
  }))

  const catSuggestions = categories.map((c) => ({
    type: 'category' as const,
    slug: c.slug,
    name: c.name,
    color: c.color,
  }))

  return json({ suggestions: [...catSuggestions, ...suggestions] })
}
