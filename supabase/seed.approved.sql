-- Tarifas iniciales aprobadas por el taller. ON CONFLICT no sobrescribe cambios del panel.
insert into public.services (id,name,category,base_price,estimated_time,description,is_active) values
('00000000-0000-4000-8000-000000000001','Dobladillo (basta o ruedo)','ajuste',5000,'2–3 días','El largo justo, conservando el acabado de tu prenda.',true),
('00000000-0000-4000-8000-000000000002','Cambio de cremallera (cierre o zipper)','reparacion',6000,'2–3 días','Para que esa chaqueta o pantalón vuelva a acompañarte.',true),
('00000000-0000-4000-8000-000000000003','Ajuste de cintura','ajuste',6000,'2–4 días','Adaptamos la cintura para que te sientas a gusto.',true),
('00000000-0000-4000-8000-000000000004','Reparación de costuras','reparacion',5000,'1–2 días','Reforzamos uniones y cerramos costuras descosidas.',true),
('00000000-0000-4000-8000-000000000005','Ajuste de mangas','ajuste',5000,'2–3 días','Una pequeña diferencia que cambia cómo te queda.',true),
('00000000-0000-4000-8000-000000000006','Cambio de botones','reparacion',5000,'1–2 días','Reponemos y aseguramos esos pequeños detalles.',true),
('00000000-0000-4000-8000-000000000007','Transformación de prenda','modificacion',5000,'4–7 días','De pantalón a falda, o de una idea a una nueva forma.',true),
('00000000-0000-4000-8000-000000000008','Modificación de vestido','modificacion',5000,'4–7 días','Renovamos el corte o los detalles de tu vestido.',true)
on conflict (id) do nothing;
