import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QUOTE_STORAGE_KEY, readPendingQuotes, storePendingQuote, removePendingQuote, RETENTION_MS } from '../../src/services/quoteStorageService.js'
const quote = { id: 'test', clientName: 'Ana', items: [{ id: 'hem', name: 'Dobladillo', price: 8000, quantity: 1 }], isExpress: false }
beforeEach(() => { localStorage.clear(); vi.restoreAllMocks() })
describe('temporary quote storage', () => {
  it('preserves a request across reads and removes it after confirmation', () => {
    expect(storePendingQuote(quote)).toBe(true)
    expect(readPendingQuotes()[0].quote).toEqual(quote)
    expect(removePendingQuote(quote.id)).toBe(true)
    expect(readPendingQuotes()).toEqual([])
  })
  it('recovers from malformed JSON and rejects malformed entries', () => {
    localStorage.setItem(QUOTE_STORAGE_KEY, '{broken')
    expect(storePendingQuote(quote)).toBe(true)
    localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify([{}, { id: 'bad', savedAt: Date.now(), quote: {} }]))
    expect(readPendingQuotes()).toEqual([])
  })
  it('expires old copies and retains only the last twenty', () => {
    localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify([{ id: quote.id, savedAt: Date.now() - RETENTION_MS, quote }]))
    expect(readPendingQuotes()).toEqual([])
    for (let i = 0; i < 22; i++) storePendingQuote({ ...quote, id: String(i) })
    expect(readPendingQuotes()).toHaveLength(20)
    expect(readPendingQuotes()[0].id).toBe('2')
  })
  it('does not throw when storage is inaccessible or full', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota') })
    expect(storePendingQuote(quote)).toBe(false)
    expect(removePendingQuote(quote.id)).toBe(false)
    vi.restoreAllMocks()
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new Error('Denied') })
    expect(readPendingQuotes()).toEqual([])
    expect(storePendingQuote(quote)).toBe(false)
  })
})
