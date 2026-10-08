import { supabase, isSupabaseConfigured } from './lib/supabase.js'

function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!isSupabaseConfigured) {
    return res.status(503).json({ error: 'Database belum dikonfigurasi' })
  }

  try {
    // Count vehicles
    const { count: vehicleCount } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })

    // Count consignments
    const { count: consignmentCount } = await supabase
      .from('consignment_requests')
      .select('*', { count: 'exact', head: true })

    // Count leads
    const { count: leadCount } = await supabase
      .from('whatsapp_leads')
      .select('*', { count: 'exact', head: true })

    // Available vehicles
    const { count: availableCount } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'AVAILABLE')

    // Recent leads
    const { data: recentLeads } = await supabase
      .from('whatsapp_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    res.status(200).json({
      success: true,
      data: {
        total_vehicles: vehicleCount || 0,
        available_vehicles: availableCount || 0,
        total_consignments: consignmentCount || 0,
        total_leads: leadCount || 0,
        recent_leads: recentLeads || []
      }
    })
  } catch (error) {
    const status = error.status || 500
    const message = error.message || 'Internal Server Error'
    res.status(status).json({ error: message })
  }
}
