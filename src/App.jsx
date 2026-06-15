import React, { useState } from 'react';
import { ZONES, RUBROS, getMockEvaluation, createCircleCoords } from './mockData';
import MapboxComponent from './components/MapboxComponent';
import PanelResultados from './components/PanelResultados';
import { 
  ShieldCheck, 
  User, 
  MapPin, 
  Sparkles, 
  Layers, 
  Store, 
  ChevronRight,
  Check,
  X,
  Target,
  Search,
  Loader2
} from 'lucide-react';

export default function App() {
  const [selectedRubro, setSelectedRubro] = useState(RUBROS[0].id);
  const [customZones, setCustomZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(ZONES[0]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [evaluationData, setEvaluationData] = useState(null);

  // Drawing State (Circle/Radius)
  const [isDrawing, setIsDrawing] = useState(false);
  const [customCenter, setCustomCenter] = useState(null); // [lat, lng]
  const [customRadius, setCustomRadius] = useState(250); // meters

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Combina las zonas por defecto con las customizadas
  const allZones = [...ZONES, ...customZones];

  const handleEvaluate = () => {
    setIsLoading(true);
    setShowResults(false);
    
    // Simulate 1.5 second loading delay as requested
    setTimeout(() => {
      const data = getMockEvaluation(selectedZone.id, selectedRubro);
      setEvaluationData(data);
      setIsLoading(false);
      setShowResults(true);
    }, 1500);
  };

  const handleSelectZone = (zone) => {
    if (isDrawing) return; // Prevent selection while drawing
    setSelectedZone(zone);
    if (showResults) {
      setIsLoading(true);
      setShowResults(false);
      setTimeout(() => {
        const data = getMockEvaluation(zone.id, selectedRubro);
        setEvaluationData(data);
        setIsLoading(false);
        setShowResults(true);
      }, 800);
    }
  };

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setCustomCenter(null);
    setCustomRadius(250);
    setShowResults(false);
  };

  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setCustomCenter(null);
  };

  const handleFinishDrawing = () => {
    if (!customCenter) {
      alert("Por favor, haz clic en el mapa para establecer el centro de tu zona.");
      return;
    }

    // Genera el polígono circular usando nuestra función matemática
    const circleCoords = createCircleCoords(customCenter[0], customCenter[1], customRadius);

    const newZone = {
      id: `custom-${Date.now()}`,
      name: `Radio Customizado (${customRadius}m)`,
      description: `Zona circular trazada manualmente por el asesor, radio de ${customRadius} metros.`,
      center: customCenter,
      coords: circleCoords
    };

    setCustomZones([...customZones, newZone]);
    setSelectedZone(newZone);
    setIsDrawing(false);
    setCustomCenter(null);
  };

  const handleMapClick = (lngLat) => {
    if (isDrawing) {
      // Guardamos como [lat, lng]
      setCustomCenter([lngLat[1], lngLat[0]]);
    }
  };

  // Mock Geocoding Search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowResults(false);

    // Simulate API delay for geocoding
    setTimeout(() => {
      // Centro base de Chillán
      const baseLat = -36.6063;
      const baseLng = -72.1034;
      
      // Generar una coordenada aleatoria cercana simulando la dirección encontrada
      const latOffset = (Math.random() - 0.5) * 0.02;
      const lngOffset = (Math.random() - 0.5) * 0.02;
      
      const foundLat = baseLat + latOffset;
      const foundLng = baseLng + lngOffset;

      setCustomCenter([foundLat, foundLng]);
      setIsDrawing(true);
      setCustomRadius(250);
      setIsSearching(false);
      setSearchQuery('');
    }, 1200);
  };

  const currentRubroName = RUBROS.find(r => r.id === selectedRubro)?.name || '';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0f172a] text-slate-200 antialiased font-sans">
      
      {/* Background Mapbox 3D / CesiumJS 3D */}
      <MapboxComponent 
        selectedZone={selectedZone} 
        onSelectZone={handleSelectZone} 
        zones={allZones}
        isDrawing={isDrawing}
        customCenter={customCenter}
        customRadius={customRadius}
        onMapClick={handleMapClick}
      />

      {/* Header Transparente Flotante */}
      <header className="absolute top-0 left-0 w-full z-10 bg-gradient-to-b from-[#0f172a]/90 to-transparent pointer-events-none pb-12 pt-4 px-6">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-400/30">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 m-0 drop-shadow-md">
                SIT-Ñuble 
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-widest">
                  3D Spatial
                </span>
              </h1>
              <p className="text-xs text-blue-200/70 font-medium drop-shadow">
                Sistema de Inteligencia Territorial
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-full px-4 py-1.5 shadow-lg">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30">
              <User size={14} className="text-indigo-300" />
            </div>
            <div className="text-left pr-2">
              <span className="text-xs font-semibold block leading-none text-slate-200">
                admin
              </span>
              <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block mt-0.5">
                Asesor Senior
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Panel de Control Flotante (Glassmorphism - Izquierdo) */}
      <div className="absolute top-24 left-6 z-10 w-80 max-h-[calc(100vh-120px)] flex flex-col gap-4 pointer-events-none">
        
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] pointer-events-auto transition-all">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/50">
            <Layers size={16} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Configuración</h2>
          </div>

          <div className="space-y-5">
            
            {/* Selección de Región y Comuna (Filtro Chile) */}
            <div className="space-y-3 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                  Región (Chile)
                </label>
                <select 
                  defaultValue="16"
                  disabled={isDrawing || isSearching}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="16">XVI Región de Ñuble</option>
                  <option value="13" disabled>RM Metropolitana (Próximamente)</option>
                  <option value="8" disabled>VIII Región del Biobío (Próximamente)</option>
                  <option value="5" disabled>V Región de Valparaíso (Próximamente)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                  Comuna
                </label>
                <select
                  defaultValue="chillan"
                  disabled={isDrawing || isSearching}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="chillan">Chillán</option>
                  <option value="chillan-viejo" disabled>Chillán Viejo</option>
                  <option value="bulnes" disabled>Bulnes</option>
                  <option value="san-carlos" disabled>San Carlos</option>
                </select>
              </div>
            </div>

            {/* Buscador de Dirección */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Search size={12} /> Buscar Dirección en Chillán
              </label>
              <form 
                onSubmit={handleSearch}
                className="flex items-center bg-slate-800/80 border border-slate-600 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all"
              >
                <input
                  type="text"
                  placeholder="Ej. Libertad 500..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isDrawing || isSearching}
                  className="w-full bg-transparent text-sm text-white px-3 py-2.5 focus:outline-none placeholder-slate-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!searchQuery.trim() || isDrawing || isSearching}
                  className="px-3 text-slate-400 hover:text-blue-400 disabled:opacity-50 transition-colors"
                >
                  {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
              </form>
            </div>

            {/* Rubro Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Store size={12} /> Rubro a Evaluar
              </label>
              <div className="relative">
                <select
                  value={selectedRubro}
                  onChange={(e) => setSelectedRubro(e.target.value)}
                  disabled={isDrawing || isSearching}
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer transition-colors disabled:opacity-50"
                >
                  {RUBROS.map((rubro) => (
                    <option key={rubro.id} value={rubro.id} className="bg-slate-800 text-white">
                      {rubro.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                  <ChevronRight size={14} className="transform rotate-90" />
                </div>
              </div>
            </div>

            {/* Zone Indicator and Drawing Controls */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={12} /> Zona Geográfica
              </label>

              {isDrawing ? (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  {!customCenter ? (
                    <p className="text-xs text-amber-300 font-medium mb-3 flex items-start gap-1.5">
                      <Target size={14} className="mt-0.5 flex-shrink-0" />
                      Haz clic en el mapa para establecer el centro de la zona de estudio.
                    </p>
                  ) : (
                    <div className="mb-4">
                      <p className="text-[10px] text-amber-200/80 uppercase font-bold tracking-wider mb-2">
                        Ajustar Radio del Círculo
                      </p>
                      <div className="flex items-center gap-3">
                        <input 
                          type="range" 
                          min="50" 
                          max="1500" 
                          step="50"
                          value={customRadius}
                          onChange={(e) => setCustomRadius(parseInt(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                        <span className="text-xs font-mono font-bold text-amber-400 w-12 text-right">
                          {customRadius}m
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button 
                      onClick={handleFinishDrawing}
                      disabled={!customCenter}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/20 disabled:text-amber-500/50 text-slate-900 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Check size={14} /> Finalizar
                    </button>
                    <button 
                      onClick={handleCancelDrawing}
                      className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <X size={14} /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-full bg-blue-500/10 border border-blue-500/30 rounded-lg py-2.5 px-3 flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-blue-300 truncate">
                      {selectedZone.name}
                    </span>
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                  </div>
                  
                  <button
                    onClick={handleStartDrawing}
                    className="w-full text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-colors"
                  >
                    <Target size={12} /> Trazar Radio Dinámico
                  </button>
                </>
              )}
            </div>

            {/* Main Action Button */}
            <button
              onClick={handleEvaluate}
              disabled={isLoading || isDrawing || isSearching}
              className={`w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${
                isLoading || isDrawing || isSearching
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5'
              }`}
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out"></div>
              <Sparkles size={16} className={`relative z-10 ${isLoading ? 'animate-pulse' : ''}`} />
              <span className="relative z-10">
                {isLoading ? 'Analizando entorno...' : 'Evaluar Zona Seleccionada'}
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* Panel de Resultados Flotante (Glassmorphism - Derecho) */}
      <div className="absolute top-24 right-6 z-10 w-[380px] max-h-[calc(100vh-120px)] flex flex-col pointer-events-none">
        {(showResults || isLoading) && !isDrawing && (
          <div className="pointer-events-auto w-full animate-fade-in">
            <PanelResultados 
              isLoading={isLoading} 
              showResults={showResults} 
              evaluationData={evaluationData}
              selectedRubroName={currentRubroName}
              selectedZoneName={selectedZone.name}
            />
          </div>
        )}
      </div>

    </div>
  );
}
