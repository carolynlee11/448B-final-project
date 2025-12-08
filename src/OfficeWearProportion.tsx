// src/OfficeWearProportion.tsx
import Papa from "papaparse";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { useEffect, useState, useMemo } from "react";

type OfficePoint = {
  month: string;
  office_share: number;
};

type Props = {
  active?: boolean;
};

export const OfficeWearProportion: React.FC<Props> = ({ active = true }) => {
  const [data, setData] = useState<OfficePoint[]>([]);
  const [loading, setLoading] = useState(true);

  const [brushStart, setBrushStart] = useState(0);
  const [brushEnd, setBrushEnd] = useState(0);

  useEffect(() => {
    Papa.parse("/data/office_wear_proportion.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (res) => {
        const parsed: OfficePoint[] = (res.data as any[])
          .map((r) => {
            const month = String(r["date_first_available"])?.slice(0, 7);
            const val = parseFloat(r["proportion_professional"]);
            if (!month || Number.isNaN(val)) return null;
            return { month, office_share: val };
          })
          .filter((x): x is OfficePoint => x !== null);

        setData(parsed);
        setBrushStart(0);
        setBrushEnd(parsed.length - 1);
        setLoading(false);
      },
    });
  }, []);

  const yDomain = useMemo(() => {
    if (data.length === 0) return [0, 1];
    const vals = data.map((d) => d.office_share);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return [Math.max(0, min - 0.01), max + 0.01];
  }, [data]);

  const yTicks = useMemo(() => {
    const [min, max] = yDomain;
    const n = 5;
    const step = (max - min) / (n - 1);
    return Array.from({ length: n }, (_, i) => min + i * step);
  }, [yDomain]);

  if (!active) return <div style={{ height: 330 }} />;

  if (loading || data.length === 0) {
    return (
      <div className="macro-chart-shell">
        <p className="macro-loading">Loading office-wear share…</p>
      </div>
    );
  }

  return (
    <div className="macro-chart-shell">
      <h3 className="infl-chart-title">
        Proportion of Office/Professional Wear Products Over Time
      </h3>

      <ResponsiveContainer width="100%" height={340}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 24, left: 0, bottom: 40 }}
        >
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 10 }}
            label={{ value: "Month", position: "insideBottom", dy: 20 }}
          />

          <YAxis
            domain={yDomain}
            ticks={yTicks}
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => `${(v * 100).toFixed(1)}%`}
            label={{
              value: "Share of office-wear reviews",
              angle: -90,
              position: "insideLeft",
              dx: 5,
              dy: 80,
              fontSize: 12,
            }}
          />

          <Tooltip
            formatter={(v: number) => `${(v * 100).toFixed(2)}%`}
            labelFormatter={(v) => v}
          />

          <Line
            type="monotone"
            dataKey="office_share"
            stroke="#7c3aed"
            strokeWidth={2}
            dot={false}
          />

          <Brush
            dataKey="month"
            height={24}
            stroke="#9ca3af"
            fill="#f9fafb"
            travellerWidth={8}
            y={300}
            startIndex={brushStart}
            endIndex={brushEnd}
            onChange={(range) => {
              if (range.startIndex != null) setBrushStart(range.startIndex);
              if (range.endIndex != null) setBrushEnd(range.endIndex);
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
