import CategoryTabs from './CategoryTabs.jsx'
import ServiceCard from './ServiceCard.jsx'
import Icon from './Icon.jsx'

export default function ServicesGrid({ services, activeCategory, onSelectCategory, search, onSearch, onReset, items, onAdd, isDemo = false, loading = false, error = null }) {
  return <section id="servicios" aria-labelledby="services-heading" className="mx-auto max-w-7xl scroll-mt-28 px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-3 text-sm text-forest">Reparar. Ajustar. Transformar.</p><h2 id="services-heading" className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">¿Qué necesita tu prenda?</h2></div><p className="max-w-sm text-sm leading-relaxed text-muted">Elige tus arreglos y arma tu presupuesto. Confirmamos el precio final al revisar la prenda.</p></div>
    <div className="mb-8 mt-10 flex flex-col justify-between gap-5 xl:flex-row xl:items-center"><CategoryTabs activeCategory={activeCategory} onSelect={onSelectCategory} /><label className="flex min-h-11 items-center gap-2 rounded-sm border border-border px-3 focus-within:border-forest focus-within:outline-1 focus-within:outline-forest"><Icon name="search" className="size-4 shrink-0 text-muted" /><span className="sr-only">Buscar un servicio</span><input type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Busca tu arreglo" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none xl:w-44" /></label></div>
    {loading ? <p role="status" className="py-16 text-muted">Estamos preparando los servicios…</p> : <>
      {error && <p role="status" className="mb-5 text-sm text-muted">Mostramos nuestras tarifas de referencia para que puedas seguir cotizando.</p>}
      {services.length ? <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <ServiceCard key={service.id} service={service} quantity={items.find((item) => item.id === service.id)?.quantity ?? 0} onAdd={onAdd} />)}</div> : <div className="border-y border-border py-14 text-center"><p className="font-semibold">No encontramos ese arreglo.</p><p className="mt-2 text-sm text-muted">Prueba con otro nombre o revisa las otras categorías.</p><button type="button" onClick={onReset} className="mt-4 min-h-11 cursor-pointer px-4 text-sm font-semibold text-forest underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-forest">Ver todos los servicios</button></div>}
    </>}
    <p className="mt-6 text-xs leading-relaxed text-muted">Precios en pesos chilenos (CLP). {isDemo ? 'Tarifas de demostración, pendientes de confirmar con el taller. ' : 'Tarifas de referencia. '}Los materiales, el tejido y la complejidad pueden cambiar el precio y el plazo.</p>
  </section>
}
