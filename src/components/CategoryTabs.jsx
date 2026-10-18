import { categories } from '../data/initialServices.js'

export default function CategoryTabs({ activeCategory, onSelect }) {
  return <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar servicios por categoría">
    {categories.map((category) => <button key={category.id} type="button" aria-pressed={activeCategory === category.id} onClick={() => onSelect(category.id)} className={`min-h-11 cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${activeCategory === category.id ? 'border-forest bg-forest text-white' : 'border-border bg-transparent text-muted hover:border-forest hover:text-forest'}`}>{category.label}</button>)}
  </div>
}
