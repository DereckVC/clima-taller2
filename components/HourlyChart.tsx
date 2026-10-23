"use client";
/**
 * HourlyChart.tsx
 * Shows today's hourly temperature (line), precipitation (bars), and wind (dots)
 * in a Meteored-style canvas chart. No external dependencies.
 */
import { useEffect, useRef, useState } from "react";
import type { HourlyPoint } from "@/lib/weather";

type Tab = "temp" | "precip" | "wind";

type Props = {
  hourly: HourlyPoint[];
  accentColor?: string;
  cityName?: string;
};

export default function HourlyChart({ hourly, accentColor = "#38bdf8", cityName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<Tab>("temp");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || hourly.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const PAD = { top: 24, right: 12, bottom: 36, left: 36 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top  - PAD.bottom;

    ctx.clearRect(0, 0, W, H);

    // Background grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = PAD.top + (chartH / 4) * i;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(W - PAD.right, y); ctx.stroke();
    }

    const n = hourly.length;
    const xAt = (i: number) => PAD.left + (i / (n - 1)) * chartW;

    if (tab === "temp") {
      const vals = hourly.map(h => h.temp);
      const lo = Math.min(...vals) - 2;
      const hi = Math.max(...vals) + 2;
      const yAt = (v: number) => PAD.top + chartH - ((v - lo) / (hi - lo)) * chartH;

      // Fill gradient under curve
      const grad = ctx.createLinearGradient(0, PAD.top, 0, H - PAD.bottom);
      grad.addColorStop(0, accentColor + "44");
      grad.addColorStop(1, accentColor + "00");
      ctx.beginPath();
      ctx.moveTo(xAt(0), H - PAD.bottom);
      vals.forEach((v, i) => ctx.lineTo(xAt(i), yAt(v)));
      ctx.lineTo(xAt(n - 1), H - PAD.bottom);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Smooth line
      ctx.beginPath();
      ctx.moveTo(xAt(0), yAt(vals[0]!));
      for (let i = 1; i < n; i++) {
        const cx = (xAt(i - 1) + xAt(i)) / 2;
        ctx.bezierCurveTo(cx, yAt(vals[i - 1]!), cx, yAt(vals[i]!), xAt(i), yAt(vals[i]!));
      }
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.stroke();

      // Temp labels on key hours
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 9px Inter, sans-serif";
      ctx.textAlign = "center";
      [0, 6, 12, 18, 23].forEach(h => {
        const pt = hourly[h];
        if (!pt) return;
        ctx.fillStyle = accentColor;
        ctx.fillText(`${pt.temp}°`, xAt(h), yAt(pt.temp) - 6);
        // Dot
        ctx.beginPath();
        ctx.arc(xAt(h), yAt(pt.temp), 3, 0, Math.PI * 2);
        ctx.fillStyle = accentColor;
        ctx.fill();
      });

      // Y axis labels
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(148,163,184,0.8)";
      ctx.font = "500 9px Inter, sans-serif";
      for (let t = 0; t <= 4; t++) {
        const v = lo + ((hi - lo) / 4) * t;
        ctx.fillText(`${Math.round(v)}°`, PAD.left - 4, yAt(v) + 3);
      }

    } else if (tab === "precip") {
      const vals = hourly.map(h => h.precipitation);
      const hi = Math.max(...vals, 1);
      const yAt = (v: number) => PAD.top + chartH - (v / hi) * chartH;
      const barW = chartW / n * 0.6;

      vals.forEach((v, i) => {
        if (v <= 0) return;
        const x = xAt(i) - barW / 2;
        const y = yAt(v);
        const barH = (H - PAD.bottom) - y;
        const grad = ctx.createLinearGradient(0, y, 0, H - PAD.bottom);
        grad.addColorStop(0, "#38bdf8");
        grad.addColorStop(1, "#0ea5e944");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, [2, 2, 0, 0]);
        ctx.fill();
        if (v >= 0.5) {
          ctx.fillStyle = "#bae6fd";
          ctx.font = "bold 8px Inter, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`${v}`, xAt(i), y - 4);
        }
      });

      // Y labels
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(148,163,184,0.8)";
      ctx.font = "500 9px Inter, sans-serif";
      for (let t = 0; t <= 4; t++) {
        const v = (hi / 4) * t;
        ctx.fillText(`${v.toFixed(1)}`, PAD.left - 4, yAt(v) + 3);
      }

    } else if (tab === "wind") {
      const vals = hourly.map(h => h.windSpeed);
      const hi = Math.max(...vals, 5);
      const yAt = (v: number) => PAD.top + chartH - (v / hi) * chartH;

      // Area fill
      const grad = ctx.createLinearGradient(0, PAD.top, 0, H - PAD.bottom);
      grad.addColorStop(0, "#22d3ee44");
      grad.addColorStop(1, "#22d3ee00");
      ctx.beginPath();
      ctx.moveTo(xAt(0), H - PAD.bottom);
      vals.forEach((v, i) => ctx.lineTo(xAt(i), yAt(v)));
      ctx.lineTo(xAt(n - 1), H - PAD.bottom);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(xAt(0), yAt(vals[0]!));
      for (let i = 1; i < n; i++) {
        const cx = (xAt(i - 1) + xAt(i)) / 2;
        ctx.bezierCurveTo(cx, yAt(vals[i - 1]!), cx, yAt(vals[i]!), xAt(i), yAt(vals[i]!));
      }
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Labels
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(148,163,184,0.8)";
      ctx.font = "500 9px Inter, sans-serif";
      for (let t = 0; t <= 4; t++) {
        const v = (hi / 4) * t;
        ctx.fillText(`${Math.round(v)}`, PAD.left - 4, yAt(v) + 3);
      }
    }

    // X axis — hour labels every 3h
    ctx.fillStyle = "rgba(148,163,184,0.7)";
    ctx.font = "500 9px Inter, sans-serif";
    ctx.textAlign = "center";
    hourly.forEach((pt, i) => {
      if (i % 3 !== 0) return;
      ctx.fillText(pt.time, xAt(i), H - 6);
      // Tick
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xAt(i), PAD.top + chartH);
      ctx.lineTo(xAt(i), PAD.top + chartH + 4);
      ctx.stroke();
    });

  }, [hourly, tab, accentColor]);

  if (hourly.length === 0) return null;

  const tabLabel: Record<Tab, string> = { temp: "🌡️ Temperatura", precip: "🌧️ Precipitación (mm)", wind: "💨 Viento (km/h)" };

  return (
    <div className="hourly-chart-wrap">
      {cityName && <div className="hourly-chart-city">{cityName}</div>}
      <div className="hourly-chart-tabs">
        {(["temp", "precip", "wind"] as Tab[]).map(t => (
          <button
            key={t}
            className={`hourly-tab-btn ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {tabLabel[t]}
          </button>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "140px", display: "block" }}
      />
      <div className="hourly-row">
        {hourly.filter((_, i) => i % 3 === 0).map(pt => (
          <div key={pt.time} className="hourly-cell">
            <span className="hourly-time">{pt.time}</span>
            <span className="hourly-icon">{pt.icon}</span>
            <span className="hourly-temp">{pt.temp}°</span>
            {tab === "precip" && <span className="hourly-sub">{pt.precipitation}mm</span>}
            {tab === "wind"   && <span className="hourly-sub">{pt.windSpeed}km/h</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

