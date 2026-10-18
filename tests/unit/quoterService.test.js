import { describe, expect, it } from 'vitest'
import { calculateTotals, formatCurrency, isValidPrice } from '../../src/services/quoterService.js'

describe('CLP calculations', () => {
  it('calculates integer pesos and quantities', () => {
    expect(calculateTotals([{ price: 8000, quantity: 2 }, { price: 12000, quantity: 1 }], false))
      .toEqual({ subtotal: 28000, expressSurcharge: 0, totalEstimated: 28000 })
    expect(formatCurrency(20000)).toBe('$20.000')
  })
  it('rounds the express surcharge once for the entire subtotal', () => {
    expect(calculateTotals([{ price: 1005, quantity: 1 }], true))
      .toEqual({ subtotal: 1005, expressSurcharge: 302, totalEstimated: 1307 })
    expect(calculateTotals([{ price: 50000, quantity: 1 }], true).totalEstimated).toBe(65000)
    expect(calculateTotals([], true).totalEstimated).toBe(0)
  })
  it('rejects fractional, negative and out of range prices', () => {
    for (const value of [-1, 1.5, Infinity, NaN, 100000000, '8000', null]) expect(isValidPrice(value)).toBe(false)
    expect(isValidPrice(0)).toBe(true)
    expect(isValidPrice(99999999)).toBe(true)
  })
})
