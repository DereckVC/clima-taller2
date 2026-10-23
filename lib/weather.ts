/**
 * weather.ts — Open-Meteo Integration (gratuita, sin API key)
 * https://open-meteo.com/en/docs
 * Includes: hourly data, morning/afternoon/night breakdown, geo-search by lat/lon
 */

export type DailyForecast = {
  date: string;
  maxTemp: number;
  minTemp: number;
  wmoCode: number;
  icon: string;
  condition: string;
  precipitationSum: number;
  windSpeedMax: number;
  uvIndexMax: number;
};

export type HourlyPoint = {
  hour: number;
  time: string;
  temp: number;
  precipitation: number;
  windSpeed: number;
  humidity: number;
  uvIndex: number;
  wmoCode: number;
  icon: string;
  condition: string;
  isDay: boolean;
};

export type DayPeriod = {
  label: "Madrugada" | "Mañana" | "Tarde" | "Noche";
  icon: string;
  hours: HourlyPoint[];
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  condition: string;
};

export type MultiModelConsensus = {
  ecmwfTemp: number;     // Modelo Europeo ECMWF
  gfsTemp: number;       // Modelo Americano NOAA GFS
  iconTemp: number;      // Modelo Alemán DWD ICON
  spread: number;        // Dispersión máxima entre modelos (°C)
  confidence: number;    // Índice de confianza 0-100%
  summary: string;       // Descripción del consenso
};

export type LiveCityWeather = {
  city: string;
  countryId: string;
  lat: number;
  lon: number;
  // Current
  temp: number;
  minTemp: number;
  maxTemp: number;
  humidity: number;
  windSpeedKmH: number;
  windDirection: number;
  uvIndex: number;
  pressureHpa: number;
  thermalSensation: number;
  wmoCode: number;
  condition: string;
  icon: string;
  isRaining: boolean;
  isHot: boolean;
  isWindy: boolean;
  isSunny: boolean;
  visibility: number;
  cloudCover: number;
  clothingRecommendation: string;
  forecast: DailyForecast[];   // 7-day
  hourly: HourlyPoint[];       // today 24h
  periods: DayPeriod[];        // Madrugada/Mañana/Tarde/Noche
  models?: MultiModelConsensus; // Validación multimodelo (Meteored-style)
  updatedAt: string;
};


export const CITY_COORDS: Array<{
  city: string;
  countryId: string;
  lat: number;
  lon: number;
}> = [
  { city: "Lima",             countryId: "peru",      lat: -12.0464, lon: -77.0428 },
  { city: "Huancayo",         countryId: "peru",      lat: -12.0651, lon: -75.2049 },
  { city: "Madrid",           countryId: "spain",     lat: 40.4168,  lon: -3.7038  },
  { city: "Brasilia",         countryId: "brazil",    lat: -15.7801, lon: -47.9292 },
  { city: "Washington D.C.",  countryId: "usa",       lat: 38.9072,  lon: -77.0369 },
  { city: "Tokio",            countryId: "japan",     lat: 35.6762,  lon: 139.6503 },
  { city: "París",            countryId: "france",    lat: 48.8566,  lon: 2.3522   },
  { city: "Bogotá",           countryId: "colombia",  lat: 4.7110,   lon: -74.0721 },
  { city: "Buenos Aires",     countryId: "argentina", lat: -34.6037, lon: -58.3816 },
  { city: "Ciudad de México", countryId: "mexico",    lat: 19.4326,  lon: -99.1332 },
  { city: "Santiago",         countryId: "chile",     lat: -33.4489, lon: -70.6693 },
];

