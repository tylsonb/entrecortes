import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ServicesGrid from '../../src/components/ServicesGrid.jsx'
import { initialServices } from '../../src/data/initialServices.js'
import App from '../../src/App.jsx'

vi.mock('../../src/services/supabaseClient.js', () => ({ supabase: null }))

const props = {
  services: initialServices, activeCategory: 'all', onSelectCategory: vi.fn(),
  search: '', onSearch: vi.fn(), onReset: vi.fn(), items: [], currencySymbol: '$', onAdd: vi.fn(),
}

describe('catalog resilience', () => {
  it('announces loading while services are pending', () => {
    render(<ServicesGrid {...props} loading />)
    expect(screen.getByRole('status')).toHaveTextContent('Estamos preparando los servicios')
    expect(screen.queryByRole('button', { name: 'Agregar Cambio de cremallera (cierre o zipper)' })).not.toBeInTheDocument()
  })
  it('keeps fallback prices and add actions usable after a catalog error', () => {
    render(<ServicesGrid {...props} error={new Error('Network unavailable')} />)
    expect(screen.getByRole('status')).toHaveTextContent('puedas seguir cotizando')
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Cambio de cremallera (cierre o zipper)' }))
    expect(props.onAdd).toHaveBeenCalledWith(expect.objectContaining({ id: initialServices[1].id }))
  })
  it('closes mobile navigation with Escape', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
    expect(screen.getByRole('navigation', { name: 'Navegación móvil' })).toBeVisible()
    fireEvent.keyDown(screen.getByRole('button', { name: 'Cerrar menú' }), { key: 'Escape' })
    expect(screen.queryByRole('navigation', { name: 'Navegación móvil' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveFocus()
  })
  it('offers a selectable message if clipboard access is denied', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockRejectedValue(new Error('Permission denied')) }, configurable: true })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Dobladillo (basta o ruedo)' }))
    fireEvent.change(screen.getByLabelText('Tu nombre'), { target: { value: 'Ana' } })
    fireEvent.click(screen.getByRole('button', { name: 'Copiar presupuesto' }))
    const message = await screen.findByRole('textbox', { name: 'Tu presupuesto para compartir' })
    expect(message.value).toContain('Mi nombre es Ana.')
  })
})
