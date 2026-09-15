"use client";

import { CandlestickSeries, ColorType, createChart, HistogramSeries, type IChartApi, type UTCTimestamp } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { useCandles } from "@/lib/api";
import { formatPrice } from "@/lib/format";

const INTERVALS = [
  { s: 60, label: "1m" },
  { s: 300, label: "5m" },
  { s: 3600, label: "1h" },
  { s: 86400, label: "1d" },
];

export const CHART_THEME = {
  text: "#7c786a",
  grid: "#e9e3d3",
  border: "#c4bba2",
  crosshair: "#b8892a",
  up: "#0f7a4c",
  down: "#b3321c",
  volume: "#b8892a55",
};

export function CoinChart({ token }: { token: string }) {
  const [interval, setInterval] = useState(300);
  const { data: candles } = useCandles(token, interval);
  const el = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<{ price: ReturnType<IChartApi["addSeries"]>; volume: ReturnType<IChartApi["addSeries"]> } | null>(null);

  useEffect(() => {
    if (!el.current) return;
    const chart = createChart(el.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: CHART_THEME.text,
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: 10.5,
      },
      grid: { vertLines: { color: CHART_THEME.grid }, horzLines: { color: CHART_THEME.grid } },
      rightPriceScale: { borderColor: CHART_THEME.border },
      timeScale: { borderColor: CHART_THEME.border, timeVisible: true, secondsVisible: false },
      crosshair: { vertLine: { color: CHART_THEME.crosshair }, horzLine: { color: CHART_THEME.crosshair } },
      localization: { priceFormatter: (p: number) => `$${formatPrice(p)}` },
    });
    const price = chart.addSeries(CandlestickSeries, {
      upColor: CHART_THEME.up,
      downColor: CHART_THEME.down,
      borderVisible: false,
      wickUpColor: CHART_THEME.up,
      wickDownColor: CHART_THEME.down,
      priceFormat: { type: "custom", minMove: 1e-12, formatter: (p: number) => `$${formatPrice(p)}` },
    });
    const volume = chart.addSeries(HistogramSeries, { color: CHART_THEME.volume, priceScaleId: "vol", priceFormat: { type: "volume" } });
    chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.84, bottom: 0 } });
    chartRef.current = chart;
    seriesRef.current = { price, volume };
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !candles) return;
    // Candles store the pool price after each trade; open each bar at the previous close so bars connect.
    let prevClose: number | undefined;
    const bars = candles.map((c) => {
      const open = prevClose ?? c.open;
      prevClose = c.close;
      return {
        time: c.bucket as UTCTimestamp,
        open,
        high: Math.max(c.high, open),
        low: Math.min(c.low, open),
        close: c.close,
      };
    });
    seriesRef.current.price.setData(bars);
    seriesRef.current.volume.setData(
      candles.map((c) => ({ time: c.bucket as UTCTimestamp, value: c.volumeUsd, color: c.close >= c.open ? "#0f7a4c44" : "#b3321c44" })),
    );
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="eyebrow">Price · USD</span>
        <div className="seg">
          {INTERVALS.map((i) => (
            <button key={i.s} data-active={interval === i.s} onClick={() => setInterval(i.s)}>
              {i.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <div ref={el} className="chart-box" />
        {candles && candles.length === 0 && (
          <div className="empty" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
            No trades in this interval yet
          </div>
        )}
      </div>
    </div>
  );
}
