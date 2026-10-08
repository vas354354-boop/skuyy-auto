import crypto from 'crypto'
import { supabase, isSupabaseConfigured } from './supabase.js'
import { HttpError } from './http.js'

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }
export const ALLOWED_MIME = Object.keys(EXT)

export const BUCKETS = { vehicles: 'vehicle-images', consignment: 'consignment-images' }

// Untuk Vercel Serverless, hanya support Supabase Storage
export async function saveImage(file, kind) {
  if (!isSupabaseConfigured) {
    throw new HttpError(503, 'Storage tidak dikonfigurasi. Atur SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.')
  }

  const ext = EXT[file.mimetype]
  if (!ext) {
    throw new HttpError(400, 'Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.')
  }

  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`
  const bucket = BUCKETS[kind] || 'uploads'

  const { error } = await supabase.storage.from(bucket).upload(name, file.buffer, {
    contentType: file.mimetype,
    upsert: false
  })

  if (error) {
    throw new HttpError(500, `Gagal upload: ${error.message}`)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(name)
  return data.publicUrl
}
