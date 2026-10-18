// Tarifas iniciales aprobadas por el taller, expresadas en pesos chilenos.
export const defaultPricesApproved = true

export const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'reparacion', label: 'Reparaciones' },
  { id: 'ajuste', label: 'Ajustes' },
  { id: 'modificacion', label: 'Modificaciones' },
]

export const initialServices = [
  { id: '00000000-0000-4000-8000-000000000001', name: 'Dobladillo (basta o ruedo)', category: 'ajuste', base_price: 5000, estimated_time: '2–3 días', description: 'El largo justo, conservando el acabado de tu prenda.' },
  { id: '00000000-0000-4000-8000-000000000002', name: 'Cambio de cremallera (cierre o zipper)', category: 'reparacion', base_price: 6000, estimated_time: '2–3 días', description: 'Para que esa chaqueta o pantalón vuelva a acompañarte.' },
  { id: '00000000-0000-4000-8000-000000000003', name: 'Ajuste de cintura', category: 'ajuste', base_price: 6000, estimated_time: '2–4 días', description: 'Adaptamos la cintura para que te sientas a gusto.' },
  { id: '00000000-0000-4000-8000-000000000004', name: 'Reparación de costuras', category: 'reparacion', base_price: 5000, estimated_time: '1–2 días', description: 'Reforzamos uniones y cerramos costuras descosidas.' },
  { id: '00000000-0000-4000-8000-000000000005', name: 'Ajuste de mangas', category: 'ajuste', base_price: 5000, estimated_time: '2–3 días', description: 'Una pequeña diferencia que cambia cómo te queda.' },
  { id: '00000000-0000-4000-8000-000000000006', name: 'Cambio de botones', category: 'reparacion', base_price: 5000, estimated_time: '1–2 días', description: 'Reponemos y aseguramos esos pequeños detalles.' },
  { id: '00000000-0000-4000-8000-000000000007', name: 'Transformación de prenda', category: 'modificacion', base_price: 5000, estimated_time: '4–7 días', description: 'De pantalón a falda, o de una idea a una nueva forma.' },
  { id: '00000000-0000-4000-8000-000000000008', name: 'Modificación de vestido', category: 'modificacion', base_price: 5000, estimated_time: '4–7 días', description: 'Renovamos el corte o los detalles de tu vestido.' },
]
