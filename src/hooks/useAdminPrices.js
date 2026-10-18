import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchServices } from '../services/catalogService.js'
import { updateServicePrice } from '../services/adminService.js'
import { isValidPrice } from '../services/quoterService.js'

export function useAdminPrices(enabled) {
  const [services, setServices] = useState([])
  const [drafts, setDrafts] = useState({})
  const [rows, setRows] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const locks = useRef(new Set())
  const generation = useRef(0)
  const refresh = useCallback(async () => {
    const ticket = ++generation.current
    setLoading(true)
    setError('')
    try {
      const data = await fetchServices({ admin: true })
      if (ticket === generation.current) { setServices(data); setRows({}) }
    } catch {
      if (ticket === generation.current) setError('No pudimos cargar los precios. Revisa la conexión y vuelve a intentarlo.')
    } finally { if (ticket === generation.current) setLoading(false) }
  }, [])
  useEffect(() => {
    const timer = enabled ? setTimeout(() => { void refresh() }, 0) : null
    return () => { clearTimeout(timer); generation.current += 1 }
  }, [enabled, refresh])
  function edit(id, value) {
    setDrafts((current) => ({ ...current, [id]: value }))
    setRows((current) => ({ ...current, [id]: { status: 'editing', message: '' } }))
  }
  function validate(id, value) {
    const valid = typeof value === 'string' && /^\d+$/.test(value) && isValidPrice(Number(value))
    if (!valid) setRows((current) => ({ ...current, [id]: { status: 'error', message: 'Ingresa un precio entero entre 0 y 99.999.999 CLP.' } }))
    return valid
  }
  async function save(service, value = drafts[service.id] ?? String(service.base_price)) {
    const id = service.id
    if (!enabled || locks.current.has(id) || !validate(id, value)) return
    locks.current.add(id)
    const ticket = generation.current
    setRows((current) => ({ ...current, [id]: { status: 'saving', message: 'Guardando…' } }))
    try {
      const result = await updateServicePrice({ id, basePrice: Number(value), expectedVersion: service.price_version })
      if (ticket !== generation.current) return
      if (result.service) setServices((current) => current.map((item) => item.id === id ? result.service : item))
      if (result.status === 'saved') setDrafts((current) => ({ ...current, [id]: String(result.service.base_price) }))
      setRows((current) => ({ ...current, [id]: { status: result.status, message: result.status === 'saved' ? 'Precio guardado.' : result.message } }))
    } finally { locks.current.delete(id) }
  }
  function clear() { generation.current += 1; setServices([]); setDrafts({}); setRows({}); setError('') }
  return { services, drafts, rows, loading, error, refresh, edit, validate, save, clear }
}
