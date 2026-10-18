export const EXPRESS_RATE = 0.3
export const EXPRESS_PERCENT = EXPRESS_RATE * 100
export const MAX_AMOUNT = 99999999
const formatter = new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', minimumFractionDigits: 0, maximumFractionDigits: 0,
})

export function isValidPrice(value) {
  return Number.isSafeInteger(value) && value >= 0 && value <= MAX_AMOUNT
}

export function calculateTotals(items, isExpress, expressRate = EXPRESS_RATE) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const expressSurcharge = isExpress ? Math.round(subtotal * expressRate) : 0
  return { subtotal, expressSurcharge, totalEstimated: subtotal + expressSurcharge }
}

export function validateQuote({ clientName, items, isExpress }) {
  if (!Array.isArray(items) || !items.length) return 'Agrega al menos un servicio a tu presupuesto.'
  if (typeof clientName !== 'string' || !clientName.trim()) return 'Escribe tu nombre para preparar el presupuesto.'
  if (items.some((item) => !isValidPrice(item.price) || !Number.isSafeInteger(item.quantity) || item.quantity < 1
    || typeof item.name !== 'string' || !item.name.trim() || typeof item.id !== 'string')) {
    return 'Revisa los precios y las cantidades de tu presupuesto.'
  }
  if (!isValidPrice(calculateTotals(items, isExpress).totalEstimated)) return 'El presupuesto supera el monto permitido. Contacta al taller para cotizarlo.'
  return ''
}

export function formatCurrency(amount) {
  return formatter.format(amount)
}
