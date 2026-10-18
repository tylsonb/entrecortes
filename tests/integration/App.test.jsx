import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from '../../src/App.jsx'

vi.mock('../../src/services/supabaseClient.js', () => ({ supabase: null }))

describe('workshop landing', () => {
  it('renders the landing sections and compares a transformation', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /tu ropa tiene mucho por vivir/i })).toBeInTheDocument()
    for (const id of ['servicios', 'trabajos', 'taller', 'cotizador', 'contacto']) {
      expect(document.getElementById(id)).toBeInTheDocument()
    }
    fireEvent.click(screen.getByRole('button', { name: 'Ver antes' }))
    expect(screen.getByAltText('Pantalón original antes de su transformación')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Ver después' }))
    expect(screen.getByAltText('Falda creada a partir del pantalón original')).toBeVisible()
  })

  it('filters categories and explains an empty search', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Ajustes' }))
    expect(screen.getByRole('heading', { name: 'Dobladillo (basta o ruedo)' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Cambio de cremallera (cierre o zipper)' })).not.toBeInTheDocument()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar un servicio' }), { target: { value: 'inexistente' } })
    expect(screen.getByText('No encontramos ese arreglo.')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Ver todos los servicios' }))
    expect(screen.getByRole('heading', { name: 'Cambio de cremallera (cierre o zipper)' })).toBeVisible()
  })

  it('quotes without credentials, updates quantities and applies express', () => {
    render(<App />)
    const panel = within(screen.getByRole('region', { name: 'Tu presupuesto, sin compromiso.' }))
    expect(panel.getByText('Todavía no hay prendas en tu presupuesto.')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Dobladillo (basta o ruedo)' }))
    expect(panel.getByText('Desde $5.000')).toBeVisible()
    fireEvent.click(panel.getByRole('button', { name: 'Aumentar Dobladillo (basta o ruedo)' }))
    expect(panel.getByText('Desde $10.000')).toBeVisible()
    fireEvent.click(panel.getByRole('checkbox', { name: /servicio exprés/i }))
    expect(panel.getByText('$3.000')).toBeVisible()
    expect(panel.getByText('Subtotal desde')).toBeVisible()
    expect(panel.getByText('Recargo exprés desde (+30%)')).toBeVisible()
    expect(panel.getByText('Total estimado desde')).toBeVisible()
    expect(panel.getByText('$13.000')).toBeVisible()
    fireEvent.click(panel.getByRole('button', { name: 'Quitar Dobladillo (basta o ruedo)' }))
    expect(panel.getByText('Todavía no hay prendas en tu presupuesto.')).toBeVisible()
  })

  it('validates the name before copying and provides the composed message', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Dobladillo (basta o ruedo)' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copiar presupuesto' }))
    expect(screen.getByText('Escribe tu nombre para preparar el presupuesto.')).toBeVisible()
    fireEvent.change(screen.getByLabelText('Tu nombre'), { target: { value: 'María' } })
    fireEvent.click(screen.getByRole('button', { name: 'Copiar presupuesto' }))
    expect(await screen.findByText('Presupuesto copiado. Ya puedes compartirlo.')).toBeVisible()
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('María'))
  })

  it('can empty the quote and reset express without leaving a surcharge', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Cambio de cremallera (cierre o zipper)' }))
    fireEvent.click(screen.getByRole('checkbox', { name: /servicio exprés/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Vaciar' }))
    expect(screen.getByText('Todavía no hay prendas en tu presupuesto.')).toBeVisible()
    expect(screen.getByRole('checkbox', { name: /servicio exprés/i })).not.toBeChecked()
    expect(screen.queryByText('Recargo exprés (+30%)')).not.toBeInTheDocument()
  })
})
