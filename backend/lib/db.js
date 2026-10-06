import { isSupabaseConfigured } from './supabase.js';
import { supabaseDriver } from './drivers/supabaseDriver.js';
import { fileDriver } from './drivers/fileDriver.js';

// Supabase jika dikonfigurasi, jika tidak pakai database lokal (file JSON)
export const db = isSupabaseConfigured ? supabaseDriver : fileDriver;
