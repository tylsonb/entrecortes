import { formatCurrency } from '../services/quoterService.js'
import { categories, initialServices, defaultPricesApproved } from '../data/initialServices.js'

const button = 'min-h-11 cursor-pointer rounded-sm border border-forest px-4 py-2 text-sm font-semibold text-forest hover:bg-linen focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-50'

export default function AdminPricesPanel({ prices, onRestore }) {
  if (prices.loading) return <p role="status" className="py-12 text-muted">Cargando las tarifas del taller…</p>
  if (prices.error) return <div className="space-y-4 py-8"><p role="alert">{prices.error}</p><button className={button} onClick={prices.refresh}>Volver a cargar</button></div>
  return <section aria-labelledby="prices-heading">
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div><h2 id="prices-heading" className="text-2xl font-semibold">Precios de los servicios</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">Los cambios se publican al guardarlos. Los presupuestos que ya están abiertos conservan su estimación.</p></div>
      <button className={button} onClick={prices.refresh}>Actualizar catálogo</button>
    </div>
    <p className="mb-6 rounded-sm bg-linen p-4 text-sm leading-relaxed">Los precios predeterminados sirven como respaldo si el catálogo no está disponible. Pueden diferir de los vigentes.{!defaultPricesApproved && ' Los valores predeterminados actuales son de demostración y requieren aprobación del taller.'}</p>
    {!prices.services.length ? <p role="status" className="border-y border-border py-12">Todavía no hay servicios. Solicita al responsable del sitio que cargue el catálogo inicial.</p> :
      <div className="divide-y divide-border border-y border-border">{prices.services.map((service) => {
        const row = prices.rows[service.id] ?? {}
        const value = prices.drafts[service.id] ?? String(service.base_price)
        const fallback = initialServices.find((item) => item.id === service.id)
        const invalid = ['error', 'conflict', 'denied'].includes(row.status)
        const saving = row.status === 'saving'
        return <form key={service.id} aria-label={service.name} onSubmit={(event) => { event.preventDefault(); void prices.save(service) }} className="grid gap-5 py-7 lg:grid-cols-[1fr_1fr] lg:gap-10">
          <div><h3 className="font-semibold">{service.name}</h3><p className="mt-1 text-sm text-muted">{categories.find((item) => item.id === service.category)?.label} · {service.is_active ? 'Visible' : 'Inactivo'}</p>
            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm"><div><dt className="text-muted">Precio vigente</dt><dd className="mt-1 font-semibold tabular-nums">{formatCurrency(service.base_price)}</dd></div><div><dt className="text-muted">Predeterminado</dt><dd className="mt-1 tabular-nums">{fallback ? formatCurrency(fallback.base_price) : 'Sin respaldo'}</dd></div></dl>
          </div>
          <div className="min-w-0">
            <label htmlFor={`price-${service.id}`} className="mb-2 block text-sm font-semibold">Nuevo precio en CLP</label>
            <input id={`price-${service.id}`} type="text" inputMode="numeric" autoComplete="off" value={value} disabled={saving}
              onChange={(event) => prices.edit(service.id, event.target.value)} onBlur={() => prices.validate(service.id, value)}
              aria-invalid={invalid} aria-describedby={`price-status-${service.id}`}
              className="min-h-12 w-full rounded-sm border border-border bg-white px-4 text-base tabular-nums focus-visible:outline-2 focus-visible:outline-forest disabled:opacity-60" />
            <div className="mt-3 flex flex-wrap gap-3"><button type="submit" disabled={saving || value === String(service.base_price)} className={button}>{saving ? 'Guardando…' : 'Guardar precio'}</button>
              {fallback && <button type="button" disabled={saving || service.base_price === fallback.base_price} className={button} onClick={() => onRestore(service, fallback.base_price)}>Restaurar predeterminado</button>}</div>
            <p id={`price-status-${service.id}`} role={invalid ? 'alert' : 'status'} className={`mt-3 text-sm leading-relaxed ${invalid ? 'text-red-800' : 'text-forest'}`}>{row.message}</p>
          </div>
        </form>
      })}</div>}
  </section>
}
