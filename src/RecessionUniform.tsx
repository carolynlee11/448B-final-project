// src/RecessionUniform.tsx
import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import "./RecessionUniform.css";

// ----------------------------
// Types for CSV rows
// ----------------------------

type ProductRow = {
  main_category?: string;
  title?: string;
  average_rating?: string | number;
  rating_number?: string | number;
  features?: string;
  price?: string | number;
  videos?: string;
  store?: string;
  categories?: string; // often JSON-ish string; we'll treat it as plain text for matching
  details?: string;
  parent_asin?: string;
  bought_together?: string;
};

type ReviewRow = {
  rating?: string | number;
  title?: string;
  text?: string;
  asin?: string;
  parent_asin?: string;
  user_id?: string;
  timestamp?: string; // can parse to Date later
  helpful_vote?: string | number;
  verified_purchase?: string;
};

// ----------------------------
// Derived structure for the UI
// ----------------------------

type UniformItem = {
  id: string;
  label: string;
  count: number;
  avgPrice: number | null;
  avgRating: number | null;
};

// Simple helper to parse price strings like "$39.99", "39.99", "39"
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

// ----------------------------
// Category matching rules
// ----------------------------

const CATEGORY_DEFS = [
  {
    id: "denim",
    label: "Denim",
    keywords: ["denim", "jean", "jeans"],
  },
  {
    id: "coat",
    label: "Black coat",
    keywords: ["coat", "trench", "overcoat"],
  },
  {
    id: "tee",
    label: "White tee",
    keywords: ["t-shirt", "tee", "t shirt"],
  },
  {
    id: "tote",
    label: "Tote",
    keywords: ["tote", "shopper bag"],
  },
  {
    id: "sneaker",
    label: "Sneaker",
    keywords: ["sneaker", "trainer", "running shoe"],
  },
  {
    id: "heels",
    label: "Heels",
    keywords: ["heel", "pumps", "stiletto"],
  },
];

// Does this product roughly belong in a category based on its text fields?
function productMatchesCategory(p: ProductRow, keywords: string[]): boolean {
  const text =
    (
      (p.title ?? "") +
      " " +
      (p.categories ?? "") +
      " " +
      (p.features ?? "") +
      " " +
      (p.details ?? "")
    )
      .toString()
      .toLowerCase();

  return keywords.some((kw) => text.includes(kw));
}

// ----------------------------
// Main component
// ----------------------------

export const RecessionUniform: React.FC = () => {
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [reviews, setReviews] = useState<ReviewRow[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load metadata + reviews once on mount
  useEffect(() => {
    // 📁 Adjust paths if needed:
    // Put your CSVs in public/data/ so Vite serves them at /data/...
    const metaUrl = "/data/amazon_fashion_metadata.csv";
    const reviewsUrl = "/data/amazon_reviews.csv";

    Papa.parse<ProductRow>(metaUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setProducts(result.data);
      },
      error: (err) => {
        console.error("Error loading metadata CSV", err);
        setError("Could not load fashion metadata.");
      },
    });

    Papa.parse<ReviewRow>(reviewsUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setReviews(result.data);
      },
      error: (err) => {
        console.error("Error loading reviews CSV", err);
        // Not fatal for this scene, so don't overwrite error
      },
    });
  }, []);

  // Derive uniform stats from the metadata
  const items: UniformItem[] = useMemo(() => {
    if (!products) return [];

    return CATEGORY_DEFS.map((def) => {
      const bucket: ProductRow[] = products.filter((p) =>
        productMatchesCategory(p, def.keywords)
      );

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
        const price = parsePrice(p.price);
        if (price != null) {
          priceSum += price;
          priceCount += 1;
        }
        const rating = parseNumber(p.average_rating);
        if (rating != null) {
          ratingSum += rating;
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
  }, [products]);

  // Default to first category when data arrives
  useEffect(() => {
    if (items.length > 0 && !activeId) {
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

  if (!products || items.length === 0 || !activeId) {
    return (
      <div className="recession-uniform-root">
        <p className="uniform-loading">Loading wardrobe from CSV…</p>
      </div>
    );
  }

  const active = items.find((d) => d.id === activeId)!;

  const maxPrice = Math.max(
    ...items.map((d) => (d.avgPrice ?? 0)),
    1 // avoid 0
  );
  const maxCount = Math.max(...items.map((d) => d.count), 1);

  const formatPrice = (p: number | null) =>
    p == null ? "—" : `$${p.toFixed(0)}`;
  const formatCount = (c: number) =>
    c >= 1000 ? `${(c / 1000).toFixed(1)}k` : c.toString();

  return (
    <div className="recession-uniform-root">
      {/* Summary text driven by active category */}
      <div className="uniform-summary">
        <p className="uniform-summary-label">Scene 02 · Recession uniform</p>
        <p className="uniform-summary-main">
          In our catalog, <span className="uniform-highlight">
            {active.label}
          </span>{" "}
          typically sits around{" "}
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

      {/* Card strip */}
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
                  <span>{item.avgRating != null ? `${item.avgRating.toFixed(1)}★` : "—"}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
