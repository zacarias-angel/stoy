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
import { getMembership } from '../memberships/memberships.service.js';

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
export interface NearbyFilters { limit: number; q?: string; skillId?: number; }

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
  filters: NearbyFilters
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
        AND (? IS NULL OR pr.name LIKE ? OR pr.headline LIKE ? OR pr.bio LIKE ? OR EXISTS (
          SELECT 1 FROM user_skills search_us JOIN skills search_s ON search_s.id = search_us.skill_id
          WHERE search_us.user_id = ul.user_id AND search_s.name LIKE ?
        ))
        AND (? IS NULL OR EXISTS (SELECT 1 FROM user_skills filter_us WHERE filter_us.user_id = ul.user_id AND filter_us.skill_id = ?))
      ORDER BY distance_m ASC
      LIMIT ?`,
    [originWkt, userId, envelope, originWkt, radiusMeters, filters.q ?? null, `%${filters.q ?? ''}%`, `%${filters.q ?? ''}%`, `%${filters.q ?? ''}%`, `%${filters.q ?? ''}%`, filters.skillId ?? null, filters.skillId ?? null, filters.limit]
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

export async function findNearby(userId: number, filters: NearbyFilters): Promise<NearbyResultDto> {
  const origin = requireOwnLocation(await getOwnLocation(userId));
  const membership = await getMembership(userId);

  // La membresia garantiza su radio contratado; el limite global solo regula el plan gratuito.
  const maxRadius = membership.isActive
    ? membership.discoveryRadiusMeters
    : Math.min(env.NEARBY_MAX_RADIUS_METERS, membership.discoveryRadiusMeters);
  let radius = Math.min(membership.discoveryRadiusMeters, maxRadius);
  let results = await queryNearby(userId, origin, radius, filters);

  while (results.length < env.NEARBY_MIN_RESULTS && radius < maxRadius) {
    radius = Math.min(radius * 2, maxRadius);
    results = await queryNearby(userId, origin, radius, filters);
  }

  return { radiusMeters: radius, results };
}
