import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  MapPin,
  Loader2,
  Send,
  Bot
} from 'lucide-react';

export default function PanelResultados({ 
  isLoading, 
  showResults, 
  evaluationData, 
  selectedRubroName, 
  selectedZoneName 
}) {
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const loadingSteps = [
    'Sincronizando con satélites espaciales...',
    'Procesando densidad peatonal (Heatmaps)...',
    'Georeferenciando competencia comercial...',
    'Aplicando modelo de predicción Anthropic...',
    'Renderizando diagnóstico territorial...'
  ];

  // Initialize chat when evaluation data loads
  useEffect(() => {
    if (evaluationData && !isLoading) {
      setMessages([
        {
          id: Date.now(),
          sender: 'bot',
          text: evaluationData.aiAnalysis
        }
      ]);
    }
  }, [evaluationData, isLoading]);

  useEffect(() => {
    let interval;
    if (isLoading) {
      setLoadingTextIndex(0);
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingSteps.length);
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponses = [
        `Basado en el radio de ${selectedZoneName}, la densidad de competidores es un factor clave a considerar en tu estrategia de precios.`,
        "Cruzando los datos socioeconómicos de esta área, te sugiero un ticket promedio moderado con foco en promociones de volumen.",
        "Aún estamos en fase de maqueta, pero este es el tipo de insights detallados que generaré usando la API del SII y datos censales.",
        "Si observas el flujo peatonal estimado, tu mejor horario de apertura sería durante la mañana para captar a los residentes locales."
      ];
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMsg = { id: Date.now() + 1, sender: 'bot', text: randomResponse };
      setMessages((prev) => [...prev, botMsg]);
    }, 1200);
  };

  // Si no está cargando ni se han mostrado resultados, no renderizamos nada (el panel está oculto por defecto en la app padre)
  if (!showResults && !isLoading) return null;

  // Render Loader con estilo Dark Glassmorphism
  if (isLoading) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] h-64 relative overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-blue-500/10 blur-[50px] rounded-full animate-pulse"></div>
        
        <Loader2 size={40} className="text-blue-400 animate-spin mb-6 relative z-10" />
        
        <h3 className="text-sm font-bold text-white mb-2 relative z-10 tracking-wide">
          Procesando datos territoriales con IA...
        </h3>
        <div className="h-5 overflow-hidden max-w-[280px] relative z-10">
          <p className="text-[11px] text-blue-200/60 font-mono tracking-tight animate-fade-in-out">
            {loadingSteps[loadingTextIndex]}
          </p>
        </div>
      </div>
    );
  }

  if (!evaluationData) return null;

  // Determine styles based on viability color for dark mode
  const getViabilityTheme = (color) => {
    switch (color) {
      case 'green':
        return {
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
          stroke: '#10b981', // emerald-500
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/30',
          icon: <CheckCircle2 size={20} className="text-emerald-400" />,
          label: 'VIABLE (Recomendado)'
        };
      case 'yellow':
        return {
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
          stroke: '#f59e0b', // amber-500
          text: 'text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/30',
          icon: <AlertTriangle size={20} className="text-amber-400 animate-pulse" />,
          label: 'PRECAUCIÓN (Riesgo Medio)'
        };
      case 'red':
        return {
          glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]',
          stroke: '#f43f5e', // rose-500
          text: 'text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/30',
          icon: <XCircle size={20} className="text-rose-400" />,
          label: 'RIESGO ALTO (No Recomendado)'
        };
      default:
        return {
          glow: 'shadow-none',
          stroke: '#64748b',
          text: 'text-slate-400',
          bg: 'bg-slate-800/50 border-slate-700',
          icon: <AlertTriangle size={20} className="text-slate-400" />,
          label: 'Evaluación Parcial'
        };
    }
  };

  const theme = getViabilityTheme(evaluationData.color);

  // Helper icons for KPIs
  const kpiIcons = [
    <Building2 size={16} className="text-blue-400" />,
    <Users size={16} className="text-blue-400" />,
    <DollarSign size={16} className="text-blue-400" />
  ];

  // Circular progress math
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (evaluationData.score / 100) * circumference;

  return (
    <div className="flex flex-col bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
      
      {/* Header section */}
      <div className="px-5 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/40 to-transparent">
        <span className="text-[9px] uppercase font-bold tracking-widest text-blue-400/80 block mb-1">
          Reporte de Factibilidad SIT
        </span>
        <h3 className="text-sm font-extrabold text-white truncate">
          {selectedRubroName}
        </h3>
        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
          <MapPin size={10} className="text-[#00e5ff]" />
          <span>{selectedZoneName}</span>
        </p>
      </div>

      <div className="p-5 flex flex-col gap-5">
        
        {/* Índice de Factibilidad: Circular Widget */}
        <div className={`p-4 rounded-xl border ${theme.bg} ${theme.glow} flex items-center justify-between transition-all duration-500`}>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block mb-2">
              Índice de Viabilidad
            </span>
            <div className="flex items-center gap-2">
              {theme.icon}
              <span className={`text-[11px] font-bold tracking-wide ${theme.text}`}>
                {theme.label}
              </span>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            {/* SVG Circular Progress */}
            <svg width="84" height="84" className="transform -rotate-90">
              <circle
                cx="42"
                cy="42"
                r={radius}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="42"
                cy="42"
                r={radius}
                stroke={theme.stroke}
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1500 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white">{evaluationData.score}%</span>
            </div>
          </div>
        </div>

        {/* KPIs Grid Minimalista */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Métricas de Terreno
          </h4>
          <div className="grid grid-cols-1 gap-2.5">
            {evaluationData.kpis.map((kpi, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:bg-slate-800/70 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                  {kpiIcons[idx]}
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    {kpi.label}
                  </span>
                  <span className="text-xs font-bold text-slate-100 block">
                    {kpi.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Integrado IA (Claude 3 Haiku) */}
        <div className="relative flex flex-col rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/20 to-purple-900/10 overflow-hidden mt-2">
          
          {/* Header del Chat */}
          <div className="flex items-center justify-between bg-indigo-950/50 px-3 py-2 border-b border-indigo-500/20">
            <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
              <Bot size={12} /> Asesor IA Territorial
            </h4>
            <div className="flex items-center gap-1.5 bg-indigo-950 border border-indigo-500/50 rounded-full px-2 py-0.5 shadow-md">
              <Sparkles size={10} className="text-indigo-400" />
              <span className="text-[8px] font-bold text-indigo-300 tracking-wider">CLAUDE 3 HAIKU</span>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-48 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-xl px-3 py-2 text-[11px] leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-600/80 text-white rounded-tr-sm'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de Chat */}
          <div className="p-2 bg-indigo-950/40 border-t border-indigo-500/20">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/80 rounded-lg p-1 focus-within:border-indigo-500/50 transition-all"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Haz una pregunta sobre esta zona..."
                className="flex-1 bg-transparent border-none text-[11px] text-slate-200 px-2 py-1.5 focus:outline-none placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
              >
                <Send size={12} />
              </button>
            </form>
          </div>
          
        </div>

      </div>
    </div>
  );
}
