import { saveImage, ALLOWED_MIME, BUCKETS } from './lib/storage.js'
import { HttpError, rateLimit } from './lib/http.js'
import { isSupabaseConfigured } from './lib/supabase.js'

const uploadLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 15 })

function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

function isAdmin(req) {
  const userId = req.headers['x-user-id']
  if (!userId) return false
  try {
    const user = JSON.parse(Buffer.from(userId, 'base64').toString())
    return user.role === 'admin'
  } catch {
    return false
  }
}

// Vercel tidak support multipart form data secara native untuk serverless functions
// Kamu perlu pakai middleware atau upload langsung ke Supabase dari client-side
// Ini adalah skeleton endpoint

export default async function handler(req, res) {
  corsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (!isSupabaseConfigured) {
    return res.status(503).json({ error: 'Storage belum dikonfigurasi' })
  }

  try {
    const path = req.url.split('?')[0]

    // POST /api/uploads/vehicles — admin only
    if (req.method === 'POST' && path === '/api/uploads/vehicles') {
      if (!isAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Vercel serverless functions tidak support file uploads langsung
      // Alternatif: upload dari frontend langsung ke Supabase Storage
      return res.status(501).json({
        error: 'Upload langsung tidak didukung di Vercel serverless',
        hint: 'Upload file dari frontend langsung ke Supabase Storage'
      })
    }

    // POST /api/uploads/consignment — public
    if (req.method === 'POST' && path === '/api/uploads/consignment') {
      uploadLimiter(req, res, () => {
        return res.status(501).json({
          error: 'Upload langsung tidak didukung di Vercel serverless',
          hint: 'Upload file dari frontend langsung ke Supabase Storage'
        })
      })
      return
    }

    res.status(404).json({ error: 'Endpoint tidak ditemukan' })
  } catch (error) {
    const status = error.status || 500
    const message = error.message || 'Internal Server Error'
    res.status(status).json({ error: message })
  }
}
