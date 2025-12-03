// src/RecessionUniform.tsx
import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import "./RecessionUniform.css";

type MetaRow = {
  parent_asin?: string;
  product_type?: string;       // <- from your cleaning
  title?: string;
  price?: string | number;
  average_rating?: string | number;
  rating_number?: string | number;
  categories?: string;
  details?: string;
};

type UniformItem = {
  id: string;
  label: string;
  count: number;
  avgPrice: number | null;
  avgRating: number | null;
};

const CATEGORY_DEFS = [
  {
    id: "dress",
    label: "Dress",
    matches: (p: MetaRow) => {
      const pt = p.product_type?.toLowerCase() ?? "";
      const text =
        (
          (p.title ?? "") +
          " " +
          (p.categories ?? "") +
          " " +
          (p.details ?? "")
        )
          .toString()
          .toLowerCase();
      return (
        pt === "dress" ||
        text.includes("dress") ||
        text.includes("maxi dress") ||
        text.includes("midi dress")
      );
    },
  },
  {
    id: "professional",
    label: "Professional",
    matches: (p: MetaRow) => {
      const pt = p.product_type?.toLowerCase() ?? "";
      const text =
        (
          (p.title ?? "") +
          " " +
          (p.categories ?? "") +
          " " +
          (p.details ?? "")
        )
          .toString()
          .toLowerCase();
      return (
        pt === "professional" ||
        text.includes("blazer") ||
        text.includes("suit") ||
        text.includes("work") ||
        text.includes("office")
      );
    },
  },
  {
    id: "denim",
    label: "Denim",
    matches: (p: MetaRow) => {
      const text =
        (
          (p.title ?? "") +
          " " +
          (p.categories ?? "") +
          " " +
          (p.details ?? "")
        )
          .toString()
          .toLowerCase();
      return (
        text.includes("denim") ||
        text.includes("jean") ||
        text.includes("jeans")
      );
    },
  },
  {
    id: "coat",
    label: "Coat",
    matches: (p: MetaRow) => {
      const text =
        (
          (p.title ?? "") +
          " " +
          (p.categories ?? "") +
          " " +
          (p.details ?? "")
        )
          .toString()
          .toLowerCase();
      return (
        text.includes("coat") ||
        text.includes("trench") ||
        text.includes("overcoat")
      );
    },
  },
  {
    id: "sneaker",
    label: "Sneaker",
    matches: (p: MetaRow) => {
      const text =
        (
          (p.title ?? "") +
          " " +
          (p.categories ?? "") +
          " " +
          (p.details ?? "")
        )
          .toString()
          .toLowerCase();
      return (
        text.includes("sneaker") ||
        text.includes("trainer") ||
        text.includes("running shoe")
      );
    },
  },
  {
    id: "heels",
    label: "Heels",
    matches: (p: MetaRow) => {
      const text =
        (
          (p.title ?? "") +
          " " +
          (p.categories ?? "") +
          " " +
          (p.details ?? "")
        )
          .toString()
          .toLowerCase();
      return (
        text.includes("heel") ||
        text.includes("pumps") ||
        text.includes("stiletto")
      );
    },
  },
];

function parsePrice(raw: string | number | undefined): number | null {
  if (raw == null) return null;
  const s = String(raw).replace(/[^0-9.]/g, "");
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : null;
}

function parseNumber(raw: string | number | undefined): number | null {
  if (raw == null) return null;
  const v = typeof raw === "number" ? raw : parseFloat(raw);
  return Number.isFinite(v) ? v : null;
}

