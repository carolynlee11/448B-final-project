// src/StarRatingMix.tsx
import React, { useEffect, useState } from "react";
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

type RatingPoint = {
  month: string; // "YYYY-MM"
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
  r1: "#4c1d95", // deep purple
  r2: "#1d4ed8", // blue
  r3: "#0d9488", // teal
  r4: "#22c55e", // green
  r5: "#eab308", // yellow
};

type StarRatingMixProps = {
  active?: boolean; // whether the page is currently visible in the flipbook
};

export const StarRatingMix: React.FC<StarRatingMixProps> = ({
  active = true,
}) => {
  const [data, setData] = useState<RatingPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // which ratings are currently visible
  const [visibleRatings, setVisibleRatings] = useState<RatingKey[]>([
    "r1",
    "r2",
    "r3",
    "r4",
    "r5",
  ]);

  // hover-driven state for the narrative
  const [activePoint, setActivePoint] = useState<RatingPoint | null>(null);

  useEffect(() => {
    Papa.parse("/data/monthly_star_rating_proportions.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = res.data as any[];

        const parsed: RatingPoint[] = rows.map((r) => {
          const month = String(r["year_month"]).slice(0, 7); // "2018-01"

          const r1 = parseFloat(r["1.0"] ?? 0) || 0;
          const r2 = parseFloat(r["2.0"] ?? 0) || 0;
          const r3 = parseFloat(r["3.0"] ?? 0) || 0;
          const r4 = parseFloat(r["4.0"] ?? 0) || 0;
          const r5 = parseFloat(r["5.0"] ?? 0) || 0;

          return { month, r1, r2, r3, r4, r5 };
        });

        setData(parsed);
        setActivePoint(parsed[parsed.length - 1] ?? null);
        setLoading(false);
      },
    });
  }, []);

  const toggleRating = (key: RatingKey) => {
    setVisibleRatings((curr) =>
      curr.includes(key) ? curr.filter((k) => k !== key) : [...curr, key]
    );
  };

  const handleMouseMove = (state: any) => {
    if (!state || !state.activePayload || !state.activePayload[0]) return;
    const point = state.activePayload[0].payload as RatingPoint;
    setActivePoint(point);
  };

  const handleMouseLeave = () => {
    // keep last activePoint so the text doesn’t disappear
  };

  if (loading || data.length === 0) {
    return (
      <div className="macro-chart-shell">
        <p className="macro-loading">Loading star rating mix over time…</p>
      </div>
    );
  }

  // --- dynamic Y domain based on visible ratings (stack max) ---
  const maxStack = (() => {
    if (!data.length || !visibleRatings.length) return 1;
    let max = 0;
    for (const p of data) {
      let sum = 0;
      for (const key of visibleRatings) {
        sum += p[key];
      }
      if (sum > max) max = sum;
    }
    return Math.min(1, Math.max(0, max));
  })();

  const summary =
    activePoint &&
    (() => {
      const month = activePoint.month;
      const pct = (k: RatingKey) => (activePoint[k] * 100).toFixed(1) + "%";

      return `In ${month}, ${pct("r5")} of reviews were 5-star and ${pct(
        "r1"
      )} were 1-star, with the remaining share spread across 2–4★ ratings.`;
    })();

  return (
    <div className="macro-chart-shell">
      {/* Toggle chips above the chart */}
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

      {active ? (
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 10 }}
              label={{
                value: "Month",
                position: "insideBottom",
                dy: 18,
                style: { fontSize: 10 },
              }}
            />

            <YAxis
              tick={{ fontSize: 10 }}
              domain={[0, maxStack]} // dynamic scale that adapts to toggles
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              label={{
                value: "Proportion of reviews",
                angle: -90,
                position: "insideLeft",
                dx: -6,
                style: { fontSize: 10 },
              }}
            />

            <Tooltip
              formatter={(v: number, key: any) => {
                const labelMap: Record<string, string> = {
                  r1: "1★",
                  r2: "2★",
                  r3: "3★",
                  r4: "4★",
                  r5: "5★",
                };
                return [`${(v * 100).toFixed(2)}%`, labelMap[key] ?? key];
              }}
              labelFormatter={(v) => v}
            />

            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ fontSize: 10, paddingBottom: 8 }}
              formatter={(value: string) => {
                const map: Record<string, string> = {
                  r1: "1★",
                  r2: "2★",
                  r3: "3★",
                  r4: "4★",
                  r5: "5★",
                };
                return map[value] ?? value;
              }}
            />

            {/* Brush / slider with a clean bar at the bottom */}
            <Brush
              dataKey="month"
              height={20}
              stroke="#9ca3af"
              travellerWidth={8}
              fill="#f9fafb"
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
        // Keep the layout height even when not active
        <div style={{ height: 340 }} />
      )}


    </div>
  );
};
