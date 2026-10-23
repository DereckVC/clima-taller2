# RAG Explicado para Inteligencia Climática

## ¿Qué problema resuelve en el sector climático?

Un modelo de lenguaje generalista puede alucinar datos numéricos de temperatura, confundir las fases del Fenómeno El Niño o inventar estadísticas de retroceso glaciar. 

La arquitectura **RAG (Retrieval-Augmented Generation)** recupera documentos científicos validados (IPCC, SENAMHI, OMM, NOAA) e inyecta esa evidencia en el contexto del LLM antes de redactar la respuesta.

## Las tres etapas

```text
Retrieve (Recuperar)  → Buscar fragmentos científicos relevantes según la consulta
Augment (Aumentar)    → Agregar los fragmentos y datos de países al prompt del sistema
Generate (Generar)    → Generar una respuesta rigurosa y empática con Aura
```

## Flujo en GeoClima Global

```text
Consulta: "¿Cuál es el impacto de El Niño en Perú?"
        ↓
Embedding vectorial de la pregunta (nomic-embed-text)
        ↓
Similitud coseno con la base científica (lib/knowledge.ts)
        ↓
Documento recuperado: El Niño en la costa norte (lluvias/huaicos) y sequías en Puno
        ↓
Respuesta precisa y fundamentada de Aura
```

## Dos modelos, dos responsabilidades

| Modelo | Responsabilidad |
|---|---|
| `nomic-embed-text` | Recuperación semántica de ciencia climática por significado |
| `llama3.1:8b` / `llama3.2` | Razonamiento, redacción y estructuración del dossier con Aura |
