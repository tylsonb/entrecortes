export default function WorkSection() {
  return <section id="trabajos" aria-labelledby="work-heading" className="scroll-mt-28 bg-linen py-20 lg:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
    <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><h2 id="work-heading" className="max-w-md text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">De nuestras manos<br />a tu día a día.</h2><p className="max-w-xs text-sm leading-relaxed text-muted">Prendas que cambian de forma y detalles que hacen la diferencia.</p></div>
    <div className="grid gap-8 sm:grid-cols-3">
      {[
        { src: 'skirt-after.jpg', alt: 'Falda de camuflaje transformada a partir de un pantalón', title: 'Una nueva forma de usarlo', text: 'De pantalón a falda' },
        { src: 'traditional-shirt.jpg', alt: 'Blusa blanca con cintas rojas, amarillas y verdes junto a su sombrero', title: 'Detalles con identidad', text: 'Prendas para ocasiones especiales' },
        { src: 'traditional-outfit.jpg', alt: 'Conjunto de falda y pañuelo blancos con cintas de colores', title: 'Cada terminación cuenta', text: 'Confección y acabados' },
      ].map((work) => <figure key={work.src}><img src={`/images/${work.src}`} alt={work.alt} width="800" height="1000" loading="lazy" className="aspect-[4/4.7] w-full rounded-sm object-cover" /><figcaption className="mt-5"><h3 className="font-semibold tracking-tight">{work.title}</h3><p className="mt-1 text-sm text-muted">{work.text}</p></figcaption></figure>)}
    </div>
  </div></section>
}
