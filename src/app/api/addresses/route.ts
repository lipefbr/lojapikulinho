import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, json, error } from '@/lib/api'

export async function GET() {
  const user = await requireUser()
  if (!user) return json({ addresses: [] })
  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
  return json({ addresses })
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    if (!user) return error('Não autenticado', 401)
    const body = await req.json()
    const { recipient, street, number, complement, district, city, state, zip, label, isDefault } = body
    if (!recipient || !street || !number || !district || !city || !state || !zip) {
      return error('Endereço incompleto', 422)
    }
    if (isDefault) {
      await db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } })
    }
    const address = await db.address.create({
      data: {
        userId: user.id,
        recipient,
        street,
        number,
        complement: complement || null,
        district,
        city,
        state,
        zip,
        label: label || 'Casa',
        isDefault: !!isDefault,
      },
    })
    return json({ address }, 201)
  } catch (e: any) {
    return error(e?.message, 500)
  }
}
