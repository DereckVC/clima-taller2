# Recorrido de una Misión Climática

## 1. El usuario inicia la consulta

El usuario interactúa por texto o voz desde `app/page.tsx`:

```text
"Quiero monitorear la alerta temprana de El Niño para Perú"
```

La interfaz envía a la API:

```json
{
  "messages": [
    { "role": "user", "content": "Quiero monitorear la alerta temprana de El Niño para Perú" }
  ],
  "draft": {
    "lines": [],
    "fulfillment": "Monitoreo Satelital 24/7"
  }
}
```

## 2. La API recibe y procesa

`app/api/chat/route.ts` valida el cuerpo y llama a `handleConversation()`.

## 3. Se construye el contexto integrado

`lib/conversation.ts` combina:
- Identidad de GeoClima Global y rol de Aura.
- Base de datos de países (`countriesData`), destacando la vulnerabilidad de Perú.
- Catálogo de módulos de monitoreo (`catalog`).
- Documentos científicos recuperados por RAG (`lib/knowledge.ts`).
- Historial de conversación y borrador actual.

## 4. Aura interpreta y estructura

El modelo devuelve un JSON formal:

```json
{
  "reply": "He incorporado a tu dossier el módulo Alerta Temprana El Niño (ENSO) · Perú...",
  "readyToConfirm": true,
  "draft": {
    "fulfillment": "Monitoreo Satelital 24/7",
    "lines": [
      {
        "itemId": "peru-enso",
        "name": "Alerta Temprana El Niño (ENSO) · Perú",
        "quantity": 1,
        "unitPrice": 65
      }
    ]
  }
}
```

## 5. El servidor valida

El servidor calcula los créditos UEC totales en `lib/orders.ts`. No confía en los números calculados por la IA.

## 6. Confirmación humana

Aura solicita confirmación. El botón para desplegar la misión climática solo se activa cuando el usuario confirma explícitamente (`"Sí, confirmo"`).

## 7. Despliegue de sensores

`POST /api/orders` registra la misión (`CLM-XXXXXX`), `lib/store.ts` la almacena y el navegador descuenta los sensores operativos en `localStorage`.
