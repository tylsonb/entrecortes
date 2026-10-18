import { supabase } from './supabaseClient.js'
import { validateQuote } from './quoterService.js'
import { withRequestTimeout } from './requestService.js'

export function toQuotePayload(quote) {
  return {
    id: quote.id, client_name: quote.clientName.trim(), client_phone: quote.clientPhone?.trim() || null, items: quote.items,
    subtotal: quote.totals.subtotal, is_express: quote.isExpress,
    express_surcharge: quote.totals.expressSurcharge, total_estimated: quote.totals.totalEstimated,
    currency: 'CLP', is_demo: Boolean(quote.isDemo), status: 'pending',
  }
}

export async function saveQuote(quote, client = supabase) {
  try {
    if (!client) throw new Error('SUPABASE_UNAVAILABLE')
    if (validateQuote(quote)) throw new Error('INVALID_QUOTE')
    await withRequestTimeout(async (signal) => {
      const { error } = await client.from('quotes').insert(toQuotePayload(quote)).abortSignal(signal)
      if (error) throw error
    })
    return { status: 'saved' }
  } catch {
    // No se registran datos personales, payloads ni detalles de errores remotos.
    console.warn('No se pudo confirmar el guardado de la cotización.')
    return { status: 'failed', error: 'No se pudo confirmar el guardado.' }
  }
}
