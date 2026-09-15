"use client";

import { ColorType, createChart, LineSeries, LineType, type IChartApi, type UTCTimestamp } from "lightweight-charts";
import { useEffect, useRef } from "react";
import { CHART_THEME } from "@/components/CoinChart";
import { formatPrice } from "@/lib/format";

/** Wall price over time. Moves are discrete, so the line is stepped and extended to now. */
export function AssetChart({ history, current }: { history: { t: number; p: number }[]; current: number }) {
  const el = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ReturnType<IChartApi["addSeries"]> | null>(null);

  useEffect(() => {
    if (!el.current) return;
    const chart = createChart(el.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: CHART_THEME.text, fontFamily: "IBM Plex Mono, monospace", fontSize: 10.5 },
      grid: { vertLines: { color: CHART_THEME.grid }, horzLines: { color: CHART_THEME.grid } },
      rightPriceScale: { borderColor: CHART_THEME.border },
      timeScale: { borderColor: CHART_THEME.border, timeVisible: true, secondsVisible: false },
      crosshair: { vertLine: { color: CHART_THEME.crosshair }, horzLine: { color: CHART_THEME.crosshair } },
      localization: { priceFormatter: (p: number) => `$${formatPrice(p)}` },
    });
    seriesRef.current = chart.addSeries(LineSeries, {
      color: "#ffb000",
      lineWidth: 2,
      lineType: LineType.WithSteps,
      priceFormat: { type: "custom", minMove: 1e-6, formatter: (p: number) => `$${formatPrice(p)}` },
    });
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;
    const now = Math.floor(Date.now() / 1000);
    const points = history.map((h) => ({ time: h.t as UTCTimestamp, value: h.p }));
    const last = points.at(-1);
    if (!last || last.time < now - 60) points.push({ time: now as UTCTimestamp, value: current });
    seriesRef.current.setData(points);
    chartRef.current?.timeScale().fitContent();
  }, [history, current]);

  return <div ref={el} style={{ height: 300 }} />;
}
