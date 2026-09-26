import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { pingDatabase } from './db/pool.js';
import { initializeRealtime } from './realtime/socket.js';

const app = createApp();
const server = createServer(app);
initializeRealtime(server);

server.listen(env.PORT, () => {
  console.log(`API En 5 Estoy escuchando en http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

pingDatabase()
  .then(() => console.log('Conexion a MySQL OK'))
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`No se pudo conectar a MySQL: ${message}`);
  });
