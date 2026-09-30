-- Perfiles de demostracion en Quilmes y configuracion de Angel para pruebas locales.

INSERT INTO skills (name, slug) VALUES
  ('Programador', 'programador')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT IGNORE INTO users (email, status) VALUES
  ('demo.lucia.quilmes@en5estoy.local', 'active'),
  ('demo.mateo.quilmes@en5estoy.local', 'active'),
  ('demo.sofia.quilmes@en5estoy.local', 'active');

INSERT IGNORE INTO profiles (user_id, name, avatar_url, headline, bio, is_visible)
SELECT u.id, seed.name, seed.avatar_url, seed.headline, seed.bio, 1
FROM (
  SELECT 'demo.lucia.quilmes@en5estoy.local' AS email, 'Lucia' AS name, 'https://i.pravatar.cc/160?img=49' AS avatar_url, 'Diseñadora grafica' AS headline, 'Identidad visual, piezas para redes y diseno de marcas.' AS bio
  UNION ALL SELECT 'demo.mateo.quilmes@en5estoy.local', 'Mateo', 'https://i.pravatar.cc/160?img=11', 'Electricista', 'Instalaciones, reparaciones y tableros electricos.'
  UNION ALL SELECT 'demo.sofia.quilmes@en5estoy.local', 'Sofia', 'https://i.pravatar.cc/160?img=44', 'Fotografa', 'Fotos para emprendimientos, eventos y productos.'
) AS seed
JOIN users u ON u.email = seed.email;

INSERT IGNORE INTO user_skills (user_id, skill_id, is_primary)
SELECT u.id, s.id, 1
FROM users u
JOIN skills s ON s.slug = 'disenador-grafico'
WHERE u.email = 'demo.lucia.quilmes@en5estoy.local'
UNION ALL
SELECT u.id, s.id, 1 FROM users u JOIN skills s ON s.slug = 'electricista' WHERE u.email = 'demo.mateo.quilmes@en5estoy.local'
UNION ALL
SELECT u.id, s.id, 1 FROM users u JOIN skills s ON s.slug = 'fotografo' WHERE u.email = 'demo.sofia.quilmes@en5estoy.local';

INSERT INTO user_locations (user_id, private_location, public_location)
SELECT u.id, ST_GeomFromText(seed.private_point), ST_GeomFromText(seed.public_point)
FROM (
  SELECT 'demo.lucia.quilmes@en5estoy.local' AS email, 'POINT(-58.2550 -34.7211)' AS private_point, 'POINT(-58.2546 -34.7208)' AS public_point
  UNION ALL SELECT 'demo.mateo.quilmes@en5estoy.local', 'POINT(-58.2498 -34.7182)', 'POINT(-58.2502 -34.7186)'
  UNION ALL SELECT 'demo.sofia.quilmes@en5estoy.local', 'POINT(-58.2583 -34.7241)', 'POINT(-58.2579 -34.7237)'
) AS seed
JOIN users u ON u.email = seed.email
ON DUPLICATE KEY UPDATE private_location = VALUES(private_location), public_location = VALUES(public_location);

-- Angel queda en Quilmes, con Programador como habilidad principal y membresia activa.
INSERT INTO user_skills (user_id, skill_id, is_primary)
SELECT p.user_id, s.id, 1
FROM profiles p
JOIN skills s ON s.slug = 'programador'
WHERE LOWER(TRIM(p.name)) IN ('angel', 'angel zacarias')
ON DUPLICATE KEY UPDATE is_primary = VALUES(is_primary);

UPDATE user_skills us
JOIN profiles p ON p.user_id = us.user_id
JOIN skills s ON s.id = us.skill_id
SET us.is_primary = 0
WHERE LOWER(TRIM(p.name)) IN ('angel', 'angel zacarias')
  AND s.slug <> 'programador';

INSERT INTO user_locations (user_id, private_location, public_location)
SELECT p.user_id, ST_GeomFromText('POINT(-58.2526 -34.7206)'), ST_GeomFromText('POINT(-58.2530 -34.7209)')
FROM profiles p
WHERE LOWER(TRIM(p.name)) IN ('angel', 'angel zacarias')
ON DUPLICATE KEY UPDATE private_location = VALUES(private_location), public_location = VALUES(public_location);

INSERT INTO memberships (user_id, provider, provider_subscription_id, status, started_at, expires_at)
SELECT p.user_id, 'manual', CONCAT('manual-', p.user_id), 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)
FROM profiles p
WHERE LOWER(TRIM(p.name)) IN ('angel', 'angel zacarias')
ON DUPLICATE KEY UPDATE status = VALUES(status), started_at = VALUES(started_at), expires_at = VALUES(expires_at);
