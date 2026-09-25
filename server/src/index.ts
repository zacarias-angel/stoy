import { createApp } from './app.js';
import { env } from './config/env.js';
import { pingDatabase } from './db/pool.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API En 5 Estoy escuchando en http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

pingDatabase()
  .then(() => console.log('Conexion a MySQL OK'))
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`No se pudo conectar a MySQL: ${message}`);
  });
