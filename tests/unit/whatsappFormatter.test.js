import { describe, expect, it } from 'vitest'
import { buildQuoteMessage, generateWhatsAppLink, normalizePhone } from '../../src/services/whatsappFormatter.js'

const quote = {
  id: '00000000-0000-4000-8000-000000000001',
  phoneNumber: '+56 9 1234 5678', businessName: 'Entre Cortes y Agujas',
  clientName: ' María ', items: [{ name: 'Dobladillo (basta o ruedo)', price: 5000, quantity: 2 }],
  isExpress: true, totals: { subtotal: 10000, expressSurcharge: 3000, totalEstimated: 13000 },
}
describe('CLP quote message', () => {
  it('omits the internal id and includes accents, quantities, currency and estimate', () => {
    const message = buildQuoteMessage(quote)
    for (const text of ['María', '2x Dobladillo (basta o ruedo)', 'Desde $10.000', 'Subtotal desde: $10.000', 'Desde $3.000', 'Total estimado desde: $13.000 CLP', '+30%', 'estimado']) {
      expect(message).toContain(text)
    }
    expect(message).not.toContain('Referencia:')
    expect(message).not.toContain(quote.id)
  })
  it('includes the optional contact phone only when provided', () => {
    expect(buildQuoteMessage({ ...quote, clientPhone: ' +56 9 1111 2222 ' })).toContain('Mi teléfono de contacto es: +56 9 1111 2222.')
    expect(buildQuoteMessage(quote)).not.toContain('teléfono de contacto')
  })
  it('encodes the complete message and validates destination', () => {
    const url = new URL(generateWhatsAppLink(quote))
    expect(url.pathname).toBe('/56912345678')
    expect(url.searchParams.get('text')).toBe(buildQuoteMessage(quote))
    for (const phone of ['', '123', '00012345678', 'abcd56912345678']) expect(normalizePhone(phone)).toBe('')
    expect(generateWhatsAppLink({ ...quote, phoneNumber: '' })).toBe('')
  })
})
