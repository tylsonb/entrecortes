import Icon from './Icon.jsx'

export default function Navbar({ count, menuOpen, onToggleMenu, onCloseMenu }) {
  return (
    <header onKeyDown={(event) => { if (event.key === 'Escape' && menuOpen) { onCloseMenu(); event.currentTarget.querySelector('[aria-controls="mobile-navigation"]')?.focus() } }} className="sticky top-0 z-30 border-b border-border bg-canvas">
      <div className="mx-auto flex min-h-24 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <a href="#inicio" onClick={onCloseMenu} className="flex min-h-11 items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest" aria-label="Entre Cortes y Agujas, inicio">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-forest/25 text-forest sm:size-11"><Icon name="needle" className="size-6 sm:size-7" /></span>
          <span className="whitespace-nowrap text-xs font-semibold leading-tight tracking-tight sm:text-base">Entre Cortes<span className="block">y Agujas</span></span>
        </a>
        <nav aria-label="Navegación principal" className="hidden items-center gap-7 text-sm text-muted lg:flex">
          {[['Servicios', '#servicios'], ['Trabajos', '#trabajos'], ['El taller', '#taller'], ['Contacto', '#contacto']].map(([label, href]) => <a key={href} href={href} className="py-3 hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest">{label}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#cotizador" onClick={onCloseMenu} className="flex min-h-11 items-center gap-2 rounded-sm border border-forest px-3 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest sm:px-4">
            <Icon name="bag" /><span className="hidden sm:inline">Mi presupuesto</span><span className="sm:hidden">Cotizar</span><span className="flex size-5 items-center justify-center rounded-full bg-forest text-xs text-white">{count}</span>
          </a>
          <button type="button" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={onToggleMenu} className="flex size-11 cursor-pointer items-center justify-center rounded-sm hover:bg-stone-200 focus-visible:outline-2 focus-visible:outline-forest lg:hidden"><Icon name={menuOpen ? 'close' : 'menu'} /></button>
        </div>
      </div>
      {menuOpen && <nav id="mobile-navigation" aria-label="Navegación móvil" className="grid border-t border-border px-5 py-3 lg:hidden">
        {[['Servicios', '#servicios'], ['Trabajos', '#trabajos'], ['El taller', '#taller'], ['Contacto', '#contacto']].map(([label, href]) => <a key={href} href={href} onClick={onCloseMenu} className="rounded-sm px-2 py-3 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-forest">{label}</a>)}
      </nav>}
    </header>
  )
}
