export type InventoryItem = {
  productId: string;
  name: string;
  stock: number; // Estaciones o sensores activos en línea
  minimumStock: number; // Umbral de alerta
  unit: string;
  region: string;
};

export const initialInventory: InventoryItem[] = [
  { productId: "peru-huancayo", name: "Estaciones Meteorológicas Huancayo (Valle del Mantaro)", stock: 18, minimumStock: 4, unit: "estaciones", region: "Junín / Andes Perú" },
  { productId: "peru-lima", name: "Estaciones Costeras de Humedad y Temperatura Lima", stock: 24, minimumStock: 5, unit: "estaciones", region: "Lima Costa / Perú" },
  { productId: "boletin-madrid", name: "Red de Sensores Urbanos y Termómetros Madrid", stock: 20, minimumStock: 4, unit: "sensores", region: "España" },
  { productId: "boletin-brasilia", name: "Estaciones Meteorológicas de Sabana Brasilia", stock: 16, minimumStock: 3, unit: "estaciones", region: "Brasil" },
  { productId: "boletin-dc", name: "Torres Anemométricas Washington D.C.", stock: 15, minimumStock: 3, unit: "torres", region: "Estados Unidos" },
  { productId: "boletin-tokio", name: "Barómetros Digitales y Estaciones Tokio", stock: 22, minimumStock: 5, unit: "sensores", region: "Japón" },
  { productId: "boletin-paris", name: "Pluviómetros Ópticos y Sensores París", stock: 19, minimumStock: 4, unit: "pluviómetros", region: "Francia" },
  { productId: "alerta-uv-andina", name: "Radiómetros Ultravioleta Espectrales (Red UV)", stock: 30, minimumStock: 6, unit: "radiómetros", region: "Huancayo / Lima / Global" }
];
