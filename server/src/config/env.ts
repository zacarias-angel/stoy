import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  DB_HOST: z.string().min(1).default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1).default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().min(1).default('en5estoy'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET debe tener al menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Secreto para desplazar (ofuscar) la ubicacion publica. Si no se define, usa JWT_SECRET.
  LOCATION_SECRET: z.string().optional(),

  // Radio de descubrimiento (en metros). Configurable, no hardcodeado.
  NEARBY_RADIUS_FREE_METERS: z.coerce.number().int().positive().default(500),
  NEARBY_RADIUS_MEMBER_METERS: z.coerce.number().int().positive().default(4000),
  NEARBY_MAX_RADIUS_METERS: z.coerce.number().int().positive().default(4000),
  // Si hay pocos perfiles cerca, se amplia el radio para no dejar la zona inutilizable.
  NEARBY_MIN_RESULTS: z.coerce.number().int().nonnegative().default(3),
  NEARBY_PAGE_SIZE: z.coerce.number().int().positive().max(100).default(30),

  // Precio informativo del unico plan. Los cobros se validan siempre por webhook.
  MEMBERSHIP_PRICE_ARS: z.coerce.number().int().positive().default(1600),
  MERCADO_PAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().optional(),

  // Desplazamiento de la ubicacion publica respecto de la privada (privacidad).
  PUBLIC_LOCATION_MIN_OFFSET_METERS: z.coerce.number().int().nonnegative().default(150),
  PUBLIC_LOCATION_MAX_OFFSET_METERS: z.coerce.number().int().positive().default(350),

  // Velocidad usada para traducir metros a minutos de forma humana.
  WALK_METERS_PER_MINUTE: z.coerce.number().positive().default(80),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variables de entorno invalidas:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  LOCATION_SECRET: parsed.data.LOCATION_SECRET?.trim() || parsed.data.JWT_SECRET,
};
