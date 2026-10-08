import crypto from 'crypto'
import { HttpError } from './lib/http.js'
import { signToken, safeEqual } from './middleware/auth.js'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const MAX_LOGIN_ATTEMPTS = 20

const loginAttempts = new Map()

function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function checkRateLimit(ip) {
  const key = ip || 'unknown'
  const now = Date.now()
  const entry = loginAttempts.get(key)

  if (!entry || entry.reset < now) {
    loginAttempts.set(key, { count: 1, reset: now + LOGIN_WINDOW_MS })
    return true
  }

  entry.count += 1
  if (entry.count > MAX_LOGIN_ATTEMPTS) {
    throw new HttpError(429, 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.')
  }

  return true
}

export default async function handler(req, res) {
  corsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const path = req.url.split('?')[0]

    // POST /api/auth/login
    if (req.method === 'POST' && path === '/api/auth/login') {
      checkRateLimit(req.headers['x-forwarded-for'] || req.socket?.remoteAddress)

      const { email, password } = req.body || {}

      if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new HttpError(503, 'Admin belum dikonfigurasi.')
      }

      const valid = typeof email === 'string' && typeof password === 'string'
        && safeEqual(email.trim().toLowerCase(), ADMIN_EMAIL.toLowerCase())
        && safeEqual(password, ADMIN_PASSWORD)

      if (!valid) {
        throw new HttpError(401, 'Email atau password salah')
      }

      const user = { id: 'admin', email: ADMIN_EMAIL, role: 'admin', name: process.env.ADMIN_NAME || 'Admin' }
      const token = signToken(user)

      return res.status(200).json({
        success: true,
        user,
        token
      })
    }

    // GET /api/auth/me
    if (req.method === 'GET' && path === '/api/auth/me') {
      const authHeader = req.headers.authorization || ''
      const token = authHeader.replace(/^Bearer\s+/i, '')
      if (!token) throw new HttpError(401, 'Token tidak ditemukan')

      // Verify token (simple check)
      const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex')
      const [header, payload, signature] = token.split('.')
      const computed = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${payload}`)
        .digest('base64url')

      if (computed !== signature) throw new HttpError(401, 'Token tidak valid')

      const user = JSON.parse(Buffer.from(payload, 'base64url').toString())
      const { id, email, role, name } = user

      return res.status(200).json({
        success: true,
        user: { id, email, role, name }
      })
    }

    // POST /api/auth/logout
    if (req.method === 'POST' && path === '/api/auth/logout') {
      return res.status(200).json({ success: true, message: 'Logout berhasil' })
    }

    res.status(404).json({ error: 'Endpoint tidak ditemukan' })
  } catch (error) {
    const status = error.status || 500
    const message = error.message || 'Internal Server Error'
    res.status(status).json({ error: message })
  }
}
