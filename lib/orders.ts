import { CatalogItem } from "@/lib/catalog";

export type OrderLine = {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  customerName?: string;
  lines: OrderLine[];
  total: number;
  fulfillment: "Reporte Digital Inmediato" | "Monitoreo de Estaciones 24/7" | "Alerta de Heladas y UV";
  status: "Pronóstico Emitido" | "Monitoreo Activo" | "Boletín Archivado";
  createdAt: string;
};

export type DraftOrder = {
  customerName?: string;
  lines: OrderLine[];
  fulfillment: "Reporte Digital Inmediato" | "Monitoreo de Estaciones 24/7" | "Alerta de Heladas y UV";
};

export function createLine(item: CatalogItem, quantity = 1): OrderLine {
  return { itemId: item.id, name: item.name, quantity, unitPrice: item.price };
}

export function calculateTotal(lines: OrderLine[]) {
  return lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
}

export function createOrder(draft: DraftOrder): Order {
  return {
    id: `MET-${String(Date.now()).slice(-6)}`,
    customerName: draft.customerName || "Usuario Meteorológico / Viajero",
    lines: draft.lines,
    total: calculateTotal(draft.lines),
    fulfillment: draft.fulfillment || "Reporte Digital Inmediato",
    status: "Pronóstico Emitido",
    createdAt: new Date().toISOString()
  };
}
