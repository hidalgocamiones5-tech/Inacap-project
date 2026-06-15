// Función para generar coordenadas de un círculo basado en radio
export const createCircleCoords = (centerLat, centerLng, radiusMeters, points = 64) => {
  const radiusKm = radiusMeters / 1000;
  const distanceX = radiusKm / (111.320 * Math.cos(centerLat * Math.PI / 180));
  const distanceY = radiusKm / 110.574;

  const coords = [];
  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    // Devuelve [lat, lng] para ser consistente con el formato del proyecto
    coords.push([centerLat + y, centerLng + x]);
  }
  return coords;
};

// Generador de competidores simulados
export const generateMockCompetitors = (centerLat, centerLng, count = 15) => {
  const competitors = [];
  const types = ['panaderia', 'ferreteria', 'minimarket', 'cafeteria', 'farmacia'];
  const names = ['Local Comercial', 'Tienda', 'Negocio', 'Comercio', 'Punto de Venta'];

  for (let i = 0; i < count; i++) {
    // Generar offset aleatorio (aprox 1km a la redonda)
    const latOffset = (Math.random() - 0.5) * 0.015;
    const lngOffset = (Math.random() - 0.5) * 0.015;
    
    competitors.push({
      id: `comp-${i}`,
      lat: centerLat + latOffset,
      lng: centerLng + lngOffset,
      type: types[Math.floor(Math.random() * types.length)],
      name: `${names[Math.floor(Math.random() * names.length)]} ${Math.floor(Math.random() * 100)}`
    });
  }
  return competitors;
};

// Mock database for SIT-Ñuble evaluation
export const ZONES = [
  {
    id: 'centro-arauco',
    name: 'Paseo Arauco (Centro)',
    description: 'Zona peatonal de alto flujo en el corazón comercial de Chillán. Alta densidad de servicios y comercios.',
    center: [-36.6063, -72.1034],
    coords: [
      [-36.6053, -72.1044],
      [-36.6053, -72.1024],
      [-36.6073, -72.1024],
      [-36.6073, -72.1044]
    ]
  },
  {
    id: 'ecuador-norte',
    name: 'Av. Ecuador (Norte)',
    description: 'Avenida de tráfico mixto con actividad comercial emergente y residencial de nivel medio.',
    center: [-36.5985, -72.0995],
    coords: [
      [-36.5975, -72.1005],
      [-36.5975, -72.0985],
      [-36.5995, -72.0985],
      [-36.5995, -72.1005]
    ]
  },
  {
    id: 'ohiggins-sur',
    name: 'Av. O\'Higgins (Sur)',
    description: 'Sector residencial y de conectividad con menor densidad comercial. Flujo vehicular alto, peatonal bajo.',
    center: [-36.6180, -72.1120],
    coords: [
      [-36.6170, -72.1130],
      [-36.6170, -72.1110],
      [-36.6190, -72.1110],
      [-36.6190, -72.1130]
    ]
  }
];

export const RUBROS = [
  { id: 'panaderia', name: 'Panadería y Pastelería' },
  { id: 'ferreteria', name: 'Ferretería de Barrio' },
  { id: 'minimarket', name: 'Minimarket / Almacén' },
  { id: 'cafeteria', name: 'Cafetería de Especialidad' },
  { id: 'farmacia', name: 'Farmacia Independiente' }
];

