import { NextResponse } from 'next/server'
import { getCurrentUser } from './auth'
import { db } from './db'

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) return null
  return user
}

export type SafeUser = NonNullable<Awaited<ReturnType<typeof requireUser>>>

export async function getProducts(opts: {
  category?: string
  search?: string
  featured?: boolean
  sort?: string
  limit?: number
  ageRange?: string
  gender?: string
  excludeIds?: string[]
  priceRange?: string
  ids?: string[]
} = {}) {
  const { category, search, featured, sort, limit, ageRange, gender, excludeIds, priceRange, ids } = opts
  const where: any = { active: true }
  if (category && category !== 'todos') {
    where.category = { slug: category }
  }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ]
  }
  if (featured) {
    where.featured = true
  }
  if (ageRange) {
    where.ageRange = { contains: ageRange }
  }
  if (gender && gender !== 'unissex') {
    where.gender = { in: [gender, 'unissex'] }
  }
  if (ids && ids.length > 0) {
    where.id = { in: ids }
  }
  if (excludeIds && excludeIds.length > 0) {
    where.id = { notIn: excludeIds }
  }
  if (priceRange) {
    const [min, max] = priceRange.split('-').map(Number)
    if (!isNaN(min) && !isNaN(max)) {
      where.price = { gte: min, lte: max }
    } else if (!isNaN(min)) {
      where.price = { gte: min }
    }
  }
  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'price-asc') orderBy = { price: 'asc' }
  if (sort === 'price-desc') orderBy = { price: 'desc' }
  if (sort === 'rating') orderBy = { rating: 'desc' }
  if (sort === 'popular') orderBy = { reviewCount: 'desc' }

  const products = await db.product.findMany({
    where,
    include: { category: true },
    orderBy,
    ...(limit ? { take: limit } : {}),
  })
  return products
}

export function serializeProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: p.images.split(',').map((s: string) => s.trim()).filter(Boolean),
    sizes: p.sizes.split(',').map((s: string) => s.trim()).filter(Boolean),
    colors: p.colors.split(',').map((s: string) => s.trim()).filter(Boolean),
    ageRange: p.ageRange,
    gender: p.gender,
    categoryId: p.categoryId,
    category: p.category,
    stock: p.stock,
    rating: p.rating,
    reviewCount: p.reviewCount,
    featured: p.featured,
  }
}
