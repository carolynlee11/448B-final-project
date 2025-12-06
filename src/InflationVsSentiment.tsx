// src/InflationVsSentiment.tsx
import React, { useEffect, useState } from "react";
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

type ReviewRow = {
  date_posted?: string;
  rating?: string | number;
};

type InflationRow = {
  observation_date?: string;
  CPIAUCSL?: string | number;
};

type MergedPoint = {
  month: string;
  prop_1star: number | null;
  inflation_yoy: number | null;
};

export const InflationVsSentiment: React.FC = () => {
  const [data, setData] = useState<MergedPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Stream df_reviews.csv and aggregate 1-star proportions by month
    const countsByMonth: Record<
      string,
      { total: number; oneStar: number }
    > = {};

    const loadReviews = () =>
      new Promise<void>((resolve, reject) => {
        Papa.parse<ReviewRow>("/data/df_reviews.csv", {
          download: true,
          header: true,
          worker: true,
          skipEmptyLines: true,
          step: (row) => {
            const r = row.data;
            const rawDate = r.date_posted;
            if (!rawDate) return;

            const d = new Date(rawDate);
            if (Number.isNaN(d.getTime())) return;

            const year = d.getFullYear();
            if (year < 2018 || year > 2022) return;

            const monthKey = `${year}-${String(d.getMonth() + 1).padStart(
              2,
              "0"
            )}`;

            const ratingNum = typeof r.rating === "string"
              ? parseFloat(r.rating)
              : r.rating;

            if (!countsByMonth[monthKey]) {
              countsByMonth[monthKey] = { total: 0, oneStar: 0 };
            }

            if (!Number.isNaN(ratingNum as number)) {
              countsByMonth[monthKey].total += 1;
              if (ratingNum === 1) {
                countsByMonth[monthKey].oneStar += 1;
              }
            }
          },
          complete: () => resolve(),
          error: (err) => reject(err),
        });
      });

    // 2. Load CPIAUCSL.csv, compute YoY inflation, and bucket by month
    const inflationByMonth: Record<string, number> = {};

    const loadInflation = () =>
      new Promise<void>((resolve, reject) => {
        Papa.parse<InflationRow>("/data/CPIAUCSL.csv", {
          download: true,
          header: true,
          dynamicTyping: true,
          complete: (res) => {
            const rows = res.data as InflationRow[];

            // sort by date; build month->CPI map
            const parsed = rows
              .map((r) => {
                const d = r.observation_date
                  ? new Date(r.observation_date)
                  : null;
                const val = typeof r.CPIAUCSL === "string"
                  ? parseFloat(r.CPIAUCSL)
                  : (r.CPIAUCSL as number | undefined);

                if (!d || Number.isNaN(d.getTime()) || val == null) return null;
                return { d, v: val };
              })
              .filter((x): x is { d: Date; v: number } => x !== null)
              .sort((a, b) => a.d.getTime() - b.d.getTime());

            // compute 12-month YoY change
            for (let i = 12; i < parsed.length; i++) {
              const curr = parsed[i];
              const prev = parsed[i - 12];
              const yoy = (curr.v - prev.v) / prev.v; // fraction, not percent
              const monthKey = `${curr.d.getFullYear()}-${String(
                curr.d.getMonth() + 1
              ).padStart(2, "0")}`;
              inflationByMonth[monthKey] = yoy;
            }

            resolve();
          },
          error: (err) => reject(err),
        });
      });

    // 3. Run both, then merge
    Promise.all([loadReviews(), loadInflation()])
      .then(() => {
        const months = Object.keys(countsByMonth).sort();
        const merged: MergedPoint[] = months.map((m) => {
          const c = countsByMonth[m];
          const prop =
            c.total > 0 ? c.oneStar / c.total : null;
          const infl = inflationByMonth[m] ?? null;

          return {
            month: m,
            prop_1star: prop,
            inflation_yoy: infl,
          };
        });
        setData(merged);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error merging reviews + inflation", err);
        setError("Could not load inflation or sentiment data.");
        setLoading(false);
      });
  }, []);

  if (error) {
    return <div className="infl-root"><p className="macro-error">{error}</p></div>;
  }

  if (loading || data.length === 0) {
    return (
      <div className="infl-root">
        <p className="macro-loading">
          Comparing inflation with 1-star review share…
        </p>
      </div>
    );
  }

  return (
    <div className="infl-root">
      <div className="macro-header">
        <p className="macro-label">Scene 02 · Mood of the closet</p>
        <h2 className="macro-title">
          Do spikes in inflation travel into the reviews?
        </h2>
        <p className="macro-copy">
          The dark line tracks the share of 1-star reviews each month.
          The blue line shows year-over-year inflation. When living costs
          jump, do shoppers get harsher in how they rate the same clothes?
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10 }}
            label={{
              value: "Month",
              position: "insideBottom",
              dy: 12,
            }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 10 }}
            domain={[0, "dataMax"]}
            tickFormatter={(v) => `${(v * 100).toFixed(1)}%`}
            label={{
              value: "% of Reviews That Are 1-Star",
              angle: -90,
              position: "insideLeft",
              dx: -4,
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => `${(v * 100).toFixed(1)}%`}
            label={{
              value: "YOY Inflation",
              angle: 90,
              position: "insideRight",
              dx: 4,
            }}
          />
          <Tooltip
            formatter={(value: number, key) => {
              if (key === "prop_1star") {
                return [`${(value * 100).toFixed(2)}%`, "% 1-star reviews"];
              }
              if (key === "inflation_yoy") {
                return [`${(value * 100).toFixed(2)}%`, "YOY inflation"];
              }
              return [value, key];
            }}
            labelFormatter={(v) => v}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="prop_1star"
            stroke="#111827"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="inflation_yoy"
            stroke="#1d4ed8"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="macro-footnote">
        Both series are aggregated on the fly in the browser; no extra CSV exports required.
      </p>
    </div>
  );
};
