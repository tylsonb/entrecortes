import { supabase } from './supabaseClient.js'
import { isValidPrice } from './quoterService.js'
import { normalizeServices, SERVICE_FIELDS } from './catalogService.js'
import { withRequestTimeout } from './requestService.js'

export async function checkAdmin(client = supabase) {
  if (!client) return false
  return withRequestTimeout(async (signal) => {
    const { data, error } = await client.from('admin_users').select('user_id').abortSignal(signal)
    if (error) throw error
    return Array.isArray(data) && data.length > 0
  })
}

export async function updateServicePrice({ id, basePrice, expectedVersion }, client = supabase) {
  if (!isValidPrice(basePrice) || !Number.isSafeInteger(expectedVersion) || expectedVersion < 0) {
    return { status: 'error', message: 'Ingresa un precio entero entre 0 y 99.999.999 CLP.' }
  }
  try {
    if (!client || !await checkAdmin(client)) return { status: 'denied', message: 'Tu sesión no tiene permiso para editar precios. Vuelve a iniciar sesión.' }
    const result = await withRequestTimeout((signal) => client.from('services')
      .update({ base_price: basePrice }).eq('id', id).eq('price_version', expectedVersion)
      .select(SERVICE_FIELDS).abortSignal(signal))
    if (result.error) throw result.error
    if (result.data?.length === 1) return { status: 'saved', service: normalizeServices(result.data)[0] }
    if (!await checkAdmin(client)) return { status: 'denied', message: 'Tu permiso de administración ya no está disponible.' }
    const latest = await withRequestTimeout((signal) => client.from('services').select(SERVICE_FIELDS).eq('id', id).abortSignal(signal))
    if (latest.error) throw latest.error
    if (latest.data?.length === 1 && latest.data[0].price_version !== expectedVersion) {
      return { status: 'conflict', service: normalizeServices(latest.data)[0], message: 'El precio cambió en otra sesión. Revisa el precio vigente antes de guardar de nuevo.' }
    }
    return { status: 'error', message: 'El servicio ya no está disponible para editar. Actualiza el catálogo.' }
  } catch {
    return { status: 'error', message: 'No pudimos confirmar el cambio. Actualiza el catálogo antes de volver a guardar.' }
  }
}
