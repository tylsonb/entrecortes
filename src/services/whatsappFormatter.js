import { EXPRESS_PERCENT, formatCurrency } from './quoterService.js'

export function normalizePhone(value = '') {
  if (typeof value !== 'string' || !/^\+?[\d\s()-]+$/.test(value.trim())) return ''
  const phone = value.replace(/\D/g, '')
  return /^[1-9]\d{7,14}$/.test(phone) ? phone : ''
}

export function buildQuoteMessage({ businessName, clientName, clientPhone, items, isExpress, totals, isDemo }) {
  const lines = [
    `¡Hola ${businessName}! Mi nombre es ${clientName.trim()}.`,
    ...(clientPhone?.trim() ? [`Mi teléfono de contacto es: ${clientPhone.trim()}.`] : []),
    'Quisiera consultar por estos arreglos:', '',
    ...items.map((item) => `• ${item.quantity}x ${item.name} — Desde ${formatCurrency(item.price * item.quantity)}`),
    '', `Subtotal desde: ${formatCurrency(totals.subtotal)}`,
  ]
  if (isExpress) lines.push(`Servicio Exprés (24–48 hrs, +${EXPRESS_PERCENT}%): Desde ${formatCurrency(totals.expressSurcharge)}`)
  lines.push(`Total estimado desde: ${formatCurrency(totals.totalEstimated)} CLP`)
  if (isDemo) lines.push('Precios de demostración, pendientes de confirmar con el taller.')
  lines.push('', '¿Podrían confirmar el precio y cuándo puedo acercar las prendas al taller?')
  return lines.join('\n')
}

export function generateWhatsAppLink(quote) {
  const phone = normalizePhone(quote.phoneNumber)
  return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(buildQuoteMessage(quote))}` : ''
}
