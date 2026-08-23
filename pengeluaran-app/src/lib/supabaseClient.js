import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env (lihat .env.example).'
  )
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Only construct the real client when we have credentials, otherwise the
// SDK throws immediately at import time and crashes the whole app before
// the friendly setup guide ever gets a chance to render.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key')
