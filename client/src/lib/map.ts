import type { Feature, Polygon } from 'geojson';
import type { StyleSpecification } from 'maplibre-gl';

const tilesUrl =
  import.meta.env.VITE_MAP_TILES_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const mapStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [tilesUrl],
      tileSize: 256,
      maxzoom: 19,
      attribution: OSM_ATTRIBUTION,
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

export const DEFAULT_CENTER: [number, number] = [-58.3816, -34.6037];
export const DEFAULT_ZOOM = 13;

export function buildRadiusCircle(
  lng: number,
  lat: number,
  radiusMeters: number,
  steps = 64
): Feature<Polygon> {
  const metersPerDegreeLat = 111_320;
  const cosLat = Math.max(Math.cos((lat * Math.PI) / 180), 1e-6);
  const coordinates: [number, number][] = [];

  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2;
    const deltaLat = (radiusMeters * Math.cos(angle)) / metersPerDegreeLat;
    const deltaLng = (radiusMeters * Math.sin(angle)) / (metersPerDegreeLat * cosLat);
    coordinates.push([lng + deltaLng, lat + deltaLat]);
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coordinates] },
  };
}
