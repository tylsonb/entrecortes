import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useQuoter } from '../../src/hooks/useQuoter.js'
import QuoterPanel from '../../src/components/QuoterPanel.jsx'
import { initialServices } from '../../src/data/initialServices.js'
import { readPendingQuotes } from '../../src/services/quoteStorageService.js'
import { saveQuote } from '../../src/services/quotePersistenceService.js'
vi.mock('../../src/services/quotePersistenceService.js', () => ({ saveQuote: vi.fn() }))
function Fixture() {
  const quote = useQuoter({ phoneNumber: '56912345678' })
  return <><button onClick={() => quote.addItem(initialServices[0])}>Agregar servicio</button><QuoterPanel quote={quote} hasWhatsApp /></>
}
beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  vi.spyOn(window, 'open').mockReturnValue(null)
})
describe('WhatsApp quote flow', () => {
  it('validates the cart and name without external effects', () => {
    render(<Fixture />)
    fireEvent.click(screen.getByRole('button', { name: 'Enviar cotización por WhatsApp' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Agrega al menos')
    fireEvent.click(screen.getByText('Agregar servicio'))
    fireEvent.click(screen.getByRole('button', { name: 'Enviar cotización por WhatsApp' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Escribe tu nombre')
    expect(window.open).not.toHaveBeenCalled()
    expect(saveQuote).not.toHaveBeenCalled()
  })
  it('opens immediately, blocks duplicate clicks and clears the backup only after saving', async () => {
    let finish
    saveQuote.mockImplementation(() => new Promise((resolve) => { finish = resolve }))
    render(<Fixture />)
    fireEvent.click(screen.getByText('Agregar servicio'))
    fireEvent.change(screen.getByLabelText('Tu nombre'), { target: { value: 'María' } })
    fireEvent.change(screen.getByLabelText('Teléfono de contacto (opcional)'), { target: { value: '+56 9 1111 2222' } })
    fireEvent.click(screen.getByRole('checkbox'))
    const send = screen.getByRole('button', { name: 'Enviar cotización por WhatsApp' })
    fireEvent.click(send)
    fireEvent.click(send)
    expect(window.open).toHaveBeenCalledTimes(1)
    expect(saveQuote).toHaveBeenCalledTimes(1)
    const snapshot = saveQuote.mock.calls[0][0]
    expect(snapshot.totals.totalEstimated).toBe(6500)
    expect(snapshot.clientPhone).toBe('+56 9 1111 2222')
    expect(readPendingQuotes()).toHaveLength(1)
    const message = new URL(window.open.mock.calls[0][0]).searchParams.get('text')
    expect(message).toContain('$6.500 CLP')
    expect(message).toContain('Mi teléfono de contacto es: +56 9 1111 2222.')
    expect(message).not.toContain('Referencia:')
    expect(message).not.toContain(snapshot.id)
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar Dobladillo (basta o ruedo)' }))
    expect(snapshot.items[0].quantity).toBe(1)
    await act(async () => finish({ status: 'saved' }))
    expect(readPendingQuotes()).toEqual([])
  })
  it('keeps a local backup and a recovery link on remote failure', async () => {
    saveQuote.mockResolvedValue({ status: 'failed' })
    render(<Fixture />)
    fireEvent.click(screen.getByText('Agregar servicio'))
    fireEvent.change(screen.getByLabelText('Tu nombre'), { target: { value: 'Ana' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar cotización por WhatsApp' }))
    expect(await screen.findByText(/Conservamos una copia temporal/)).toBeVisible()
    expect(readPendingQuotes()).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Abrir cotización en WhatsApp' })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('textbox', { name: 'Tu presupuesto para compartir' }).value).toContain('Ana')
  })
  it('continues when storage is denied without claiming a backup exists', async () => {
    const denied = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Denied') })
    saveQuote.mockResolvedValue({ status: 'failed' })
    render(<Fixture />)
    fireEvent.click(screen.getByText('Agregar servicio'))
    fireEvent.change(screen.getByLabelText('Tu nombre'), { target: { value: 'Ana' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar cotización por WhatsApp' }))
    expect(await screen.findByText(/No pudimos guardar una copia/)).toBeVisible()
    expect(window.open).toHaveBeenCalledTimes(1)
    denied.mockRestore()
  })
  it('does not save or open a chat without a configured phone', async () => {
    const { result } = renderHook(() => useQuoter({ phoneNumber: '' }))
    act(() => { result.current.addItem(initialServices[0]); result.current.setClientName('Ana') })
    await act(async () => result.current.sendQuote())
    expect(saveQuote).not.toHaveBeenCalled()
    expect(window.open).not.toHaveBeenCalled()
  })
})
