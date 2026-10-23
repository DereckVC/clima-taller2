# Mapa de GeoClima Global

## La idea en una frase

GeoClima Global es un observatorio planetario con IA. Aura conversa con científicos y tomadores de decisiones, consulta el estado de vulnerabilidad de múltiples países (destacando Perú), construye un dossier estructurado de monitoreo y solo despliega la misión cuando el usuario lo confirma explícitamente.

## Estructura por responsabilidad

```text
IC_TALLER2/
├── app/                 # Interfaz web y endpoints HTTP de Next.js
│   ├── page.tsx         # Monitor de países, Centro de Comando, Aura IA y telemetría
│   ├── globals.css      # Diseño visual futurista y paleta oscura de ciencia climática
│   └── api/             # Puertas de entrada del backend
│       ├── chat/        # Conversación con Aura y guardrails
│       ├── health/      # Estado de Ollama
│       ├── knowledge/   # Consulta semántica RAG
│       ├── models/      # Modelos instalados en Ollama
│       └── orders/      # Desplegar y listar misiones climáticas
├── lib/                 # Reglas, ciencia y datos ambientales
│   ├── business.ts      # Identidad de GeoClima Global y de la analista Aura
│   ├── countries.ts     # Dataset de países (Perú, Brasil, España, etc.)
│   ├── catalog.ts       # Módulos de monitoreo satelital y telemetría
│   ├── promotions.ts    # Fondos e iniciativas ambientales
│   ├── knowledge.ts     # Documentos científicos (El Niño, Glaciares) y RAG
│   ├── conversation.ts  # Orquestación del LLM y modo demo
│   ├── orders.ts        # Tipos y cálculo de créditos ecológicos (UEC)
│   ├── inventory.ts     # Flota de sensores y estaciones activas
│   └── store.ts         # Persistencia en memoria de misiones activas
├── public/images/       # Ilustraciones SVG satelitales y de biomas
├── .env.local           # Configuración local de LLM
└── README.md            # Instalación y operación
```

## Regla de diseño clave

```text
El LLM (Aura) interpreta lenguaje y ciencia climática.
El código valida módulos existentes, precios/créditos (UEC) y confirmaciones.
```

El modelo de IA jamás inventa precios de créditos ni despliega sensores o misiones sin confirmación humana.
