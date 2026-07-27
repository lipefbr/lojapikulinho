import path from 'path'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'

/**
 * Resolve the absolute path to the SQLite database file.
 *
 * In development: process.cwd() is the project root → db/custom.db works.
 * In standalone (production): the server runs from .next/standalone/<nested>/
 * but the DB was created at the deploy root. So we walk up the directory
 * tree looking for db/custom.db.
 */
function resolveDbPath(): string {
  // 1) Try process.cwd() – works in local dev
  const cwdDb = path.join(process.cwd(), 'db', 'custom.db')
  if (fs.existsSync(cwdDb)) return cwdDb

  // 2) Walk up from __dirname (standalone server location)
  let dir = __dirname
  for (let i = 0; i < 12; i++) {
    const candidate = path.join(dir, 'db', 'custom.db')
    if (fs.existsSync(candidate)) return candidate
    const parent = path.dirname(dir)
    if (parent === dir) break // reached filesystem root
    dir = parent
  }

  // 3) Fallback – return cwd-relative so Prisma will create it there
  return cwdDb
}

const dbUrl = `file:${resolveDbPath()}`

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: dbUrl,
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
