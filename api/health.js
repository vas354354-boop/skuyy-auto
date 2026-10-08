import { supabase, isSupabaseConfigured } from './lib/supabase.js'

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id')
        .limit(1)

      if (error) throw error

      return res.status(200).json({
        status: 'OK',
        message: 'SKUYY AUTO Backend is running 🚀',
        database: {
          driver: 'Supabase',
          configured: true,
          status: 'Connected'
        }
      })
    } else {
      return res.status(200).json({
        status: 'OK',
        message: 'SKUYY AUTO Backend is running 🚀',
        database: {
          driver: 'Supabase',
          configured: false,
          status: 'Not configured'
        }
      })
    }
  } catch (error) {
    return res.status(500).json({
      status: 'ERROR',
      message: error.message,
      database: {
        driver: 'Supabase',
        configured: isSupabaseConfigured,
        status: 'Disconnected'
      }
    })
  }
}
