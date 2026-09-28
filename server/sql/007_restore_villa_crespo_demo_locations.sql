-- Los perfiles demo conservan sus ubicaciones de Villa Crespo.
-- La membresia activa de Angel Zacarias ya permite encontrarlos sin acercarlos artificialmente.
UPDATE user_locations ul
JOIN users u ON u.id = ul.user_id
SET ul.private_location = ST_GeomFromText(CASE u.email
  WHEN 'demo.marta.villacrespo@en5estoy.local' THEN 'POINT(-58.4414 -34.5986)'
  WHEN 'demo.diego.villacrespo@en5estoy.local' THEN 'POINT(-58.4430 -34.6001)'
  WHEN 'demo.ana.villacrespo@en5estoy.local' THEN 'POINT(-58.4398 -34.6008)'
  WHEN 'demo.roberto.villacrespo@en5estoy.local' THEN 'POINT(-58.4442 -34.5989)'
END),
ul.public_location = ST_GeomFromText(CASE u.email
  WHEN 'demo.marta.villacrespo@en5estoy.local' THEN 'POINT(-58.4419 -34.5989)'
  WHEN 'demo.diego.villacrespo@en5estoy.local' THEN 'POINT(-58.4425 -34.5998)'
  WHEN 'demo.ana.villacrespo@en5estoy.local' THEN 'POINT(-58.4402 -34.6011)'
  WHEN 'demo.roberto.villacrespo@en5estoy.local' THEN 'POINT(-58.4438 -34.5985)'
END)
WHERE u.email IN (
  'demo.marta.villacrespo@en5estoy.local',
  'demo.diego.villacrespo@en5estoy.local',
  'demo.ana.villacrespo@en5estoy.local',
  'demo.roberto.villacrespo@en5estoy.local'
);
