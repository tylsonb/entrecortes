import { useState } from 'react'
import { useAdminSession } from '../hooks/useAdminSession.js'
import { useAdminPrices } from '../hooks/useAdminPrices.js'
import { formatCurrency } from '../services/quoterService.js'
import AdminPricesPanel from './AdminPricesPanel.jsx'
import Icon from './Icon.jsx'

export default function AdminPage() {
  const session = useAdminSession()
  const prices = useAdminPrices(session.status === 'authorized')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  async function signIn(event) {
    event.preventDefault()
    await session.signIn(email, password)
    setPassword('')
  }
  async function signOut() {
    if (await session.signOut()) { prices.clear(); setPassword(''); setEmail('') }
  }
  function restore(service, price) {
    if (window.confirm(`¿Restaurar el precio de ${service.name} a ${formatCurrency(price)} CLP?`)) void prices.save(service, String(price))
  }
  const field = 'mt-2 min-h-12 w-full rounded-sm border border-border bg-white px-4 text-base focus-visible:outline-2 focus-visible:outline-forest'
  const button = 'min-h-12 cursor-pointer rounded-sm bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-60'
  return <main className="min-h-screen bg-canvas">
    <header className="border-b border-border bg-linen"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8">
      <a href="#inicio" className="inline-flex min-h-11 items-center gap-3 font-semibold focus-visible:outline-2 focus-visible:outline-forest"><Icon name="needle" className="size-6 text-forest" />Entre Cortes y Agujas</a>
      <div className="flex items-center gap-4"><a href="#inicio" className="inline-flex min-h-11 items-center text-sm text-forest underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-forest">Volver a la web</a>
        {session.user && <button className={button} onClick={signOut}>Cerrar sesión</button>}</div>
    </div></header>
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Las tarifas de tu taller.</h1>
      <p className="mb-10 mt-4 max-w-xl leading-relaxed text-muted">Ajusta los precios de tus arreglos en pesos chilenos. Cada servicio se guarda por separado.</p>
      {session.message && <p role="alert" className="mb-6 rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-800">{session.message}</p>}
      {session.status === 'unavailable' ? <p role="status" className="max-w-xl rounded-sm border border-border p-6">La administración todavía no está configurada. Contacta al responsable del sitio para habilitarla.</p> :
        session.status === 'authorized' ? <AdminPricesPanel prices={prices} onRestore={restore} /> :
          session.status === 'denied' ? <p className="text-sm text-muted">Solicita acceso al responsable del taller o inicia sesión con otra cuenta.</p> :
            <form onSubmit={signIn} className="max-w-md rounded-sm border border-border bg-surface p-6 sm:p-8">
              <h2 className="text-xl font-semibold">Acceso al taller</h2>
              <label className="mt-6 block text-sm font-semibold" htmlFor="admin-email">Correo electrónico</label>
              <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required className={field} />
              <label className="mt-5 block text-sm font-semibold" htmlFor="admin-password">Contraseña</label>
              <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required className={field} />
              <button className={`mt-6 w-full ${button}`} disabled={session.status === 'loading'}>{session.status === 'loading' ? 'Verificando acceso…' : 'Iniciar sesión'}</button>
              {session.status === 'loading' && <p role="status" className="mt-3 text-sm text-muted">Estamos verificando la sesión.</p>}
              <p className="mt-5 text-sm leading-relaxed text-muted">Si necesitas acceso o recuperar tu contraseña, contacta al responsable del sitio.</p>
            </form>}
    </div>
  </main>
}
