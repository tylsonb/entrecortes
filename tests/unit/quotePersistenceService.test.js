import { afterEach, describe, expect, it, vi } from 'vitest'
import { saveQuote } from '../../src/services/quotePersistenceService.js'
const quote = { id: 'request', clientName: ' Ana ', clientPhone: ' +56 9 1234 5678 ', items: [{ id: 'hem', name: 'Dobladillo', price: 8000, quantity: 1 }],
  isExpress: false, isDemo: true, totals: { subtotal: 8000, expressSurcharge: 0, totalEstimated: 8000 } }
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })
describe('quote persistence', () => {
  it('inserts pending CLP without requiring a select', async () => {
    const insert = vi.fn(() => ({ abortSignal: vi.fn().mockResolvedValue({ error: null }) }))
    expect(await saveQuote(quote, { from: () => ({ insert }) })).toEqual({ status: 'saved' })
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ id: 'request', client_name: 'Ana', client_phone: '+56 9 1234 5678', currency: 'CLP', is_demo: true, status: 'pending', total_estimated: 8000 }))
  })
  it('stores null when the client phone is omitted', async () => {
    const insert = vi.fn(() => ({ abortSignal: vi.fn().mockResolvedValue({ error: null }) }))
    await saveQuote({ ...quote, clientPhone: '' }, { from: () => ({ insert }) })
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ client_phone: null }))
  })
  it('returns failure without logging personal details', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect((await saveQuote(quote, null)).status).toBe('failed')
    expect(warning).toHaveBeenCalledWith('No se pudo confirmar el guardado de la cotización.')
  })
  it('bounds insertion time', async () => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = saveQuote(quote, { from: () => ({ insert: () => ({ abortSignal: () => new Promise(() => {}) }) }) })
    await vi.advanceTimersByTimeAsync(3000)
    expect((await result).status).toBe('failed')
  })
})
