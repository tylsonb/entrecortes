import { supabase } from './supabaseClient.js'
import { isValidPrice } from './quoterService.js'
import { withRequestTimeout } from './requestService.js'

export const SERVICE_FIELDS = 'id,name,category,base_price,estimated_time,description,is_active,price_version'
const categories = ['reparacion', 'ajuste', 'modificacion']
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function normalizeServices(data) {
  if (!Array.isArray(data) || data.some((item) => !item || !uuid.test(item.id)
    || typeof item.name !== 'string' || !item.name.trim() || !categories.includes(item.category)
    || !isValidPrice(item.base_price) || typeof item.estimated_time !== 'string' || !item.estimated_time.trim()
    || (item.description != null && typeof item.description !== 'string')
    || typeof item.is_active !== 'boolean' || !Number.isSafeInteger(item.price_version) || item.price_version < 0)
    || new Set(data.map((item) => item.id)).size !== data.length) throw new Error('INVALID_CATALOG')
  return data.map((item) => ({ ...item, description: item.description ?? '' }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

export async function fetchServices({ client = supabase, signal, admin = false } = {}) {
  if (!client) throw new Error('SUPABASE_UNAVAILABLE')
  return withRequestTimeout(async (requestSignal) => {
    let query = client.from('services').select(SERVICE_FIELDS)
    if (!admin) query = query.eq('is_active', true)
    const { data, error } = await query.order('name').abortSignal(requestSignal)
    if (error) throw error
    return normalizeServices(data)
  }, { signal })
}
