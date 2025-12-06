// src/MacroTrends.tsx
import React, { useEffect, useState } from "react";
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

type Row = {
  date_posted?: string;
  review_count?: string | number;
};

type CombinedPoint = {
  month: string; // "YYYY-MM"
  dress: number;
  suit: number;
  jacket: number;
  shoes: number;
  sweater: number;
};

type CategoryKey = "dress" | "suit" | "jacket" | "shoes" | "sweater";

const CATEGORY_META: Record<CategoryKey, { label: string; color: string }> = {
  dress: { label: "Dress", color: "#111827" }, // near-black
  suit: { label: "Suit", color: "#1d4ed8" }, // blue
  jacket: { label: "Jacket", color: "#16a34a" }, // green
  shoes: { label: "Shoes", color: "#b91c1c" }, // red
  sweater: { label: "Sweater", color: "#7c3aed" }, // purple
};

export const MacroTrends: React.FC = () => {
  const [data, setData] = useState<CombinedPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // which lines are visible
  const [visible, setVisible] = useState<Record<CategoryKey, boolean>>({
    dress: true,
    suit: true,
    jacket: true,
    shoes: true,
    sweater: true,
  });

  useEffect(() => {
    let cancelled = false;

    const parseCategory = (file: string): Promise<Record<string, number>> => {
      return new Promise((resolve, reject) => {
        Papa.parse<Row>(file, {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: (result: any) => {
            try {
              const rows: Row[] = result.data ?? [];
              const byMonth: Record<string, number> = {};

              for (const r of rows) {
                if (!r.date_posted) continue;

                const d = new Date(r.date_posted);
                if (Number.isNaN(d.getTime())) continue;

                const year = d.getFullYear();
                if (year < 2018 || year > 2022) continue;

                const monthKey = `${year}-${String(
                  d.getMonth() + 1
                ).padStart(2, "0")}-01`;

                let count: number;
                if (typeof r.review_count === "string") {
                  const parsed = parseInt(r.review_count, 10);
                  count = Number.isNaN(parsed) ? 0 : parsed;
                } else if (typeof r.review_count === "number") {
                  count = r.review_count;
                } else {
                  count = 0;
                }

                byMonth[monthKey] = (byMonth[monthKey] || 0) + count;
              }

              resolve(byMonth);
            } catch (e) {
              reject(e);
            }
          },
          error: (err) => {
            reject(err);
          },
        });
      });
    };

    const loadAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          dressByMonth,
          suitByMonth,
          jacketByMonth,
          shoesByMonth,
          sweaterByMonth,
        ] = await Promise.all([
          parseCategory("/data/dress_review_counts.csv"),
          parseCategory("/data/suit_review_counts.csv"),
          parseCategory("/data/jacket_review_counts.csv"),
          parseCategory("/data/shoes_review_counts.csv"),
          parseCategory("/data/sweater_review_counts.csv"),
        ]);

        if (cancelled) return;

        const allMonths = new Set([
          ...Object.keys(dressByMonth),
          ...Object.keys(suitByMonth),
          ...Object.keys(jacketByMonth),
          ...Object.keys(shoesByMonth),
          ...Object.keys(sweaterByMonth),
        ]);

        const months = Array.from(allMonths).sort();

        const combined: CombinedPoint[] = months.map((m) => ({
          month: m.slice(0, 7),
          dress: dressByMonth[m] ?? 0,
          suit: suitByMonth[m] ?? 0,
          jacket: jacketByMonth[m] ?? 0,
          shoes: shoesByMonth[m] ?? 0,
          sweater: sweaterByMonth[m] ?? 0,
        }));

        setData(combined);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setError(
          "Could not load review counts for dress, suit, jacket, shoes, and sweater."
        );
        setLoading(false);
      }
    };

    loadAll();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleCategory = (key: CategoryKey) => {
    setVisible((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (error) {
    return (
      <div className="macro-root">
        <p className="macro-error">{error}</p>
      </div>
    );
  }

  if (loading || data.length === 0) {
    return (
      <div className="macro-root">
        <p className="macro-loading">
          Loading dress, suit, jacket, shoes, and sweater review trends…
        </p>
      </div>
    );
  }

  return (
    <div className="macro-root">
      <div className="macro-header">
        <div className="macro-toggle">
          {(Object.keys(CATEGORY_META) as CategoryKey[]).map((key) => {
            const meta = CATEGORY_META[key];
            const isOn = visible[key];

            return (
              <button
                key={key}
                type="button"
                className={
                  "macro-toggle-btn" + (isOn ? " macro-toggle-btn--active" : "")
                }
                onClick={() => toggleCategory(key)}
              >
                <span
                  className="macro-toggle-dot"
                  style={{ backgroundColor: meta.color }}
                />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="macro-chart-shell">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 50, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 10 }}
              angle={-35}
              textAnchor="end"
              label={{
                value: "Month (2018–2022)",
                position: "insideBottom",
                dy: 30,
                fontSize: 12,
              }}
            />

            <YAxis
              tick={{ fontSize: 10 }}
              label={{
                value: "Number of Reviews",
                angle: -90,
                position: "insideLeft",
                dx: -35,
                fontSize: 12,
              }}
            />

            <Tooltip
              formatter={(val: number, key: string) => {
                const meta =
                  CATEGORY_META[key as CategoryKey] ?? { label: key };
                return [val, `${meta.label} reviews`];
              }}
              labelFormatter={(m) => m}
            />

            {(
              Object.keys(CATEGORY_META) as CategoryKey[]
            ).map((key) => {
              if (!visible[key]) return null;
              const meta = CATEGORY_META[key];
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={meta.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  name={meta.label}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>

        <p className="macro-footnote">
          Daily review counts were aggregated to months in the notebook. All
          series share the same y-axis, so relative shapes and spikes are
          directly comparable.
        </p>
      </div>
    </div>
  );
};
