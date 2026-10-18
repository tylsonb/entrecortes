import { describe, expect, it, vi } from 'vitest'
import { checkAdmin, updateServicePrice } from '../../src/services/adminService.js'
import { initialServices } from '../../src/data/initialServices.js'
const service = { ...initialServices[0], is_active: true, price_version: 1 }
function clientFor(responses) {
  const calls = []
  const from = vi.fn((table) => {
    const query = { select: vi.fn(() => query), update: vi.fn(() => query), eq: vi.fn(() => query),
      abortSignal: vi.fn(async () => responses.shift()) }
    calls.push({ table, query })
    return query
  })
  return { from, calls }
}
describe('admin price updates', () => {
  it('denies authenticated users without membership before writing', async () => {
    const client = clientFor([{ data: [], error: null }])
    expect((await updateServicePrice({ id: service.id, basePrice: 9000, expectedVersion: 0 }, client)).status).toBe('denied')
    expect(client.calls).toHaveLength(1)
    expect(await checkAdmin(null)).toBe(false)
  })
  it('updates only the price with an expected version', async () => {
    const client = clientFor([{ data: [{ user_id: 'admin' }] }, { data: [{ ...service, base_price: 9000 }] }])
    const result = await updateServicePrice({ id: service.id, basePrice: 9000, expectedVersion: 0 }, client)
    expect(result.status).toBe('saved')
    expect(client.calls[1].query.update).toHaveBeenCalledWith({ base_price: 9000 })
    expect(client.calls[1].query.eq).toHaveBeenCalledWith('price_version', 0)
  })
  it('distinguishes an optimistic conflict from a revoked permission', async () => {
    const client = clientFor([{ data: [{ user_id: 'admin' }] }, { data: [] }, { data: [{ user_id: 'admin' }] }, { data: [service] }])
    expect((await updateServicePrice({ id: service.id, basePrice: 9000, expectedVersion: 0 }, client)).status).toBe('conflict')
    const revoked = clientFor([{ data: [{ user_id: 'admin' }] }, { data: [] }, { data: [] }])
    expect((await updateServicePrice({ id: service.id, basePrice: 9000, expectedVersion: 0 }, revoked)).status).toBe('denied')
  })
  it('rejects invalid prices and reports errors without a retry', async () => {
    const client = clientFor([{ data: [{ user_id: 'admin' }] }, { error: new Error('offline') }])
    expect((await updateServicePrice({ id: service.id, basePrice: 1.2, expectedVersion: 0 }, client)).status).toBe('error')
    expect(client.from).not.toHaveBeenCalled()
    expect((await updateServicePrice({ id: service.id, basePrice: 9000, expectedVersion: 0 }, client)).status).toBe('error')
    expect(client.calls).toHaveLength(2)
  })
})