export const getMockEvaluation = (zoneId, rubroId) => {
  const key = `${zoneId}-${rubroId}`;
  
  const evaluations = {
    // ---- Centro Arauco evaluations ----
    'centro-arauco-panaderia': {
      viability: 'caution',
      score: 65,
      color: 'yellow',
      kpis: [
        { label: 'Competidores en la zona', value: '4 locales' },
        { label: 'Flujo Peatonal', value: '1,800 personas/día' },
        { label: 'NSE Predominante', value: 'C2 - C3' }
      ],
      aiAnalysis: 'El sector presenta una viabilidad moderada. El alto flujo peatonal derivado de la cercanía a oficinas públicas y bancos es favorable, pero la competencia directa es agresiva. Se recomienda enfocar la oferta en productos de panadería premium o cafetería al paso para captar el público de paso temprano en la mañana y a la hora del almuerzo.'
    },
    'centro-arauco-ferreteria': {
      viability: 'risk',
      score: 35,
      color: 'red',
      kpis: [
        { label: 'Competidores en la zona', value: '6 locales (grandes cadenas)' },
        { label: 'Flujo Peatonal', value: '1,800 personas/día' },
        { label: 'NSE Predominante', value: 'C2 - C3' }
      ],
      aiAnalysis: 'Riesgo alto de instalación. La zona tiene alta concentración de tiendas comerciales grandes y de ferreterías establecidas en sectores aledaños al mercado. El costo del arriendo comercial es elevado para el margen tradicional de una ferretería minorista de barrio. Se desaconseja a menos que sea un nicho extremadamente específico (ej. cerrajería digital o herramientas de precisión).'
    },
    'centro-arauco-minimarket': {
      viability: 'viable',
      score: 88,
      color: 'green',
      kpis: [
        { label: 'Competidores en la zona', value: '1 competidor directo' },
        { label: 'Flujo Peatonal', value: '2,200 personas/día' },
        { label: 'NSE Predominante', value: 'C2' }
      ],
      aiAnalysis: 'Viabilidad óptima. Aunque existe un alto flujo peatonal y oficinas, los minimarkets actuales están saturados en horas peak. Un formato "express" con foco en comida preparada, snacks saludables y pago rápido resolvería la fricción de los oficinistas del centro. El retorno de inversión proyectado es alto.'
    },
    'centro-arauco-cafeteria': {
      viability: 'viable',
      score: 92,
      color: 'green',
      kpis: [
        { label: 'Competidores en la zona', value: '3 cafeterías' },
        { label: 'Flujo Peatonal', value: '2,100 personas/día' },
        { label: 'NSE Predominante', value: 'ABC1 - C2' }
      ],
      aiAnalysis: 'Excelente oportunidad. El público en el paseo peatonal Arauco demanda espacios de reunión y trabajo express. Las cafeterías existentes tienen tiempos de espera superiores a 15 minutos en horas peak. Una propuesta de valor centrada en café de especialidad y espacio coworking "micro" tiene altas probabilidades de éxito comercial.'
    },
    'centro-arauco-farmacia': {
      viability: 'caution',
      score: 55,
      color: 'yellow',
      kpis: [
        { label: 'Competidores en la zona', value: '5 farmacias de cadena' },
        { label: 'Flujo Peatonal', value: '1,800 personas/día' },
        { label: 'NSE Predominante', value: 'C2' }
      ],
      aiAnalysis: 'Viabilidad condicionada. Las grandes cadenas dominan los medicamentos genéricos y de marca en el centro. Sin embargo, existe un nicho desatendido para fitoterapia, medicina natural y asesoría personalizada. El éxito depende de generar convenios locales y un servicio de entrega a domicilio veloz en el casco histórico.'
    },

    // ---- Av Ecuador evaluations ----
    'ecuador-norte-panaderia': {
      viability: 'viable',
      score: 85,
      color: 'green',
      kpis: [
        { label: 'Competidores en la zona', value: '0 locales en 500m' },
        { label: 'Flujo Peatonal', value: '850 personas/día' },
        { label: 'NSE Predominante', value: 'C3 - D' }
      ],
      aiAnalysis: 'Oportunidad muy alta. Existe un vacío de oferta de pan fresco en esta sección de Av. Ecuador. Los residentes actuales deben caminar más de 10 minutos para abastecerse. Se recomienda un modelo tradicional de panadería con venta adicional de abarrotes básicos. Los costos de arriendo son moderados, mejorando el margen neto inicial.'
    },
    'ecuador-norte-ferreteria': {
      viability: 'viable',
      score: 80,
      color: 'green',
      kpis: [
        { label: 'Competidores en la zona', value: '1 local pequeño' },
        { label: 'Flujo Peatonal', value: '750 personas/día' },
        { label: 'NSE Predominante', value: 'C3' }
      ],
      aiAnalysis: 'Oportunidad favorable. Av. Ecuador es una vía de alto flujo vehicular y residencial que está viviendo remodelaciones y ampliaciones de viviendas autoconstruidas. Un negocio de ferretería con stock enfocado en gasfitería, pintura y materiales de reparación rápida captará la demanda inmediata de vecinos que evitan viajar al centro.'
    },
    'ecuador-norte-minimarket': {
      viability: 'caution',
      score: 60,
      color: 'yellow',
      kpis: [
        { label: 'Competidores en la zona', value: '3 almacenes de barrio' },
        { label: 'Flujo Peatonal', value: '800 personas/día' },
        { label: 'NSE Predominante', value: 'C3' }
      ],
      aiAnalysis: 'Viabilidad moderada. La zona ya cuenta con pequeños almacenes familiares consolidados en pasajes interiores. Para competir, se requiere una propuesta diferenciadora: mayor variedad de congelados, carnicería envasada o una sección de verdulería limpia y ordenada. La ubicación en la misma avenida comercial es clave.'
    },
    'ecuador-norte-cafeteria': {
      viability: 'risk',
      score: 40,
      color: 'red',
      kpis: [
        { label: 'Competidores en la zona', value: '0 locales' },
        { label: 'Flujo Peatonal', value: '550 personas/día' },
        { label: 'NSE Predominante', value: 'C3' }
      ],
      aiAnalysis: 'Riesgo alto de mercado. El flujo peatonal de Av. Ecuador en esta zona norte es residencial y de tránsito rápido. El perfil socioeconómico y los hábitos locales no justifican el gasto recurrente en café de especialidad. Si se desea avanzar, se debe reformular el concepto hacia una panadería/pastelería tradicional que ofrezca café de máquina económico.'
    },
    'ecuador-norte-farmacia': {
      viability: 'viable',
      score: 78,
      color: 'green',
      kpis: [
        { label: 'Competidores en la zona', value: '0 competidores directos' },
        { label: 'Flujo Peatonal', value: '850 personas/día' },
        { label: 'NSE Predominante', value: 'C3' }
      ],
      aiAnalysis: 'Viabilidad positiva. No existen farmacias comunitarias ni de cadena en un radio de 1 km en este eje. La densidad poblacional del sector norte de Chillán garantiza demanda recurrente, en especial si se dispone de stock de pañales, leche de fórmula y medicamentos básicos del Formulario Nacional. La aprobación sanitaria de la SEREMI será el principal hito crítico.'
    },

    // ---- Av O'Higgins evaluations ----
    'ohiggins-sur-panaderia': {
      viability: 'caution',
      score: 58,
      color: 'yellow',
      kpis: [
        { label: 'Competidores en la zona', value: '2 locales' },
        { label: 'Flujo Peatonal', value: '450 personas/día' },
        { label: 'NSE Predominante', value: 'C2 - C3' }
      ],
      aiAnalysis: 'Viabilidad moderada con precaución. El flujo peatonal es bajo y el tráfico es predominantemente automotriz a alta velocidad. Es vital contar con estacionamiento habilitado fuera del local o ubicarse en una esquina semaforizada. El público objetivo son automovilistas que regresan a sus hogares en el sector sur de Chillán Viejo.'
    },
    'ohiggins-sur-ferreteria': {
      viability: 'caution',
      score: 62,
      color: 'yellow',
      kpis: [
        { label: 'Competidores en la zona', value: '2 locales a 1km' },
        { label: 'Flujo Peatonal', value: '400 personas/día' },
        { label: 'NSE Predominante', value: 'C2 - C3' }
      ],
      aiAnalysis: 'Viabilidad media. Si bien el flujo peatonal es bajo, el sector tiene alta conectividad y es ideal para compras planificadas si se cuenta con estacionamiento amplio. El inventario debería apuntar a constructoras pequeñas y contratistas, ofreciendo reparto a domicilio en la zona de expansión sur.'
    },
    'ohiggins-sur-minimarket': {
      viability: 'viable',
      score: 75,
      color: 'green',
      kpis: [
        { label: 'Competidores en la zona', value: '1 local pequeño' },
        { label: 'Flujo Peatonal', value: '600 personas/día' },
        { label: 'NSE Predominante', value: 'C2 - C3' }
      ],
      aiAnalysis: 'Viabilidad favorable. La densidad residencial va en aumento debido a nuevos condominios. Un minimarket moderno con estacionamiento, buena iluminación y medios de pago diversificados (Transbank/Junaeb) captará el flujo de compras de conveniencia nocturna que actualmente no tiene alternativas cercanas.'
    },
    'ohiggins-sur-cafeteria': {
      viability: 'caution',
      score: 50,
      color: 'yellow',
      kpis: [
        { label: 'Competidores en la zona', value: '0 locales' },
        { label: 'Flujo Peatonal', value: '350 personas/día' },
        { label: 'NSE Predominante', value: 'C2' }
      ],
      aiAnalysis: 'Precaución de viabilidad. Un modelo de cafetería tradicional fracasará debido al bajo tráfico peatonal. Sin embargo, existe oportunidad para una pastelería-cafetería con "retiro en local" (takeaway) y estacionamiento rápido, orientada a familias de condominios cercanos durante los fines de semana.'
    },
    'ohiggins-sur-farmacia': {
      viability: 'risk',
      score: 30,
      color: 'red',
      kpis: [
        { label: 'Competidores en la zona', value: '3 farmacias (en strip centers)' },
        { label: 'Flujo Peatonal', value: '300 personas/día' },
        { label: 'NSE Predominante', value: 'C2' }
      ],
      aiAnalysis: 'Riesgo alto de inserción. Los strip centers consolidados en el eje O\'Higgins ya cuentan con farmacias de grandes cadenas que acaparan el mercado local y cuentan con amplios estacionamientos. Un competidor independiente tendrá dificultades severas para negociar precios de compra con distribuidores y no podrá igualar la conveniencia de estacionamiento.'
    }
  };

  if (zoneId.startsWith('custom-')) {
    const randomScore = Math.floor(Math.random() * 60) + 30; // 30 to 90
    let color = 'yellow';
    let viability = 'caution';
    if (randomScore >= 75) { color = 'green'; viability = 'viable'; }
    else if (randomScore < 50) { color = 'red'; viability = 'risk'; }
    
    return {
      viability,
      score: randomScore,
      color,
      kpis: [
        { label: 'Competidores en área custom', value: `${Math.floor(Math.random() * 5)} locales` },
        { label: 'Flujo Peatonal Estimado', value: `${Math.floor(Math.random() * 2000) + 500} personas/día` },
        { label: 'NSE Predominante', value: 'C2 - C3' }
      ],
      aiAnalysis: `Análisis Dinámico de IA: El polígono trazado manualmente revela un potencial de viabilidad del ${randomScore}%. Para el rubro seleccionado se detecta un flujo peatonal promedio que podría sostener el negocio si las estrategias de marketing son adecuadas. Se sugiere realizar un estudio presencial para validar el flujo real en esta cuadrante específico.`
    };
  }

  return evaluations[key] || {
    viability: 'caution',
    score: 50,
    color: 'yellow',
    kpis: [
      { label: 'Competidores en la zona', value: 'No determinado' },
      { label: 'Flujo Peatonal', value: 'Medio' },
      { label: 'NSE Predominante', value: 'C3' }
    ],
    aiAnalysis: 'Datos simulados parcialmente disponibles. Se recomienda realizar un estudio de campo complementario en la zona para confirmar la factibilidad de instalación del rubro seleccionado.'
  };
};