export const RecessionUniform: React.FC = () => {
  const [meta, setMeta] = useState<MetaRow[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ⚠️ Place df_meta.csv in public/data/ so this URL works
    const url = "/data/df_meta.csv";

    Papa.parse<MetaRow>(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setMeta(result.data);
      },
      error: (err) => {
        console.error("Error loading df_meta.csv", err);
        setError("Could not load fashion metadata.");
      },
    });
  }, []);

  const items: UniformItem[] = useMemo(() => {
    if (!meta) return [];

    return CATEGORY_DEFS.map((def) => {
      const bucket = meta.filter((row) => def.matches(row));

      if (bucket.length === 0) {
        return {
          id: def.id,
          label: def.label,
          count: 0,
          avgPrice: null,
          avgRating: null,
        };
      }

      let priceSum = 0;
      let priceCount = 0;
      let ratingSum = 0;
      let ratingCount = 0;

      for (const p of bucket) {
        const pr = parsePrice(p.price);
        if (pr != null) {
          priceSum += pr;
          priceCount += 1;
        }
        const r = parseNumber(p.average_rating);
        if (r != null) {
          ratingSum += r;
          ratingCount += 1;
        }
      }

      const avgPrice = priceCount > 0 ? priceSum / priceCount : null;
      const avgRating = ratingCount > 0 ? ratingSum / ratingCount : null;

      return {
        id: def.id,
        label: def.label,
        count: bucket.length,
        avgPrice,
        avgRating,
      };
    });
  }, [meta]);

  useEffect(() => {
    if (!activeId && items.length > 0) {
      setActiveId(items[0].id);
    }
  }, [items, activeId]);

  if (error) {
    return (
      <div className="recession-uniform-root">
        <p className="uniform-error">{error}</p>
      </div>
    );
  }

  if (!meta || items.length === 0 || !activeId) {
    return (
      <div className="recession-uniform-root">
        <p className="uniform-loading">Loading wardrobe from df_meta…</p>
      </div>
    );
  }

  const active = items.find((d) => d.id === activeId)!;

  const maxPrice = Math.max(
    ...items.map((d) => (d.avgPrice ?? 0)),
    1
  );
  const maxCount = Math.max(...items.map((d) => d.count), 1);

  const formatPrice = (p: number | null) =>
    p == null ? "—" : `$${p.toFixed(0)}`;
  const formatCount = (c: number) =>
    c >= 1000 ? `${(c / 1000).toFixed(1)}k` : c.toString();

  return (
    <div className="recession-uniform-root">
      <div className="uniform-summary">
        <p className="uniform-summary-label">Scene 02 · Recession uniform</p>
        <p className="uniform-summary-main">
          In our catalog,{" "}
          <span className="uniform-highlight">{active.label}</span> typically
          sits around{" "}
          <span className="uniform-highlight">
            {formatPrice(active.avgPrice)}
          </span>{" "}
          across{" "}
          <span className="uniform-highlight">
            {formatCount(active.count)}
          </span>{" "}
          products.
        </p>
        {active.avgRating != null && (
          <p className="uniform-summary-sub">
            Average rating: {active.avgRating.toFixed(1)}★
          </p>
        )}
      </div>

      <div className="uniform-strip">
        {items.map((item) => {
          const priceRatio =
            item.avgPrice != null ? item.avgPrice / maxPrice : 0;
          const countRatio = item.count / maxCount;

          return (
            <button
              key={item.id}
              type="button"
              className={
                "uniform-card" +
                (item.id === activeId ? " uniform-card--active" : "")
              }
              onMouseEnter={() => setActiveId(item.id)}
              onFocus={() => setActiveId(item.id)}
            >
              <div className="uniform-card-gradient" />
              <div className="uniform-card-inner">
                <p className="uniform-card-label">{item.label}</p>

                <div className="uniform-bars">
                  <div className="uniform-bar-label">Price</div>
                  <div className="uniform-bar-track">
                    <div
                      className="uniform-bar-fill"
                      style={{ width: `${priceRatio * 100}%` }}
                    />
                  </div>

                  <div className="uniform-bar-label">Count</div>
                  <div className="uniform-bar-track">
                    <div
                      className="uniform-bar-fill uniform-bar-fill--secondary"
                      style={{ width: `${countRatio * 100}%` }}
                    />
                  </div>
                </div>

                <div className="uniform-metrics">
                  <span>{formatPrice(item.avgPrice)}</span>
                  <span>
                    {item.avgRating != null
                      ? `${item.avgRating.toFixed(1)}★`
                      : "—"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
