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
import { CloseIcon, EyeIcon, EyeOffIcon, PeopleIcon } from '../components/icons';
import { PersonCard } from '../components/PersonCard';
import { PersonProfileCard } from '../components/PersonProfileCard';
import { apiFetch } from '../lib/api';
import { useAuth } from '../lib/auth';
import { buildRadiusCircle, DEFAULT_CENTER, DEFAULT_ZOOM, mapStyle } from '../lib/map';
import type { Membership, NearbyPerson, NearbyResponse, PublicProfile, Skill } from '../lib/types';

type LocationStatus = 'idle' | 'locating' | 'ready' | 'denied' | 'unsupported' | 'error';

const statusMessages: Record<Exclude<LocationStatus, 'idle' | 'locating' | 'ready'>, string> = {
  denied: 'No pudimos acceder a tu ubicacion. Activa el permiso para descubrir personas cerca.',
  unsupported: 'Tu navegador no soporta geolocalizacion.',
  error: 'No pudimos guardar tu ubicacion. Intenta de nuevo.',
};

function createFallbackAvatar(name: string): ImageData {
  const size = 160;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return new ImageData(size, size);

  context.beginPath();
  context.arc(size / 2, size / 2, 74, 0, Math.PI * 2);
  context.fillStyle = '#f8f4e9';
  context.fill();
  context.strokeStyle = '#39362f';
  context.lineWidth = 7;
  context.stroke();
  context.fillStyle = '#39362f';
  context.font = 'bold 78px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(name.trim().charAt(0).toUpperCase() || '?', size / 2, size / 2 + 4);
  return context.getImageData(0, 0, size, size);
}

function createRoundAvatar(source: CanvasImageSource): ImageData {
  const size = 160;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return new ImageData(size, size);

  context.save();
  context.beginPath();
  context.arc(size / 2, size / 2, 72, 0, Math.PI * 2);
  context.clip();
  context.drawImage(source, 0, 0, size, size);
  context.restore();
  context.beginPath();
  context.arc(size / 2, size / 2, 74, 0, Math.PI * 2);
  context.strokeStyle = '#39362f';
  context.lineWidth = 7;
  context.stroke();
  return context.getImageData(0, 0, size, size);
}

