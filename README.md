# MeteoGlobal: Centro de Comando Meteorológico

MeteoGlobal es una plataforma interactiva del **estado del tiempo y meteorología en tiempo real**. El asistente virtual **Aura** está impulsado por el modelo open source **Qwen 3.5 (4B)** (`qwen3.5:4b`) y capacitado para brindar temperaturas, humedad, vientos, radiación UV y recomendaciones prácticas de vestimenta para capitales del mundo y con especial detalle en **Perú (la capital Lima y la ciudad andina de Huancayo)**.

## Qué incluye

- **Enfoque Especial Perú (Lima y Huancayo):**
  - **Lima (Capital):** 21°C actual (Mín: 17°C, Máx: 23°C), 84% de humedad costera, cielo parcialmente nublado con resolana y brisa marina de 16 km/h.
  - **Huancayo (Junín · 3,250 msnm):** 15°C actual (Mín: 4°C noche muy fría, Máx: 19°C al sol), cielo azul andino despejado, radiación UV Extrema (12) y recomendaciones de vestimenta en capas.
- **Monitor de Capitales del Mundo:**
  - **España (Madrid):** 19°C, soleado y despejado.
  - **Brasil (Brasilia):** 28°C, clima tropical de sabana cálido y luminoso.
  - **Estados Unidos (Washington D.C.):** 16°C, fresco templado y cielo nublado.
  - **Japón (Tokio):** 18°C, templado agradable y cielo claro.
  - **Francia (París):** 15°C, llovizna suave intermitente y brisa atlántica.
  - **Colombia (Bogotá):** 17°C, frío andino de montaña con nubes bajas.
- **Asistente IA con LLM Open Source Qwen 3.5 (4B):**
  - Configurado para operar con `qwen3.5:4b` vía Ollama local.
  - Entrenado con los contextos meteorológicos de nuestro proyecto (temperaturas reales, sensación térmica, viento, radiación UV y qué ropa ponerse).
  - Incluye **Modo Demo Científico** determinista que funciona sin claves ni descargas externas para talleres.
- **Estructuración de Boletines:** Conversando con Aura puedes armar un borrador de reporte meteorológico y registrarlo formalmente (`MET-XXXXXX`).
- **Flota de Estaciones Meteorológicas en Vivo:** Inventario didáctico en `localStorage` (estaciones en Huancayo, Lima, barómetros y radiómetros UV).
- **RAG Meteorológico:** Base de conocimiento sobre el clima andino de Huancayo, la humedad costera de Lima, radiación UV en altura y el funcionamiento de Qwen 3.5.

## Ejecución Rápida

Requiere Node.js 18.17 o superior.

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Sin configuración adicional iniciará en **Modo Demo Meteorológico**.

## Usar el LLM Open Source Qwen 3.5 con Ollama

1. Descarga e instala Ollama desde [ollama.com/download](https://ollama.com/download).
2. Descarga el modelo Qwen 3.5 (4B):

```bash
ollama pull qwen3.5:4b
```

*(Opcional para RAG vectorial local):*
```bash
ollama pull nomic-embed-text
```

3. Copia `.env.example` a `.env.local`:

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434/v1
OLLAMA_MODEL=qwen3.5:4b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

4. Reinicia `npm run dev`.

Aura responderá directamente con Qwen 3.5 (4B) ejecutado en tu propia máquina.

## Comandos de Voz y Preguntas Recomendadas

Pulsa el botón 🎙️ o escribe en el chat:
* *"Hola Aura, ¿cómo estás hoy?"*
* *"Me siento un poco triste y cansado, ¿qué me recomiendas hacer con este clima?"*
* *"Quiero salir a correr hoy, ¿a qué hora es mejor?"*
* *"¿Qué me recomiendas para comer con este frío?"*
* *"Cuéntame un chiste meteorológico"*
* *"¿Cómo está el clima hoy en Huancayo y Lima?"*
* *"Compara los modelos ECMWF, GFS e ICON"*
* *"Quiero comprar el reporte de Lima"*
* *"Sí, confirmo"*

## Novedades y Capacidades Meteorológicas Avanzadas

1. **📍 Detección Automática de Ubicación y Búsqueda Global**:
   - Georreferenciación instantánea por GPS del navegador o fallback inteligente por IP.
   - Buscador dinámico de cualquier ciudad del mundo con autocompletado y clima en tiempo real.

2. **⏰ Desglose por Franjas Horarias (Meteored Standard)**:
   - Clasificación en **Madrugada**, **Mañana**, **Tarde** y **Noche** con temperaturas medias, condición climática y lluvia acumulada (mm).

3. **🌐 Consenso Multimodelo (Meteored.pe Style)**:
   - Validación cruzada en tiempo real entre los 3 principales modelos numéricos del mundo:
     - 🇪🇺 **ECMWF** (Modelo Europeo)
     - 🇺🇸 **GFS** (Modelo Americano NOAA)
     - 🇩🇪 **ICON** (Modelo Alemán DWD)
   - Cálculo automático del índice de fiabilidad (%) y dispersión térmica entre predicciones.

4. **📊 Gráficas en Tiempo Real con Canvas**:
   - Curva horaria continua de 24 horas con gradientes y puntos clave.
   - Pestañas dinámicas para alternar entre **Temperatura (°C)**, **Precipitación (mm)** y **Viento (km/h)**.
   - Gráfica comparativa de pronóstico a 7 días.

5. **🎙️ Asistente Aura con Voz y Empatía Humana**:
   - **Voz Bidireccional:** Reconocimiento de voz (micrófono) y síntesis de voz (Text-to-Speech) en español con control de volumen, visualizador de ondas y botón para detener o repetir mensajes.
   - **Comprensión Contextual:** Entrena a Aura para responder como una persona real, empática y reflexiva. Conecta cualquier tema cotidiano (emociones, salud, dolor de cabeza, comida, deportes, planes o charlas) con la biometeorología y el ambiente.

## Estructura de Archivos

- `lib/weather.ts`: Integración con Open-Meteo API, desglose por franjas horarias y consenso multimodelo (ECMWF, GFS, ICON).
- `lib/countries.ts`: Datos base y microclimas de capitales mundiales y Perú (Lima costera y Huancayo andino).
- `lib/conversation.ts`: Asistente Aura humanizada (Qwen 3.5:4b) con comprensión contextual total y motor determinista empático.
- `lib/catalog.ts`: Catálogo de boletines y pronósticos meteorológicos con créditos.
- `lib/knowledge.ts`: Arquitectura RAG de ciencia climática y biometeorología.
- `components/HourlyChart.tsx`: Gráfica Canvas interactiva de 24 horas (temperatura, lluvia, viento).
- `components/TempChart.tsx`: Gráfica Canvas de pronóstico a 7 días.
- `app/api/weather/route.ts`: Endpoint de caché ISR para todas las ciudades.
- `app/api/weather/search/route.ts`: Endpoint de búsqueda de ciudades por nombre o coordenadas geográficas.
- `app/api/locate/route.ts`: Detección automática de ubicación por IP de cliente.
- `app/page.tsx`: Centro de comando meteorológico completo con geolocalización, spotlight Perú, gráficas, filtros y chat Aura con voz.

