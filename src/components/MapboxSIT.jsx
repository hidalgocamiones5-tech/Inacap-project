import React, { useMemo, useState } from 'react';
import Map, { Source, Layer, Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// API Key de Mapbox desde el archivo .env
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY || 'PON_AQUI_TU_MAPBOX_ACCESS_TOKEN';

export default function MapboxSIT({ 
  selectedZone, 
  onMapClick, 
  isDrawing, 
  customCenter, 
  customRadius 
}) {
  // Estado inicial de la cámara configurado para Chillán con perspectiva 3D
  const [viewState, setViewState] = useState({
    longitude: -72.1034,
    latitude: -36.6063,
    zoom: 15.5,
    pitch: 65,
    bearing: -20
  });

  // Generamos un polígono circular translúcido simulado si hay un customCenter
  const polygonData = useMemo(() => {
    if (!customCenter) return null;
    
    const [lat, lng] = customCenter;
    const radius = customRadius || 250; // Metros
    const points = 64;
    const coords = [];
    
    // Generar círculo usando matemáticas simples
    for (let i = 0; i < points; i++) {
      const angle = (i * 360) / points;
      const rad = (angle * Math.PI) / 180;
      // Aproximación de grados a metros en la latitud de Chillán
      const dx = (radius * Math.cos(rad)) / 111320;
      const dy = (radius * Math.sin(rad)) / (111320 * Math.cos((lat * Math.PI) / 180));
      coords.push([lng + dx, lat + dy]);
    }
    // Cerrar el polígono
    coords.push(coords[0]);

    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coords]
          }
        }
      ]
    };
  }, [customCenter, customRadius]);

  // Manejar el clic en el mapa sin interferir con la UI (React)
  const handleClick = (e) => {
    if (isDrawing && onMapClick) {
      // Mapbox devuelve e.lngLat
      onMapClick([e.lngLat.lng, e.lngLat.lat]);
    }
  };

  // Si no hay Token válido de Mapbox, mostrar advertencia amigable
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('PON_AQUI_')) {
    return (
      <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-8 text-center z-0">
        <div className="bg-cyan-500/10 border border-cyan-500/30 p-6 rounded-2xl max-w-lg shadow-[0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-md">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Falta el Access Token de Mapbox</h2>
          <p className="text-slate-300 text-sm mb-4">
            Para ver el mapa 3D estándar de Mapbox, necesitas crear una cuenta gratuita y generar un Token.
          </p>
          <p className="text-slate-400 text-xs mb-4">
            Agrégalo a tu archivo <code className="bg-slate-800 px-2 py-1 rounded text-cyan-300">.env</code> en la raíz del proyecto:
          </p>
          <pre className="bg-slate-950 p-3 rounded-lg text-emerald-400 text-xs font-mono text-left select-all">
            VITE_MAPBOX_API_KEY=tu_token_de_mapbox_aqui
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 bg-slate-900">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onClick={handleClick}
        style={{ width: '100vw', height: '100vh' }}
        mapStyle="mapbox://styles/mapbox/standard"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['zona-seleccionada-fill']}
      >
        {/* Si existe un customCenter (simulando "Paseo Arauco"), renderizar polígono y marcador */}
        {polygonData && customCenter && (
          <>
            {/* Fuente GeoJSON para el Polígono */}
            <Source id="zona-seleccionada" type="geojson" data={polygonData}>
              {/* Capa Translúcida Cyan */}
              <Layer
                id="zona-seleccionada-fill"
                type="fill"
                paint={{
                  'fill-color': '#06b6d4',
                  'fill-opacity': 0.3
                }}
              />
              {/* Borde del Polígono */}
              <Layer
                id="zona-seleccionada-line"
                type="line"
                paint={{
                  'line-color': '#0891b2',
                  'line-width': 2
                }}
              />
            </Source>

            {/* Marcador Flotante Estilizado con Tailwind sobre el centro del polígono */}
            <Marker longitude={customCenter[1]} latitude={customCenter[0]} anchor="bottom">
              <div className="bg-cyan-500/20 backdrop-blur-md border border-cyan-400 text-cyan-50 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)] text-sm font-semibold flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Paseo Arauco (Centro)
              </div>
            </Marker>
          </>
        )}
      </Map>
    </div>
  );
}
