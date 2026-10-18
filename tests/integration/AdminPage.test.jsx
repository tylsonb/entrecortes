import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({
  getSession: vi.fn(), signInWithPassword: vi.fn(), signOut: vi.fn(),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
}))
vi.mock('../../src/services/supabaseClient.js', () => ({ supabase: { auth: mocks } }))
vi.mock('../../src/services/adminService.js', () => ({ checkAdmin: vi.fn(), updateServicePrice: vi.fn() }))
vi.mock('../../src/services/catalogService.js', () => ({ fetchServices: vi.fn() }))
import AdminPage from '../../src/components/AdminPage.jsx'
import { checkAdmin, updateServicePrice } from '../../src/services/adminService.js'
import { fetchServices } from '../../src/services/catalogService.js'
import { initialServices } from '../../src/data/initialServices.js'
const userSession = { user: { id: 'admin-id' } }
const service = { ...initialServices[0], base_price: 9000, price_version: 1, is_active: true }
beforeEach(() => {
  vi.clearAllMocks()
  mocks.getSession.mockResolvedValue({ data: { session: userSession }, error: null })
  mocks.signOut.mockResolvedValue({ error: null })
  mocks.signInWithPassword.mockResolvedValue({ data: { session: userSession }, error: null })
  checkAdmin.mockResolvedValue(true)
  fetchServices.mockResolvedValue([service])
  updateServicePrice.mockResolvedValue({ status: 'saved', service: { ...service, base_price: 10000, price_version: 2 } })
})
describe('price administration', () => {
  it('signs in through Supabase and signs out without leaving the editor visible', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null })
    render(<AdminPage />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled())
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'admin@example.test' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'test-password' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByRole('form', { name: service.name })).toBeVisible()
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({ email: 'admin@example.test', password: 'test-password' })
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(await screen.findByRole('button', { name: 'Iniciar sesión' })).toBeVisible()
    expect(screen.queryByRole('form', { name: service.name })).not.toBeInTheDocument()
  })
  it('denies access without loading prices', async () => {
    checkAdmin.mockResolvedValue(false)
    render(<AdminPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('no tiene permiso')
    expect(fetchServices).not.toHaveBeenCalled()
  })
  it('validates prices before saving and keeps edits after network failure', async () => {
    updateServicePrice.mockResolvedValue({ status: 'error', message: 'No pudimos confirmar el cambio.' })
    render(<AdminPage />)
    const row = within(await screen.findByRole('form', { name: service.name }))
    const input = row.getByLabelText('Nuevo precio en CLP')
    fireEvent.change(input, { target: { value: '1.5' } })
    fireEvent.click(row.getByRole('button', { name: 'Guardar precio' }))
    expect(row.getByRole('alert')).toHaveTextContent('precio entero')
    expect(updateServicePrice).not.toHaveBeenCalled()
    fireEvent.change(input, { target: { value: '10000' } })
    fireEvent.click(row.getByRole('button', { name: 'Guardar precio' }))
    expect(await row.findByRole('alert')).toHaveTextContent('No pudimos')
    expect(input).toHaveValue('10000')
  })
  it('shows conflicts, refreshes the version and requires an explicit retry', async () => {
    updateServicePrice.mockResolvedValueOnce({ status: 'conflict', service: { ...service, base_price: 11000, price_version: 2 }, message: 'El precio cambió en otra sesión.' })
      .mockResolvedValueOnce({ status: 'saved', service: { ...service, base_price: 10000, price_version: 3 } })
    render(<AdminPage />)
    const row = within(await screen.findByRole('form', { name: service.name }))
    fireEvent.change(row.getByLabelText('Nuevo precio en CLP'), { target: { value: '10000' } })
    fireEvent.click(row.getByRole('button', { name: 'Guardar precio' }))
    expect(await row.findByRole('alert')).toHaveTextContent('otra sesión')
    expect(row.getByText('$11.000')).toBeVisible()
    expect(updateServicePrice).toHaveBeenCalledTimes(1)
    fireEvent.click(row.getByRole('button', { name: 'Guardar precio' }))
    expect(await row.findByText('Precio guardado.')).toBeVisible()
    expect(updateServicePrice).toHaveBeenLastCalledWith({ id: service.id, basePrice: 10000, expectedVersion: 2 })
  })
  it('restores the code default only after confirmation', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    updateServicePrice.mockResolvedValue({ status: 'saved', service: { ...service, base_price: 5000, price_version: 2 } })
    render(<AdminPage />)
    const row = within(await screen.findByRole('form', { name: service.name }))
    fireEvent.click(row.getByRole('button', { name: 'Restaurar predeterminado' }))
    expect(updateServicePrice).not.toHaveBeenCalled()
    fireEvent.click(row.getByRole('button', { name: 'Restaurar predeterminado' }))
    expect(await row.findByText('Precio guardado.')).toBeVisible()
    expect(updateServicePrice).toHaveBeenCalledWith({ id: service.id, basePrice: 5000, expectedVersion: 1 })
    confirm.mockRestore()
  })
  it('handles an empty catalog and a failed catalog load', async () => {
    fetchServices.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('offline'))
    render(<AdminPage />)
    expect(await screen.findByText(/Todavía no hay servicios/)).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar catálogo' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar')
  })
})
