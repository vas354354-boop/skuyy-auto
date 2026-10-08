import { supabase, isSupabaseConfigured } from './lib/supabase.js'
import { HttpError, rateLimit } from './lib/http.js'
import { parseConsignment, CONSIGNMENT_STATUSES } from './lib/validate.js'

const submitLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 })

function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
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

export default async function handler(req, res) {
  corsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (!isSupabaseConfigured) {
    return res.status(503).json({ error: 'Database belum dikonfigurasi' })
  }

  try {
    const path = req.url.split('?')[0]
    const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    // POST /api/consignment — public
    if (req.method === 'POST' && path === '/api/consignment') {
      submitLimiter(req, res, async () => {
        const body = req.body || {}
        const data = parseConsignment(body)

        const { data: consignment, error } = await supabase
          .from('consignment_requests')
          .insert([data])
          .select()
          .single()

        if (error) throw error

        return res.status(201).json({
          success: true,
          data: { id: consignment.id, status: consignment.status }
        })
      })
      return
    }

    // GET /api/consignment — admin only
    if (req.method === 'GET' && path === '/api/consignment') {
      if (!isAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const { status } = req.query || {}
      let query = supabase
        .from('consignment_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (status) {
        if (!CONSIGNMENT_STATUSES.includes(status)) {
          throw new HttpError(400, 'Status tidak valid')
        }
        query = query.eq('status', status)
      }

      const { data, error } = await query
      if (error) throw error

      return res.status(200).json({ success: true, data })
    }

    // GET /api/consignment/:id — admin only
    if (req.method === 'GET' && /^\/api\/consignment\/[^/]+$/.test(path)) {
      if (!isAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const id = path.split('/')[3]
      if (!UUID.test(id)) throw new HttpError(404, 'Pengajuan tidak ditemukan')

      const { data, error } = await supabase
        .from('consignment_requests')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new HttpError(404, 'Pengajuan tidak ditemukan')

      return res.status(200).json({ success: true, data })
    }

    // PATCH /api/consignment/:id/status — admin only
    if (req.method === 'PATCH' && path.includes('/status')) {
      if (!isAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const id = path.split('/')[3]
      if (!UUID.test(id)) throw new HttpError(404, 'Pengajuan tidak ditemukan')

      const { status } = req.body || {}
      if (!CONSIGNMENT_STATUSES.includes(status)) {
        throw new HttpError(400, 'Status tidak valid')
      }

      const { data, error } = await supabase
        .from('consignment_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new HttpError(404, 'Pengajuan tidak ditemukan')

      return res.status(200).json({ success: true, data })
    }

    res.status(404).json({ error: 'Endpoint tidak ditemukan' })
  } catch (error) {
    const status = error.status || 500
    const message = error.message || 'Internal Server Error'
    res.status(status).json({ error: message })
  }
}
