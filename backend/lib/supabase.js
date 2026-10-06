import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

export const isSupabaseConfigured = config.supabase.enabled;

export const supabaseStatus = {
  configured: isSupabaseConfigured,
  message: isSupabaseConfigured
    ? 'Supabase connected'
    : 'Supabase belum dikonfigurasi — memakai database lokal (backend/data/db.json)',
};

export const supabase = isSupabaseConfigured
  ? createClient(config.supabase.url, config.supabase.key, { auth: { persistSession: false } })
  : null;
