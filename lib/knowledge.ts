export type KnowledgeEntry = { id: string; title: string; content: string; tags: string[] };
export type KnowledgeResult = KnowledgeEntry & { score: number; source: "vector" | "keyword" };
const embeddingCache = new Map<string, number[]>();

export const knowledge: KnowledgeEntry[] = [
  {
    id: "clima-huancayo",
    title: "¿Cómo es el clima en Huancayo y por qué varía tanto la temperatura?",
    content: "Huancayo se ubica a 3,259 metros sobre el nivel del mar en el Valle del Mantaro (Junín, Perú). Tiene un clima templado de montaña con una fuerte oscilación térmica diaria: mañanas y mediodías cálidos y soleados con cielo azul despejado (alcanzando 18°C a 20°C), y un descenso drástico al caer la tarde, con noches frías que descienden a 4°C (e incluso 0°C a -2°C en temporada de heladas). Su humedad es moderada a baja (40-50%), lo que acentúa la sensación de frío nocturno.",
    tags: ["huancayo", "peru", "valle del mantaro", "temperatura", "frio andino", "sierra", "clima"]
  },
  {
    id: "clima-lima",
    title: "¿Cómo es el clima en la capital Lima y por qué hay tanta humedad?",
    content: "Lima tiene un clima subtropical desértico caracterizado por una humedad relativa muy alta (entre 80% y 90%) debido a la fría Corriente de Humboldt que baña la costa. Esta corriente genera una capa de inversión térmica con neblina costera y el clásico cielo 'panza de burro' o resolana en meses templados. Las temperaturas oscilan entre 17°C y 23°C en primavera/otoño, con vientos costeros de 15 a 20 km/h y lloviznas finas conocidas como garúa.",
    tags: ["lima", "peru", "capital", "humedad", "costa", "garua", "marina", "clima"]
  },
  {
    id: "recomendacion-ropa-huancayo",
    title: "¿Qué ropa se recomienda vestir para el clima de Huancayo?",
    content: "En Huancayo se aplica la vestimenta 'en capas': durante las horas de sol (10 a.m. a 3 p.m.) se usa polo o camisa de manga larga para protegerse del sol, sombrero de ala ancha y lentes oscuros con filtro UV. A partir de las 5 p.m., la temperatura cae rápidamente, por lo que es indispensable contar con chompa gruesa, casaca abrigadora, chalina o cortavientos para evitar el impacto del frío andino nocturno.",
    tags: ["ropa", "vestimenta", "huancayo", "abrigo", "consejos", "temperatura"]
  },
  {
    id: "indice-uv-altura",
    title: "¿Por qué el índice de radiación UV es extremo en Huancayo?",
    content: "Por cada 1,000 metros de altitud sobre el nivel del mar, la radiación ultravioleta (UV) se incrementa entre 10% y 12% debido a una menor densidad atmosférica que filtre los rayos del sol. Estando Huancayo a más de 3,250 msnm y cerca de la zona ecuatorial, registra con frecuencia un Índice UV superior a 11 o 12 (categoría Extrema), lo que exige uso diario de protector solar FPS 50+ y sombreros.",
    tags: ["uv", "radiacion", "huancayo", "altura", "proteccion solar", "sol"]
  },
  {
    id: "qwen-llm-asistente",
    title: "¿Cómo funciona el modelo open source Qwen 3.5:4b en este proyecto?",
    content: "Qwen 3.5:4b es un modelo de lenguaje abierto (open source) optimizado para comprender intenciones en lenguaje natural con gran velocidad y precisión. En MeteoGlobal, el modelo interpreta preguntas sobre el clima de cualquier capital del mundo y ciudades peruanas (Lima y Huancayo), identifica condiciones de temperatura, viento y humedad, y estructura boletines meteorológicos con recomendaciones prácticas para el usuario.",
    tags: ["qwen", "qwen3.5:4b", "llm", "asistente", "ia", "open source", "ollama"]
  },
  {
    id: "sensacion-termica",
    title: "¿Qué es la sensación térmica y cómo la modifican el viento y la humedad?",
    content: "La sensación térmica es la percepción de frío o calor que experimenta el cuerpo humano. El viento acelera la pérdida de calor por convección (efecto Wind Chill), haciendo que el aire se sienta más frío de lo que marca el termómetro. En Lima, la humedad del 85% penetra la ropa acentuando el frío; en Huancayo, la radiación directa calienta rápidamente al sol, pero al situarse en la sombra se siente de inmediato el aire frío andino.",
    tags: ["sensacion termica", "viento", "humedad", "temperatura", "clima"]
  },
  {
    id: "clima-capitales",
    title: "¿Qué tipo de clima tienen las capitales del mundo analizadas?",
    content: "Madrid presenta clima mediterráneo continentalizado (19°C y soleado); Brasilia tiene clima tropical de sabana cálido y luminoso (28°C); Washington D.C. ofrece clima templado de cuatro estaciones (16°C y nublado); Tokio disfruta de condiciones templadas agradables (18°C); y París goza de clima oceánico templado con lloviznas suaves (15°C).",
    tags: ["capitales", "madrid", "brasilia", "washington", "tokio", "paris", "mundo"]
  },
  {
    id: "rag-meteorologico",
    title: "¿Por qué se utiliza RAG en el asistente de clima?",
    content: "RAG (Retrieval-Augmented Generation) recupera en tiempo real los registros exactos de temperaturas, pronósticos y condiciones de las estaciones meteorológicas antes de que el LLM Qwen 3.5:4b responda. Así se garantiza que la IA proporcione cifras numéricas reales y fiables sin inventar grados centígrados ni confundir ciudades.",
    tags: ["rag", "meteorologia", "qwen", "temperatura", "verificacion", "datos"]
  },
  {
    id: "fenomeno-el-nino",
    title: "¿Qué es el Fenómeno El Niño y cómo afecta al Perú?",
    content: "El Niño es un fenómeno climático derivado del calentamiento anómalo de las aguas superficiales del Océano Pacífico ecuatorial. En Perú, genera lluvias torrenciales e inundaciones en la costa norte (Piura, Tumbes) y sequias en la sierra sur. Eleva la temperatura del mar frente a Lima, reduciendo la neblina costera habitual. Los años de El Niño intenso pueden subir la temperatura de Lima hasta 27°C en verano (enero-marzo).",
    tags: ["el nino", "fenomeno", "peru", "costa", "lluvia", "inundacion", "clima", "pacifico"]
  },
  {
    id: "heladas-sierra",
    title: "¿Cuándo ocurren las heladas en la sierra peruana y cómo afectan?",
    content: "Las heladas en la sierra peruana ocurren principalmente entre mayo y agosto (temporada seca de invierno). En Huancayo se registran temperaturas de 0°C a -2°C en las madrugadas durante este período. Las heladas dañan cultivos sensibles como papa, maíz y hortalizas. La protección recomendada incluye acolchar plantas, usar invernaderos rústicos y evitar actividades agrícolas nocturnas en meses de mayor riesgo (junio-julio).",
    tags: ["helada", "sierra", "peru", "huancayo", "temperatura", "invierno", "agricultura", "frio"]
  },
  {
    id: "tipos-precipitacion",
    title: "¿Cuáles son los tipos de precipitación y cómo se diferencian?",
    content: "Los principales tipos de precipitación son: Lluvia (gotas líquidas mayores a 0.5mm); Llovizna o garuú (gotas muy finas menores a 0.5mm, típica de Lima); Granizo (hielo precipitado, frecuente en tormentas andinas); Nieve (cristales de hielo, rara vez en Huancayo pero posible en zonas sobre 4,500 msnm); Cellisca (mezcla de lluvia y nieve). En Lima predomina la garuú costera de junio a octubre. En Huancayo, las lluvias estacionales van de octubre a abril.",
    tags: ["lluvia", "garua", "llovizna", "precipitacion", "granizo", "nieve", "lima", "huancayo", "peru"]
  },
  {
    id: "estaciones-peru",
    title: "¿Cuáles son las estaciones del año en Perú y cómo varía el clima?",
    content: "Perú no tiene estaciones marcadas como el hemisferio norte, pero sí ciclos climáticos claros: **Verano costero** (diciembre-marzo): Lima alcanza 26°-28°C, playas activas, cielo despejado. **Invierno costero** (junio-septiembre): Lima 15°-17°C, garuú y neblina densa. **Temporada de lluvias en sierra** (octubre-abril): Huancayo recibe precipitaciones regulares. **Temporada seca de sierra** (mayo-septiembre): cielos azules y heladas nocturnas en Huancayo. La región amazónica tiene lluvias todo el año con mayor intensidad en la temporada húmeda.",
    tags: ["estaciones", "verano", "invierno", "peru", "lima", "huancayo", "temporada", "lluvias", "clima"]
  },
  {
    id: "frentes-atmosfericos",
    title: "¿Qué es un frente atmosférico y cómo afecta al clima?",
    content: "Un frente atmosférico es la zona de contacto entre dos masas de aire de diferente temperatura y humedad. Los frentes fríos traen descenso brusco de temperatura, vientos fuertes y precipitaciones intensas (como los que afectan a Buenos Aires o Santiago). Los frentes cálidos generan lluvias continuas y suaves (similares a las de París). En Perú, la influencia de frentes del Pacífico es moderada en la costa; la sierra genera sus propias masas de aire por diferencia de altitud.",
    tags: ["frente", "masa de aire", "temperatura", "viento", "lluvia", "meteorologia", "clima"]
  }
];

