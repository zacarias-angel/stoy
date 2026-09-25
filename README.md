# En 5 Estoy

App web de cercania para descubrir personas que estan cerca y que saben hacer.

El documento maestro del proyecto es [`EN5ESTOY_PROYECTO.md`](./EN5ESTOY_PROYECTO.md) y es la
fuente de contexto/reglas.

Fases implementadas:

- **Fase 1 - Fundacion**: monorepo, React + TypeScript, Node + TypeScript, MySQL, variables de
  entorno, autenticacion y modelo de usuario/perfil.
- **Fase 2 - Mapa**: MapLibre + OpenStreetMap, geolocalizacion, guardado privado/ofuscado de
  ubicacion, consulta de perfiles cercanos y bottom sheet de persona.

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
| `GET` | `/api/locations/me` | Ubicacion propia (requiere token) |
| `PUT` | `/api/locations/me` | Guarda ubicacion propia (calcula la publica ofuscada) |
| `GET` | `/api/nearby?limit=30` | Perfiles cercanos visibles con distancia humana |

## Privacidad de ubicacion

El esquema separa `user_locations.private_location` de `public_location`:

```text
ubicacion_privada (precision real)  ->  BACKEND
                                          |  ST_Distance_Sphere
                                          v
                                    ubicacion_publica ofuscada  ->  MAPA
```

- La ubicacion publica se desplaza un offset determinista (secreto del backend) de
  `PUBLIC_LOCATION_MIN_OFFSET_METERS` a `..._MAX_OFFSET_METERS`, para que no se pueda invertir ni
  "saltar" entre consultas.
- `/api/nearby` nunca devuelve `private_location` ni el email. La distancia se calcula en el
  backend sobre la ubicacion publica del otro usuario.
- La consulta usa un prefilto por bounding box con `MBRContains` para aprovechar el indice
  espacial (no se descarga toda la tabla).
- Si la zona tiene pocos perfiles, el radio se amplia hasta `NEARBY_MAX_RADIUS_METERS` para no
  dejar el mapa inutilizable (parametros configurables en `server/.env`).

## Mapa

- `MapLibre GL JS` renderiza un estilo raster con tiles de OpenStreetMap y su atribucion.
- El URL de tiles se puede cambiar con `VITE_MAP_TILES_URL` (ver `client/.env.example`).
- **Antes de produccion** hay que elegir un proveedor de tiles o infraestructura propia; no se
  debe depender de los servidores publicos de tiles de OpenStreetMap como produccion.

## Notas de arquitectura

- ESM (`type: module`) con extensiones `.js` en imports relativos del backend.
- Validacion de payloads con Zod y manejo de errores centralizado.
- Migraciones versionadas en `server/sql` con tabla `schema_migrations`.
- `concurrently` (unica dependencia de la raiz) permite un unico comando `npm run dev`.
