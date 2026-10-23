import { NextResponse } from "next/server";
import { fetchAllCitiesWeather } from "@/lib/weather";

export const revalidate = 300; // 5 minutos de cache en Next.js ISR

export async function GET() {
  try {
    const cities = await fetchAllCitiesWeather();
    return NextResponse.json(
      { cities, updatedAt: new Date().toISOString() },
      {
        headers: {
          // Permite al cliente re-validar cada 5 minutos
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching live weather:", error);
    return NextResponse.json(
      { error: "No se pudo obtener el clima en vivo. Usando datos de respaldo." },
      { status: 502 }
    );
  }
}
