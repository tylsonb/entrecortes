import Icon from './Icon.jsx'

export default function Footer() {
  return <footer className="border-t border-border bg-linen"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-9 text-sm sm:flex-row sm:items-center sm:px-8 lg:px-12"><a href="#inicio" className="flex min-h-11 items-center gap-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest"><Icon name="needle" className="size-6 text-forest" />Entre Cortes y Agujas</a><p className="max-w-xs text-xs leading-relaxed text-muted">Reparar también es una forma de cuidar.</p><a href="#/admin" className="inline-flex min-h-11 items-center text-xs text-muted underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-forest">Administración</a><p className="text-xs text-muted">© {new Date().getFullYear()} Entre Cortes y Agujas</p></div></footer>
}
