// src/MacroTrends.tsx
import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ReviewRow = {
  product_type?: string;
  date_posted?: string;  // your cleaned column
  reviewTime?: string;   // fallback if present
  rating?: string | number;
};

type SeriesKey = "dress" | "professional";

const SERIES_META: Record<SeriesKey, { label: string }> = {
  dress: { label: "Dress" },
  professional: { label: "Professional" },
};

type MonthlyPoint = {
  month: string;           // "2018-01"
  dress: number;
  professional: number;
};

export const MacroTrends: React.FC = () => {
  const [rows, setRows] = useState<ReviewRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [series, setSeries] = useState<SeriesKey>("dress");

  useEffect(() => {
    // ⚠️ Put df_reviews.csv in public/data/
    const url = "/data/df_reviews.csv";

    Papa.parse<ReviewRow>(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setRows(result.data);
      },
      error: (err) => {
        console.error("Error loading df_reviews.csv", err);
        setError("Could not load reviews data.");
      },
    });
  }, []);

  const data: MonthlyPoint[] = useMemo(() => {
    if (!rows) return [];

    const counts: Record<
      string,
      { dress: number; professional: number }
    > = {};

    for (const r of rows) {
      const pt = r.product_type?.toLowerCase() ?? "";
      const rawDate = r.date_posted ?? r.reviewTime;
      if (!rawDate) continue;

      const d = new Date(rawDate);
      if (Number.isNaN(d.getTime())) continue;

      const year = d.getFullYear();
      if (year < 2018 || year > 2021) continue;

      const monthKey = `${year}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      if (!counts[monthKey]) {
        counts[monthKey] = { dress: 0, professional: 0 };
      }

      if (pt === "dress") {
        counts[monthKey].dress += 1;
      } else if (pt === "professional") {
        counts[monthKey].professional += 1;
      }
    }

    // turn into sorted array
    const monthKeys = Object.keys(counts).sort();
    return monthKeys.map((m) => ({
      month: m,
      dress: counts[m].dress,
      professional: counts[m].professional,
    }));
  }, [rows]);

  if (error) {
    return (
      <div className="macro-root">
        <p className="macro-error">{error}</p>
      </div>
    );
  }

  if (!rows || data.length === 0) {
    return (
      <div className="macro-root">
        <p className="macro-loading">Loading review trends from df_reviews…</p>
      </div>
    );
  }

  return (
    <div className="macro-root">
      <div className="macro-header">
        <p className="macro-label">Scene 01 · Macro trends</p>
        <h2 className="macro-title">
          How does attention to each category move through the downturn?
        </h2>
        <p className="macro-copy">
          Each point is the number of reviews in a month — a rough proxy for how
          much attention a category is getting. Toggle between dresses and
          professional wear to see how differently they react around 2020.
        </p>

        <div className="macro-toggle">
          {(["dress", "professional"] as SeriesKey[]).map((key) => (
            <button
              key={key}
              type="button"
              className={
                "macro-toggle-btn" +
                (series === key ? " macro-toggle-btn--active" : "")
              }
              onClick={() => setSeries(key)}
            >
              {SERIES_META[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="macro-chart-shell">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => v}
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              labelFormatter={(v) => v}
              formatter={(value: number) => [value, "Review count"]}
            />
            <Line
              type="monotone"
              dataKey={series}
              stroke="#111827"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="macro-footnote">
          Filtered to 2018–2021 to match the analysis window used in the
          notebook.
        </p>
      </div>
    </div>
  );
};
