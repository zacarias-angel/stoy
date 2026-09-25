# En 5 Estoy

App web de cercania para descubrir personas que estan cerca y que saben hacer.

El documento maestro del proyecto es [`EN5ESTOY_PROYECTO.md`](./EN5ESTOY_PROYECTO.md) y es la
fuente de contexto/reglas. Este repositorio implementa la **Fase 1 - Fundacion** del roadmap:
monorepo, React + TypeScript, Node + TypeScript, MySQL, variables de entorno, autenticacion y
modelo de usuario/perfil.

## Estructura

```text
en5estoy/
  client/              React + TypeScript + Vite + Tailwind
  server/              Node.js + TypeScript + Express
    sql/               Migraciones SQL (se aplican en orden)
  EN5ESTOY_PROYECTO.md Documento maestro
```

## Requisitos

- Node.js >= 20
- MySQL 5.7+ u 8 (probado con MySQL 5.7 de Laragon)

## Puesta en marcha

1. Instalar dependencias en la raiz (npm workspaces):

   ```powershell
   npm install
   ```

2. Crear la base de datos y configurar el entorno del backend:

   ```sql
   CREATE DATABASE en5estoy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

   ```powershell
   Copy-Item server/.env.example server/.env
   ```

   Editar `server/.env` (como minimo `DB_*` y `JWT_SECRET`).

3. Aplicar migraciones:

   ```powershell
   npm run migrate
   ```

4. Levantar backend y frontend:

   ```powershell
   npm run dev
   ```

   - API: http://localhost:4000
   - Web: http://localhost:5173

## Scripts

| Script | Descripcion |
| --- | --- |
| `npm run dev` | Levanta API y web en paralelo |
| `npm run dev:server` | Solo API (watch) |
| `npm run dev:client` | Solo web |
| `npm run migrate` | Aplica migraciones SQL pendientes |
| `npm run typecheck` | Chequeo de tipos en todos los paquetes |
| `npm run build` | Compila backend y frontend |

## API (Fase 1)

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `GET` | `/api/health` | Estado del servicio |
| `POST` | `/api/auth/register` | Crea usuario + perfil y devuelve token |
| `POST` | `/api/auth/login` | Inicia sesion |
| `GET` | `/api/auth/me` | Perfil propio (requiere token) |
| `GET` | `/api/profiles/me` | Perfil propio (requiere token) |
| `PUT` | `/api/profiles/me` | Edita perfil propio |
| `GET` | `/api/profiles/:userId` | Perfil publico (sin ubicacion exacta) |
| `GET` | `/api/skills` | Lista de oficios/categorias |

## Privacidad de ubicacion

El esquema separa `user_locations.private_location` de `public_location`. El backend nunca debe
exponer la ubicacion privada a otros usuarios; el frontend de otros usuarios solo recibe la
ubicacion aproximada. La logica de proximidad llega en la Fase 2.

## Notas de arquitectura

- ESM (`type: module`) con extensiones `.js` en imports relativos del backend.
- Validacion de payloads con Zod y manejo de errores centralizado.
- Migraciones versionadas en `server/sql` con tabla `schema_migrations`.
- `concurrently` (unica dependencia de la raiz) permite un unico comando `npm run dev`.
