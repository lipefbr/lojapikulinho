import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, setSessionCookie } from '@/lib/auth'
import { json, error } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body
    if (!email || !password) {
      return error('E-mail e senha são obrigatórios', 422)
    }
    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return error('E-mail ou senha inválidos', 401)
    }
    const ok = await verifyPassword(password, user.password)
    if (!ok) {
      return error('E-mail ou senha inválidos', 401)
    }
    await setSessionCookie(user.id)
    return json({
      user: { id: user.id, name: user.name, email: user.email, cpf: user.cpf, phone: user.phone },
    })
  } catch (e: any) {
    return error(e?.message || 'Erro ao entrar', 500)
  }
}