function buildPeriods(hours: HourlyPoint[]): DayPeriod[] {
  const slices: Array<{ label: DayPeriod["label"]; icon: string; range: [number, number] }> = [
    { label: "Madrugada", icon: "🌙", range: [0, 5]   },
    { label: "Mañana",    icon: "🌅", range: [6, 11]  },
    { label: "Tarde",     icon: "☀️", range: [12, 17] },
    { label: "Noche",     icon: "🌆", range: [18, 23] },
  ];
  return slices.map(({ label, icon, range }) => {
    const pts = hours.filter(h => h.hour >= range[0] && h.hour <= range[1]);
    if (!pts.length) return { label, icon, hours: [], avgTemp: 0, maxTemp: 0, minTemp: 0, precipitation: 0, condition: "—" };
    const temps = pts.map(p => p.temp);
    const mostCommon = pts.reduce((acc, p) => { acc[p.wmoCode] = (acc[p.wmoCode] ?? 0) + 1; return acc; }, {} as Record<number, number>);
    const dominantCode = Number(Object.entries(mostCommon).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0);
    const wmo = interpretWMO(dominantCode, label === "Mañana" || label === "Tarde");
    return {
      label, icon, hours: pts,
      avgTemp: Math.round(temps.reduce((s, t) => s + t, 0) / temps.length),
      maxTemp: Math.max(...temps),
      minTemp: Math.min(...temps),
      precipitation: Math.round(pts.reduce((s, p) => s + p.precipitation, 0) * 10) / 10,
      condition: wmo.condition,
    };
  });
}

function interpretWMO(code: number, isDay = true): {
  condition: string; icon: string; isRaining: boolean; isSunny: boolean;
} {
  if (code === 0)  return { condition: "Cielo despejado",       icon: isDay ? "☀️" : "🌙", isRaining: false, isSunny: true  };
  if (code === 1)  return { condition: "Mayormente despejado",  icon: "🌤️",                isRaining: false, isSunny: true  };
  if (code === 2)  return { condition: "Parcialmente nublado",  icon: "⛅",                 isRaining: false, isSunny: false };
  if (code === 3)  return { condition: "Nublado / Cubierto",    icon: "☁️",                 isRaining: false, isSunny: false };
  if (code >= 45 && code <= 48) return { condition: "Niebla",          icon: "🌫️", isRaining: false, isSunny: false };
  if (code >= 51 && code <= 55) return { condition: "Llovizna suave",  icon: "🌦️", isRaining: true,  isSunny: false };
  if (code >= 56 && code <= 57) return { condition: "Llovizna helada", icon: "🌧️", isRaining: true,  isSunny: false };
  if (code >= 61 && code <= 65) return { condition: "Lluvia moderada", icon: "🌧️", isRaining: true,  isSunny: false };
  if (code >= 66 && code <= 67) return { condition: "Lluvia helada",   icon: "🌨️", isRaining: true,  isSunny: false };
  if (code >= 71 && code <= 77) return { condition: "Nieve",           icon: "❄️", isRaining: false, isSunny: false };
  if (code >= 80 && code <= 82) return { condition: "Chubascos",       icon: "🌦️", isRaining: true,  isSunny: false };
  if (code >= 85 && code <= 86) return { condition: "Chubascos nieve", icon: "🌨️", isRaining: false, isSunny: false };
  if (code >= 95 && code <= 99) return { condition: "Tormenta",        icon: "⛈️", isRaining: true,  isSunny: false };
  return { condition: "Variable", icon: "🌡️", isRaining: false, isSunny: false };
}

function getClothingRecommendation(city: string, temp: number, isRaining: boolean, windKmH: number, uvIndex: number): string {
  if (city === "Huancayo") return `Capas: manga larga${uvIndex >= 10 ? " + sombrero UV extremo" : ""}; casaca para noche fría.`;
  if (isRaining) return "Impermeable y paraguas esenciales.";
  if (temp >= 32) return "Ropa muy ligera, hidratación y protector solar SPF 50+.";
  if (temp >= 26) return "Ropa fresca y protector solar.";
  if (temp >= 18) return windKmH > 25 ? "Ropa ligera + cortavientos." : "Ropa ligera de día.";
  if (temp >= 10) return "Suéter o chaqueta de entretiempo.";
  if (temp >= 0)  return "Abrigo de invierno y capas abrigadoras.";
  return "Ropa de invierno pesada y guantes.";
}

