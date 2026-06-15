import React, { useMemo, useRef } from 'react';
import { Viewer, Cesium3DTileset, Entity, PolygonGraphics, PointGraphics, LabelGraphics, CameraFlyTo, ImageryLayer } from 'resium';
import { Cartesian3, Color, Math as CesiumMath, ColorMaterialProperty, Cartesian2, UrlTemplateImageryProvider } from 'cesium';
import { generateMockCompetitors, createCircleCoords } from '../mockData';

// API Key de Google Maps desde el archivo .env
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function SITMapResium({ 
  selectedZone, 
  onSelectZone, 
  zones, 
  isDrawing, 
  customCenter, 
  customRadius,
  onMapClick 
}) {
  const viewerRef = useRef(null);

  // Manejador nativo de clics sobre el Viewer de Cesium
  const handleViewerClick = (e) => {
    if (!viewerRef.current?.cesiumElement || !onMapClick) return;
    
    const scene = viewerRef.current.cesiumElement.scene;
    // e.position trae las coordenadas (X, Y) de la pantalla
    const windowPosition = e.position; 
    
    // Intentamos obtener la elevación sobre los edificios/terreno 3D
    let cartesian;
    try {
      cartesian = scene.pickPosition(windowPosition);
    } catch (error) {
      // pickPosition puede fallar si no hay profundidad disponible
    }
    
    // Si no golpeó un modelo 3D o falló, calculamos sobre el globo (elipsoide)
    if (!cartesian) {
      cartesian = scene.camera.pickEllipsoid(windowPosition, scene.globe.ellipsoid);
    }
    
    if (cartesian) {
      const cartographic = scene.globe.ellipsoid.cartesianToCartographic(cartesian);
      const longitude = CesiumMath.toDegrees(cartographic.longitude);
      const latitude = CesiumMath.toDegrees(cartographic.latitude);
      
      // Llamar al callback en App.jsx con el formato [lng, lat]
      onMapClick([longitude, latitude]);
    }
  };

  // Generar competidores dinámicamente para mostrarlos en el 3D
  const competitors = useMemo(() => {
    if (!selectedZone) return [];
    return generateMockCompetitors(selectedZone.center[0], selectedZone.center[1], 15);
  }, [selectedZone]);

  // Convertir las coordenadas lat/lng de la zona seleccionada a formato Cartesian3 de Cesium
  const selectedZonePositions = useMemo(() => {
    if (!selectedZone || !selectedZone.coords) return [];
    // Cesium fromDegrees espera (longitude, latitude, height)
    return Cartesian3.fromDegreesArray(
      selectedZone.coords.flatMap(coord => [coord[1], coord[0]])
    );
  }, [selectedZone]);

  // Posición central para la cámara y los labels
  const centerCartesian = useMemo(() => {
    if (!selectedZone) return Cartesian3.ZERO;
    // Elevamos ligeramente el centro para que el label no quede enterrado en los edificios 3D
    return Cartesian3.fromDegrees(selectedZone.center[1], selectedZone.center[0], 50);
  }, [selectedZone]);

  // Posición de la cámara isométrica para enfocar el centro
  const cameraDestination = useMemo(() => {
    if (!selectedZone) return Cartesian3.ZERO;
    // Nos posicionamos al sur y arriba para mirar hacia abajo en ángulo
    const latOffset = -0.005; 
    return Cartesian3.fromDegrees(
      selectedZone.center[1], 
      selectedZone.center[0] + latOffset, 
      600 // Altura de la cámara en metros
    );
  }, [selectedZone]);

  // Si no hay API Key, mostramos un mensaje de advertencia estilo maqueta
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.includes('PON_AQUI')) {
    return (
      <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-8 text-center z-0">
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl max-w-lg shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <h2 className="text-xl font-bold text-red-400 mb-4">Falta la Clave de Google Maps API</h2>
          <p className="text-slate-300 text-sm mb-4">
            Para renderizar el Gemelo Digital Fotorrealista masivo de Google, debes proveer una clave válida en tu archivo <code className="bg-slate-800 px-2 py-1 rounded">.env</code>.
          </p>
          <p className="text-slate-400 text-xs">
            Variable esperada: <code className="text-emerald-400">VITE_GOOGLE_MAPS_API_KEY</code>
          </p>
        </div>
      </div>
    );
  }

  // Diccionario de emojis para reemplazar los iconos de Lucide nativos de React en el Canvas 3D de Cesium
  const getEmojiIcon = (type) => {
    switch (type) {
      case 'panaderia': return '🍞';
      case 'ferreteria': return '🔧';
      case 'minimarket': return '🛒';
      case 'cafeteria': return '☕';
      case 'farmacia': return '💊';
      default: return '🏬';
    }
  };

  // Proveedor de imágenes rasterizadas (solo etiquetas de calles transparentes) vía CartoDB
  const labelsProvider = useMemo(() => {
    return new UrlTemplateImageryProvider({
      url: 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
      credit: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.',
      minimumLevel: 1,
      maximumLevel: 19
    });
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <Viewer
        ref={viewerRef}
        onClick={handleViewerClick}
        full
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        geocoder={false}
        homeButton={false}
        infoBox={false}
        sceneModePicker={false}
        selectionIndicator={false}
        navigationHelpButton={false}
        navigationInstructionsInitiallyVisible={false}
        // Iluminación para resaltar sombras reales
        shadows={true}
        terrainShadows={true}
        // Mejoras Visuales Premium
        msaaSamples={4} // Anti-aliasing para bordes suaves en los modelos 3D
        resolutionScale={window.devicePixelRatio || 1.0} // Adaptación a pantallas Retina/4K para máxima nitidez
      >

        {/* Vuelo Automático de la Cámara hacia la zona seleccionada */}
        <CameraFlyTo
          destination={cameraDestination}
          orientation={{
            heading: CesiumMath.toRadians(0), // Mirando hacia el norte
            pitch: CesiumMath.toRadians(-45), // Inclinación hacia abajo (45 grados)
            roll: 0.0,
          }}
          duration={3}
        />

        {/* Capa de Nombres de Calles y Etiquetas (OpenStreetMap / CartoDB) superpuesta en el globo */}
        <ImageryLayer imageryProvider={labelsProvider} alpha={1.0} show={true} />

        {/* Capa Fotorealista de Google 3D Tiles */}
        <Cesium3DTileset 
          url={`https://tile.googleapis.com/v1/3dtiles/root.json?key=${GOOGLE_MAPS_API_KEY}`} 
          showCreditsOnScreen={true}
        />

        {/* Polígono de la Cuadra Seleccionada (Cyan translúcido) */}
        {!isDrawing && selectedZonePositions.length > 0 && (
          <Entity>
            <PolygonGraphics
              hierarchy={selectedZonePositions}
              material={new ColorMaterialProperty(Color.fromCssColorString('rgba(0, 229, 255, 0.4)'))}
              height={5} // Flota ligeramente sobre el terreno
              extrudedHeight={25} // Le da volumen para envolver los edificios
              outline={true}
              outlineColor={Color.fromCssColorString('#00e5ff')}
            />
          </Entity>
        )}

        {/* Dibujo en progreso del Círculo (Radio dinámico trazado) */}
        {isDrawing && customCenter && (
          <Entity>
            {/* Polígono del círculo en construcción */}
            <PolygonGraphics
              hierarchy={Cartesian3.fromDegreesArray(
                createCircleCoords(customCenter[0], customCenter[1], customRadius)
                  .flatMap(coord => [coord[1], coord[0]])
              )}
              material={new ColorMaterialProperty(Color.fromCssColorString('rgba(245, 158, 11, 0.35)'))}
              height={10}
              extrudedHeight={35}
              outline={true}
              outlineColor={Color.fromCssColorString('#f59e0b')}
            />
            {/* Punto central del círculo */}
            <Entity 
              position={Cartesian3.fromDegrees(customCenter[1], customCenter[0], 25)}
            >
              <PointGraphics 
                color={Color.fromCssColorString('#f59e0b')} 
                pixelSize={14} 
                outlineColor={Color.WHITE} 
                outlineWidth={2.5} 
              />
            </Entity>
          </Entity>
        )}

        {/* Etiqueta Central de la Zona (Paseo Arauco) */}
        {!isDrawing && selectedZone && (
          <Entity position={centerCartesian}>
            <PointGraphics 
              color={Color.fromCssColorString('#00e5ff')} 
              pixelSize={12} 
              outlineColor={Color.WHITE} 
              outlineWidth={2} 
            />
            <LabelGraphics
              text={selectedZone.name}
              font="bold 16px Inter, sans-serif"
              fillColor={Color.WHITE}
              style={2} // FILL_AND_OUTLINE
              outlineColor={Color.BLACK}
              outlineWidth={4}
              showBackground={true}
              backgroundColor={Color.fromCssColorString('rgba(15, 23, 42, 0.8)')}
              backgroundPadding={new Cartesian2(10, 5)}
              pixelOffset={new Cartesian2(0, -30)} // Arriba del punto
            />
          </Entity>
        )}

        {/* Marcadores 3D de los Competidores (Simulados) */}
        {!isDrawing && competitors.map((comp) => {
          // Elevamos los íconos 20 metros para que no queden ocultos tras edificios 3D
          const compPosition = Cartesian3.fromDegrees(comp.lng, comp.lat, 30);
          return (
            <Entity key={comp.id} position={compPosition}>
              {/* Ícono usando Emoji */}
              <LabelGraphics
                text={getEmojiIcon(comp.type)}
                font="24px sans-serif"
                pixelOffset={new Cartesian2(0, 0)}
              />
              {/* Nombre Comercial debajo del ícono */}
              <LabelGraphics
                text={comp.name}
                font="12px Inter, sans-serif"
                fillColor={Color.fromCssColorString('#cbd5e1')}
                showBackground={true}
                backgroundColor={Color.fromCssColorString('rgba(15, 23, 42, 0.7)')}
                pixelOffset={new Cartesian2(0, 25)}
              />
            </Entity>
          );
        })}

      </Viewer>
    </div>
  );
}

