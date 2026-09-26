import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  type GeoJSONSource,
} from 'maplibre-gl';
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomSheet } from '../components/BottomSheet';
import { Button } from '../components/Button';
import { MapControls } from '../components/MapControls';
import { CloseIcon, PeopleIcon } from '../components/icons';
import { PersonCard } from '../components/PersonCard';
import { PersonProfileCard } from '../components/PersonProfileCard';
import { createPersonMarkerElement } from '../components/PersonMarker';
import { apiFetch } from '../lib/api';
import { buildRadiusCircle, DEFAULT_CENTER, DEFAULT_ZOOM, mapStyle } from '../lib/map';
import type { NearbyPerson, NearbyResponse, PublicProfile, Skill } from '../lib/types';

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
  const locationInitializedRef = useRef(false);

  const [mapReady, setMapReady] = useState(false);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearby, setNearby] = useState<NearbyResponse | null>(null);
  const [selected, setSelected] = useState<NearbyPerson | null>(null);
  const [detail, setDetail] = useState<PublicProfile | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [query, setQuery] = useState('');
  const [skillId, setSkillId] = useState<number | null>(null);
  const [nearbyOpen, setNearbyOpen] = useState(false);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [selectingManualLocation, setSelectingManualLocation] = useState(false);

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

  const loadNearby = useCallback(async (nextQuery = query, nextSkillId = skillId) => {
    const params = new URLSearchParams({ limit: '30' });
    if (nextQuery.trim()) params.set('q', nextQuery.trim());
    if (nextSkillId) params.set('skillId', String(nextSkillId));
    const data = await apiFetch<NearbyResponse>(`/api/nearby?${params}`);
    setNearby(data);
  }, [query, skillId]);

  useEffect(() => {
    apiFetch<{ skills: Skill[] }>('/api/skills').then((data) => setSkills(data.skills)).catch(() => setSkills([]));
  }, []);

  function applyFilters(event: ChangeEvent<HTMLFormElement>) {
    event.preventDefault();
    loadNearby();
  }

  const saveLocation = useCallback(async (next: { lat: number; lng: number }) => {
    setCoords(next);
    mapRef.current?.flyTo({ center: [next.lng, next.lat], zoom: 15, duration: 800 });
    try {
      await apiFetch('/api/locations/me', {
        method: 'PUT',
        body: JSON.stringify({ latitude: next.lat, longitude: next.lng }),
      });
      await loadNearby();
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [loadNearby]);

  const locate = useCallback((force = false) => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      return;
    }

    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const next = { lat: position.coords.latitude, lng: position.coords.longitude };
        await saveLocation(next);
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: force ? 0 : 60_000 }
    );
  }, [saveLocation]);

  useEffect(() => {
    if (locationInitializedRef.current) return;
    locationInitializedRef.current = true;
    let active = true;

    apiFetch<{ location: { lat: number; lng: number } | null }>('/api/locations/me')
      .then(({ location }) => {
        if (!active) return;
        if (!location) {
          locate();
          return;
        }
        setCoords(location);
        mapRef.current?.flyTo({ center: [location.lng, location.lat], zoom: 15, duration: 800 });
        loadNearby()
          .then(() => {
            if (active) setStatus('ready');
          })
          .catch(() => {
            if (active) setStatus('error');
          });
      })
      .catch(() => {
        if (active) locate();
      });

    return () => {
      active = false;
    };
  }, [loadNearby, locate]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !selectingManualLocation) return;
    const canvas = map.getCanvas();
    canvas.style.cursor = 'crosshair';
    const onMapClick = (event: { lngLat: { lat: number; lng: number } }) => {
      setSelectingManualLocation(false);
      setStatus('locating');
      void saveLocation({ lat: event.lngLat.lat, lng: event.lngLat.lng });
    };
    map.once('click', onMapClick);
    return () => {
      canvas.style.cursor = '';
      map.off('click', onMapClick);
    };
  }, [mapReady, saveLocation, selectingManualLocation]);

  function startManualLocationSelection() {
    setLocationMenuOpen(false);
    setSelectingManualLocation(true);
  }

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
    <section className="absolute inset-0 overflow-hidden md:p-5">
      <div ref={containerRef} className="map-canvas absolute inset-0 md:inset-5 md:rounded-[1.5rem_1.25rem_1.8rem_1.35rem] md:border md:border-stone-400 md:shadow-[3px_4px_0_rgba(68,52,37,0.2)]" />

      <button type="button" onClick={() => setNearbyOpen(true)} aria-label="Ver personas cerca" className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-[45%_55%_52%_48%] border border-stone-700 bg-[#fffaf0] text-brand-800 shadow-[2px_3px_0_rgba(41,37,36,0.35)] transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:right-9 md:top-9">
        <PeopleIcon width={21} height={21} />
      </button>

      {nearbyOpen && <aside className="paper-panel absolute bottom-16 right-3 top-16 z-30 flex w-[min(20rem,calc(100%-1.5rem))] flex-col rounded-[1.4rem_1.15rem_1.5rem_1.2rem] p-5 md:bottom-auto md:right-9 md:top-20 md:h-[min(36rem,calc(100%-7rem))]">
        <button type="button" onClick={() => setNearbyOpen(false)} aria-label="Cerrar personas cercanas" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100"><CloseIcon width={18} height={18} /></button>
        <p className="hand-note text-xl text-brand-800">personas cerca</p>
        <h1 className="mt-1 text-xl font-bold text-stone-900">Tu mapa de barrio</h1>
        <p className="mt-2 text-sm leading-5 text-stone-600">Elegí a alguien en el mapa para conocer lo que sabe hacer.</p>
        <div className="mt-5 flex-1 space-y-2 overflow-y-auto pr-1">
          {results.length ? results.map((person) => (
            <button key={person.userId} type="button" onClick={() => { setSelected(person); setDetail(null); }} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${selected?.userId === person.userId ? 'border-brand-700 bg-brand-50' : 'border-stone-200 bg-white/60 hover:bg-stone-100'}`}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[45%_55%_52%_48%] border border-stone-700 bg-[#fffaf0] text-xs font-bold text-brand-800">{person.name.slice(0, 1).toUpperCase()}</span>
              <span className="min-w-0"><strong className="block truncate text-sm text-stone-900">{person.name}</strong><span className="block truncate text-xs text-stone-500">{person.skill ?? person.headline ?? 'Sin oficio definido'} · {person.distanceLabel}</span></span>
            </button>
          )) : <p className="rounded-xl border border-dashed border-stone-300 p-4 text-sm text-stone-500">Cuando compartas tu ubicación, acá aparecen las personas cercanas.</p>}
        </div>
        <p className="hand-note mt-4 text-base text-stone-500">las marcas son aproximadas</p>
      </aside>}

       <div className="pointer-events-none absolute left-3 top-3 z-20">
        <span className="pointer-events-auto inline-flex items-center rounded-full border border-stone-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-stone-600 shadow-sm">
          {summary}
        </span>
       </div>

       <form onSubmit={applyFilters} className="absolute left-3 right-3 top-12 z-20 flex gap-2 sm:right-auto sm:w-[28rem]">
         <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar oficio o persona" className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white/95 px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-600" />
         <select value={skillId ?? ''} onChange={(event) => setSkillId(event.target.value ? Number(event.target.value) : null)} className="max-w-32 rounded-xl border border-stone-200 bg-white/95 px-2 py-2 text-sm shadow-sm outline-none focus:border-brand-600">
           <option value="">Todos</option>
           {skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
         </select>
         <Button type="submit" className="shrink-0">Buscar</Button>
       </form>

       <MapControls onLocate={locate} onOpenLocationMenu={() => setLocationMenuOpen(true)} locating={status === 'locating'} />

       {locationMenuOpen && <div className="paper-panel absolute bottom-4 left-16 z-30 w-72 rounded-[1.25rem_1rem_1.35rem_1.1rem] p-4">
         <button type="button" onClick={() => setLocationMenuOpen(false)} aria-label="Cerrar" className="absolute right-2 top-2 p-2 text-stone-500"><CloseIcon width={17} height={17} /></button>
         <p className="hand-note text-lg text-brand-800">tu ubicación</p>
         <p className="mt-1 pr-6 text-sm text-stone-600">Podés usar el GPS o marcar el punto exacto en el mapa.</p>
         <div className="mt-4 grid gap-2">
           <Button onClick={() => { setLocationMenuOpen(false); locate(true); }}>Usar mi GPS</Button>
           <Button variant="secondary" onClick={startManualLocationSelection}>Elegir en el mapa</Button>
         </div>
       </div>}

       {selectingManualLocation && <div className="absolute inset-x-0 top-16 z-30 mx-auto w-fit max-w-[calc(100%-2rem)] rounded-full border border-stone-700 bg-[#fffaf0] px-4 py-2 text-sm font-medium text-stone-800 shadow-md">Tocá el lugar donde estás para ajustar tu ubicación <button type="button" onClick={() => setSelectingManualLocation(false)} className="ml-2 font-semibold text-brand-800 underline">Cancelar</button></div>}

      {(status === 'denied' || status === 'unsupported' || status === 'error') && (
        <div className="absolute inset-x-0 top-16 z-20 mx-auto max-w-xs px-3">
          <div className="rounded-2xl border border-stone-200 bg-white/95 p-4 text-center shadow-lg">
            <p className="text-sm text-stone-700">{statusMessages[status]}</p>
            {status !== 'unsupported' && (
              <Button className="mt-3" fullWidth onClick={() => locate(true)}>
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
            onTalk={() => navigate(`/chats?userId=${selected.userId}`)}
          />
        ) : selected ? (
          detailLoading ? (
            <p className="py-6 text-center text-sm text-stone-500">Cargando perfil...</p>
          ) : (
            <PersonCard
              person={selected}
              onViewProfile={() => openProfile(selected.userId)}
              onTalk={() => navigate(`/chats?userId=${selected.userId}`)}
            />
          )
        ) : null}
      </BottomSheet>
    </section>
  );
}
