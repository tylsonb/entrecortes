import { useRef, useState } from 'react'
import { calculateTotals, validateQuote } from '../services/quoterService.js'
import { buildQuoteMessage, generateWhatsAppLink } from '../services/whatsappFormatter.js'
import { saveQuote } from '../services/quotePersistenceService.js'
import { removePendingQuote, storePendingQuote } from '../services/quoteStorageService.js'

export function useQuoter({ phoneNumber }) {
  const [items, setItems] = useState([])
  const [isExpress, setExpress] = useState(false)
  const [clientName, setName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [manualMessage, setManualMessage] = useState('')
  const [recoveryLink, setRecoveryLink] = useState('')
  const [isSending, setSending] = useState(false)
  const [persistenceFeedback, setPersistenceFeedback] = useState('')
  const busy = useRef(false)
  const revision = useRef(0)
  const totals = calculateTotals(items, isExpress)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  function resetFeedback() {
    revision.current += 1
    setFeedback('')
    setError('')
    setManualMessage('')
    setRecoveryLink('')
    setPersistenceFeedback('')
  }
  function addItem(service, isDemo = false) {
    resetFeedback()
    setItems((current) => current.some((item) => item.id === service.id)
      ? current.map((item) => item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...current, { id: service.id, name: service.name, price: service.base_price, category: service.category, quantity: 1, isDemo }])
  }
  function updateQuantity(id, delta) {
    resetFeedback()
    setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0))
  }
  function removeItem(id) {
    resetFeedback()
    setItems((current) => current.filter((item) => item.id !== id))
  }
  function clearItems() {
    resetFeedback()
    setItems([])
    setExpress(false)
  }
  function updateClientName(value) { resetFeedback(); setName(value) }
  function updateClientPhone(value) { resetFeedback(); setClientPhone(value) }
  function updateExpress(value) { resetFeedback(); setExpress(value) }

  function prepareQuote() {
    const message = validateQuote({ clientName, items, isExpress })
    setError(message)
    if (message) return null
    return { phoneNumber, businessName: 'Entre Cortes y Agujas', clientName: clientName.trim(), clientPhone: clientPhone.trim(),
      items: items.map(({ id, name, price, category, quantity }) => ({ id, name, price, category, quantity })),
      isExpress, totals: { ...totals }, isDemo: items.some((item) => item.isDemo) }
  }
  async function copyQuote() {
    const quote = prepareQuote()
    if (!quote) return
    const currentRevision = revision.current
    const message = buildQuoteMessage(quote)
    try {
      await navigator.clipboard.writeText(message)
      if (revision.current !== currentRevision) return
      setManualMessage('')
      setFeedback('Presupuesto copiado. Ya puedes compartirlo.')
    } catch {
      if (revision.current !== currentRevision) return
      setManualMessage(message)
      setFeedback('Selecciona y copia el presupuesto que aparece debajo.')
    }
  }
  async function sendQuote() {
    if (busy.current) return
    const quote = prepareQuote()
    if (!quote || !phoneNumber) return
    quote.id = crypto.randomUUID()
    const link = generateWhatsAppLink(quote)
    if (!link) { setError('El WhatsApp del taller no está disponible. Puedes copiar el presupuesto.'); return }
    busy.current = true
    setSending(true)
    const currentRevision = revision.current
    const stored = storePendingQuote(quote)
    setRecoveryLink(link)
    setManualMessage(buildQuoteMessage(quote))
    setPersistenceFeedback('Guardando la solicitud…')
    // Se abre dentro del gesto del usuario, antes de esperar cualquier petición de red.
    try { window.open(link, '_blank', 'noopener,noreferrer') } catch { /* El enlace de recuperación permanece disponible. */ }
    try {
      const result = await saveQuote(quote)
      if (result.status === 'saved') removePendingQuote(quote.id)
      if (revision.current === currentRevision) {
        setPersistenceFeedback(result.status === 'saved'
          ? 'Solicitud guardada. Confirma el envío del mensaje en WhatsApp.'
          : stored ? 'No pudimos confirmar el guardado. Conservamos una copia temporal en este dispositivo; puedes enviar por WhatsApp.'
            : 'No pudimos guardar una copia. Puedes enviar por WhatsApp o copiar el presupuesto.')
      }
    } finally {
      busy.current = false
      setSending(false)
    }
  }
  return { items, count, isExpress, setIsExpress: updateExpress, clientName, setClientName: updateClientName, clientPhone, setClientPhone: updateClientPhone, totals,
    addItem, updateQuantity, removeItem, clearItems, copyQuote, sendQuote, feedback, error, manualMessage,
    recoveryLink, isSending, persistenceFeedback }
}
