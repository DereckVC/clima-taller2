"use client";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { countriesData, CityWeather, CountryClimateData } from "@/lib/countries";
import { DraftOrder, Order } from "@/lib/orders";
import type { LiveCityWeather, DailyForecast, DayPeriod, MultiModelConsensus } from "@/lib/weather";
import {
  IconSun,
  IconCloudRain,
  IconWind,
  IconCloud,
  IconThermometer,
  IconDroplets,
  IconSparkles,
  IconMessageCircle,
  IconX,
  IconSend,
  IconMic,
  IconMapPin,
  IconAlertTriangle,
  IconCheck,
  IconInfo,
  IconVolume2,
  IconVolumeX
} from "@/components/Icons";


const TempChart   = dynamic(() => import("@/components/TempChart"),   { ssr: false });
const HourlyChart = dynamic(() => import("@/components/HourlyChart"), { ssr: false });

type Message = { role: "user" | "assistant"; content: string };
type ChatResult = { reply: string; draft: DraftOrder; readyToConfirm: boolean; mode: "ia" | "demo" };
type WeatherFilter = "all" | "rain" | "hot" | "wind" | "peru";

// Helper: get day abbreviation in Spanish
const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
function getDayLabel(dateStr: string, index: number): string {
  if (index === 0) return "Hoy";
  const d = new Date(dateStr + "T12:00:00");
  return DAY_NAMES[d.getDay()] ?? "";
}

// Helper: wind direction degrees → abbreviation
function windDir(deg: number): string {
  const dirs = ["N","NE","E","SE","S","SO","O","NO"];
  return dirs[Math.round(deg / 45) % 8] ?? "N";
}

// Helper: get accent color class and color string based on weather state
function getAccentColor(city: CityWeather & Partial<LiveCityWeather>): { cls: string; hex: string } {
  if (city.isRaining) return { cls: "rain", hex: "#38bdf8" };
  if (city.isHot)     return { cls: "hot",  hex: "#f59e0b" };
  if (city.isWindy)   return { cls: "wind", hex: "#22d3ee" };
  return { cls: "sun", hex: "#facc15" };
}

