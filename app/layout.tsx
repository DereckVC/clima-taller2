import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoClima Global | Centro de Comando Climático & IA Planetaria",
  description: "Plataforma de inteligencia climática planetaria y asistente IA Aura para monitoreo en tiempo real, análisis de países (Perú, Brasil, España y más) y misiones de acción ambiental."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
