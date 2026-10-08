// Helper untuk error HTTP & handler async
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export const asyncHandler = (fn) => async (req, res) => {
  try {
    await fn(req, res)
  } catch (error) {
    const status = error.status || 500
    const message = error.message || 'Internal Server Error'
    res.status(status).json({ error: message })
  }
}

// Rate limit sederhana per IP (in-memory)
const hits = new Map()

setInterval(() => {
  const now = Date.now()
  for (const [key, v] of hits) {
    if (v.reset < now) hits.delete(key)
  }
}, 60000).unref()

export function rateLimit({ windowMs, max, message = 'Terlalu banyak permintaan, coba lagi nanti.' }) {
  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown'
    const now = Date.now()
    const entry = hits.get(key)
    
    if (!entry || entry.reset < now) {
      hits.set(key, { count: 1, reset: now + windowMs })
      return next()
    }
    
    entry.count += 1
    if (entry.count > max) {
      return res.status(429).json({ error: message })
    }
    next()
  }
}
