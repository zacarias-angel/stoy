import { createHmac } from 'node:crypto';

const METERS_PER_DEGREE_LATITUDE = 111_320;

export interface LatLng {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export function isValidLatitude(value: number): boolean {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(value: number): boolean {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

export function toPointWkt(lng: number, lat: number): string {
  return `POINT(${lng} ${lat})`;
}

export function boundingBox(lat: number, lng: number, radiusMeters: number): BoundingBox {
  const latDelta = radiusMeters / METERS_PER_DEGREE_LATITUDE;
  const cosLat = Math.max(Math.cos((lat * Math.PI) / 180), 1e-6);
  const lngDelta = radiusMeters / (METERS_PER_DEGREE_LATITUDE * cosLat);

  return {
    minLat: Math.max(-90, lat - latDelta),
    maxLat: Math.min(90, lat + latDelta),
    minLng: Math.max(-180, lng - lngDelta),
    maxLng: Math.min(180, lng + lngDelta),
  };
}

export function boundingBoxPolygonWkt(box: BoundingBox): string {
  const { minLat, maxLat, minLng, maxLng } = box;
  return (
    `POLYGON((${minLng} ${minLat}, ` +
    `${maxLng} ${minLat}, ` +
    `${maxLng} ${maxLat}, ` +
    `${minLng} ${maxLat}, ` +
    `${minLng} ${minLat}))`
  );
}

export function offsetLatLng(
  lat: number,
  lng: number,
  distanceMeters: number,
  bearingRadians: number
): LatLng {
  const deltaLat = (distanceMeters * Math.cos(bearingRadians)) / METERS_PER_DEGREE_LATITUDE;
  const cosLat = Math.max(Math.cos((lat * Math.PI) / 180), 1e-6);
  const deltaLng =
    (distanceMeters * Math.sin(bearingRadians)) / (METERS_PER_DEGREE_LATITUDE * cosLat);

  return {
    lat: Math.max(-90, Math.min(90, lat + deltaLat)),
    lng: Math.max(-180, Math.min(180, lng + deltaLng)),
  };
}

export interface DeterministicOffset {
  bearingRadians: number;
  distanceMeters: number;
}

export function deterministicOffset(
  userId: number,
  secret: string,
  minMeters: number,
  maxMeters: number
): DeterministicOffset {
  const digest = createHmac('sha256', secret).update(String(userId)).digest();
  const bearingRadians = (digest.readUInt32BE(0) / 0xffffffff) * Math.PI * 2;
  const span = Math.max(0, maxMeters - minMeters);
  const distanceMeters = minMeters + (digest.readUInt32BE(4) / 0xffffffff) * span;
  return { bearingRadians, distanceMeters };
}

export interface HumanDistance {
  minutes: number;
  label: string;
}

export function formatDistance(meters: number, metersPerMinute: number): HumanDistance {
  const rawMinutes = meters / metersPerMinute;

  if (rawMinutes < 1) {
    return { minutes: 0, label: 'A menos de 1 min' };
  }

  const minutes = Math.round(rawMinutes);
  return { minutes, label: `A ${minutes} min` };
}
