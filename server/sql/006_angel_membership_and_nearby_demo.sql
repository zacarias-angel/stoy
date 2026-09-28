-- Activa manualmente la membresia de Angel Zacarias para pruebas locales.
INSERT INTO memberships (user_id, provider, provider_subscription_id, status, started_at, expires_at)
SELECT u.id, 'manual', CONCAT('manual-', u.id), 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)
FROM users u
JOIN profiles p ON p.user_id = u.id
WHERE LOWER(p.name) = 'angel zacarias'
ON DUPLICATE KEY UPDATE status = 'active', started_at = VALUES(started_at), expires_at = VALUES(expires_at);

-- Reubica los perfiles demo a menos de 500 m del punto de prueba en Villa Crespo.
UPDATE user_locations ul
JOIN users u ON u.id = ul.user_id
SET ul.private_location = ST_GeomFromText(CASE u.email
  WHEN 'demo.marta.villacrespo@en5estoy.local' THEN 'POINT(-58.4413 -34.5862)'
  WHEN 'demo.diego.villacrespo@en5estoy.local' THEN 'POINT(-58.4440 -34.5853)'
  WHEN 'demo.ana.villacrespo@en5estoy.local' THEN 'POINT(-58.4451 -34.5874)'
  WHEN 'demo.roberto.villacrespo@en5estoy.local' THEN 'POINT(-58.4400 -34.5875)'
END),
ul.public_location = ST_GeomFromText(CASE u.email
  WHEN 'demo.marta.villacrespo@en5estoy.local' THEN 'POINT(-58.4417 -34.5865)'
  WHEN 'demo.diego.villacrespo@en5estoy.local' THEN 'POINT(-58.4436 -34.5856)'
  WHEN 'demo.ana.villacrespo@en5estoy.local' THEN 'POINT(-58.4447 -34.5871)'
  WHEN 'demo.roberto.villacrespo@en5estoy.local' THEN 'POINT(-58.4404 -34.5872)'
END)
WHERE u.email IN (
  'demo.marta.villacrespo@en5estoy.local',
  'demo.diego.villacrespo@en5estoy.local',
  'demo.ana.villacrespo@en5estoy.local',
  'demo.roberto.villacrespo@en5estoy.local'
);
