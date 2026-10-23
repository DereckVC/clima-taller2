"use client";
/**
 * TempChart.tsx
 * Gráfica de temperatura máx/mín de 7 días usando Chart.js puro (canvas).
 * No usa react-chartjs-2 para evitar problemas de SSR en Next.js 15.
 */
import { useEffect, useRef } from "react";
import type { DailyForecast } from "@/lib/weather";

type Props = {
  forecast: DailyForecast[];
  accentColor?: string;
};

export default function TempChart({ forecast, accentColor = "#38bdf8" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || forecast.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const PAD = { top: 8, right: 12, bottom: 22, left: 28 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top  - PAD.bottom;

    const maxTemps = forecast.map((d) => d.maxTemp);
    const minTemps = forecast.map((d) => d.minTemp);
    const allTemps = [...maxTemps, ...minTemps];
    const dataMin  = Math.min(...allTemps) - 2;
    const dataMax  = Math.max(...allTemps) + 2;
    const range    = dataMax - dataMin;

    const days = forecast.length;
    const xStep = chartW / (days - 1);
    const yScale = (v: number) => PAD.top + chartH - ((v - dataMin) / range) * chartH;
    const xScale = (i: number) => PAD.left + i * xStep;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth   = 1;
    for (let t = 0; t <= 4; t++) {
      const y = PAD.top + (chartH / 4) * t;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(W - PAD.right, y);
      ctx.stroke();
    }

    // Helper: draw area + line
    function drawLine(temps: number[], color: string, fillColor: string) {
      const points = temps.map((t, i) => ({ x: xScale(i), y: yScale(t) }));

      // Fill area
      const grad = ctx!.createLinearGradient(0, PAD.top, 0, H - PAD.bottom);
      grad.addColorStop(0, fillColor);
      grad.addColorStop(1, "transparent");
      ctx!.beginPath();
      ctx!.moveTo(points[0]!.x, H - PAD.bottom);
      points.forEach(p => ctx!.lineTo(p.x, p.y));
      ctx!.lineTo(points[points.length - 1]!.x, H - PAD.bottom);
      ctx!.closePath();
      ctx!.fillStyle = grad;
      ctx!.fill();

      // Line
      ctx!.beginPath();
      ctx!.moveTo(points[0]!.x, points[0]!.y);
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]!;
        const curr = points[i]!;
        const cpX = (prev.x + curr.x) / 2;
        ctx!.bezierCurveTo(cpX, prev.y, cpX, curr.y, curr.x, curr.y);
      }
      ctx!.strokeStyle = color;
      ctx!.lineWidth   = 2;
      ctx!.lineJoin    = "round";
      ctx!.stroke();

      // Dots
      points.forEach((p, i) => {
        if (i === 0) {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
          ctx!.fillStyle = color;
          ctx!.fill();
        }
      });
    }

    // Parse accent as base for min line
    drawLine(maxTemps, accentColor, accentColor.replace(")", ",0.2)").replace("rgb", "rgba").replace("#38bdf8", "rgba(56,189,248,0.15)"));
    drawLine(minTemps, "rgba(148,163,184,0.7)", "rgba(148,163,184,0.05)");

    // X axis labels (day abbr)
    const dayNames = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
    ctx.fillStyle   = "rgba(100,116,128,0.9)";
    ctx.font        = `600 9px Inter, sans-serif`;
    ctx.textAlign   = "center";
    forecast.forEach((d, i) => {
      const dateObj = new Date(d.date + "T12:00:00");
      const label = i === 0 ? "Hoy" : dayNames[dateObj.getDay()] ?? "";
      ctx.fillText(label, xScale(i), H - 6);
    });

    // Y axis labels
    ctx.textAlign  = "right";
    ctx.fillStyle  = "rgba(100,116,128,0.7)";
    ctx.font       = `500 9px Inter, sans-serif`;
    const yTicks = 3;
    for (let t = 0; t <= yTicks; t++) {
      const val = dataMin + (range / yTicks) * t;
      ctx.fillText(`${Math.round(val)}°`, PAD.left - 4, yScale(val) + 3);
    }
  }, [forecast, accentColor]);

  return (
    <div className="chart-wrapper">
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
