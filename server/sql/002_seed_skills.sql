-- Categorias/oficios iniciales para el MVP.
-- Los usuarios pueden elegir una habilidad principal; a futuro podran tener varias.

INSERT INTO skills (name, slug) VALUES
  ('Modista', 'modista'),
  ('Pintor', 'pintor'),
  ('Electricista', 'electricista'),
  ('Plomero', 'plomero'),
  ('Tecnico reparador de celulares', 'tecnico-celulares'),
  ('Tapicero', 'tapicero'),
  ('Carpintero', 'carpintero'),
  ('Herrero', 'herrero'),
  ('Albanil', 'albanil'),
  ('Jardinero', 'jardinero'),
  ('Profesor de musica', 'profesor-musica'),
  ('Profesor particular', 'profesor-particular'),
  ('Peluquero/a', 'peluquero'),
  ('Manicura', 'manicura'),
  ('Cocinero/a', 'cocinero'),
  ('Panadero/a', 'panadero'),
  ('Costurera', 'costurera'),
  ('Fotografo/a', 'fotografo'),
  ('Diseñador/a grafico/a', 'disenador-grafico'),
  ('Mecanico', 'mecanico'),
  ('Lavado de autos', 'lavado-autos'),
  ('Mudanzas / fletes', 'mudanzas-fletes'),
  ('Cuidado de personas', 'cuidado-personas'),
  ('Paseo de mascotas', 'paseo-mascotas')
ON DUPLICATE KEY UPDATE name = VALUES(name);
