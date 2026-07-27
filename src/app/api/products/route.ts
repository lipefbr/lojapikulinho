import { NextRequest } from 'next/server'
import { getProducts, serializeProduct, json } from '@/lib/api'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || undefined
  const search = searchParams.get('search') || undefined
  const featured = searchParams.get('featured') === 'true'
  const sort = searchParams.get('sort') || undefined
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined
  const ageRange = searchParams.get('ageRange') || undefined
  const gender = searchParams.get('gender') || undefined
  const exclude = searchParams.get('exclude') || undefined
  const priceRange = searchParams.get('priceRange') || undefined
  const ids = searchParams.get('ids') || undefined

  const products = await getProducts({ category, search, featured, sort, limit, ageRange, gender, excludeIds: exclude ? exclude.split(',').filter(Boolean) : undefined, priceRange, ids: ids ? ids.split(',').filter(Boolean) : undefined })
  return json({ products: products.map(serializeProduct) })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const product = await db.product.create({ data: body })
    return json(serializeProduct(product), 201)
  } catch (e: any) {
    return json({ error: e?.message }, 500)
  }
}
