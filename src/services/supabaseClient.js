import { createClient } from '@supabase/supabase-js'

export function createOptionalClient(url, key) {
  try {
    if (!url || !key || key.startsWith('sb_secret_')) return null
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return null
    if (key.startsWith('eyJ')) {
      const payload = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (payload.role !== 'anon') return null
    } else if (!key.startsWith('sb_publishable_')) return null
    return createClient(url, key)
  } catch {
    return null
  }
}

export const supabase = createOptionalClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
