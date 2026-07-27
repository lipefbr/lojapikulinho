import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, requireUser } from '@/lib/auth'
import { json, error } from '@/lib/api'

export async function GET() {
  const user = await requireUser()
  if (!user) return json({ orders: [] })
  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { items: true, payment: true, address: true },
    orderBy: { createdAt: 'desc' },
  })
  return json({ orders })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      items,
      couponCode,
      couponPercent,
      subtotal,
      discount,
      shipping,
      total,
      paymentMethod,
      notes,
      address,
      addressId,
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return error('Carrinho vazio', 422)
    }
    if (!paymentMethod) return error('Forma de pagamento obrigatória', 422)
    if (!address && !addressId) return error('Endereço obrigatório', 422)

    const user = await getCurrentUser()

    let savedAddressId = addressId
    if (!savedAddressId && user && address) {
      const addr = await db.address.create({
        data: {
          userId: user.id,
          recipient: address.recipient,
          street: address.street,
          number: address.number,
          complement: address.complement || null,
          district: address.district,
          city: address.city,
          state: address.state,
          zip: address.zip,
          label: address.label || 'Entrega',
        },
      })
      savedAddressId = addr.id
    }

    const order = await db.order.create({
      data: {
        userId: user?.id || null,
        guestEmail: user ? null : body.guestEmail || null,
        addressId: savedAddressId || null,
        subtotal: Number(subtotal),
        discount: Number(discount || 0),
        shipping: Number(shipping || 0),
        total: Number(total),
        couponCode: couponCode || null,
        paymentMethod,
        notes: notes || null,
        status: 'confirmed',
        paymentStatus: 'pending',
        items: {
          create: items.map((it: any) => ({
            productId: it.productId || null,
            name: it.name,
            price: Number(it.price),
            quantity: Number(it.quantity),
            size: it.size || null,
            color: it.color || null,
            image: it.image || null,
          })),
        },
      },
      include: { items: true },
    })

    await db.payment.create({
      data: {
        orderId: order.id,
        method: paymentMethod,
        status: paymentMethod === 'pix' ? 'pending' : 'pending',
      },
    })

    if (couponCode) {
      await db.coupon.updateMany({
        where: { code: couponCode },
        data: { usedCount: { increment: 1 } },
      })
    }

    return json({ order }, 201)
  } catch (e: any) {
    return error(e?.message || 'Erro ao criar pedido', 500)
  }
}
