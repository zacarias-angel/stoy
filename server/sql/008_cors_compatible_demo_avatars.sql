-- Estas imagenes permiten CORS para que MapLibre pueda dibujarlas dentro del lienzo.
UPDATE profiles p
JOIN users u ON u.id = p.user_id
SET p.avatar_url = CASE u.email
  WHEN 'demo.marta.villacrespo@en5estoy.local' THEN 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&h=160&q=80'
  WHEN 'demo.diego.villacrespo@en5estoy.local' THEN 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&h=160&q=80'
  WHEN 'demo.ana.villacrespo@en5estoy.local' THEN 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80'
  WHEN 'demo.roberto.villacrespo@en5estoy.local' THEN 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80'
END
WHERE u.email IN (
  'demo.marta.villacrespo@en5estoy.local',
  'demo.diego.villacrespo@en5estoy.local',
  'demo.ana.villacrespo@en5estoy.local',
  'demo.roberto.villacrespo@en5estoy.local'
);
