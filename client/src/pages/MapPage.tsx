import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  type GeoJSONSource,
} from 'maplibre-gl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomSheet } from '../components/BottomSheet';
import { Button } from '../components/Button';
import { MapControls } from '../components/MapControls';
import { PersonCard } from '../components/PersonCard';
import { PersonProfileCard } from '../components/PersonProfileCard';
import { createPersonMarkerElement } from '../components/PersonMarker';
import { apiFetch } from '../lib/api';
import { buildRadiusCircle, DEFAULT_CENTER, DEFAULT_ZOOM, mapStyle } from '../lib/map';
import type { NearbyPerson, NearbyResponse, PublicProfile } from '../lib/types';

type LocationStatus = 'idle' | 'locating' | 'ready' | 'denied' | 'unsupported' | 'error';

const statusMessages: Record<Exclude<LocationStatus, 'idle' | 'locating' | 'ready'>, string> = {
  denied: 'No pudimos acceder a tu ubicacion. Activa el permiso para descubrir personas cerca.',
  unsupported: 'Tu navegador no soporta geolocalizacion.',
  error: 'No pudimos guardar tu ubicacion. Intenta de nuevo.',
};

export function MapPage() {
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const userMarkerRef = useRef<Marker | null>(null);
  const autoLocatedRef = useRef(false);

  const [mapReady, setMapReady] = useState(false);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearby, setNearby] = useState<NearbyResponse | null>(null);
  const [selected, setSelected] = useState<NearbyPerson | null>(null);
  const [detail, setDetail] = useState<PublicProfile | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new MapLibreMap({
      container: containerRef.current,
      style: mapStyle,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: { compact: true },
    });

    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    map.on('click', () => setSelected(null));

    map.on('load', () => {
      map.addSource('radius', {
        type: 'geojson',
        data: buildRadiusCircle(DEFAULT_CENTER[1], DEFAULT_CENTER[0], 0),
      });
      map.addLayer({
        id: 'radius-fill',
        type: 'fill',
        source: 'radius',
        paint: { 'fill-color': '#0d9488', 'fill-opacity': 0.08 },
      });
      map.addLayer({
        id: 'radius-line',
        type: 'line',
        source: 'radius',
        paint: { 'line-color': '#0d9488', 'line-opacity': 0.4, 'line-width': 1 },
      });
      setMapReady(true);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  const loadNearby = useCallback(async () => {
    const data = await apiFetch<NearbyResponse>('/api/nearby?limit=30');
    setNearby(data);
  }, []);

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      return;
    }

    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const next = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCoords(next);
        mapRef.current?.flyTo({ center: [next.lng, next.lat], zoom: 15, duration: 800 });

        try {
          await apiFetch('/api/locations/me', {
            method: 'PUT',
            body: JSON.stringify({
              latitude: next.lat,
              longitude: next.lng,
              accuracyMeters: position.coords.accuracy,
            }),
          });
          await loadNearby();
          setStatus('ready');
        } catch {
          setStatus('error');
        }
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 }
    );
  }, [loadNearby]);

  useEffect(() => {
    if (autoLocatedRef.current) {
      return;
    }
    autoLocatedRef.current = true;
    locate();
  }, [locate]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !coords || !nearby) {
      return;
    }
    const source = map.getSource('radius') as GeoJSONSource | undefined;
    source?.setData(buildRadiusCircle(coords.lng, coords.lat, nearby.radiusMeters));
  }, [coords, nearby, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !coords) {
      return;
    }
    if (!userMarkerRef.current) {
      const element = document.createElement('div');
      element.className = 'h-4 w-4 rounded-full border-2 border-white bg-brand-700 shadow';
      userMarkerRef.current = new Marker({ element, anchor: 'center' })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat([coords.lng, coords.lat]);
    }
  }, [coords, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (!nearby) {
      return;
    }

    markersRef.current = nearby.results.map((person) => {
      const element = createPersonMarkerElement(person, (selectedPerson) => {
        setSelected(selectedPerson);
        setDetail(null);
      });
      return new Marker({ element, anchor: 'center' })
        .setLngLat([person.lng, person.lat])
        .addTo(map);
    });
  }, [nearby, mapReady]);

  const openProfile = useCallback(async (userId: number) => {
    setDetailLoading(true);
    try {
      setDetail(await apiFetch<PublicProfile>(`/api/profiles/${userId}`));
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const results = nearby?.results ?? [];
  const summary = nearby
    ? results.length > 0
      ? `${results.length} ${results.length === 1 ? 'persona cerca' : 'personas cerca'}`
      : 'Nadie cerca por ahora'
    : status === 'locating'
      ? 'Buscando tu ubicacion...'
      : 'Comparti tu ubicacion';

  return (
    <section className="absolute inset-0 overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />

      <div className="pointer-events-none absolute left-3 top-3 z-20">
        <span className="pointer-events-auto inline-flex items-center rounded-full border border-stone-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-stone-600 shadow-sm">
          {summary}
        </span>
      </div>

      <MapControls onLocate={locate} locating={status === 'locating'} />

      {(status === 'denied' || status === 'unsupported' || status === 'error') && (
        <div className="absolute inset-x-0 top-16 z-20 mx-auto max-w-xs px-3">
          <div className="rounded-2xl border border-stone-200 bg-white/95 p-4 text-center shadow-lg">
            <p className="text-sm text-stone-700">{statusMessages[status]}</p>
            {status !== 'unsupported' && (
              <Button className="mt-3" fullWidth onClick={locate}>
                Reintentar
              </Button>
            )}
          </div>
        </div>
      )}

      <BottomSheet open={selected !== null} onClose={() => setSelected(null)}>
        {selected && detail ? (
          <PersonProfileCard
            profile={detail}
            distanceLabel={selected.distanceLabel}
            onTalk={() => navigate('/chats')}
          />
        ) : selected ? (
          detailLoading ? (
            <p className="py-6 text-center text-sm text-stone-500">Cargando perfil...</p>
          ) : (
            <PersonCard
              person={selected}
              onViewProfile={() => openProfile(selected.userId)}
              onTalk={() => navigate('/chats')}
            />
          )
        ) : null}
      </BottomSheet>
    </section>
  );
}
