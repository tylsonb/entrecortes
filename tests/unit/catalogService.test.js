import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchServices, normalizeServices } from '../../src/services/catalogService.js'
import { initialServices } from '../../src/data/initialServices.js'
const service = { ...initialServices[0], description: null, is_active: true, price_version: 0 }
function clientFor(response) {
  const query = { select: vi.fn(() => query), eq: vi.fn(() => query), order: vi.fn(() => query), abortSignal: vi.fn(() => response) }
  return { from: vi.fn(() => query), query }
}
afterEach(() => vi.useRealTimers())
describe('catalog remote contract', () => {
  it('loads active services and normalizes nullable descriptions', async () => {
    const client = clientFor(Promise.resolve({ data: [service], error: null }))
    expect((await fetchServices({ client }))[0].description).toBe('')
    expect(client.query.eq).toHaveBeenCalledWith('is_active', true)
  })
  it('keeps a successful empty catalog empty', async () => {
    expect(await fetchServices({ client: clientFor({ data: [], error: null }) })).toEqual([])
  })
  it('rejects missing credentials, server failures and malformed prices', async () => {
    await expect(fetchServices({ client: null })).rejects.toThrow('SUPABASE_UNAVAILABLE')
    await expect(fetchServices({ client: clientFor({ error: new Error('offline') }) })).rejects.toThrow('offline')
    for (const price of [-1, 1.5, NaN]) expect(() => normalizeServices([{ ...service, base_price: price }])).toThrow()
  })
  it('times out even if the transport ignores cancellation', async () => {
    vi.useFakeTimers()
    const client = clientFor(new Promise(() => {}))
    const assertion = expect(fetchServices({ client })).rejects.toThrow('REQUEST_TIMEOUT')
    await vi.advanceTimersByTimeAsync(3000)
    await assertion
    expect(client.query.abortSignal.mock.calls[0][0].aborted).toBe(true)
  })
  it('cancels the request on unmount', async () => {
    const controller = new AbortController()
    const result = fetchServices({ client: clientFor(new Promise(() => {})), signal: controller.signal })
    controller.abort()
    await expect(result).rejects.toThrow('REQUEST_CANCELLED')
  })
})
