import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useServices } from '../../src/hooks/useServices.js'
import { fetchServices } from '../../src/services/catalogService.js'
import { initialServices } from '../../src/data/initialServices.js'
vi.mock('../../src/services/supabaseClient.js', () => ({ supabase: {} }))
vi.mock('../../src/services/catalogService.js', () => ({ fetchServices: vi.fn() }))
beforeEach(() => vi.clearAllMocks())
describe('remote catalog hook', () => {
  it('exposes loading and filters the remote catalog in memory', async () => {
    fetchServices.mockResolvedValue([{ ...initialServices[0], base_price: 9000 }])
    const { result } = renderHook(() => useServices())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.source).toBe('remote'))
    expect(result.current.services[0].base_price).toBe(9000)
    act(() => result.current.setSearch('basta'))
    expect(result.current.services).toHaveLength(1)
    act(() => result.current.setActiveCategory('reparacion'))
    expect(result.current.services).toHaveLength(0)
    expect(fetchServices).toHaveBeenCalledTimes(1)
  })
  it('preserves a successful empty response and falls back only on failure', async () => {
    fetchServices.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('REQUEST_TIMEOUT'))
    const { result, rerender } = renderHook(({ route }) => useServices(route), { initialProps: { route: false } })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.services).toEqual([])
    rerender({ route: true })
    await waitFor(() => expect(result.current.source).toBe('local'))
    expect(result.current.services).toHaveLength(8)
    expect(result.current.error).toBeTruthy()
  })
  it('ignores results from a request cancelled by route change', async () => {
    let finish
    fetchServices.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve })).mockResolvedValueOnce([])
    const { result, rerender } = renderHook(({ route }) => useServices(route), { initialProps: { route: false } })
    rerender({ route: true })
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => finish(initialServices))
    expect(result.current.services).toEqual([])
  })
})
