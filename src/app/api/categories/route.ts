import { db } from '@/lib/db'
import { json } from '@/lib/api'

export async function GET() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: { where: { active: true } } } } },
  })
  return json({ categories })
}