// Merge static CityWeather with live data
function mergeCity(staticCity: CityWeather, live?: LiveCityWeather): CityWeather & { live?: LiveCityWeather } {
  if (!live) return staticCity;
  return {
    ...staticCity,
    temp: live.temp,
    minTemp: live.minTemp,
    maxTemp: live.maxTemp,
    humidity: live.humidity,
    windSpeedKmH: live.windSpeedKmH,
    uvIndex: live.uvIndex,
    pressureHpa: live.pressureHpa,
    thermalSensation: live.thermalSensation,
    condition: live.condition,
    icon: live.icon,
    isRaining: live.isRaining,
    isHot: live.isHot,
    isWindy: live.isWindy,
    isSunny: live.isSunny,
    clothingRecommendation: live.clothingRecommendation,
    live,
  } as CityWeather & { live?: LiveCityWeather };
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState<DraftOrder>({ lines: [], fulfillment: "Reporte Digital Inmediato" });
  const [input, setInput] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [model, setModel] = useState("qwen3.5:4b");
  const [connected, setConnected] = useState(false);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<WeatherFilter>("all");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Live weather state
  const [liveWeather, setLiveWeather] = useState<LiveCityWeather[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // User geolocation + city search
  const [userWeather, setUserWeather] = useState<LiveCityWeather | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [userGeoLoading, setUserGeoLoading] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [searchResult, setSearchResult] = useState<LiveCityWeather | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const total = useMemo(
    () => draft.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
    [draft]
  );

  // ── Fetch live weather ─────────────────────────────────────────────────────
  const fetchLiveWeather = useCallback(async () => {
    setWeatherLoading(true);
    try {
      const res = await fetch("/api/weather");
      if (!res.ok) throw new Error("weather api error");
      const data = (await res.json()) as { cities: LiveCityWeather[]; updatedAt: string };
      setLiveWeather(data.cities);
      setLastUpdated(new Date(data.updatedAt));
    } catch {
      // fallback silently to static data
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLiveWeather();
    const iv = setInterval(() => { void fetchLiveWeather(); }, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, [fetchLiveWeather]);

  // ── Auto-detect user location ──────────────────────────────────────────────
  const autoDetectLocation = useCallback(async () => {
    setUserGeoLoading(true);
    try {
      // Try browser GPS first (most accurate)
      if ("geolocation" in navigator) {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        ).catch(() => null);

        if (pos) {
          const { latitude, longitude } = pos.coords;
          // Reverse-geocode with Open-Meteo geocoding
          const geoRes = await fetch(
            `/api/weather/search?lat=${latitude}&lon=${longitude}&city=Mi%20Ubicaci%C3%B3n`
          );
          if (geoRes.ok) {
            const data = await geoRes.json() as LiveCityWeather;
            setUserWeather(data);
            setUserCity(data.city);
            setUserGeoLoading(false);
            return;
          }
        }
      }

      // Fallback: IP geolocation
      const locRes = await fetch("/api/locate");
      if (locRes.ok) {
        const loc = await locRes.json() as { city: string; lat: number; lon: number };
        const wxRes = await fetch(`/api/weather/search?lat=${loc.lat}&lon=${loc.lon}&city=${encodeURIComponent(loc.city)}`);
        if (wxRes.ok) {
          const data = await wxRes.json() as LiveCityWeather;
          setUserWeather(data);
          setUserCity(data.city);
        }
      }
    } catch { /* silent */ } finally {
      setUserGeoLoading(false);
    }
  }, []);

  // ── City search ────────────────────────────────────────────────────────────
  const searchCity = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setSearchLoading(true);
    setSearchResult(null);
    try {
      const res = await fetch(`/api/weather/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json() as LiveCityWeather;
        setSearchResult(data);
      } else {
        setNotice(`No se encontró "${query}"`);
      }
    } catch { setNotice("Error al buscar la ciudad"); }
    finally { setSearchLoading(false); }
  }, []);

  // ── Voice speak helper ─────────────────────────────────────────────────────
  function speakText(text: string) {
    if (voiceMuted) return;
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_`•\[\]]/g, "").replace(/https?:\/\/\S+/g, "");
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = "es-PE";
    utt.rate = 1.05;
    utt.pitch = 1.05;
    // Prefer a Spanish female voice if available
    const voices = window.speechSynthesis.getVoices();
    const espVoice = voices.find(v => v.lang.startsWith("es") && v.name.toLowerCase().includes("female"))
      || voices.find(v => v.lang.startsWith("es"))
      || null;
    if (espVoice) utt.voice = espVoice;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
  }

  function stopSpeaking() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }

  // ── App data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    void fetch("/api/orders")
      .then((r) => r.json())
      .then((data: { orders: Order[] }) => setOrders(data.orders ?? []))
      .catch(() => {});
    void fetch("/api/health")
      .then((r) => r.json())
      .then((data: { connected: boolean; model?: string }) => {
        setConnected(data.connected);
        if (data.model) setModel(data.model);
      })
      .catch(() => {});
    setMessages([{
      role: "assistant",
      content: "Hola, soy **Aura**, tu asistente meteorológica. Pregúntame sobre el clima en cualquier ciudad del mundo, el pronóstico de los próximos días, o cualquier cosa sobre el tiempo. 🌤️"
    }]);
    // Auto-detect location on load
    void autoDetectLocation();
  }, [autoDetectLocation]);

  // ── Merge helpers ──────────────────────────────────────────────────────────
  function getLive(city: string, countryId: string): LiveCityWeather | undefined {
    return liveWeather.find((l) => l.city === city && l.countryId === countryId);
  }

  const peru = countriesData.find((c) => c.id === "peru")!;
  const limaStatic = peru.cities.find((c) => c.city === "Lima")!;
  const huancayoStatic = peru.cities.find((c) => c.city === "Huancayo")!;
  const lima = mergeCity(limaStatic, getLive("Lima", "peru"));
  const huancayo = mergeCity(huancayoStatic, getLive("Huancayo", "peru"));

  const allCitiesList = useMemo(() => {
    const list: Array<{ country: CountryClimateData; city: CityWeather & { live?: LiveCityWeather } }> = [];
    countriesData.forEach((country) => {
      country.cities.forEach((city) => {
        list.push({ country, city: mergeCity(city, getLive(city.city, country.id)) });
      });
    });
    return list;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveWeather]);

  const filteredCities = useMemo(() => {
    let list = allCitiesList;
    if (activeFilter === "rain")  return list.filter((i) => i.city.isRaining);
    if (activeFilter === "hot")   return list.filter((i) => i.city.isHot);
    if (activeFilter === "wind")  return list.filter((i) => i.city.isWindy);
    if (activeFilter === "peru")  return list.filter((i) => i.country.id === "peru");
    return list.filter((i) => i.country.id !== "peru");
  }, [activeFilter, allCitiesList]);

  // Stats for hero bar
  const stats = useMemo(() => {
    const all = allCitiesList;
    return {
      raining: all.filter((i) => i.city.isRaining).length,
      hot:     all.filter((i) => i.city.isHot).length,
      windy:   all.filter((i) => i.city.isWindy).length,
      total:   all.length,
    };
  }, [allCitiesList]);

  // ── Chat ───────────────────────────────────────────────────────────────────
  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, draft, model })
      });
      const result = (await response.json()) as ChatResult & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Error del servicio");
      setMessages([...next, { role: "assistant", content: result.reply }]);
      setDraft(result.draft);
      setReady(result.readyToConfirm);
      speakText(result.reply);

    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Error al conectar con Aura.");
    } finally {
      setLoading(false);
    }
  }

  function startVoiceRecognition() {
    type SE = { results: Array<Array<{ transcript: string }>> };
    type RI = { lang: string; interimResults: boolean; maxAlternatives: number; onresult: (e: SE) => void; onerror: () => void; onend: () => void; start: () => void };
    const win = window as unknown as { SpeechRecognition?: new () => RI; webkitSpeechRecognition?: new () => RI };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) { setNotice("Tu navegador no soporta entrada de voz."); return; }
    const r = new SpeechRec();
    r.lang = "es-PE"; r.interimResults = false; r.maxAlternatives = 1;
    setIsListening(true);
    r.onresult = (e: SE) => { setIsListening(false); const t = e.results[0]?.[0]?.transcript ?? ""; if (t) void sendMessage(t); };
    r.onerror = () => { setIsListening(false); setNotice("No pude capturar el audio. Verifica los permisos."); };
    r.onend = () => setIsListening(false);
    r.start();
  }

  async function registerOrder() {
    const response = await fetch("/api/orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    });
    const data = (await response.json()) as { order?: Order; error?: string };
    if (!response.ok || !data.order) { setNotice(data.error ?? "No se pudo emitir el boletín."); return; }
    setOrders((cur) => [data.order!, ...cur]);
    setDraft({ lines: [], fulfillment: "Reporte Digital Inmediato" });
    setReady(false);
    setNotice(`✦ Boletín ${data.order.id} emitido con éxito.`);
  }

  // ── Render helpers ─────────────────────────────────────────────────────────
  function renderConditionPill(city: CityWeather) {
    if (city.isRaining) return <span className="condition-pill rain">🌧️ Lloviendo</span>;
    if (city.isHot)     return <span className="condition-pill sun">☀️ Cálido</span>;
    if (city.isWindy)   return <span className="condition-pill wind">💨 Ventoso</span>;
    return <span className="condition-pill cloud">⛅ {city.condition}</span>;
  }

  function renderForecastStrip(forecast: DailyForecast[]) {
    return (
      <div className="forecast-strip">
        {forecast.slice(0, 7).map((d, i) => (
          <div key={d.date} className="forecast-day">
            <span className="forecast-day-name">{getDayLabel(d.date, i)}</span>
            <span className="forecast-day-icon">{d.icon}</span>
            <span className="forecast-day-max">{d.maxTemp}°</span>
            <span className="forecast-day-min">{d.minTemp}°</span>
            {d.precipitationSum > 0 && (
              <span className="forecast-day-precip">{d.precipitationSum}mm</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="app-container">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="top-nav">
        <Link className="brand-badge" href="/">
          <div className="brand-icon">
            <IconSun className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1>MeteoGlobal</h1>
            <span>Centro de Comando Meteorológico · Open-Meteo API</span>
          </div>
        </Link>

        <div className="nav-right">
          <span className={`nav-pill ${connected ? "connected" : "live"}`}>
            <span className="pulse-dot" />
            {connected ? `Ollama · ${model}` : "Modo Demo"}
          </span>

          <button
            className={`nav-pill ${weatherLoading ? "loading" : "live"}`}
            onClick={() => { void fetchLiveWeather(); }}
            title="Actualizar datos meteorológicos"
          >
            <span style={{ display: "inline-block", animation: weatherLoading ? "spin 1s linear infinite" : "none" }}>
              {weatherLoading ? "⟳" : "●"}
            </span>
            {weatherLoading ? "Actualizando..." : `LIVE · Open-Meteo${lastUpdated ? " · " + lastUpdated.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }) : ""}`}
          </button>
        </div>
      </header>

      {/* ── HERO STATS BAR ─────────────────────────────────── */}
      <section className="hero-stats-bar">
        <div className="stat-tile">
          <div className="stat-tile-icon rain">🌧️</div>
          <div>
            <div className="stat-tile-val rain">{stats.raining}</div>
            <div className="stat-tile-label">Ciudades con lluvia</div>
          </div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-icon hot">🌡️</div>
          <div>
            <div className="stat-tile-val hot">{stats.hot}</div>
            <div className="stat-tile-label">Ciudades cálidas ≥28°C</div>
          </div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-icon wind">💨</div>
          <div>
            <div className="stat-tile-val wind">{stats.windy}</div>
            <div className="stat-tile-label">Ciudades ventosas ≥20km/h</div>
          </div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-icon cloud">🌍</div>
          <div>
            <div className="stat-tile-val cloud">{stats.total}</div>
            <div className="stat-tile-label">Ciudades monitoreadas</div>
          </div>
        </div>
      </section>

      {/* ── FILTER BAR ─────────────────────────────────────── */}
      <section className="filter-bar">
        <span className="filter-label">Filtrar:</span>
        {([
          { key: "all",  label: "Todas las capitales",    icon: <IconThermometer className="w-3.5 h-3.5" />, cls: "" },
          { key: "rain", label: "Lloviendo ahora",         icon: <IconCloudRain   className="w-3.5 h-3.5" />, cls: "rain" },
          { key: "hot",  label: "Más cálidas",             icon: <IconSun         className="w-3.5 h-3.5" />, cls: "hot"  },
          { key: "wind", label: "Viento activo",            icon: <IconWind        className="w-3.5 h-3.5" />, cls: "wind" },
          { key: "peru", label: "🇵🇪 Perú",               icon: <IconMapPin      className="w-3.5 h-3.5" />, cls: "peru" },
        ] as { key: WeatherFilter; label: string; icon: React.ReactNode; cls: string }[]).map(({ key, label, icon, cls }) => (
          <button
            key={key}
            className={`filter-btn ${cls} ${activeFilter === key ? `active ${cls}` : ""}`}
            onClick={() => setActiveFilter(key)}
          >
            {icon}
            {label}
          </button>
        ))}
      </section>

      {/* ── MI CLIMA (User Location) ───────────────────────── */}
      <section className="my-location-section">
        {/* Search bar */}
        <div className="city-search-bar">
          <IconMapPin size={18} style={{ color: "var(--blue)" }} />
          <form
            className="city-search-form"
            onSubmit={(e) => { e.preventDefault(); void searchCity(citySearch); }}
          >
            <input
              ref={searchRef}
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
              placeholder="Buscar cualquier ciudad del mundo..."
              className="city-search-input"
            />
            <button type="submit" className="city-search-btn" disabled={searchLoading}>
              {searchLoading ? "⟳" : "🔍"}
            </button>
          </form>
          <button
            className="geo-detect-btn"
            onClick={() => { void autoDetectLocation(); }}
            disabled={userGeoLoading}
            title="Detectar mi ubicación"
          >
            {userGeoLoading ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> : "📍"}
            {userGeoLoading ? "Detectando..." : "Mi Ubicación"}
          </button>
        </div>

        {/* Search result */}
        {searchResult && (
          <div className="search-result-panel animate-in">
            <div className="search-result-header">
              <div>
                <span className="search-result-city">{searchResult.city}</span>
                <span className="search-result-icon">{searchResult.icon}</span>
                <span className="search-result-temp" style={{ color: searchResult.isHot ? "#f59e0b" : searchResult.isRaining ? "#38bdf8" : "#facc15" }}>
                  {searchResult.temp}°C
                </span>
              </div>
              <button onClick={() => setSearchResult(null)} className="search-result-close">✕</button>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 8px" }}>{searchResult.condition}</p>
            <div className="metrics-grid" style={{ marginBottom: "10px" }}>
              <div className="metric-box"><span>Sensación</span><strong>{searchResult.thermalSensation}°C</strong></div>
              <div className="metric-box"><span>Humedad</span><strong>{searchResult.humidity}%</strong></div>
              <div className="metric-box"><span>Viento</span><strong>{searchResult.windSpeedKmH}km/h</strong></div>
              <div className="metric-box"><span>UV</span><strong>{searchResult.uvIndex}</strong></div>
            </div>
            {/* Periods */}
            {searchResult.periods && searchResult.periods.length > 0 && (
              <div className="periods-strip">
                {searchResult.periods.filter(p => p.hours.length > 0).map(p => (
                  <div key={p.label} className="period-card">
                    <span className="period-icon">{p.icon}</span>
                    <span className="period-label">{p.label}</span>
                    <span className="period-temp">{p.avgTemp}°C</span>
                    <span className="period-cond">{p.condition}</span>
                    {p.precipitation > 0 && <span className="period-precip">💧{p.precipitation}mm</span>}
                  </div>
                ))}
              </div>
            )}
            <HourlyChart hourly={searchResult.hourly ?? []} accentColor="#facc15" cityName={searchResult.city} />
          </div>
        )}

        {/* User location card */}
        {userWeather && !searchResult && (
          <div className="user-location-card animate-in">
            <div className="user-location-header">
              <div>
                <span style={{ fontSize: "11px", color: "var(--emerald)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  📍 Tu Clima Ahora · {userCity}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px" }}>
                  <span style={{ fontSize: "42px", lineHeight: 1 }}>{userWeather.icon}</span>
                  <div>
                    <div style={{ fontSize: "32px", fontWeight: 800, color: userWeather.isHot ? "#f59e0b" : userWeather.isRaining ? "#38bdf8" : "#facc15" }}>
                      {userWeather.temp}°C
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{userWeather.condition} · Sensación {userWeather.thermalSensation}°C</div>
                  </div>
                </div>
              </div>
              <div className="metrics-grid" style={{ minWidth: "180px" }}>
                <div className="metric-box"><span>↓Min</span><strong>{userWeather.minTemp}°</strong></div>
                <div className="metric-box"><span>↑Max</span><strong>{userWeather.maxTemp}°</strong></div>
                <div className="metric-box"><span>Humedad</span><strong>{userWeather.humidity}%</strong></div>
                <div className="metric-box"><span>UV</span><strong style={{ color: userWeather.uvIndex >= 8 ? "#f43f5e" : "inherit" }}>{userWeather.uvIndex}</strong></div>
              </div>
            </div>

            {/* Day/Night periods */}
            {userWeather.periods && userWeather.periods.length > 0 && (
              <div className="periods-strip">
                {userWeather.periods.filter(p => p.hours.length > 0).map(p => (
                  <div key={p.label} className="period-card">
                    <span className="period-icon">{p.icon}</span>
                    <span className="period-label">{p.label}</span>
                    <span className="period-temp">{p.avgTemp}°C</span>
                    <span className="period-cond">{p.condition}</span>
                    {p.precipitation > 0 && <span className="period-precip">💧{p.precipitation}mm</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Hourly chart */}
            <HourlyChart
              hourly={userWeather.hourly ?? []}
              accentColor={userWeather.isHot ? "#f59e0b" : userWeather.isRaining ? "#38bdf8" : "#22d3ee"}
              cityName={userCity ?? undefined}
            />

            <div className="clothing-tip" style={{ marginTop: "8px" }}>
              <b>Vestimenta: </b>{userWeather.clothingRecommendation}
            </div>
          </div>
        )}
      </section>

      {/* ── PERÚ SPOTLIGHT ─────────────────────────────────── */}

      {(activeFilter === "all" || activeFilter === "peru") && (
        <section className="peru-spotlight">
          <div className="section-header">
            <div className="section-title">🇵🇪 Perú — Lima &amp; Huancayo</div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Costa húmeda vs. Sierra andina</span>
          </div>

          <div className="peru-cities-grid">
            {([
              { city: huancayo, liveData: getLive("Huancayo","peru"), label: "Valle del Mantaro · 3,250 msnm", tempColor: "#f59e0b" },
              { city: lima,     liveData: getLive("Lima","peru"),     label: "Capital · Costa Central del Pacífico", tempColor: "#38bdf8" },
            ]).map(({ city, liveData, label, tempColor }) => (
              <article className="city-hero-card animate-in" key={city.city}>
                <div className="city-hero-header">
                  <div className="city-hero-meta">
                    <h3>{city.city}</h3>
                    <p>{label}</p>
                  </div>
                  <div className="city-temp-display">
                    <div className="city-temp-big" style={{ color: tempColor }}>{city.temp}°C</div>
                    <div className="city-temp-range">↓{city.minTemp}° ↑{city.maxTemp}°</div>
                  </div>
                </div>

                {renderConditionPill(city)}

                <div className="metrics-grid">
                  <div className="metric-box">
                    <span>Sensación</span>
                    <strong>{city.thermalSensation}°C</strong>
                  </div>
                  <div className="metric-box">
                    <span>Humedad</span>
                    <strong>{city.humidity}%</strong>
                  </div>
                  <div className="metric-box">
                    <span>Viento</span>
                    <strong>{city.windSpeedKmH}km/h</strong>
                  </div>
                  <div className="metric-box">
                    <span>UV</span>
                    <strong style={{ color: city.uvIndex >= 10 ? "#f43f5e" : city.uvIndex >= 6 ? "#f59e0b" : "inherit" }}>
                      {city.uvIndex}
                    </strong>
                  </div>
                </div>

                {liveData && (
                  <div className="extra-metrics">
                    <div className="extra-metric">
                      <span>🧭</span>
                      <span>Dirección: <strong>{windDir(liveData.windDirection)} {liveData.windDirection}°</strong></span>
                    </div>
                    <div className="extra-metric">
                      <span>👁️</span>
                      <span>Visibilidad: <strong>{liveData.visibility}km</strong></span>
                    </div>
                    <div className="extra-metric">
                      <span>☁️</span>
                      <span>Nubosidad: <strong>{liveData.cloudCover}%</strong></span>
                    </div>
                  </div>
                )}

                <div className="clothing-tip">
                  <b>Vestimenta: </b>{city.clothingRecommendation}
                </div>

                {/* ── Meteored Day/Night Periods Breakdown ── */}
                {liveData?.periods && liveData.periods.length > 0 && (
                  <div style={{ marginTop: "12px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 600 }}>
                      ⏰ DESGLOSE POR HORAS (DÍA / TARDE / NOCHE)
                    </div>
                    <div className="periods-strip">
                      {liveData.periods.filter(p => p.hours.length > 0).map(p => (
                        <div key={p.label} className="period-card">
                          <span className="period-icon">{p.icon}</span>
                          <span className="period-label">{p.label}</span>
                          <span className="period-temp">{p.avgTemp}°C</span>
                          <span className="period-cond">{p.condition}</span>
                          {p.precipitation > 0 && <span className="period-precip">💧{p.precipitation}mm</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Meteored Multi-Model Consensus (ECMWF, GFS, ICON) ── */}
                {liveData?.models && (
                  <div className="model-consensus-badge">
                    <div className="consensus-header">
                      <span className="consensus-title">🌐 Consenso Multimodelo (Meteored)</span>
                      <span className="consensus-tag">{liveData.models.confidence}% Confiabilidad</span>
                    </div>
                    <div className="models-row">
                      <div className="model-item">
                        <span className="model-name">🇪🇺 ECMWF</span>
                        <strong className="model-val">{liveData.models.ecmwfTemp}°C</strong>
                      </div>
                      <div className="model-item">
                        <span className="model-name">🇺🇸 GFS</span>
                        <strong className="model-val">{liveData.models.gfsTemp}°C</strong>
                      </div>
                      <div className="model-item">
                        <span className="model-name">🇩🇪 ICON</span>
                        <strong className="model-val">{liveData.models.iconTemp}°C</strong>
                      </div>
                    </div>
                    <div className="consensus-footer">
                      <span>{liveData.models.summary}</span>
                      <span>Dispersión: ±{liveData.models.spread}°C</span>
                    </div>
                  </div>
                )}

                {/* ── Real Canvas Hourly Chart ── */}
                {liveData?.hourly && liveData.hourly.length > 0 && (
                  <HourlyChart
                    hourly={liveData.hourly}
                    accentColor={tempColor}
                    cityName={`${city.city} · Hoy 24 Horas`}
                  />
                )}

                {/* 7-day forecast */}
                {liveData?.forecast && liveData.forecast.length > 0 && renderForecastStrip(liveData.forecast)}

                {/* Temperature chart */}
                {liveData?.forecast && liveData.forecast.length > 1 && (
                  <TempChart forecast={liveData.forecast} accentColor={tempColor} />
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── WORLD CITIES GRID ──────────────────────────────── */}
      <section>
        <div className="section-header">
          <div className="section-title">
            {activeFilter === "rain" ? "🌧️ Ciudades con lluvia" :
             activeFilter === "hot"  ? "☀️ Ciudades cálidas" :
             activeFilter === "wind" ? "💨 Ciudades ventosas" :
             activeFilter === "peru" ? "🇵🇪 Ciudades de Perú" :
             "🌍 Capitales del Mundo"}
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {filteredCities.length} ciudad{filteredCities.length !== 1 ? "es" : ""} · Datos Open-Meteo
          </span>
        </div>

        <div className="weather-grid">
          {filteredCities.map(({ country, city }) => {
            const accent = getAccentColor(city);
            const isExpanded = expandedCard === `${country.id}-${city.city}`;
            const liveData = (city as CityWeather & { live?: LiveCityWeather }).live;

            return (
              <article
                className={`weather-card animate-in ${city.isRaining ? "is-raining" : city.isHot ? "is-hot" : city.isWindy ? "is-windy" : ""}`}
                key={`${country.id}-${city.city}`}
                onClick={() => setExpandedCard(isExpanded ? null : `${country.id}-${city.city}`)}
              >
                <div className={`weather-card-accent ${accent.cls}`} />

                <div className="card-top">
                  <div>
                    <div className="card-city">{city.city} {country.flag}</div>
                    <div className="card-country">{country.name} · {city.isCapital ? "Capital" : "Ciudad"}</div>
                  </div>
                  <div className="card-temp" style={{ color: accent.hex }}>{city.temp}°</div>
                </div>

                <div className={`card-condition-pill condition-pill ${accent.cls}`}>
                  {city.icon} {city.condition}
                </div>

                <div className="card-metrics">
                  <div className="card-metric">
                    <span>Humedad</span>
                    <strong style={{ color: city.humidity > 70 ? "#38bdf8" : "inherit" }}>{city.humidity}%</strong>
                  </div>
                  <div className="card-metric">
                    <span>Viento</span>
                    <strong style={{ color: city.isWindy ? "#22d3ee" : "inherit" }}>{city.windSpeedKmH}km/h</strong>
                  </div>
                  <div className="card-metric">
                    <span>Índice UV</span>
                    <strong style={{ color: city.uvIndex >= 8 ? "#f43f5e" : city.uvIndex >= 5 ? "#f59e0b" : "inherit" }}>UV {city.uvIndex}</strong>
                  </div>
                </div>

                {/* 5-day mini forecast */}
                {liveData?.forecast && liveData.forecast.length > 0 && (
                  <div className="card-forecast-mini">
                    {liveData.forecast.slice(0, 5).map((d, i) => (
                      <div key={d.date} className="forecast-mini-day">
                        <span>{getDayLabel(d.date, i)}</span>
                        <span className="ico">{d.icon}</span>
                        <strong>{d.maxTemp}°</strong>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expanded: chart + extra data */}
                {isExpanded && (
                  <div style={{ marginTop: "14px", borderTop: "1px solid var(--glass-border)", paddingTop: "12px" }}>
                    {liveData && (
                      <div className="extra-metrics" style={{ marginBottom: "10px" }}>
                        <div className="extra-metric">
                          <span>🧭</span>
                          <span>Viento <strong>{windDir(liveData.windDirection)}</strong></span>
                        </div>
                        <div className="extra-metric">
                          <span>👁️</span>
                          <span>Visib. <strong>{liveData.visibility}km</strong></span>
                        </div>
                        <div className="extra-metric">
                          <span>☁️</span>
                          <span>Nubes <strong>{liveData.cloudCover}%</strong></span>
                        </div>
                      </div>
                    )}
                    {liveData?.forecast && liveData.forecast.length > 1 && (
                      <TempChart forecast={liveData.forecast} accentColor={accent.hex} />
                    )}
                    <div className="clothing-tip" style={{ marginTop: "10px" }}>
                      <b>Vestimenta: </b>{city.clothingRecommendation}
                    </div>
                    <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "8px", textAlign: "center" }}>
                      Haz clic para colapsar
                    </p>
                  </div>
                )}

                {!isExpanded && (
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "10px", textAlign: "right" }}>
                    Clic para ver pronóstico y gráfica →
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="minimal-footer">
        <span>METEOGLOBAL · TIEMPO EN VIVO EN PERÚ Y CAPITALES DEL MUNDO</span>
        <span style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span>OPEN-METEO API · QWEN 3.5 (4B) · CANVAS CHARTS</span>
          {lastUpdated && (
            <span style={{ color: "var(--emerald)", fontSize: "9px" }}>
              ● Actualizado {lastUpdated.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </span>
      </footer>

      {/* ── FAB CHATBOT ────────────────────────────────────── */}
      <button
        className="floating-chat-btn"
        onClick={() => setIsChatOpen(!isChatOpen)}
        title="Abrir Asistente Meteorológica Aura"
      >
        <span className="badge-dot" />
        <IconSparkles className="w-4 h-4" />
        <span>{isChatOpen ? "Cerrar Aura" : "Preguntar a Aura"}</span>
      </button>

      {/* ── CHAT DRAWER ────────────────────────────────────── */}
      {isChatOpen && (
        <aside className="chat-drawer">
          <div className="drawer-header">
            <div className="drawer-header-info">
              <div className="drawer-avatar">
                <IconSparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <b>Aura · Asistente Meteorológica</b>
                <span>Qwen 3.5:4B · Open-Meteo Multi-Model</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                className={`drawer-sound-toggle-btn ${voiceMuted ? "muted" : "active"}`}
                onClick={() => {
                  if (!voiceMuted) stopSpeaking();
                  setVoiceMuted(!voiceMuted);
                }}
                title={voiceMuted ? "Voz silenciada (clic para activar)" : "Voz activa (clic para silenciar)"}
              >
                {voiceMuted ? <IconVolumeX className="w-3.5 h-3.5" /> : <IconVolume2 className="w-3.5 h-3.5" />}
              </button>
              <button className="drawer-close-btn" onClick={() => setIsChatOpen(false)} title="Cerrar ventana">
                <IconX className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Voice Speaking status */}
          {isSpeaking && (
            <div className="voice-status-bar animate-in">
              <div className="voice-wave-bars">
                <span className="vbar vb1" />
                <span className="vbar vb2" />
                <span className="vbar vb3" />
                <span className="vbar vb4" />
                <span className="vbar vb5" />
              </div>
              <span>Aura está hablando...</span>
              <button className="voice-stop-btn" onClick={stopSpeaking}>Detener</button>
            </div>
          )}

          {/* Speech-to-Text Listening status */}
          {isListening && (
            <div className="voice-status-bar listening animate-in">
              <span className="pulse-mic">🎙️</span>
              <span>Te escucho... habla tu consulta</span>
            </div>
          )}

          <div className="drawer-messages">
            {messages.map((msg, idx) => (
              <div className={`msg-row ${msg.role}`} key={`${msg.role}-${idx}`}>
                <div className="msg-header-row">
                  <small>{msg.role === "assistant" ? "AURA" : "TÚ"}</small>
                  {msg.role === "assistant" && (
                    <button
                      className="msg-listen-btn"
                      onClick={() => speakText(msg.content)}
                      title="Reproducir voz de Aura"
                    >
                      <IconVolume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="msg-bubble" style={{ whiteSpace: "pre-line" }}>{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="msg-row assistant">
                <small>AURA</small>
                <div className="msg-bubble" style={{ color: "var(--blue)" }}>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block", marginRight: "6px" }}>⟳</span>
                  Consultando datos meteorológicos...
                </div>
              </div>
            )}
          </div>

          <div className="drawer-chips">
            {[
              ["☀️ Huancayo", "¿Cómo está el clima hoy en Huancayo?"],
              ["⛅ Lima", "¿Cómo está el clima en Lima?"],
              ["🌧️ ¿Dónde llueve?", "¿En qué ciudades está lloviendo hoy?"],
              ["🔥 Más calor", "¿Dónde hace más calor hoy?"],
              ["💨 Viento", "¿Qué ciudades tienen viento fuerte?"],
              ["📅 Pronóstico", "Dame el pronóstico de los próximos 7 días para Lima"],
            ].map(([label, prompt]) => (
              <button key={label} onClick={() => void sendMessage(prompt!)}>{label}</button>
            ))}
          </div>

          {draft.lines.length > 0 && (
            <div className="drawer-draft-box">
              <div>
                <b>Boletín:</b> {draft.lines.map((l) => `${l.quantity}× ${l.name}`).join(", ")}
              </div>
              {ready && (
                <button onClick={() => void registerOrder()}>
                  <IconCheck className="w-3 h-3 inline mr-1" />
                  Emitir ({total} cr.)
                </button>
              )}
            </div>
          )}

          <form
            className="drawer-input-bar"
            onSubmit={(e) => { e.preventDefault(); void sendMessage(input); }}
          >
            <button
              type="button"
              className={`drawer-mic-btn ${isListening ? "active" : ""}`}
              onClick={startVoiceRecognition}
              title="Hablar por voz"
            >
              <IconMic className="w-3.5 h-3.5" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Consulta el clima o pronóstico..."
            />
            <button type="submit" className="drawer-send-btn" disabled={!input.trim() || loading}>
              <IconSend className="w-3.5 h-3.5" />
            </button>
          </form>
        </aside>
      )}

      {/* ── TOAST ──────────────────────────────────────────── */}
      {notice && (
        <div className="toast-notification">
          <span>{notice}</span>
          <button className="toast-close" onClick={() => setNotice("")}>✕</button>
        </div>
      )}
    </div>
  );
}
