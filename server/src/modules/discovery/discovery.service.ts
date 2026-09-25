import type { RowDataPacket } from 'mysql2';
import { env } from '../../config/env.js';
import { pool } from '../../db/pool.js';
import {
  boundingBox,
  boundingBoxPolygonWkt,
  formatDistance,
  toPointWkt,
  type LatLng,
} from '../../utils/geo.js';
import { getOwnLocation, requireOwnLocation } from '../locations/locations.service.js';

export interface NearbyPersonDto {
  userId: number;
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  skill: string | null;
  lat: number;
  lng: number;
  distanceMeters: number;
  distanceMinutes: number;
  distanceLabel: string;
}

export interface NearbyResultDto {
  radiusMeters: number;
  results: NearbyPersonDto[];
}

interface NearbyRow extends RowDataPacket {
  user_id: number;
  name: string;
  avatar_url: string | null;
  headline: string | null;
  skill_name: string | null;
  lat: number;
  lng: number;
  distance_m: number;
}

async function queryNearby(
  userId: number,
  origin: LatLng,
  radiusMeters: number,
  limit: number
): Promise<NearbyPersonDto[]> {
  const originWkt = toPointWkt(origin.lng, origin.lat);
  const envelope = boundingBoxPolygonWkt(boundingBox(origin.lat, origin.lng, radiusMeters));

  const [rows] = await pool.query<NearbyRow[]>(
    `SELECT
        pr.user_id,
        pr.name,
        pr.avatar_url,
        pr.headline,
        s.name AS skill_name,
        ST_X(ul.public_location) AS lng,
        ST_Y(ul.public_location) AS lat,
        ST_Distance_Sphere(ul.public_location, ST_GeomFromText(?)) AS distance_m
     FROM user_locations ul
     JOIN users u ON u.id = ul.user_id
     JOIN profiles pr ON pr.user_id = ul.user_id
     LEFT JOIN user_skills us ON us.user_id = ul.user_id AND us.is_primary = 1
     LEFT JOIN skills s ON s.id = us.skill_id
     WHERE ul.user_id <> ?
       AND u.status = 'active'
       AND pr.is_visible = 1
       AND MBRContains(ST_GeomFromText(?), ul.public_location)
       AND ST_Distance_Sphere(ul.public_location, ST_GeomFromText(?)) <= ?
     ORDER BY distance_m ASC
     LIMIT ?`,
    [originWkt, userId, envelope, originWkt, radiusMeters, limit]
  );

  return rows.map((row) => {
    const distanceMeters = Number(row.distance_m);
    const human = formatDistance(distanceMeters, env.WALK_METERS_PER_MINUTE);

    return {
      userId: row.user_id,
      name: row.name,
      avatarUrl: row.avatar_url,
      headline: row.headline,
      skill: row.skill_name,
      lat: Number(row.lat),
      lng: Number(row.lng),
      distanceMeters: Math.round(distanceMeters),
      distanceMinutes: human.minutes,
      distanceLabel: human.label,
    };
  });
}

export async function findNearby(userId: number, limit: number): Promise<NearbyResultDto> {
  const origin = requireOwnLocation(await getOwnLocation(userId));

  const maxRadius = env.NEARBY_MAX_RADIUS_METERS;
  let radius = Math.min(env.NEARBY_RADIUS_FREE_METERS, maxRadius);
  let results = await queryNearby(userId, origin, radius, limit);

  while (results.length < env.NEARBY_MIN_RESULTS && radius < maxRadius) {
    radius = Math.min(radius * 2, maxRadius);
    results = await queryNearby(userId, origin, radius, limit);
  }

  return { radiusMeters: radius, results };
}
