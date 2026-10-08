import { supabase, isSupabaseConfigured } from './lib/supabase.js'
import { asyncHandler, HttpError } from './lib/http.js'
import { parseVehicle, parseImages, VEHICLE_STATUSES } from './lib/validate.js'
import { requireAdmin } from './middleware/auth.js'

function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req, res) {
  corsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (!isSupabaseConfigured) {
    return res.status(503).json({ error: 'Database belum dikonfigurasi' })
  }

  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const idOr404 = (id) => {
    if (!UUID.test(id)) throw new HttpError(404, 'Kendaraan tidak ditemukan')
    return id
  }
  const optNum = (v) => (v === undefined || v === '' || Number.isNaN(Number(v)) ? undefined : Number(v))

  try {
    // GET /api/vehicles — public catalog
    if (req.method === 'GET') {
      const { type, status, brand, transmission, fuel, search } = req.query
      
      let query = supabase
        .from('vehicles')
        .select('*, vehicle_images(id, image_url, is_cover, sort_order)')
        .order('created_at', { ascending: false })

      if (type) query = query.eq('type', type)
      if (status) query = query.eq('status', status)
      if (brand) query = query.ilike('brand', `%${brand}%`)
      if (transmission) query = query.eq('transmission', transmission)
      if (fuel) query = query.eq('fuel', fuel)
      if (req.query.min_price != null) query = query.gte('price', optNum(req.query.min_price))
      if (req.query.max_price != null) query = query.lte('price', optNum(req.query.max_price))
      if (search) {
        const s = search.toLowerCase()
        query = query.or(`brand.ilike.%${s}%,model.ilike.%${s}%`)
      }

      const { data, error } = await query
      if (error) throw error

      return res.status(200).json({ data })
    }

    // POST /api/vehicles — admin create
    if (req.method === 'POST') {
      const user = req.headers['x-user-id'] ? JSON.parse(Buffer.from(req.headers['x-user-id'], 'base64').toString()) : null
      if (user?.role !== 'admin') {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const body = req.body || {}
      const data = parseVehicle(body)
      const images = parseImages(body.images) || []

      const { data: vehicle, error } = await supabase
        .from('vehicles')
        .insert([data])
        .select()
        .single()

      if (error) throw error

      if (images.length > 0) {
        await supabase
          .from('vehicle_images')
          .insert(images.map((url, idx) => ({
            vehicle_id: vehicle.id,
            image_url: url,
            is_cover: idx === 0,
            sort_order: idx
          })))
      }

      return res.status(201).json({ success: true, data: vehicle })
    }

    // PUT /api/vehicles/:id — admin update
    if (req.method === 'PUT') {
      const user = req.headers['x-user-id'] ? JSON.parse(Buffer.from(req.headers['x-user-id'], 'base64').toString()) : null
      if (user?.role !== 'admin') {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const { id } = req.query
      const body = req.body || {}
      const data = parseVehicle(body, { partial: true })
      const images = parseImages(body.images)

      const { data: updated, error } = await supabase
        .from('vehicles')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', idOr404(id))
        .select()
        .single()

      if (error) throw error
      if (!updated) throw new HttpError(404, 'Kendaraan tidak ditemukan')

      if (images !== undefined) {
        await supabase.from('vehicle_images').delete().eq('vehicle_id', id)
        if (images.length > 0) {
          await supabase
            .from('vehicle_images')
            .insert(images.map((url, idx) => ({
              vehicle_id: id,
              image_url: url,
              is_cover: idx === 0,
              sort_order: idx
            })))
        }
      }

      return res.status(200).json({ success: true, data: updated })
    }

    // PATCH /api/vehicles/:id/status — admin patch status
    if (req.method === 'PATCH' && req.url.includes('/status')) {
      const user = req.headers['x-user-id'] ? JSON.parse(Buffer.from(req.headers['x-user-id'], 'base64').toString()) : null
      if (user?.role !== 'admin') {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const id = req.url.split('/')[3]
      const { status } = req.body || {}
      if (!VEHICLE_STATUSES.includes(status)) {
        throw new HttpError(400, 'Status tidak valid')
      }

      const { data, error } = await supabase
        .from('vehicles')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', idOr404(id))
        .select()
        .single()

      if (error) throw error
      if (!data) throw new HttpError(404, 'Kendaraan tidak ditemukan')

      return res.status(200).json({ success: true, data })
    }

    // DELETE /api/vehicles/:id — admin delete
    if (req.method === 'DELETE') {
      const user = req.headers['x-user-id'] ? JSON.parse(Buffer.from(req.headers['x-user-id'], 'base64').toString()) : null
      if (user?.role !== 'admin') {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const { id } = req.query
      const { error } = await supabase.from('vehicles').delete().eq('id', idOr404(id))
      if (error) throw error

      return res.status(200).json({ success: true })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    const status = error.status || 500
    const message = error.message || 'Internal Server Error'
    res.status(status).json({ error: message })
  }
}
