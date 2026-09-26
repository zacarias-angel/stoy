import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setWorkerUrl } from 'maplibre-gl';
import mapLibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { App } from './App';
import './index.css';

// Vite sirve el worker como modulo separado; MapLibre necesita esta referencia explicita.
setWorkerUrl(mapLibreWorkerUrl);

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('No se encontro el elemento #root');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
