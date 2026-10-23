import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Get client IP from headers (works behind Vercel/proxies)
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "";

    // ip-api.com free tier: 45 req/min, no key needed
    const apiUrl = ip
      ? `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon,timezone`
      : `http://ip-api.com/json/?fields=status,country,countryCode,regionName,city,lat,lon,timezone`;

    const res = await fetch(apiUrl, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("ip-api error");

    const data = await res.json() as {
      status: string; country: string; countryCode: string;
      regionName: string; city: string; lat: number; lon: number; timezone: string;
    };

    if (data.status !== "success") throw new Error("ip-api returned fail");

    return NextResponse.json({
      city: data.city,
      region: data.regionName,
      country: data.country,
      countryCode: data.countryCode,
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
    });
  } catch (err) {
    console.error("Geo locate error:", err);
    // Fallback: Lima, Perú
    return NextResponse.json({
      city: "Lima", region: "Lima", country: "Perú", countryCode: "PE",
      lat: -12.0464, lon: -77.0428, timezone: "America/Lima",
    });
  }
}

