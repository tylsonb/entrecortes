import Icon from './Icon.jsx'

export default function Hero({ showBefore, onCompare }) {
  return (
    <section id="inicio" aria-labelledby="hero-heading" className="scroll-mt-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[1.08fr_1fr] lg:gap-16 lg:px-12 lg:pb-20 lg:pt-16">
        <div className="max-w-xl">
          <p className="mb-7 flex items-center gap-2 text-sm text-forest"><span className="size-1.5 rounded-full bg-forest" />Tu taller de costura</p>
          <h1 id="hero-heading" className="max-w-[11ch] text-balance text-[3.25rem] font-semibold leading-[1.04] tracking-[-0.055em] text-ink sm:text-7xl lg:text-[5.25rem]">Tu ropa tiene mucho por vivir.</h1>
          <p className="mt-7 max-w-[39ch] text-base leading-relaxed text-muted sm:text-lg">Un ajuste, una reparación o una idea nueva. Cuidamos tus prendas para que vuelvas a disfrutar de ellas.</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a href="#servicios" className="inline-flex min-h-13 items-center justify-center gap-4 rounded-sm bg-forest px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest">Encontrar mi arreglo<Icon name="arrow" /></a>
            <a href="#trabajos" className="min-h-11 py-3 text-sm font-semibold text-ink underline decoration-border underline-offset-8 hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest">Ver nuestros trabajos</a>
          </div>
          <p className="mt-9 flex items-center gap-2 text-sm text-muted"><Icon name="check" className="size-4 text-forest" />Presupuesto orientativo, sin compromiso.</p>
        </div>
        <figure className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="relative overflow-hidden rounded-sm bg-stone-200">
            <img src={showBefore ? '/images/pants-before.jpg' : '/images/skirt-after.jpg'} alt={showBefore ? 'Pantalón original antes de su transformación' : 'Falda creada a partir del pantalón original'} width="960" height="1275" fetchPriority="high" className="aspect-[5/5.3] w-full object-contain" />
            <span className="absolute left-5 top-5 rounded-sm bg-white px-3 py-2 text-xs font-semibold text-ink">{showBefore ? 'Antes: un pantalón' : 'Después: una nueva falda'}</span>
            <div className="flex items-center justify-between gap-2 border-t border-border bg-white p-1.5 text-sm">
              <p className="pl-3 text-muted">La misma tela. Otra historia.</p>
              <div className="flex rounded-sm bg-stone-100 p-1">
                {[true, false].map((before) => <button key={String(before)} type="button" aria-label={before ? 'Ver antes' : 'Ver después'} aria-pressed={showBefore === before} onClick={() => onCompare(before)} className={`min-h-11 cursor-pointer rounded-sm px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-forest ${showBefore === before ? 'bg-forest text-white' : 'text-muted hover:bg-stone-200'}`}>{before ? 'Antes' : 'Después'}</button>)}
              </div>
            </div>
          </div>
          <figcaption className="mt-4 flex items-center justify-between gap-4 text-xs text-muted"><span>Transformaciones del taller</span><span>Hecho para seguir usándose</span></figcaption>
        </figure>
      </div>
      <div className="border-y border-border bg-linen">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 text-sm sm:grid-cols-3 sm:px-8 lg:px-12">
          {[['scissors', 'Arreglos que se adaptan a ti'], ['needle', 'Atención en cada puntada'], ['clock', 'Opción exprés de 24–48 hrs']].map(([icon, text]) => <p key={text} className="flex items-center gap-3 sm:justify-center"><Icon name={icon} className="size-5 shrink-0 text-forest" />{text}</p>)}
        </div>
      </div>
    </section>
  )
}
