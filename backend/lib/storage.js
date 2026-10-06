import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { supabase, isSupabaseConfigured } from './supabase.js';

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
export const ALLOWED_MIME = Object.keys(EXT);

export const BUCKETS = { vehicles: 'vehicle-images', consignment: 'consignment-images' };

// Simpan file ke Supabase Storage (jika aktif) atau ke folder uploads lokal. Mengembalikan URL publik.
export async function saveImage(file, kind, req) {
  const ext = EXT[file.mimetype];
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;

  if (isSupabaseConfigured) {
    const bucket = BUCKETS[kind];
    const { error } = await supabase.storage.from(bucket).upload(name, file.buffer, { contentType: file.mimetype, upsert: false });
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(name).data.publicUrl;
  }

  const dir = path.join(config.uploadDir, kind);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), file.buffer);
  const base = config.publicUrl || `${req.protocol}://${req.get('host')}`;
  return `${base}/uploads/${kind}/${name}`;
}
