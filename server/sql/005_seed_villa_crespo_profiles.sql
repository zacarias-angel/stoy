-- Perfiles de demostracion para validar descubrimiento en Villa Crespo.
-- No tienen credenciales de acceso y solo se insertan una vez por email.

INSERT IGNORE INTO users (email, status) VALUES
  ('demo.marta.villacrespo@en5estoy.local', 'active'),
  ('demo.diego.villacrespo@en5estoy.local', 'active'),
  ('demo.ana.villacrespo@en5estoy.local', 'active'),
  ('demo.roberto.villacrespo@en5estoy.local', 'active');

INSERT IGNORE INTO profiles (user_id, name, avatar_url, headline, bio, is_visible)
SELECT u.id, seed.name, seed.avatar_url, seed.headline, seed.bio, 1
FROM (
  SELECT 'demo.marta.villacrespo@en5estoy.local' AS email, 'Marta' AS name, 'https://i.pravatar.cc/160?img=47' AS avatar_url, 'Modista' AS headline, 'Arreglos de ropa y prendas a medida.' AS bio
  UNION ALL SELECT 'demo.diego.villacrespo@en5estoy.local', 'Diego', 'https://i.pravatar.cc/160?img=12', 'Pintor', 'Pinto casas, departamentos y locales.'
  UNION ALL SELECT 'demo.ana.villacrespo@en5estoy.local', 'Ana', 'https://i.pravatar.cc/160?img=32', 'Clases de guitarra', 'Clases para empezar o retomar la guitarra.'
  UNION ALL SELECT 'demo.roberto.villacrespo@en5estoy.local', 'Roberto', 'https://i.pravatar.cc/160?img=68', 'Tapicero', 'Restauro sillones y sillas antiguas.'
) AS seed
JOIN users u ON u.email = seed.email;

INSERT IGNORE INTO user_skills (user_id, skill_id, is_primary)
SELECT u.id, s.id, 1
FROM users u
JOIN skills s ON s.slug = 'modista'
WHERE u.email = 'demo.marta.villacrespo@en5estoy.local'
UNION ALL
SELECT u.id, s.id, 1 FROM users u JOIN skills s ON s.slug = 'pintor' WHERE u.email = 'demo.diego.villacrespo@en5estoy.local'
UNION ALL
SELECT u.id, s.id, 1 FROM users u JOIN skills s ON s.slug = 'profesor-musica' WHERE u.email = 'demo.ana.villacrespo@en5estoy.local'
UNION ALL
SELECT u.id, s.id, 1 FROM users u JOIN skills s ON s.slug = 'tapicero' WHERE u.email = 'demo.roberto.villacrespo@en5estoy.local';

INSERT INTO user_locations (user_id, private_location, public_location)
SELECT u.id, ST_GeomFromText(seed.private_point), ST_GeomFromText(seed.public_point)
FROM (
  SELECT 'demo.marta.villacrespo@en5estoy.local' AS email, 'POINT(-58.4414 -34.5986)' AS private_point, 'POINT(-58.4419 -34.5989)' AS public_point
  UNION ALL SELECT 'demo.diego.villacrespo@en5estoy.local', 'POINT(-58.4430 -34.6001)', 'POINT(-58.4425 -34.5998)'
  UNION ALL SELECT 'demo.ana.villacrespo@en5estoy.local', 'POINT(-58.4398 -34.6008)', 'POINT(-58.4402 -34.6011)'
  UNION ALL SELECT 'demo.roberto.villacrespo@en5estoy.local', 'POINT(-58.4442 -34.5989)', 'POINT(-58.4438 -34.5985)'
) AS seed
JOIN users u ON u.email = seed.email
ON DUPLICATE KEY UPDATE private_location = VALUES(private_location), public_location = VALUES(public_location);