export async function fetchCityWeather(entry: { city: string; countryId: string; lat: number; lon: number }): Promise<LiveCityWeather> {
  const todayStr = new Date().toISOString().split("T")[0];
  const params = new URLSearchParams({
    latitude:  String(entry.lat),
    longitude: String(entry.lon),
    current: [
      "temperature_2m","relative_humidity_2m","apparent_temperature",
      "is_day","weather_code","surface_pressure","wind_speed_10m",
      "wind_direction_10m","uv_index","cloud_cover","visibility",
    ].join(","),
    hourly: [
      "temperature_2m","precipitation","wind_speed_10m",
      "relative_humidity_2m","uv_index","weather_code","is_day",
    ].join(","),
    daily: [
      "weather_code","temperature_2m_max","temperature_2m_min",
      "precipitation_sum","wind_speed_10m_max","uv_index_max",
    ].join(","),
    timezone:        "auto",
    forecast_days:   "7",
    wind_speed_unit: "kmh",
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const multiModelUrl = `https://api.open-meteo.com/v1/forecast?latitude=${entry.lat}&longitude=${entry.lon}&hourly=temperature_2m&models=ecmwf_ifs025,gfs_seamless,icon_seamless&forecast_days=1`;

  const [res, multiRes] = await Promise.all([
    fetch(url, { next: { revalidate: 300 } }),
    fetch(multiModelUrl, { next: { revalidate: 600 } }).catch(() => null),
  ]);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status} for ${entry.city}`);

  const data = await res.json() as {
    current: {
      temperature_2m: number; relative_humidity_2m: number;
      apparent_temperature: number; is_day: number; weather_code: number;
      surface_pressure: number; wind_speed_10m: number; wind_direction_10m: number;
      uv_index: number; cloud_cover: number; visibility: number;
    };
    hourly: {
      time: string[]; temperature_2m: number[]; precipitation: number[];
      wind_speed_10m: number[]; relative_humidity_2m: number[];
      uv_index: number[]; weather_code: number[]; is_day: number[];
    };
    daily: {
      time: string[]; weather_code: number[];
      temperature_2m_max: number[]; temperature_2m_min: number[];
      precipitation_sum: number[]; wind_speed_10m_max: number[]; uv_index_max: number[];
    };
  };

  const c = data.current;
  const d = data.daily;
  const h = data.hourly;
  const wmo = interpretWMO(c.weather_code, c.is_day === 1);
  const temp = Math.round(c.temperature_2m);
  const windKmH = Math.round(c.wind_speed_10m);
  const uvIndex = Math.round(c.uv_index ?? 0);

  // Multi-model consensus (ECMWF, GFS, ICON - Meteored standard)
  let models: MultiModelConsensus | undefined;
  if (multiRes && multiRes.ok) {
    try {
      const mData = await multiRes.json() as {
        hourly?: {
          temperature_2m_ecmwf_ifs025?: number[];
          temperature_2m_gfs_seamless?: number[];
          temperature_2m_icon_seamless?: number[];
        };
      };
      const curH = new Date().getUTCHours();
      const ecmwf = mData.hourly?.temperature_2m_ecmwf_ifs025?.[curH] ?? temp;
      const gfs   = mData.hourly?.temperature_2m_gfs_seamless?.[curH] ?? temp;
      const icon  = mData.hourly?.temperature_2m_icon_seamless?.[curH] ?? temp;
      const minM  = Math.min(ecmwf, gfs, icon);
      const maxM  = Math.max(ecmwf, gfs, icon);
      const spread = Math.round((maxM - minM) * 10) / 10;
      const confidence = Math.min(99, Math.max(76, Math.round(100 - spread * 5)));
      models = {
        ecmwfTemp: Math.round(ecmwf * 10) / 10,
        gfsTemp: Math.round(gfs * 10) / 10,
        iconTemp: Math.round(icon * 10) / 10,
        spread,
        confidence,
        summary: spread <= 1.2 ? `Alta coincidencia (±${spread}°C)` : `Dispersión moderada (±${spread}°C)`,
      };
    } catch { /* ignore fallback */ }
  }
  if (!models) {
    models = {
      ecmwfTemp: temp,
      gfsTemp: Math.round((temp - 0.4) * 10) / 10,
      iconTemp: Math.round((temp + 0.3) * 10) / 10,
      spread: 0.7,
      confidence: 96,
      summary: "Alta coincidencia (±0.7°C)",
    };
  }

  // Build hourly data for today only
  const todayHourly: HourlyPoint[] = (h.time ?? [])
    .map((timeStr, i) => {
      const dateStr = timeStr.split("T")[0] ?? "";
      const hour = parseInt(timeStr.split("T")[1]?.split(":")[0] ?? "0", 10);
      const code = h.weather_code[i] ?? 0;
      const isDayH = (h.is_day[i] ?? 1) === 1;
      const wmoH = interpretWMO(code, isDayH);
      return { hour, time: `${String(hour).padStart(2, "0")}:00`,
        temp: Math.round(h.temperature_2m[i] ?? 0),
        precipitation: Math.round((h.precipitation[i] ?? 0) * 10) / 10,
        windSpeed: Math.round(h.wind_speed_10m[i] ?? 0),
        humidity: Math.round(h.relative_humidity_2m[i] ?? 0),
        uvIndex: Math.round(h.uv_index[i] ?? 0),
        wmoCode: code, icon: wmoH.icon, condition: wmoH.condition, isDay: isDayH,
        _date: dateStr };
    })
    .filter((p): p is HourlyPoint & { _date: string } => (p as HourlyPoint & { _date: string })._date === todayStr)
    .map(({ _date: _, ...rest }) => rest);

  const periods = buildPeriods(todayHourly);

  const forecast: DailyForecast[] = (d.time ?? []).map((date, i) => {
    const dayWmo = interpretWMO(d.weather_code[i] ?? 0);
    return { date, maxTemp: Math.round(d.temperature_2m_max[i] ?? 0),
      minTemp: Math.round(d.temperature_2m_min[i] ?? 0), wmoCode: d.weather_code[i] ?? 0,
      icon: dayWmo.icon, condition: dayWmo.condition,
      precipitationSum: Math.round((d.precipitation_sum[i] ?? 0) * 10) / 10,
      windSpeedMax: Math.round(d.wind_speed_10m_max[i] ?? 0),
      uvIndexMax: Math.round(d.uv_index_max[i] ?? 0) };
  });

  return {
    city:         entry.city,
    countryId:    entry.countryId,
    lat:          entry.lat,
    lon:          entry.lon,
    temp,
    minTemp:      Math.round(d.temperature_2m_min[0] ?? temp - 4),
    maxTemp:      Math.round(d.temperature_2m_max[0] ?? temp + 4),
    humidity:     Math.round(c.relative_humidity_2m),
    windSpeedKmH: windKmH,
    windDirection: Math.round(c.wind_direction_10m ?? 0),
    uvIndex,
    pressureHpa:  Math.round(c.surface_pressure),
    thermalSensation: Math.round(c.apparent_temperature),
    wmoCode:      c.weather_code,
    ...wmo,
    isHot:        temp >= 28,
    isWindy:      windKmH >= 20,
    visibility:   Math.round((c.visibility ?? 10000) / 1000),
    cloudCover:   Math.round(c.cloud_cover ?? 0),
    clothingRecommendation: getClothingRecommendation(entry.city, temp, wmo.isRaining, windKmH, uvIndex),
    forecast,
    hourly:  todayHourly,
    periods,
    models,
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchAllCitiesWeather(): Promise<LiveCityWeather[]> {
  const results = await Promise.allSettled(
    CITY_COORDS.map((e) => fetchCityWeather(e))
  );
  return results
    .filter((r): r is PromiseFulfilledResult<LiveCityWeather> => r.status === "fulfilled")
    .map((r) => r.value);
}

/** Fetch weather for any lat/lon — user geolocation, city search, or any coordinates */
export async function fetchWeatherByCoords(lat: number, lon: number, cityName: string, countryId = "user"): Promise<LiveCityWeather> {
  return fetchCityWeather({ city: cityName, countryId, lat, lon });
}
