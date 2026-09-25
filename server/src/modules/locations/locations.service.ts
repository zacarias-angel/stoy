import type { RowDataPacket } from 'mysql2';
import { env } from '../../config/env.js';
import { pool } from '../../db/pool.js';
import { AppError } from '../../utils/http.js';
import {
  deterministicOffset,
  offsetLatLng,
  toPointWkt,
  type LatLng,
} from '../../utils/geo.js';

export interface SaveLocationInput {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

export async function saveOwnLocation(
  userId: number,
  input: SaveLocationInput
): Promise<void> {
  const { bearingRadians, distanceMeters } = deterministicOffset(
    userId,
    env.LOCATION_SECRET,
    env.PUBLIC_LOCATION_MIN_OFFSET_METERS,
    env.PUBLIC_LOCATION_MAX_OFFSET_METERS
  );

  const publicLocation = offsetLatLng(
    input.latitude,
    input.longitude,
    distanceMeters,
    bearingRadians
  );

  await pool.query(
    `INSERT INTO user_locations (user_id, private_location, public_location, updated_at)
     VALUES (?, ST_GeomFromText(?), ST_GeomFromText(?), CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE
       private_location = VALUES(private_location),
       public_location = VALUES(public_location),
       updated_at = CURRENT_TIMESTAMP`,
    [
      userId,
      toPointWkt(input.longitude, input.latitude),
      toPointWkt(publicLocation.lng, publicLocation.lat),
    ]
  );
}

export async function getOwnLocation(userId: number): Promise<LatLng | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT ST_X(private_location) AS lng, ST_Y(private_location) AS lat
     FROM user_locations
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return { lat: Number(row.lat), lng: Number(row.lng) };
}

export function requireOwnLocation(location: LatLng | null): LatLng {
  if (!location) {
    throw new AppError(400, 'Primero comparti tu ubicacion', 'location_required');
  }
  return location;
}
