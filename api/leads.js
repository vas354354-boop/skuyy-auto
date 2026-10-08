import { supabase, isSupabaseConfigured } from './lib/supabase.js'
import { HttpError, rateLimit } from './lib/http.js'
import { parseLead, LEAD_STATUSES } from './lib/validate.js'

const leadLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 })

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

    // POST /api/leads — public
    if (req.method === 'POST' && path === '/api/leads') {
      leadLimiter(req, res, async () => {
        const body = req.body || {}
        const lead = parseLead(body)

        const { data, error } = await supabase
          .from('whatsapp_leads')
          .insert([lead])
          .select()
          .single()

        if (error) throw error

        return res.status(201).json({ success: true, data: { id: data.id } })
      })
      return
    }

    // GET /api/leads — admin only
    if (req.method === 'GET' && path === '/api/leads') {
      if (!isAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const { data, error } = await supabase
        .from('whatsapp_leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return res.status(200).json({ success: true, data })
    }

    // PATCH /api/leads/:id/status — admin only
    if (req.method === 'PATCH' && path.includes('/status')) {
      if (!isAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const id = path.split('/')[3]
      const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

      if (!UUID.test(id)) {
        throw new HttpError(404, 'Lead tidak ditemukan')
      }

      const { status } = req.body || {}
      if (!LEAD_STATUSES.includes(status)) {
        throw new HttpError(400, 'Status tidak valid')
      }

      const { data, error } = await supabase
        .from('whatsapp_leads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new HttpError(404, 'Lead tidak ditemukan')

      return res.status(200).json({ success: true, data })
    }

    res.status(404).json({ error: 'Endpoint tidak ditemukan' })
  } catch (error) {
    const status = error.status || 500
    const message = error.message || 'Internal Server Error'
    res.status(status).json({ error: message })
  }
}
