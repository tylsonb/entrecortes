export default function AboutSection() {
  return <section id="taller" aria-labelledby="about-heading" className="mx-auto grid max-w-7xl scroll-mt-28 gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-24 lg:px-12 lg:py-24">
    <div><p className="mb-4 text-sm text-forest">Entre Cortes y Agujas</p><h2 id="about-heading" className="max-w-sm text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Hay prendas que vale la pena conservar.</h2><p className="mt-6 max-w-md text-base leading-relaxed text-muted">La que te acompaña todos los días. La que guarda un recuerdo. La que solo necesita un pequeño cambio para volver a ser tu favorita.</p><p className="mt-4 max-w-md text-base leading-relaxed text-muted">En el taller escuchamos tu idea, revisamos la tela y buscamos contigo el arreglo que tenga más sentido.</p></div>
    <div><h3 className="mb-6 text-lg font-semibold">Así trabajamos contigo</h3><ol className="space-y-7">{[
      ['Cuéntanos qué quieres cambiar', 'Elige un servicio o prepara una foto de tu prenda.'],
      ['Revisamos los detalles', 'Acordamos el arreglo, el presupuesto y el plazo antes de empezar.'],
      ['Vuelve a disfrutarla', 'Recoge tu prenda ajustada, reparada o transformada.'],
    ].map(([title, text], index) => <li key={title} className="flex gap-5"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linen text-sm font-semibold text-forest">{index + 1}</span><div><p className="font-semibold">{title}</p><p className="mt-2 text-sm leading-relaxed text-muted">{text}</p></div></li>)}</ol></div>
  </section>
}
