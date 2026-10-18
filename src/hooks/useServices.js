import { useEffect, useMemo, useState } from 'react'
import { initialServices } from '../data/initialServices.js'
import { fetchServices } from '../services/catalogService.js'
import { supabase } from '../services/supabaseClient.js'

export function useServices(refreshKey = false, enabled = true) {
  const [catalog, setCatalog] = useState({ data: initialServices, loading: Boolean(supabase), error: supabase ? null : 'unconfigured', source: 'local' })
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    if (supabase && enabled) {
      fetchServices({ signal: controller.signal }).then((data) => {
        if (!controller.signal.aborted) setCatalog({ data, loading: false, error: null, source: 'remote' })
      }).catch(() => {
        if (!controller.signal.aborted) setCatalog({ data: initialServices, loading: false, error: 'unavailable', source: 'local' })
      })
    }
    return () => controller.abort()
  }, [refreshKey, enabled])
  const services = useMemo(() => {
    const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    return catalog.data.filter((service) => (activeCategory === 'all' || service.category === activeCategory)
      && normalize(`${service.name} ${service.description}`).includes(normalize(search.trim())))
  }, [catalog.data, activeCategory, search])
  function resetFilters() {
    setActiveCategory('all')
    setSearch('')
  }
  return { services, loading: catalog.loading, error: catalog.error, source: catalog.source,
    activeCategory, setActiveCategory, search, setSearch, resetFilters }
}
