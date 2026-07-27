import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, setSessionCookie } from '@/lib/auth'
import { json, error } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, cpf, phone } = body
    if (!name || !email || !password) {
      return error('Nome, e-mail e senha são obrigatórios', 422)
    }
    if (password.length < 6) {
      return error('A senha deve ter ao menos 6 caracteres', 422)
    }
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return error('Já existe uma conta com este e-mail', 409)
    }
    if (cpf) {
      const cpfExists = await db.user.findUnique({ where: { cpf } })
      if (cpfExists) return error('CPF já cadastrado', 409)
    }
    const hashed = await hashPassword(password)
    const user = await db.user.create({
      data: { name, email, password: hashed, cpf: cpf || null, phone: phone || null },
    })
    await setSessionCookie(user.id)
    return json({
      user: { id: user.id, name: user.name, email: user.email, cpf: user.cpf, phone: user.phone },
    })
  } catch (e: any) {
    return error(e?.message || 'Erro ao cadastrar', 500)
  }
}