export function retrieveKeywordKnowledge(query: string): KnowledgeResult[] {
  const terms = query.toLowerCase().split(/\W+/).filter(Boolean);
  return knowledge
    .map((entry) => ({
      entry,
      score: terms.reduce(
        (score, term) =>
          score +
          (entry.title.toLowerCase().includes(term) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(term)) ||
          entry.content.toLowerCase().includes(term)
            ? 1
            : 0),
        0
      )
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => ({ ...item.entry, score: item.score, source: "keyword" as const }));
}

function cosineSimilarity(left: number[], right: number[]) {
  const dot = left.reduce((sum, value, index) => sum + value * (right[index] ?? 0), 0);
  const leftMagnitude = Math.sqrt(left.reduce((sum, value) => sum + value * value, 0));
  const rightMagnitude = Math.sqrt(right.reduce((sum, value) => sum + value * value, 0));
  return leftMagnitude && rightMagnitude ? dot / (leftMagnitude * rightMagnitude) : 0;
}

async function embedMany(texts: string[]) {
  const missing = texts.filter((text) => !embeddingCache.has(text));
  if (!missing.length) return texts.map((text) => embeddingCache.get(text)!);
  const baseUrl = (process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434/v1").replace(/\/v1\/?$/, "");
  const response = await fetch(`${baseUrl}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.OLLAMA_EMBEDDING_MODEL ?? "nomic-embed-text", input: missing }),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Ollama embeddings respondió ${response.status}.`);
  const data = (await response.json()) as { embeddings?: number[][] };
  if (!data.embeddings?.length || data.embeddings.length !== missing.length)
    throw new Error("Ollama no devolvió todos los embeddings.");
  missing.forEach((text, index) => embeddingCache.set(text, data.embeddings![index]));
  return texts.map((text) => embeddingCache.get(text)!);
}

export async function retrieveKnowledge(query: string): Promise<{ results: KnowledgeResult[]; source: "vector" | "keyword" }> {
  try {
    const documents = knowledge.map((entry) => `${entry.title}. ${entry.content}. Etiquetas: ${entry.tags.join(", ")}`);
    const [queryEmbedding, ...documentEmbeddings] = await embedMany([query, ...documents]);
    const vectorResults = knowledge.map((entry, index) => ({
      entry,
      score: cosineSimilarity(queryEmbedding, documentEmbeddings[index])
    }));
    return {
      results: vectorResults
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ entry, score }) => ({ ...entry, score, source: "vector" as const })),
      source: "vector"
    };
  } catch (error) {
    console.warn("RAG vectorial no disponible; usando recuperación por palabras clave.", error);
    return { results: retrieveKeywordKnowledge(query), source: "keyword" };
  }
}
