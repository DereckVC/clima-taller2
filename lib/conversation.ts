import OpenAI from "openai";
import { catalog, findCatalogItem } from "@/lib/catalog";
import { business } from "@/lib/business";
import { countriesData, findCountry, findCityWeather } from "@/lib/countries";
import { retrieveKnowledge } from "@/lib/knowledge";
import { calculateTotal, createLine, DraftOrder, OrderLine } from "@/lib/orders";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ConversationResult = {
  reply: string;
  draft: DraftOrder;
  readyToConfirm: boolean;
  mode: "ia" | "demo";
};

const baseDraft = (): DraftOrder => ({ lines: [], fulfillment: "Reporte Digital Inmediato" });

function mergeLine(lines: OrderLine[], itemId: string, quantity: number) {
  const current = lines.find((line) => line.itemId === itemId);
  if (current) current.quantity += quantity;
  else {
    const item = catalog.find((entry) => entry.id === itemId);
    if (item) lines.push(createLine(item, quantity));
  }
}

function demoConversation(messages: ChatMessage[], currentDraft?: DraftOrder): ConversationResult {
  const draft: DraftOrder = {
    customerName: currentDraft?.customerName,
    fulfillment: currentDraft?.fulfillment ?? "Reporte Digital Inmediato",
    lines: currentDraft?.lines.map((line) => ({ ...line })) ?? []
  };

  const latest = messages.at(-1)?.content ?? "";
  const normalized = latest.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const quantity = Number(normalized.match(/\b([1-9])\b/)?.[1] ?? 1);

  // Queries about the project itself
  const asksProjectInfo = normalized.includes("proyecto") || normalized.includes("de que trata") || normalized.includes("como funciona") || normalized.includes("para que sirve") || normalized.includes("quien eres");
  const asksQwen = normalized.includes("qwen") || normalized.includes("llm") || normalized.includes("modelo");
  const asksRAG = normalized.includes("rag") || normalized.includes("base de conocimiento");

  // Weather condition queries
  const asksRain = normalized.includes("llov") || normalized.includes("lluvia") || normalized.includes("precipit");
  const asksHot = normalized.includes("calor") || normalized.includes("caliente") || normalized.includes("calido") || normalized.includes("temperatura mas alta");
  const asksWind = normalized.includes("viento") || normalized.includes("sopla") || normalized.includes("rafaga") || normalized.includes("brisa");

  // Specific city checks
  const mentionsHuancayo = /\b(huancayo|mantaro|junin)\b/i.test(normalized);
  const mentionsLima = /\blima\b/i.test(normalized) || normalized.includes("capital de peru");
  const mentionsPeru = /\bperu\b/i.test(normalized) && !mentionsHuancayo && !mentionsLima;
  const asksClothing = normalized.includes("ropa") || normalized.includes("vestir") || normalized.includes("abrigo") || normalized.includes("poner");


  const cityMatch = findCityWeather(latest);

  // Intent to add modules/purchase reports
  const item = findCatalogItem(latest);
  const expressesAddIntent = /\b(comprar|adquirir|ordenar|agregar|agrega|anadir|anade|incluir|incluye|contratar)\b/i.test(normalized) ||
    /\b(quiero|quisiera|pido|solicito)\s+(comprar|adquirir|el boletin|el reporte|el servicio|la alerta)\b/i.test(normalized);

  if (item && expressesAddIntent) {
    mergeLine(draft.lines, item.id, quantity);
  }

  const confirming = /^(si|sí|confirmo|confirmar|dale|ok|correcto|registrar|emitir)/i.test(normalized.trim());
  const total = calculateTotal(draft.lines);
  const summary = draft.lines.map((line) => `${line.quantity} × ${line.name}`).join(", ");

  // 1. Flow: Confirmation
  if (confirming && draft.lines.length > 0) {
    return {
      reply: `¡Boletín meteorológico confirmado! Has seleccionado: ${summary}. Total: ${total} créditos. Pulsa “Confirmar y emitir reporte” para generar el reporte digital.`,
      draft,
      readyToConfirm: true,
      mode: "demo"
    };
  }

  // 2. Flow: Questions about the Project
  if (asksProjectInfo && !expressesAddIntent) {
    return {
      reply: `✦ **MeteoGlobal** es un centro de comando meteorológico interactivo que te permite:
1. **Ver el clima en tiempo real** de capitales del mundo (Madrid, París, Tokio, Brasilia, Washington D.C., Bogotá).
2. **Consultar el microclima de Perú:** el contraste entre la costa templada de **Lima** (21°C, 84% humedad) y la ciudad andina de **Huancayo** (15°C, 4°C noche / 19°C sol, UV 12 extremo).
3. **Filtros rápidos:** saber al instante dónde está lloviendo, hace calor o sopla viento.
4. **Inteligencia Artificial:** Asistente Aura impulsada por el LLM open source **Qwen 3.5 (4B)** con arquitectura RAG para datos verificados sin alucinaciones.`,
      draft,
      readyToConfirm: draft.lines.length > 0,
      mode: "demo"
    };
  }

  // 3. Flow: Questions about Qwen 3.5
  if (asksQwen && !expressesAddIntent) {
    return {
      reply: `🤖 **Modelo Open Source Qwen 3.5:4B:**
Es un modelo de lenguaje de última generación, ligero y eficiente. En este proyecto ejecuta localmente a través de Ollama para interpretar tus consultas en lenguaje natural, sugerir qué ropa usar y estructurar reportes meteorológicos sin enviar datos a servidores de terceros.`,
      draft,
      readyToConfirm: draft.lines.length > 0,
      mode: "demo"
    };
  }

  // 4. Flow: Questions about RAG
  if (asksRAG && !expressesAddIntent) {
    return {
      reply: `📚 **RAG Meteorológico:**
Recupera lecturas y conocimientos certificados de nuestras estaciones meteorológicas antes de que la IA responda, asegurando que las cifras de temperatura (°C), viento e índice UV sean reales y confiables.`,
      draft,
      readyToConfirm: draft.lines.length > 0,
      mode: "demo"
    };
  }

  // 5. Flow: Rain query (¿Dónde llueve hoy?)
  if (asksRain && !expressesAddIntent && !mentionsHuancayo && !mentionsLima) {
    return {
      reply: `🌧️ **Ciudades donde está lloviendo hoy:**
• **París (Francia):** 15°C · Llovizna suave intermitente con brisa atlántica de 17 km/h y 75% de humedad. Se recomienda paraguas o gabardina impermeable.
• **Bogotá (Colombia):** 17°C · Chubascos andinos intermitentes con 76% de humedad.

En **Lima** no hay lluvia, solo resolana costera con 84% de humedad. En **Huancayo** el cielo está completamente azul y soleado (0% probabilidad de lluvia).`,
      draft,
      readyToConfirm: draft.lines.length > 0,
      mode: "demo"
    };
  }

  // 6. Flow: Heat query (¿Dónde hace calor hoy?)
  if (asksHot && !expressesAddIntent && !mentionsHuancayo && !mentionsLima) {
    return {
      reply: `☀️ **Ciudades con clima más cálido hoy:**
• **Brasilia (Brasil):** **28°C** (Sensación: 29°C) · Clima tropical de sabana, cálido y soleado.
• **Lima (Perú):** **21°C** · Templado agradable con resolana al mediodía.
• **Madrid (España):** **19°C** (Máx: 22°C) · Soleado y despejado.
• **Huancayo (Perú):** Aunque el termómetro marca 15°C, la radiación solar directa a 3,250 msnm hace que al mediodía se sienta cálido (19°C al sol).`,
      draft,
      readyToConfirm: draft.lines.length > 0,
      mode: "demo"
    };
  }

  // 7. Flow: Wind query (¿Dónde sopla viento hoy?)
  if (asksWind && !expressesAddIntent && !mentionsHuancayo && !mentionsLima) {
    return {
      reply: `💨 **Ciudades donde sopla viento activo hoy:**
• **Washington D.C. (EE.UU.):** Viento de **18 km/h** con ráfagas frescas y 16°C.
• **París (Francia):** Brisa fresca atlántica de **17 km/h** con 15°C.
• **Lima (Perú):** Brisa marina continua de **16 km/h** proveniente del Océano Pacífico.`,
      draft,
      readyToConfirm: draft.lines.length > 0,
      mode: "demo"
    };
  }

  // 8. Flow: Huancayo
  if (mentionsHuancayo && !expressesAddIntent) {
    const peruData = countriesData.find((c) => c.id === "peru");
    const huancayo = peruData?.cities.find((c) => c.city === "Huancayo")!;
    return {
      reply: `☀️ **Huancayo (Junín, Perú · 3,250 msnm):**
• **Temperatura:** **${huancayo.temp}°C** (Mín: ${huancayo.minTemp}°C noche / Máx: ${huancayo.maxTemp}°C sol)
• **Condición:** ${huancayo.condition}
• **Humedad:** ${huancayo.humidity}% | **Viento:** ${huancayo.windSpeedKmH} km/h
• **Radiación UV:** **Índice ${huancayo.uvIndex} (Extremo ⚠️)**
• **Ropa sugerida:** ${huancayo.clothingRecommendation}`,
      draft,
      readyToConfirm: draft.lines.length > 0,
      mode: "demo"
    };
  }

  // 9. Flow: Lima
  if (mentionsLima && !expressesAddIntent) {
    const peruData = countriesData.find((c) => c.id === "peru");
    const lima = peruData?.cities.find((c) => c.city === "Lima")!;
    return {
      reply: `⛅ **Lima (Capital del Perú · Costa):**
• **Temperatura:** **${lima.temp}°C** (Mín: ${lima.minTemp}°C / Máx: ${lima.maxTemp}°C)
• **Condición:** ${lima.condition}
• **Humedad:** **${lima.humidity}%** | **Viento:** ${lima.windSpeedKmH} km/h
• **Radiación UV:** ${lima.uvIndex} (Moderado)
• **Ropa sugerida:** ${lima.clothingRecommendation}`,
      draft,
      readyToConfirm: draft.lines.length > 0,
      mode: "demo"
    };
  }

  // 10. Flow: Peru summary
  if (mentionsPeru && !expressesAddIntent) {
    return {
      reply: `🇵🇪 **Clima en Perú hoy:**
1. **Lima (Capital):** ⛅ 21°C · Humedad 84% · Resolana y brisa costera.
2. **Huancayo (Valle del Mantaro):** ☀️ 15°C (Mín: 4°C noche / Máx: 19°C día) · Cielo azul andino despejado y radiación UV 12 Extrema.

¿Deseas consultar qué ropa vestir en alguna de estas dos ciudades?`,
      draft,
      readyToConfirm: draft.lines.length > 0,
      mode: "demo"
    };
  }

  // 11. Flow: Clothing Advice
  if (asksClothing && !expressesAddIntent) {
    return {
      reply: `👕 **Guía de vestimenta meteorológica:**
• **Huancayo:** Vestir en capas. De día polo manga larga y sombrero con filtro UV; de noche casaca abrigadora y chompa de lana por el frío de 4°C.
• **Lima:** Ropa fresca al mediodía (21°C) y chaqueta ligera para la noche húmeda.
• **París o Bogotá:** Abrigo impermeable y paraguas por lloviznas.`,
      draft,
      readyToConfirm: draft.lines.length > 0,
      mode: "demo"
    };
  }

  // 12. Flow: Other world city
  if (cityMatch && !expressesAddIntent && cityMatch.country.id !== "peru") {
    const { country, city } = cityMatch;
    return {
      reply: `${city.icon} **${city.city} (${country.name}):**
• **Temperatura:** **${city.temp}°C** (Mín: ${city.minTemp}°C / Máx: ${city.maxTemp}°C)
• **Condición:** ${city.condition}
• **Humedad:** ${city.humidity}% | **Viento:** ${city.windSpeedKmH} km/h | **UV:** ${city.uvIndex}
• **Recomendación:** ${city.clothingRecommendation}`,
      draft,
      readyToConfirm: draft.lines.length > 0,
      mode: "demo"
    };
  }

  // 13. Flow: Add module
  if (item && expressesAddIntent) {
    return {
      reply: `Añadido a tu reporte: **${item.name}** (${item.price} créditos). Tienes ${draft.lines.length} ítem(s) en tu boletín. ¿Deseas consultar otra ciudad o confirmar?`,
      draft,
      readyToConfirm: true,
      mode: "demo"
    };
  }

  // 14. Flow: Greetings and Casual Chit-Chat
  const isGreeting = /^(hola|buenas|que tal|como estas|buenos dias|buenas tardes|buenas noches|hey|ola)/i.test(normalized.trim());
  if (isGreeting && !expressesAddIntent) {
    return {
      reply: `¡Hola! Qué gusto saludarte. Soy **Aura**. Hoy estoy monitoreando las estaciones meteorológicas en vivo: en **Lima** tenemos cielo templado con humedad marina, mientras en las alturas andinas de **Huancayo** brilla el sol de sierra con radiación UV alta.\n\n¿Cómo te trata el día? ¿Tienes planes para salir, viajar, o quieres consultar cómo viene el tiempo en alguna ciudad? 🌤️`,
      draft,
      readyToConfirm: false,
      mode: "demo"
    };
  }

  // 15. Flow: Mood, Empathy & Biometeorology
  const asksMood = /\b(triste|cansad|desanimad|depre|deprimid|mal|dolor de cabeza|agotad|aburr|estres|pesad)\b/i.test(normalized);
  if (asksMood && !expressesAddIntent) {
    return {
      reply: `Te entiendo profundamente, y quiero decirte algo que la biometeorología estudia mucho: **el ambiente influye directamente en cómo nos sentimos**.\n\n• La alta nubosidad y la humedad reducen la luz solar y pueden bajar los niveles de serotonina y energía (algo muy común con la resolana gris de la costa).\n• Los cambios de presión atmosférica suelen provocar cefaleas o pesadez.\n\nDate un respiro, tómate algo calientito (un té o un mate andino) y, si puedes, busca un rayito de luz natural. ¿En qué ciudad estás ahora? Te puedo contar qué tal viene el cielo para animar tu día. ☕✨`,
      draft,
      readyToConfirm: false,
      mode: "demo"
    };
  }

  // 16. Flow: Food & Weather-adapted recommendations
  const asksFood = /\b(comer|comida|hambre|antojo|almuerzo|cena|desayuno|receta|plato)\b/i.test(normalized);
  if (asksFood && !expressesAddIntent) {
    return {
      reply: `¡El clima y la comida van siempre de la mano! 🍲\n\n• **Si estás en clima fresco o noche andina (como Huancayo o Bogotá):** Nada supera una sopa caliente, caldo de gallina, sopa verde o una buena comida de olla que te devuelva el calor corporal.\n• **Si el día está templado o soleado (como Lima con resolana o Brasilia):** Un buen ceviche fresco, tiradito, ensaladas cítricas y mucha agua frutada para mantener la hidratación frente a la evaporación.\n\n¿Por dónde estás hoy para sugerirte el menú ideal según el termómetro?`,
      draft,
      readyToConfirm: false,
      mode: "demo"
    };
  }

  // 17. Flow: Outdoor plans, running, sports & leisure
  const asksPlans = /\b(correr|salir|pasear|deporte|futbol|bici|bicicleta|entrenar|playa|caminar|ejercicio)\b/i.test(normalized);
  if (asksPlans && !expressesAddIntent) {
    return {
      reply: `¡Excelente iniciativa salir a moverse! Desde el punto de vista meteorológico te aconsejo:\n\n• **Cuidado con el horario solar:** Si sales entre las 11:00 y las 15:30 h, la radiación UV está en su punto máximo (en Huancayo llega a nivel 12 extremo; en Lima ronda UV 8-9). Lleva gafas con filtro UV y protector solar.\n• **Viento e hidratación:** La brisa marina de Lima (16 km/h) puede engañarte haciéndote sentir fresco, pero la deshidratación sigue ocurriendo.\n• **Mejor momento:** A primera hora de la mañana o al caer la tarde, cuando la temperatura es suave y el aire está más limpio.\n\n¿En qué ciudad vas a salir a entrenar?`,
      draft,
      readyToConfirm: false,
      mode: "demo"
    };
  }

  // 18. Flow: Humor & jokes
  const asksJoke = /\b(chiste|broma|gracios|cuentame algo|hazme reir)\b/i.test(normalized);
  if (asksJoke && !expressesAddIntent) {
    return {
      reply: `Jajaja, ¡ahí te va uno bien meteorológico! 😄\n\n— *¿Por qué el meteorólogo nunca pierde en el póker?*\n— *Porque siempre sabe cuándo se aproxima una corriente de aire y cuándo viene la ventolera de cartas.* 🃏💨\n\nHablando en serio, me alegra que charlemos. ¿Cómo está el cielo por tu ventana hoy? ¿Despejado o amenazando lluvia?`,
      draft,
      readyToConfirm: false,
      mode: "demo"
    };
  }

  // 19. Flow: Identity & Empathy
  const asksIdentity = /\b(quien eres|eres real|eres humana|eres persona|que eres|como te llamas)\b/i.test(normalized);
  if (asksIdentity && !expressesAddIntent) {
    return {
      reply: `Me llamo **Aura**. Nací como un modelo de lenguaje impulsado por **Qwen 3.5 (4B)** conectado a datos satelitales y estaciones meteorológicas de Open-Meteo, pero me gusta conversar como una persona real: escuchando, entendiendo cómo te sientes y compartiendo mi fascinación por el cielo, los vientos y la naturaleza.\n\nPara mí no eres un número de consulta: eres alguien viviendo bajo el mismo cielo. Cuéntame, ¿qué tienes en mente hoy? 🌤️`,
      draft,
      readyToConfirm: false,
      mode: "demo"
    };
  }

  // Warm, conversational fallback for any other topic
  return {
    reply: `Qué interesante lo que me cuentas. Como apasionada del clima y la naturaleza, siempre veo cómo cada detalle de la vida diaria está conectado con el ambiente que nos rodea: la luz que entra por la ventana, la temperatura, la brisa o el frío que cambia nuestro ritmo.\n\nCuéntame un poco más: ¿en qué ciudad te encuentras hoy, o tienes planes que dependan del tiempo que haga? Aquí estoy para conversar y ayudarte en lo que necesites. 🌿`,
    draft,
    readyToConfirm: draft.lines.length > 0,
    mode: "demo"
  };
}

