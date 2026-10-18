import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../services/supabaseClient.js'
import { checkAdmin } from '../services/adminService.js'
import { withRequestTimeout } from '../services/requestService.js'

export function useAdminSession() {
  const [state, setState] = useState({ status: supabase ? 'loading' : 'unavailable', user: null, message: '' })
  const sequence = useRef(0)
  const active = useRef(true)
  const resolveSession = useCallback(async (session) => {
    const ticket = ++sequence.current
    if (!session?.user) {
      if (active.current) setState({ status: 'signedOut', user: null, message: '' })
      return
    }
    try {
      const authorized = await checkAdmin()
      if (active.current && ticket === sequence.current) setState({
        status: authorized ? 'authorized' : 'denied', user: session.user,
        message: authorized ? '' : 'Esta cuenta no tiene permiso para administrar tarifas.',
      })
    } catch {
      if (active.current && ticket === sequence.current) setState({ status: 'error', user: session.user, message: 'No pudimos verificar tu acceso. Vuelve a intentarlo.' })
    }
  }, [])
  useEffect(() => {
    active.current = true
    if (!supabase) return
    // La consulta de permisos se difiere fuera del callback síncrono de Auth.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => { if (active.current) void resolveSession(session) }, 0)
    })
    withRequestTimeout(() => supabase.auth.getSession()).then(({ data, error }) => {
      if (error) throw error
      if (active.current) void resolveSession(data.session)
    }).catch(() => {
      if (active.current) setState({ status: 'error', user: null, message: 'No pudimos cargar la sesión. Vuelve a intentarlo.' })
    })
    return () => { active.current = false; sequence.current += 1; subscription.unsubscribe() }
  }, [resolveSession])
  async function signIn(email, password) {
    setState({ status: 'loading', user: null, message: '' })
    try {
      const { data, error } = await withRequestTimeout(() => supabase.auth.signInWithPassword({ email: email.trim(), password }), { timeoutMs: 10000 })
      if (error) throw error
      await resolveSession(data.session)
    } catch {
      setState({ status: 'signedOut', user: null, message: 'No pudimos iniciar sesión. Revisa tus datos y la conexión.' })
    }
  }
  async function signOut() {
    sequence.current += 1
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) throw error
      setState({ status: 'signedOut', user: null, message: '' })
      return true
    } catch {
      setState((current) => ({ ...current, message: 'No pudimos cerrar la sesión. Vuelve a intentarlo.' }))
      return false
    }
  }
  return { ...state, signIn, signOut }
}
