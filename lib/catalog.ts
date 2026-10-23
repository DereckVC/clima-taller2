export type CatalogItem = {
  id: string;
  name: string;
  description: string;
  price: number; // Créditos de consulta o UEC
  category: "Clima Perú" | "Capitales del Mundo" | "Alertas y Radiación UV";
  city: string;
  country: string;
  available: boolean;
};

export const catalog: CatalogItem[] = [
  {
    id: "peru-huancayo",
    name: "Pronóstico Meteorológico Huancayo · Valle del Mantaro",
    description: "Temperatura actual (15°C), oscilación térmica extrema (4°C a 19°C), cielo azul andino despejado, índice UV extremo (12) y recomendaciones de ropa.",
    price: 15,
    category: "Clima Perú",
    city: "Huancayo",
    country: "Perú",
    available: true
  },
  {
    id: "peru-lima",
    name: "Reporte del Tiempo Lima · Costa Capital",
    description: "Temperatura (21°C), humedad costera elevada (84%), brisa marina (16 km/h), cielo con resolana y pronóstico para las próximas 24 horas.",
    price: 15,
    category: "Clima Perú",
    city: "Lima",
    country: "Perú",
    available: true
  },
  {
    id: "boletin-madrid",
    name: "Boletín del Clima Madrid · España",
    description: "Condiciones en la capital española: 19°C, cielo despejado y soleado, humedad del 48% y vientos suaves del noreste.",
    price: 20,
    category: "Capitales del Mundo",
    city: "Madrid",
    country: "España",
    available: true
  },
  {
    id: "boletin-brasilia",
    name: "Pronóstico Cálido Brasilia · Brasil",
    description: "Clima en la capital brasileña: 28°C, clima tropical de sabana, nubes dispersas, humedad 58% y sensación térmica de 29°C.",
    price: 20,
    category: "Capitales del Mundo",
    city: "Brasilia",
    country: "Brasil",
    available: true
  },
  {
    id: "boletin-dc",
    name: "Reporte Meteorológico Washington D.C. · EE.UU.",
    description: "Estado del tiempo en la capital estadounidense: 16°C, cielo nublado con vientos frescos de 18 km/h y humedad del 65%.",
    price: 20,
    category: "Capitales del Mundo",
    city: "Washington D.C.",
    country: "Estados Unidos",
    available: true
  },
  {
    id: "boletin-tokio",
    name: "Boletín del Tiempo Tokio · Japón",
    description: "Clima en la capital japonesa: 18°C, cielo claro y agradable, humedad moderada del 52% y excelente visibilidad.",
    price: 20,
    category: "Capitales del Mundo",
    city: "Tokio",
    country: "Japón",
    available: true
  },
  {
    id: "boletin-paris",
    name: "Pronóstico París · Francia",
    description: "Condiciones en la capital francesa: 15°C, llovizna suave intermitente, humedad del 75% y viento fresco atlántico.",
    price: 20,
    category: "Capitales del Mundo",
    city: "París",
    country: "Francia",
    available: true
  },
  {
    id: "alerta-uv-andina",
    name: "Monitor Radiación UV Extrema & Protección Solar",
    description: "Evaluación del índice ultravioleta por altitud (alerta UV 12 en Huancayo vs UV 7 en Lima) y tiempos seguros de exposición solar.",
    price: 10,
    category: "Alertas y Radiación UV",
    city: "Huancayo / Lima",
    country: "Perú",
    available: true
  }
];

export function findCatalogItem(text: string): CatalogItem | undefined {
  const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Match direct name or id
  const directMatch = catalog.find((item) =>
    normalized.includes(item.id.toLowerCase()) ||
    normalized.includes(item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  );
  if (directMatch) return directMatch;

  // City & country triggers
  if (/\b(huancayo|mantaro|junin)\b/i.test(normalized)) {
    return catalog.find((item) => item.id === "peru-huancayo");
  }

  if (/\blima\b/i.test(normalized) || /\bcosta\b/i.test(normalized)) {
    return catalog.find((item) => item.id === "peru-lima");
  }

  if (/\b(madrid|espana)\b/i.test(normalized)) {
    return catalog.find((item) => item.id === "boletin-madrid");
  }

  if (/\b(brasilia|brasil)\b/i.test(normalized)) {
    return catalog.find((item) => item.id === "boletin-brasilia");
  }

  if (/\b(washington|estados unidos|eeuu|usa)\b/i.test(normalized)) {
    return catalog.find((item) => item.id === "boletin-dc");
  }

  if (/\b(tokio|japon)\b/i.test(normalized)) {
    return catalog.find((item) => item.id === "boletin-tokio");
  }

  if (/\b(paris|francia)\b/i.test(normalized)) {
    return catalog.find((item) => item.id === "boletin-paris");
  }

  if (/\b(uv|radiacion|solar|bloqueador)\b/i.test(normalized)) {
    return catalog.find((item) => item.id === "alerta-uv-andina");
  }

  if (/\bperu\b/i.test(normalized)) {
    return catalog.find((item) => item.id === "peru-huancayo");
  }

  return undefined;
}
