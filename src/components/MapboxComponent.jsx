import React, { useEffect, useRef, useMemo } from 'react';
import Map, { Source, Layer, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createCircleCoords, generateMockCompetitors } from '../mockData';
import { Store, Building2, ShoppingCart, Coffee, Activity } from 'lucide-react';

export default function MapboxComponent({ 
  selectedZone, 
  onSelectZone, 
  zones, 
  isDrawing, 
  customCenter, 
  customRadius,
  onMapClick 
}) {
  const mapRef = useRef();

  // Generar competidores dinámicamente
  const competitors = useMemo(() => {
    if (!selectedZone) return [];
    return generateMockCompetitors(selectedZone.center[0], selectedZone.center[1], 15);
  }, [selectedZone]);


  // Convertir zonas interactivas a polígonos
  const zonesGeoJSON = {
    type: 'FeatureCollection',
    features: zones.map(zone => ({
      type: 'Feature',
      properties: { id: zone.id, name: zone.name, height: 5 }, // Altura base pequeña
      geometry: {
        type: 'Polygon',
        coordinates: [zone.coords.map(coord => [coord[1], coord[0]])]
      }
    }))
  };

  // La cuadra seleccionada se eleva como un prisma flotante/resaltado
  const selectedZoneGeoJSON = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: { height: 25, min_height: 0 }, // Extrusión destacada
      geometry: {
        type: 'Polygon',
        coordinates: [selectedZone.coords.map(coord => [coord[1], coord[0]])]
      }
    }]
  };

  const getDrawingGeoJSON = () => {
    if (!customCenter) return null;
    const coords = createCircleCoords(customCenter[0], customCenter[1], customRadius);
    const coordsLngLat = coords.map(coord => [coord[1], coord[0]]);
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: { height: 15 },
        geometry: {
          type: 'Polygon',
          coordinates: [coordsLngLat]
        }
      }]
    };
  };

  const drawingGeoJSON = getDrawingGeoJSON();

  useEffect(() => {
    if (mapRef.current && !isDrawing) {
      mapRef.current.flyTo({
        center: [selectedZone.center[1], selectedZone.center[0]], 
        zoom: 16.5,
        pitch: 65,  // Perspectiva isométrica profunda
        bearing: -20, // Rotación
        duration: 2500,
        essential: true
      });
    }
  }, [selectedZone, isDrawing]);

  const handleMapClick = (e) => {
    if (isDrawing) {
      onMapClick([e.lngLat.lng, e.lngLat.lat]);
      return;
    }

    const features = e.features;
    if (features && features.length > 0) {
      const clickedZoneId = features[0].properties.id;
      if (clickedZoneId) {
        const zone = zones.find(z => z.id === clickedZoneId);
        if (zone) onSelectZone(zone);
      }
    }
  };

  const getCompetitorIcon = (type) => {
    switch (type) {
      case 'panaderia': return <Store size={12} className="text-amber-400" />;
      case 'ferreteria': return <Building2 size={12} className="text-blue-400" />;
      case 'minimarket': return <ShoppingCart size={12} className="text-emerald-400" />;
      case 'cafeteria': return <Coffee size={12} className="text-orange-400" />;
      case 'farmacia': return <Activity size={12} className="text-rose-400" />;
      default: return <Store size={12} className="text-slate-400" />;
    }
  };

  return (
    <div className={`absolute inset-0 z-0 bg-[#0f172a] ${isDrawing && !customCenter ? 'cursor-crosshair' : ''}`}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -72.1034,
          latitude: -36.6063,
          zoom: 16.5,
          pitch: 65,
          bearing: -20
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        interactiveLayerIds={isDrawing ? [] : ['zones-fill']}
        onClick={handleMapClick}
        style={{ width: '100vw', height: '100vh' }}
        cursor={isDrawing && !customCenter ? 'crosshair' : 'auto'}
      >
        {/* Zonas Inactivas (Extrusión Baja) */}
        <Source id="all-zones" type="geojson" data={zonesGeoJSON}>
          <Layer 
            id="zones-fill"
            type="fill-extrusion"
            paint={{
              'fill-extrusion-color': '#1e293b',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-opacity': 0.6
            }}
          />
        </Source>

        {/* Zona Seleccionada (Prisma 3D Resaltado Neon) */}
        {!isDrawing && (
          <Source id="selected-zone" type="geojson" data={selectedZoneGeoJSON}>
            <Layer 
              id="selected-zone-extrusion"
              type="fill-extrusion"
              paint={{
                'fill-extrusion-color': '#00e5ff',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 0.4
              }}
            />
            <Layer 
              id="selected-zone-line"
              type="line"
              paint={{
                'line-color': '#00e5ff',
                'line-width': 3,
                'line-opacity': 0.9
              }}
            />
          </Source>
        )}

        {/* Competidores Locales (Puntos Visuales) */}
        {!isDrawing && competitors.map((comp) => (
          <Marker 
            key={comp.id}
            longitude={comp.lng} 
            latitude={comp.lat} 
            anchor="bottom"
          >
            <div className="relative group cursor-pointer flex flex-col items-center">
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-max">
                <div className="bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg px-2 py-1.5 shadow-xl flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-200">{comp.name}</span>
                  <span className="text-[8px] text-slate-400 uppercase tracking-wider">{comp.type}</span>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-600/80 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:border-blue-400 group-hover:scale-110 transition-all duration-300">
                {getCompetitorIcon(comp.type)}
              </div>
              <div className="w-1 h-2 bg-slate-600/80 group-hover:bg-blue-400 transition-colors"></div>
            </div>
          </Marker>
        ))}

        {/* Marcador Central de la Zona Seleccionada */}
        {!isDrawing && (
          <Marker 
            longitude={selectedZone.center[1]} 
            latitude={selectedZone.center[0]} 
            anchor="bottom"
          >
            <div className="flex flex-col items-center pointer-events-none relative z-20">
              <div className="bg-slate-900/90 backdrop-blur text-[#00e5ff] text-xs font-black px-3 py-1.5 rounded-lg border-2 border-[#00e5ff]/50 mb-1 shadow-[0_0_20px_rgba(0,229,255,0.6)] whitespace-nowrap">
                {selectedZone.name}
              </div>
              <div className="w-5 h-5 bg-[#00e5ff] rounded-full flex items-center justify-center animate-bounce shadow-[0_0_20px_rgba(0,229,255,0.9)]">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </Marker>
        )}

        {/* Dibujo en Progreso (Prisma Cilíndrico Ámbar) */}
        {isDrawing && drawingGeoJSON && (
          <Source id="drawing-zone" type="geojson" data={drawingGeoJSON}>
            <Layer 
              id="drawing-zone-extrusion"
              type="fill-extrusion"
              paint={{
                'fill-extrusion-color': '#f59e0b',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-opacity': 0.3
              }}
            />
            <Layer 
              id="drawing-zone-line"
              type="line"
              paint={{
                'line-color': '#f59e0b',
                'line-width': 2,
                'line-opacity': 0.8,
                'line-dasharray': [2, 2]
              }}
            />
          </Source>
        )}

        {/* Punto Central mientras se dibuja */}
        {isDrawing && customCenter && (
          <Marker 
            longitude={customCenter[1]} 
            latitude={customCenter[0]} 
            anchor="center"
          >
            <div className="w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(245,158,11,0.8)]"></div>
          </Marker>
        )}
      </Map>
    </div>
  );
}
