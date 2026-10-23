export type CityWeather = {
  city: string;
  isCapital: boolean;
  temp: number; // °C actual
  minTemp: number; // °C mínima
  maxTemp: number; // °C máxima
  condition: string; // ej: "Soleado", "Parcialmente nublado", "Llovizna suave"
  icon: string; // emoji icon: ☀️, ⛅, 🌧️, 🌤️, ☁️
  humidity: number; // %
  windSpeedKmH: number; // km/h
  uvIndex: number; // 1 - 12+
  pressureHpa: number; // hPa
  thermalSensation: number; // °C
  clothingRecommendation: string;
  // Weather state flags for clean filtering
  isRaining: boolean;
  isHot: boolean;
  isWindy: boolean;
  isSunny: boolean;
};

export type CountryClimateData = {
  id: string;
  name: string;
  code: string;
  flag: string;
  region: string;
  capital: string;
  cities: CityWeather[];
  summary: string;
};

export const countriesData: CountryClimateData[] = [
  {
    id: "peru",
    name: "Perú",
    code: "PE",
    flag: "🇵🇪",
    region: "Sudamérica",
    capital: "Lima",
    cities: [
      {
        city: "Lima",
        isCapital: true,
        temp: 21,
        minTemp: 17,
        maxTemp: 23,
        condition: "Parcialmente nublado con resolana costera",
        icon: "⛅",
        humidity: 84,
        windSpeedKmH: 16,
        uvIndex: 7,
        pressureHpa: 1014,
        thermalSensation: 21,
        clothingRecommendation: "Ropa ligera de día y casaca delgada para la brisa nocturna.",
        isRaining: false,
        isHot: true,
        isWindy: true,
        isSunny: false
      },
      {
        city: "Huancayo",
        isCapital: false,
        temp: 15,
        minTemp: 4,
        maxTemp: 19,
        condition: "Cielo azul andino despejado y sol radiante",
        icon: "☀️",
        humidity: 46,
        windSpeedKmH: 12,
        uvIndex: 12,
        pressureHpa: 695,
        thermalSensation: 15,
        clothingRecommendation: "Vestir en capas: polo manga larga y sombrero con filtro UV de día; casaca abrigadora para la noche fría.",
        isRaining: false,
        isHot: false,
        isWindy: false,
        isSunny: true
      }
    ],
    summary: "Contraste meteorológico entre la costa húmeda de Lima (84% humedad) y el clima andino de altura en Huancayo (UV 12 y noches frías)."
  },
  {
    id: "spain",
    name: "España",
    code: "ES",
    flag: "🇪🇸",
    region: "Europa / Península Ibérica",
    capital: "Madrid",
    cities: [
      {
        city: "Madrid",
        isCapital: true,
        temp: 19,
        minTemp: 10,
        maxTemp: 22,
        condition: "Soleado y despejado",
        icon: "☀️",
        humidity: 48,
        windSpeedKmH: 10,
        uvIndex: 5,
        pressureHpa: 1018,
        thermalSensation: 19,
        clothingRecommendation: "Ropa de entretiempo con chaqueta ligera para las primeras horas.",
        isRaining: false,
        isHot: false,
        isWindy: false,
        isSunny: true
      }
    ],
    summary: "Clima mediterráneo continentalizado con ambiente seco y luminoso."
  },
  {
    id: "brazil",
    name: "Brasil",
    code: "BR",
    flag: "🇧🇷",
    region: "Sudamérica / Meseta Central",
    capital: "Brasilia",
    cities: [
      {
        city: "Brasilia",
        isCapital: true,
        temp: 28,
        minTemp: 18,
        maxTemp: 30,
        condition: "Cálido con nubes dispersas",
        icon: "🌤️",
        humidity: 58,
        windSpeedKmH: 14,
        uvIndex: 9,
        pressureHpa: 1012,
        thermalSensation: 29,
        clothingRecommendation: "Ropa fresca de verano e hidratación continua.",
        isRaining: false,
        isHot: true,
        isWindy: false,
        isSunny: true
      }
    ],
    summary: "Clima tropical de sabana cálido y soleado durante el día."
  },
  {
    id: "usa",
    name: "Estados Unidos",
    code: "US",
    flag: "🇺🇸",
    region: "Norteamérica",
    capital: "Washington D.C.",
    cities: [
      {
        city: "Washington D.C.",
        isCapital: true,
        temp: 16,
        minTemp: 8,
        maxTemp: 18,
        condition: "Fresco con viento notable y cielo nublado",
        icon: "☁️",
        humidity: 65,
        windSpeedKmH: 18,
        uvIndex: 4,
        pressureHpa: 1016,
        thermalSensation: 15,
        clothingRecommendation: "Chaqueta cortavientos o abrigo liviano.",
        isRaining: false,
        isHot: false,
        isWindy: true,
        isSunny: false
      }
    ],
    summary: "Ambiente templado con rachas de viento fresco y nubosidad uniforme."
  },
  {
    id: "japan",
    name: "Japón",
    code: "JP",
    flag: "🇯🇵",
    region: "Asia Oriental",
    capital: "Tokio",
    cities: [
      {
        city: "Tokio",
        isCapital: true,
        temp: 18,
        minTemp: 11,
        maxTemp: 21,
        condition: "Despejado y templado agradable",
        icon: "🌤️",
        humidity: 52,
        windSpeedKmH: 11,
        uvIndex: 5,
        pressureHpa: 1019,
        thermalSensation: 18,
        clothingRecommendation: "Chaqueta casual o suéter para la tarde.",
        isRaining: false,
        isHot: false,
        isWindy: false,
        isSunny: true
      }
    ],
    summary: "Día agradable con excelente visibilidad y brisa suave."
  },
  {
    id: "france",
    name: "Francia",
    code: "FR",
    flag: "🇫🇷",
    region: "Europa Occidental",
    capital: "París",
    cities: [
      {
        city: "París",
        isCapital: true,
        temp: 15,
        minTemp: 9,
        maxTemp: 17,
        condition: "Llovizna suave intermitente con viento fresco",
        icon: "🌧️",
        humidity: 75,
        windSpeedKmH: 17,
        uvIndex: 3,
        pressureHpa: 1013,
        thermalSensation: 14,
        clothingRecommendation: "Gabardina impermeable y paraguas.",
        isRaining: true,
        isHot: false,
        isWindy: true,
        isSunny: false
      }
    ],
    summary: "Clima oceánico templado con precipitaciones ligeras."
  },
  {
    id: "colombia",
    name: "Colombia",
    code: "CO",
    flag: "🇨🇴",
    region: "Sudamérica / Andes del Norte",
    capital: "Bogotá",
    cities: [
      {
        city: "Bogotá",
        isCapital: true,
        temp: 17,
        minTemp: 8,
        maxTemp: 19,
        condition: "Nublado con chubascos intermitentes",
        icon: "🌧️",
        humidity: 76,
        windSpeedKmH: 13,
        uvIndex: 8,
        pressureHpa: 745,
        thermalSensation: 16,
        clothingRecommendation: "Chompa o buzo abrigador y paraguas para la lluvia.",
        isRaining: true,
        isHot: false,
        isWindy: false,
        isSunny: false
      }
    ],
    summary: "Frío andino ecuatorial constante con lloviznas vespertinas."
  }
];

export function findCountry(query: string): CountryClimateData | undefined {
  const normalized = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (/\b(huancayo|lima|peru)\b/i.test(normalized)) {
    return countriesData.find((c) => c.id === "peru");
  }

  return countriesData.find((country) => {
    const countryNorm = country.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const capitalNorm = country.capital.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (new RegExp(`\\b${countryNorm}\\b`, "i").test(normalized) || new RegExp(`\\b${capitalNorm}\\b`, "i").test(normalized)) return true;
    // Only match country code if uppercase in original query (e.g. "clima en ES")
    const codeRegex = new RegExp(`\\b${country.code}\\b`);
    return codeRegex.test(query);
  });
}

export function findCityWeather(cityName: string): { country: CountryClimateData; city: CityWeather } | undefined {
  const normalized = cityName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (const country of countriesData) {
    for (const city of country.cities) {
      const cityNorm = city.city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const regex = new RegExp(`\\b${cityNorm}\\b`, "i");
      if (regex.test(normalized)) {
        return { country, city };
      }
    }
  }

  const country = findCountry(cityName);
  if (country && country.cities[0]) {
    return { country, city: country.cities[0] };
  }

  return undefined;
}
