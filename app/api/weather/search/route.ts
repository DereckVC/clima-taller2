import { NextResponse } from "next/server";
import { fetchCityWeather } from "@/lib/weather";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  try {
    // If direct lat/lon provided (from browser geolocation)
    if (lat && lon) {
      const cityName = searchParams.get("city") ?? "Tu ubicación";
      const data = await fetchCityWeather({
        city: cityName, countryId: "user",
        lat: Number(lat), lon: Number(lon),
      });
      return NextResponse.json(data);
    }

    if (!query) return NextResponse.json({ error: "Parámetro ?q= requerido" }, { status: 400 });

    // Open-Meteo Geocoding API — free, no key
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=es&format=json`,
      { next: { revalidate: 86400 } }
    );
    const geoData = await geoRes.json() as {
      results?: Array<{ name: string; country: string; country_code: string; latitude: number; longitude: number; admin1?: string }>
    };

    const place = geoData.results?.[0];
    if (!place) return NextResponse.json({ error: `No se encontró "${query}"` }, { status: 404 });

    const data = await fetchCityWeather({
      city: place.name,
      countryId: place.country_code.toLowerCase(),
      lat: place.latitude,
      lon: place.longitude,
    });

    return NextResponse.json({ ...data, country: place.country, admin1: place.admin1 });
  } catch (err) {
    console.error("Weather search error:", err);
    return NextResponse.json({ error: "Error al obtener el clima" }, { status: 502 });
  }
}

