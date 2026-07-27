import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { db } from './db'

const SECRET = process.env.AUTH_SECRET || 'kidshop-dev-secret-change-me-please-123456'
const encoder = new TextEncoder()

const COOKIE_NAME = 'kidshop_session'

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createSessionToken(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(encoder.encode(SECRET))
  return token
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, encoder.encode(SECRET))
    return payload as { sub: string }
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    const payload = await verifySessionToken(token)
    if (!payload?.sub) return null
    const user = await db.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, cpf: true, phone: true, role: true },
    })
    return user
  } catch {
    return null
  }
}

export async function setSessionCookie(userId: string) {
  const token = await createSessionToken(userId)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export { COOKIE_NAME }
