import { describe, expect, it } from 'vitest'
import { defaultPricesApproved, initialServices } from '../../src/data/initialServices.js'

describe('approved service price defaults', () => {
  it('matches the approved CLP catalog and public names', () => {
    expect(defaultPricesApproved).toBe(true)
    expect(initialServices.map(({ name, base_price }) => [name, base_price])).toEqual([
      ['Dobladillo (basta o ruedo)', 5000],
      ['Cambio de cremallera (cierre o zipper)', 6000],
      ['Ajuste de cintura', 6000],
      ['Reparación de costuras', 5000],
      ['Ajuste de mangas', 5000],
      ['Cambio de botones', 5000],
      ['Transformación de prenda', 5000],
      ['Modificación de vestido', 5000],
    ])
  })
})