export function MapPage() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const userMarkerRef = useRef<Marker | null>(null);
  const nearbyRef = useRef<NearbyPerson[]>([]);

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
  const [visibilitySaving, setVisibilitySaving] = useState(false);
  const [membership, setMembership] = useState<Membership | null>(null);

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
    map.on('click', (event) => {
      const hitPerson = map.getLayer('people-photo')
        && map.queryRenderedFeatures(event.point, { layers: ['people-photo'] }).length > 0;
      if (!hitPerson) setSelected(null);
    });

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
      map.addSource('people', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'people-photo',
        type: 'symbol',
        source: 'people',
        layout: {
          'icon-image': ['get', 'icon'],
          'icon-size': 0.4,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });
      map.on('click', 'people-photo', (event) => {
        const userId = Number(event.features?.[0]?.properties?.userId);
        const person = nearbyRef.current.find((item) => item.userId === userId);
        if (person) {
          setSelected(person);
          setDetail(null);
        }
      });
      setMapReady(true);
    });

    mapRef.current = map;

    return () => {
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

  useEffect(() => {
    apiFetch<Membership>('/api/memberships/me').then(setMembership).catch(() => setMembership(null));
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
    if (!mapReady) return;
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
  }, [loadNearby, locate, mapReady]);

  async function toggleMapVisibility() {
    if (!profile || visibilitySaving) return;
    setVisibilitySaving(true);
    try {
      await apiFetch('/api/profiles/me', {
        method: 'PUT',
        body: JSON.stringify({ isVisible: !profile.isVisible }),
      });
      await refreshProfile();
      if (profile.isVisible) setNearby((current) => current ? { ...current, results: current.results.filter((person) => person.userId !== profile.userId) } : current);
    } catch {
      // El estado visual se conserva hasta que el backend confirme el cambio.
    } finally {
      setVisibilitySaving(false);
    }
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
    if (!map || !mapReady || !coords || !profile?.isVisible) {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      return;
    }
    if (!userMarkerRef.current) {
      const element = document.createElement('div');
      element.className = 'flex h-16 w-16 items-center justify-center overflow-hidden rounded-[45%_55%_52%_48%] border-[3px] border-stone-800 bg-[#fffaf0] text-lg font-semibold text-brand-800 shadow-[3px_4px_0_rgba(41,37,36,0.45)]';
      if (profile.avatarUrl) {
        const image = document.createElement('img');
        image.src = profile.avatarUrl;
        image.alt = '';
        image.className = 'h-full w-full object-cover';
        element.appendChild(image);
      } else {
        element.textContent = profile.name.trim().charAt(0).toUpperCase() || '?';
      }
      userMarkerRef.current = new Marker({ element, anchor: 'center' })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat([coords.lng, coords.lat]);
    }
  }, [coords, mapReady, profile]);

  useEffect(() => {
    nearbyRef.current = nearby?.results ?? [];
  }, [nearby]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }
    const source = map.getSource('people') as GeoJSONSource | undefined;
    if (!source) return;
    const activeMap = map;
    const activeSource = source;

    let cancelled = false;
    async function updatePeopleLayer() {
      const people = nearby?.results ?? [];
      people.forEach((person) => {
        const imageId = `person-photo-${person.userId}`;
        if (!activeMap.hasImage(imageId)) activeMap.addImage(imageId, createFallbackAvatar(person.name));
      });
      activeSource.setData({
        type: 'FeatureCollection',
        features: people.map((person) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [person.lng, person.lat] },
          properties: { userId: person.userId, icon: `person-photo-${person.userId}` },
        })),
      });
      await Promise.all(people.filter((person) => person.avatarUrl).map(async (person) => {
        try {
          const image = await activeMap.loadImage(person.avatarUrl!);
          if (!cancelled && activeMap.hasImage(`person-photo-${person.userId}`)) {
            activeMap.updateImage(`person-photo-${person.userId}`, createRoundAvatar(image.data));
          }
        } catch {
          // The generated initial remains visible if the remote image blocks CORS.
        }
      }));
    }
    void updatePeopleLayer();
    return () => { cancelled = true; };
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

       {profile && <button type="button" onClick={toggleMapVisibility} disabled={visibilitySaving} aria-label={profile.isVisible ? 'Dejar de mostrarme en el mapa' : 'Mostrarme en el mapa'} title={profile.isVisible ? 'Te mostrás en el mapa' : 'No te mostrás en el mapa'} className={`absolute right-16 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-[45%_55%_52%_48%] border shadow-[2px_3px_0_rgba(41,37,36,0.35)] transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60 md:right-[5.25rem] md:top-9 ${profile.isVisible ? 'border-stone-700 bg-[#fffaf0] text-stone-800' : 'border-stone-400 bg-[#e7e1d5] text-stone-500'}`}>
         {profile.isVisible ? <EyeIcon width={21} height={21} /> : <EyeOffIcon width={21} height={21} />}
       </button>}

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

       <MapControls onLocate={locate} locating={status === 'locating'} />

       {membership && !membership.isActive && (
         <button
           type="button"
           onClick={() => navigate('/membresia')}
           className="hand-action absolute bottom-4 right-3 z-20 max-w-[15rem] border-2 border-stone-700 bg-[#f8f4e9]/95 px-4 py-3 text-left shadow-[3px_4px_0_rgba(57,54,47,0.25)] transition-transform hover:-rotate-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-600 md:bottom-9 md:right-9"
         >
           <span className="font-hand block text-lg font-semibold leading-none text-stone-800">¿querés ver más lejos?</span>
           <span className="mt-1 block text-sm text-stone-600">ampliá tu mapa de 500 m <span className="font-hand text-base text-stone-800">-&gt;</span></span>
         </button>
       )}

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
