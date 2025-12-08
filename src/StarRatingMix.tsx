// src/StarRatingMix.tsx
import Papa from "papaparse";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Brush,
} from "recharts";
import { useEffect, useState } from "react";

type RatingPoint = {
  month: string;
  r1: number;
  r2: number;
  r3: number;
  r4: number;
  r5: number;
};

const RATING_KEYS = ["r1", "r2", "r3", "r4", "r5"] as const;
type RatingKey = (typeof RATING_KEYS)[number];

const RATING_LABEL: Record<RatingKey, string> = {
  r1: "1★",
  r2: "2★",
  r3: "3★",
  r4: "4★",
  r5: "5★",
};

const RATING_COLORS: Record<RatingKey, string> = {
  r1: "#4c1d95",
  r2: "#1d4ed8",
  r3: "#0d9488",
  r4: "#22c55e",
  r5: "#eab308",
};

type Props = {
  active?: boolean;
};

export const StarRatingMix: React.FC<Props> = ({ active = true }) => {
  const [data, setData] = useState<RatingPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const [visibleRatings, setVisibleRatings] = useState<RatingKey[]>([
    "r1",
    "r2",
    "r3",
    "r4",
    "r5",
  ]);

  useEffect(() => {
    Papa.parse("/data/monthly_star_rating_proportions.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (res) => {
        const parsed: RatingPoint[] = (res.data as any[]).map((r) => ({
          month: String(r["year_month"]).slice(0, 7),
          r1: parseFloat(r["1.0"] ?? 0) || 0,
          r2: parseFloat(r["2.0"] ?? 0) || 0,
          r3: parseFloat(r["3.0"] ?? 0) || 0,
          r4: parseFloat(r["4.0"] ?? 0) || 0,
          r5: parseFloat(r["5.0"] ?? 0) || 0,
        }));

        setData(parsed);
        setLoading(false);
      },
    });
  }, []);

  const toggleRating = (key: RatingKey) => {
    setVisibleRatings((curr) =>
      curr.includes(key)
        ? curr.filter((k) => k !== key)
        : [...curr, key]
    );
  };

  if (loading || data.length === 0) {
    return (
      <div className="macro-chart-shell">
        <p className="macro-loading">Loading star rating mix over time…</p>
      </div>
    );
  }

  const maxStack = (() => {
    let max = 0;
    for (const p of data) {
      let sum = 0;
      for (const k of visibleRatings) sum += p[k];
      if (sum > max) max = sum;
    }
    return Math.min(1, Math.max(0, max));
  })();

  return (
    <div className="macro-chart-shell">
      {/* Toggles */}
      <div className="macro-toggle-row" style={{ marginBottom: "0.75rem" }}>
        <span className="macro-toggle-label">Highlight ratings:</span>
        {RATING_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => toggleRating(key)}
            className={`macro-toggle-chip ${
              visibleRatings.includes(key) ? "is-active" : "is-muted"
            }`}
          >
            <span
              className="macro-toggle-swatch"
              style={{ backgroundColor: RATING_COLORS[key] }}
            />
            {RATING_LABEL[key]}
          </button>
        ))}
      </div>

      <h3 className="infl-chart-title">
        Proportion of Reviews by Star Rating Over Time (2018–2022)
      </h3>

      {active ? (
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
          >
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 10 }}
              label={{ value: "Month", position: "insideBottom", dy: 12 }}
            />

            <YAxis
              domain={[0, maxStack]}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              tick={{ fontSize: 10 }}
              label={{
                value: "Proportion of reviews",
                angle: -90,
                position: "insideLeft",
                dx: 5,
                dy: 60,
                fontSize: 12,
              }}
            />

            <Tooltip
              formatter={(v: number, key: any) => [
                `${(v * 100).toFixed(2)}%`,
                RATING_LABEL[key as RatingKey] ?? key,
              ]}
            />

            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ fontSize: 10, paddingBottom: 8 }}
              formatter={(value: any) => RATING_LABEL[value as RatingKey]}
            />

            <Brush
              dataKey="month"
              height={20}
              stroke="#9ca3af"
              fill="#f9fafb"
              travellerWidth={8}
              y={280}
            />

            {RATING_KEYS.map((key) =>
              visibleRatings.includes(key) ? (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  stroke={RATING_COLORS[key]}
                  fill={RATING_COLORS[key]}
                  fillOpacity={0.9}
                />
              ) : null
            )}
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: 340 }} />
      )}
    </div>
  );
};
