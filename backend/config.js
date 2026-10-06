import dotenv from 'dotenv';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isPlaceholder = (v) => !v || /GANTI_|PLACEHOLDER/i.test(v);

const jwtFromEnv = process.env.JWT_SECRET?.trim();

export const config = {
  port: Number(process.env.PORT) || 5000,
  isProduction: process.env.NODE_ENV === 'production',
  corsOrigins: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
    : null, // null = izinkan semua origin (mode dev)
  publicUrl: process.env.PUBLIC_URL?.trim().replace(/\/$/, '') || null,
  admin: {
    email: process.env.ADMIN_EMAIL?.trim() || '',
    password: process.env.ADMIN_PASSWORD?.trim() || '',
    name: process.env.ADMIN_NAME?.trim() || 'Admin',
  },
  jwtSecret: isPlaceholder(jwtFromEnv) ? crypto.randomBytes(32).toString('hex') : jwtFromEnv,
  jwtSecretIsEphemeral: isPlaceholder(jwtFromEnv),
  supabase: {
    url: process.env.SUPABASE_URL?.trim(),
    key: process.env.SUPABASE_SERVICE_KEY?.trim(),
  },
  dataDir: path.join(__dirname, 'data'),
  uploadDir: path.join(__dirname, 'uploads'),
};

config.supabase.enabled = !isPlaceholder(config.supabase.url) && !isPlaceholder(config.supabase.key);
