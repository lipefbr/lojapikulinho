import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { json } from '@/lib/api'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return json({ user: null })
  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
  return json({ user, addresses })
}
