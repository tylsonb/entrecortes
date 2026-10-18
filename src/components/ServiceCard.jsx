import { formatCurrency } from '../services/quoterService.js'
import Icon from './Icon.jsx'

export default function ServiceCard({ service, quantity, onAdd }) {
  return <article className="flex h-full flex-col border-t border-border py-7">
    <div className="flex items-start justify-between gap-4"><h3 className="text-lg font-semibold tracking-tight">{service.name}</h3><Icon name={service.category === 'reparacion' ? 'needle' : 'scissors'} className="mt-1 size-5 shrink-0 text-forest" /></div>
    <p className="mt-3 max-w-[35ch] flex-1 text-sm leading-relaxed text-muted">{service.description}</p>
    <p className="mb-5 mt-4 flex items-center gap-1.5 text-xs text-muted"><Icon name="clock" className="size-3.5" />{service.estimated_time}</p>
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm"><span className="text-muted">Desde </span><span className="font-semibold tabular-nums">{formatCurrency(service.base_price)}</span></p><button type="button" onClick={() => onAdd(service)} aria-label={`Agregar ${service.name}`} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-sm border border-forest/25 px-3 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"><Icon name={quantity ? 'check' : 'plus'} className="size-4" />{quantity ? `Agregado (${quantity})` : 'Agregar'}</button></div>
  </article>
}
