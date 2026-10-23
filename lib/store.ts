import { Order } from "@/lib/orders";

const orders: Order[] = [
  {
    id: "MET-102482",
    customerName: "Observatorio Andino Junín",
    lines: [
      { itemId: "peru-huancayo", name: "Pronóstico Meteorológico Huancayo · Valle del Mantaro", quantity: 1, unitPrice: 15 },
      { itemId: "peru-lima", name: "Reporte del Tiempo Lima · Costa Capital", quantity: 1, unitPrice: 15 }
    ],
    total: 30,
    fulfillment: "Reporte Digital Inmediato",
    status: "Pronóstico Emitido",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
];

export function listOrders() {
  return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveOrder(order: Order) {
  orders.unshift(order);
  return order;
}
