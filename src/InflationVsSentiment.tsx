// src/InflationVsSentiment.tsx
import React, { useEffect, useState, useMemo } from "react";
import Papa from "papaparse";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type Point = {
  month: string;   // "YYYY-MM"
  value: number;   // 0–1
};

export const InflationVsSentiment: React.FC = () => {
  const [oneStar, setOneStar] = useState<Point[]>([]);
  const [inflation, setInflation] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  // Load just 1-star file
  const loadOneStar = () =>
    new Promise<void>((resolve) => {
      Papa.parse("/data/monthly_1star_review_proportion.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (res) => {
          const rows = res.data as any[];
          const parsed = rows.map((r) => {
            const month = String(r["year_month"]).slice(0, 7); // YYYY-MM
            const val = parseFloat(r["0"]);
            return { month, value: val };
          });
          setOneStar(parsed);
          resolve();
        },
      });
    });

  // Load inflation file
  const loadInflation = () =>
    new Promise<void>((resolve) => {
      Papa.parse("/data/inflation_data.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (res) => {
          const rows = res.data as any[];
          const parsed = rows.map((r) => {
            const month = String(r["observation_date"]).slice(0, 7);
            const val = parseFloat(r["inflation_yoy"]);
            return { month, value: val };
          });
          setInflation(parsed);
          resolve();
        },
      });
    });

  useEffect(() => {
    Promise.all([loadOneStar(), loadInflation()]).then(() =>
      setLoading(false)
    );
  }, []);

  // Shared X-axis ticks so vertical grid lines align
  const xTicks = useMemo(() => {
    const months = Array.from(
      new Set([...oneStar, ...inflation].map((p) => p.month))
    ).sort();

    if (months.length === 0) return [];

    const targetTicks = 7;
    const step = Math.max(1, Math.round(months.length / targetTicks));

    return months.filter((_, idx) => idx % step === 0);
  }, [oneStar, inflation]);

  if (loading) {
    return (
      <div className="infl-root">
        <p className="macro-loading">Loading inflation and sentiment…</p>
      </div>
    );
  }

  return (
    <div className="infl-root">
      {/* Two vertically stacked charts */}
      <div className="infl-chart-stack">
        {/* Chart 1: 1-star review share */}
        <div className="infl-chart">
          <h3 className="infl-chart-title">% of reviews that are 1-star</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={oneStar}
              margin={{ top: 10, right: 30, left: 0, bottom: 25 }}
            >
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              {/* No X label here to avoid crowding; bottom chart will have it */}
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10 }}
                ticks={xTicks}
                label={{
                  value: "Month",
                  position: "insideBottom",
                  dy: 18,
                  style: { fontSize: 10 },
                }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                domain={[0.10, 0.22]}                 // fixed, no weird 21.3 cap
                ticks={[0.10, 0.14, 0.18, 0.22]}      // evenly spaced ticks
                tickFormatter={(v) => `${(v * 100).toFixed(1)}%`}
                label={{
                  value: "% of reviews that are 1-star",
                  angle: -90,
                  position: "insideLeft",
                  dx: 5,
                  dy: 60,
                  style: { fontSize: 10 },
                }}
              />
              <Tooltip
                formatter={(v: number) => `${(v * 100).toFixed(2)}%`}
                labelFormatter={(v) => v}
              />
              <Line
                dataKey="value"
                stroke="#111827"
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: YOY inflation */}
        <div className="infl-chart">
          <h3 className="infl-chart-title">Year-over-year inflation</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={inflation}
              margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10 }}
                ticks={xTicks}
                label={{
                  value: "Month",
                  position: "insideBottom",
                  dy: 18,
                  style: { fontSize: 10 },
                }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `${(v * 100).toFixed(1)}%`}
                label={{
                  value: "Year-over-year inflation",
                  angle: -90,
                  position: "insideLeft",
                  dx: 5,
                  dy: 50,
                  style: { fontSize: 10 },
                }}
              />
              <Tooltip
                formatter={(v: number) => `${(v * 100).toFixed(2)}%`}
                labelFormatter={(v) => v}
              />
              <Line
                dataKey="value"
                stroke="#1d4ed8"
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