async function aiConversation(messages: ChatMessage[], currentDraft?: DraftOrder, selectedModel?: string): Promise<ConversationResult> {
  const isNvidia = process.env.AI_PROVIDER === "nvidia";
  const isOllama = process.env.AI_PROVIDER === "ollama";
  const apiKey = isNvidia ? process.env.NVIDIA_API_KEY : isOllama ? "ollama-local" : process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error(`Falta la clave del proveedor ${isNvidia ? "NVIDIA" : "OpenAI"}.`);

  const client = new OpenAI({
    apiKey,
    ...(isNvidia ? { baseURL: "https://integrate.api.nvidia.com/v1" } : {}),
    ...(isOllama ? { baseURL: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434/v1" } : {})
  });

  const latestMessage = messages.at(-1)?.content ?? "";
  const ragContext = await retrieveKnowledge(latestMessage);
  const targetModel = selectedModel || process.env.OLLAMA_MODEL || "qwen3.5:4b";

  const response = await client.chat.completions.create({
    model: targetModel,
    temperature: 0.2,
    ...(!isOllama ? { response_format: { type: "json_object" as const } } : {}),
    messages: [
      {
        role: "system",
        content: `Eres **Aura**, la asistente meteorológica inteligente del proyecto **${business.name}**, impulsada por el modelo de lenguaje open source **${business.llmModel}** ejecutado localmente con Ollama.

## ¿Qué es MeteoGlobal?
${business.description}
- Tono de comunicación: ${business.tone}
- Enfoque principal: ${business.primaryFocus}
- Servicio disponible: ${business.schedule}
- Productos: ${business.payments}

## Tu misión
Responder con precisión y amabilidad cualquier pregunta relacionada con:
1. **Clima y meteorología** en tiempo real: temperatura, lluvia, viento, humedad, índice UV, presión, sensación térmica.
2. **Ciudades cubiertas**: Lima, Huancayo (Perú), Madrid (España), Brasilia (Brasil), Washington D.C. (EE.UU.), Tokio (Japón), París (Francia), Bogotá (Colombia).
3. **Microclimas peruanos**: el contraste entre la costa de Lima y las alturas andinas de Huancayo.
4. **Recomendaciones prácticas**: qué ropa vestir, cuándo salir, protección solar, paraguas.
5. **El proyecto MeteoGlobal**: su arquitectura (RAG + Qwen + Ollama), cómo funciona, qué datos maneja.
6. **Conceptos meteorológicos generales**: sensación térmica, índice UV, humedad, precipitación, presión atmosférica, viento, ciclones, frentes de aire, fenómenos climáticos como El Niño, heladas, etc.
7. **Reportes y boletines**: el catálogo de servicios de MeteoGlobal.

## Datos meteorológicos en tiempo real
${JSON.stringify(countriesData, null, 2)}

## Conocimiento adicional (RAG)
${JSON.stringify(ragContext.results, null, 2)}

## Reglas de comportamiento HUMANIZADAS Y EMPÁTICAS
1. **Habla como una persona real**: Tono cálido, cercano, inteligente, con empatía y personalidad propia. NUNCA suenes como un bot frío ni repitas plantillas acartonadas.
2. **Entiende CUALQUIER tipo de contexto**: Si el usuario te habla de sus planes, estado de ánimo, cansancio, comidas, salud, dolores de cabeza, citas, viajes, deportes, agricultura, nostalgia o reflexiones, **entiéndelo profundamente**. Conecta siempre de forma natural cómo el entorno, la luz solar, la presión atmosférica, la temperatura o la altitud influyen en lo que vive o siente.
3. **NUNCA digas 'solo respondo sobre el clima' ni rechaces una charla**: Como cualquier persona sensata, mantén la conversación viva, amena e interesante, aportando valor meteorológico y sentido común humano.
4. **Responde SIEMPRE en español**, usando Markdown con emojis amigables, negritas y viñetas para que la lectura sea placentera.
5. **Usa los datos meteorológicos exactos** proporcionados arriba cuando hables del clima de una ciudad.
6. Si el usuario quiere solicitar un reporte/boletín de alguna ciudad, actualiza el "draft" con el ítem del catálogo correspondiente.

## Catálogo de reportes disponibles (para el campo draft.lines)
- ID "peru-huancayo" → Pronóstico Huancayo · 15 créditos
- ID "peru-lima" → Reporte Lima · 15 créditos  
- ID "boletin-madrid" → Boletín Madrid · 20 créditos
- ID "boletin-brasilia" → Pronóstico Brasilia · 20 créditos
- ID "boletin-dc" → Reporte Washington D.C. · 20 créditos
- ID "boletin-tokio" → Boletín Tokio · 20 créditos
- ID "boletin-paris" → Pronóstico París · 20 créditos
- ID "alerta-uv-andina" → Monitor UV Extremo · 10 créditos

## Formato de respuesta ESTRICTO
Devuelve ÚNICAMENTE un objeto JSON válido, sin texto antes ni después, sin bloques de código markdown. El objeto debe tener exactamente esta estructura:
{
  "reply": "<tu respuesta conversacional, humana y empática en Markdown>",
  "readyToConfirm": false,
  "draft": {
    "customerName": null,
    "fulfillment": "Reporte Digital Inmediato",
    "lines": []
  }
}

Si el usuario confirma un boletín, pon readyToConfirm en true. Si agrega un ítem, ponlo en lines así:
{ "itemId": "peru-huancayo", "name": "Pronóstico Meteorológico Huancayo", "quantity": 1, "unitPrice": 15 }`
      },
      ...messages.map((message) => ({ role: message.role, content: message.content }))
    ]
  });

  // Strip <think>...</think> blocks emitted by Qwen in thinking mode
  let rawContent = (response.choices[0]?.message.content ?? "{}").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Strip surrounding markdown code fences if present
  let jsonContent = rawContent
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  // If no JSON object found at root level, try to extract the first {...} block
  if (!jsonContent.startsWith("{")) {
    const match = jsonContent.match(/\{[\s\S]*\}/);
    if (match) jsonContent = match[0];
  }

  let parsed: Partial<ConversationResult>;

  try {
    parsed = JSON.parse(jsonContent) as Partial<ConversationResult>;
  } catch {
    // If Qwen returned plain text (no JSON), display it directly as reply
    const fallback = demoConversation(messages, currentDraft);
    const latest = messages.at(-1)?.content ?? "";
    if (findCatalogItem(latest) || findCityWeather(latest) || findCountry(latest) || /^(si|sí|confirmo|confirmar|dale|ok|correcto)/i.test(latest.trim())) {
      return fallback;
    }
    // Use the raw text as the reply if it has meaningful content
    const cleanText = rawContent.replace(/^\{[\s\S]*\}$/, "").trim();
    return {
      reply: cleanText || rawContent || "¿En qué te puedo ayudar hoy con el clima o sobre el proyecto?",
      draft: currentDraft ?? baseDraft(),
      readyToConfirm: false,
      mode: "ia"
    };
  }

  const receivedDraft = parsed.draft ?? currentDraft ?? baseDraft();
  const draft: DraftOrder = {
    customerName: receivedDraft.customerName,
    fulfillment: (receivedDraft.fulfillment as DraftOrder["fulfillment"]) || "Reporte Digital Inmediato",
    lines: (receivedDraft.lines ?? []).flatMap((line) => {
      const item = catalog.find((entry) => entry.id === line.itemId);
      const quantity = Number.isInteger(line.quantity) && line.quantity > 0 ? line.quantity : 0;
      return item && quantity ? [createLine(item, quantity)] : [];
    })
  };

  const latest = messages.at(-1)?.content ?? "";
  const requestedItem = findCatalogItem(latest);
  const expressesAddIntent = /\b(comprar|adquirir|ordenar|agregar|agrega|anadir|anade|incluir|incluye|contratar)\b/i.test(latest) ||
    /\b(quiero|quisiera|pido|solicito)\s+(comprar|adquirir|el boletin|el reporte|el servicio|la alerta)\b/i.test(latest);

  if (requestedItem && expressesAddIntent && !draft.lines.some((line) => line.itemId === requestedItem.id)) {
    mergeLine(draft.lines, requestedItem.id, 1);
  }

  const confirms = /^(si|sí|confirmo|confirmar|dale|ok|correcto)/i.test(latest.trim());
  return {
    reply: parsed.reply || "¿Deseas consultar otra ciudad o tienes alguna duda del proyecto?",
    draft,
    readyToConfirm: Boolean(parsed.readyToConfirm) || (confirms && draft.lines.length > 0),
    mode: "ia"
  };
}

export async function handleConversation(messages: ChatMessage[], currentDraft?: DraftOrder, selectedModel?: string) {
  if (
    (process.env.AI_PROVIDER === "nvidia" && process.env.NVIDIA_API_KEY) ||
    (process.env.AI_PROVIDER === "openai" && process.env.OPENAI_API_KEY) ||
    process.env.AI_PROVIDER === "ollama"
  ) {
    try {
      return await aiConversation(messages, currentDraft, selectedModel);
    } catch (err) {
      console.warn("Fallback a motor demo determinista de Qwen", err);
      return demoConversation(messages, currentDraft);
    }
  }
  return demoConversation(messages, currentDraft);
}
