export type Promotion = {
  id: string;
  name: string;
  days: string;
  description: string;
  price: number; // Créditos o costo
  badge: string;
  image: string;
};

export const promotions: Promotion[] = [
  {
    id: "alerta-uv-huancayo",
    name: "Alerta de Sol Radiante y Radiación UV en Huancayo",
    days: "Actualización Diaria 08:00 - 16:00",
    description: "Índice UV Extremo (12) en el Valle del Mantaro. Cielo despejado con sol andino intenso de 19°C y descenso a 4°C por la noche. Indispensable bloqueador FPS 50+, sombrero y abrigo nocturno.",
    price: 0,
    badge: "Alerta Meteorológica Activa",
    image: "/images/promo-andino.svg"
  },
  {
    id: "pronostico-lima",
    name: "Reporte de Resolana y Humedad Costera en Lima",
    days: "Actualización 24 Horas",
    description: "Temperatura templada de 21°C con 84% de humedad relativa y brisas marítimas de 16 km/h. Condiciones ideales con casaca ligera para la noche costera.",
    price: 0,
    badge: "Boletín Costero Gratuito",
    image: "/images/promo-global.svg"
  },
  {
    id: "guia-capitales",
    name: "Guía Meteorológica para Viajeros (Capitales del Mundo)",
    days: "Tiempo Real",
    description: "Pronósticos actualizados de temperatura, lluvia y recomendaciones de vestimenta para Madrid (19°C), París (15°C), Tokio (18°C) y Brasilia (28°C).",
    price: 10,
    badge: "Especial Viajeros",
    image: "/images/promo-amazonia.svg"
  }
];
