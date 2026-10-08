import crypto from 'crypto'
import { HttpError } from '../lib/http.js'

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex')
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

// Simple JWT sign (HS256)
export function signToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({ ...user, iat: Math.floor(Date.now() / 1000) })).toString('base64url')
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url')
  return `${header}.${payload}.${signature}`
}

// Simple JWT verify
export function verifyToken(token) {
  try {
    const [header, payload, signature] = token.split('.')
    const computed = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url')
    if (computed !== signature) throw new Error('Invalid signature')
    return JSON.parse(Buffer.from(payload, 'base64url').toString())
  } catch (error) {
    throw new HttpError(401, 'Token tidak valid')
  }
}

// Safe string compare (mencegah timing attack)
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// Middleware untuk memvalidasi admin token
export function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace(/^Bearer\s+/i, '')
    if (!token) throw new HttpError(401, 'Token tidak ditemukan')
    
    const user = verifyToken(token)
    if (user.role !== 'admin') throw new HttpError(403, 'Akses ditolak')
    
    req.user = user
    next()
  } catch (error) {
    const status = error.status || 401
    const message = error.message || 'Unauthorized'
    res.status(status).json({ error: message })
  }
}
