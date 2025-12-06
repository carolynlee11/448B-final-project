// src/Book.tsx
import React, { useRef, useState } from "react";
import HTMLFlipBookDefault from "react-pageflip";
import "./Book.css";
import { MacroTrends } from "./MacroTrends";
import { InflationVsSentiment } from "./InflationVsSentiment";
import { StarRatingMix } from "./StarRatingMix";

const HTMLFlipBook = HTMLFlipBookDefault as any;

type SceneId = "macro" | "ratings" | "inflation" | "uniform" | "price";

type Scene = {
  id: SceneId;
  number: string;
  shortLabel: string;
  title: string;
  description: string;
};

const SCENES: Scene[] = [
  {
    id: "macro",
    number: "01",
    shortLabel: "Macro trends",
    title: "Which categories stay in focus through a downturn?",
    description:
      "We use monthly review counts as a rough proxy for attention, and track how interest in dresses, suits, jackets, shoes, sweaters, and accessories moves from 2018 through the COVID-era shock.",
  },
  {
    id: "ratings",
    number: "02",
    shortLabel: "Review mix",
    title: "How does the star rating mix shift through a downturn?",
    description:
      "Here we follow the full distribution of ratings—from 1-star rants to 5-star raves—and watch how their shares evolve over time.",
  },
  {
    id: "inflation",
    number: "03",
    shortLabel: "Sentiment vs. inflation",
    title: "Do shoppers get harsher when prices heat up?",
    description:
      "We line up the share of 1-star reviews with year-over-year inflation. When the cost of living spikes, does patience with fashion products run out faster too?",
  },
  {
    id: "uniform",
    number: "04",
    shortLabel: "Recession uniform",
    title: "What does a ‘downturn outfit’ look like?",
    description:
      "From structured coats to denim blues, we sketch a collage of silhouettes and textures that show up more often in recession years.",
  },
  {
    id: "price",
    number: "05",
    shortLabel: "Spending power",
    title: "Price tiers through the crash",
    description:
      "We compare how budget basics, mid-range staples, and quiet-luxury pieces expand or shrink as spending power drops.",
  },
];

function Book() {
  const bookRef = useRef<any>(null);
  const [page, setPage] = useState(0);

  const macroScene = SCENES.find((s) => s.id === "macro") as Scene;
  const ratingsScene = SCENES.find((s) => s.id === "ratings") as Scene;
  const inflationScene = SCENES.find((s) => s.id === "inflation") as Scene;
  const remainingScenes = SCENES.filter(
    (s) => s.id !== "macro" && s.id !== "ratings" && s.id !== "inflation"
  );

  const goPrev = () => {
    if (bookRef.current && bookRef.current.pageFlip) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const goNext = () => {
    if (bookRef.current && bookRef.current.pageFlip) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  return (
    <div className="book-root">
      {/* Left arrow */}
      <button
        type="button"
        className="book-arrow book-arrow--left"
        onClick={goPrev}
      >
        ‹
      </button>

      <HTMLFlipBook
        ref={bookRef}
        width={650}
        height={700}
        maxShadowOpacity={0.5}
        drawShadow={true}
        showCover={false}
        size="fixed"
        className="book-flipbook"
        showPageCorners={false}
        style={{}}
        onFlip={(e: any) => setPage(e.data)}
        useMouseEvents={false}
      >
        {/* 0: COVER PAGE */}
        <div className="page page--cover">
          <div className="cover-page">
            <div className="cover-top-row">
              <span className="cover-label">CS 448B Final Project</span>
              <span className="cover-date">Autumn 2025</span>
            </div>

            <h1 className="cover-title">
              <span className="cover-word">Fashion</span>
              <img
                src="./icons/outfit.png"
                className="cover-icon"
                style={{ height: "5rem" }}
              />
              <span className="cover-word">Trends</span>
              <img
                src="/icons/shoe.png"
                className="cover-icon"
                style={{ height: "3.5rem" }}
              />
              <span className="cover-word">as</span>
              <img
                src="/icons/glasses.png"
                className="cover-icon"
                style={{ height: "3.5rem" }}
              />
              <span className="cover-word">Recession</span>
              <img
                src="/icons/recession.jpg"
                className="cover-icon"
                style={{ height: "3.5rem" }}
              />
              <span className="cover-word">Indicators</span>
            </h1>

            <p className="cover-tagline">
              A visual explainer on how downturns reshape the closet, stitched
              from fashion products and macro-economic indicators.
            </p>

            <p className="cover-byline">Carolyn Lee · Colin McKhann</p>
          </div>
        </div>

        {/* 1: INTRO TEXT PAGE */}
        <div className="page page--intro">
          <div className="text-page">
            <h1 className="text-page-title">INTRODUCTION</h1>

            <p className="text-page-body">
              In this visualization project, we investigate fashion trends and
              whether they are reliable indicators of broader economic
              conditions, particularly recessions. In the past, economic
              theorists have hypothesized on phenomena like the Hemline Index,
              which established a direct correlation between lengths of skirts
              and market conditions. For example, in 2010, Marjolein van
              Baardwijk and Philip Hans Franse published “The hemline and the
              economy: is there any match?” which investigated data from 1921 to
              2009. They found that shorter skirts were more present during
              positive economic conditions. Despite data supporting this theory,
              it is a simplification of a complex relationship between fashion
              culture and economic activity.
              <br />
              <br />
              Additionally, with the present fast-fashion industry cycling
              trends at unprecedented speeds, it becomes even more difficult to
              determine whether such trends could even be classified as an
              indicator of economic conditions. Our project builds upon earlier
              theories to understand whether they reflect or diverge from
              traditional economic indicators.
            </p>
          </div>
        </div>

        {/* 2: SCENE 01: MACRO (INTERACTIVE) */}
        {macroScene && (
          <div className="page" key={macroScene.id}>
            <div className="single-page">
              <header className="single-page-header">
                <p className="scene-label">
                  Scene {macroScene.number}
                  {macroScene.shortLabel && ` · ${macroScene.shortLabel}`}
                </p>
                <h1 className="scene-title">{macroScene.title}</h1>
                {macroScene.description && (
                  <p className="scene-text">{macroScene.description}</p>
                )}
              </header>

              <MacroTrends />
            </div>
          </div>
        )}

        {/* 3: SCENE 01 METHODS */}
        <div className="page page--macro-notes">
          <div className="text-page">
            <h1 className="text-page-title">SCENE 01 · METHODS & NOTES</h1>
            <p className="text-page-body">
              For this scene, we treat monthly review counts as a proxy for how
              much attention each category receives over time. We aggregate
              daily product reviews for dresses, suits, jackets, shoes, and
              sweaters from 2018–2022, and then sum them at the category-month
              level.
              <br />
              <br />
              The goal isn&apos;t to estimate absolute sales, but to compare the
              relative shapes of these curves across categories and
              macroeconomic shocks. Spikes may reflect product launches,
              seasonal events, or news cycles, while longer plateaus and dips
              line up with broader changes in spending behavior.
              <br />
              <br />
              Use the toggles to isolate single categories or small groups. As
              you page forward, keep an eye on how these broad patterns echo —
              or contradict — more detailed views of sentiment and price tiers.
            </p>
          </div>
        </div>

        {/* 4: SCENE 02: STAR RATING MIX */}
        {ratingsScene && (
          <div className="page" key={ratingsScene.id}>
            <div className="single-page">
              <header className="single-page-header">
                <p className="scene-label">
                  Scene {ratingsScene.number}
                  {ratingsScene.shortLabel && ` · ${ratingsScene.shortLabel}`}
                </p>
                <h1 className="scene-title">{ratingsScene.title}</h1>
                {ratingsScene.description && (
                  <p className="scene-text">{ratingsScene.description}</p>
                )}
              </header>

              {/* Only mount chart when this page is visible */}
              <StarRatingMix active={page === 4} />
            </div>
          </div>
        )}

        <div className="page page--macro-notes">
          <div className="text-page">
            <h1 className="text-page-title">SCENE 01 · METHODS & NOTES</h1>
            <p className="text-page-body">
              For this scene, we treat monthly review counts as a proxy for how
              much attention each category receives over time. We aggregate
              daily product reviews for dresses, suits, jackets, shoes, and
              sweaters from 2018–2022, and then sum them at the category-month
              level.
              <br />
              <br />
              The goal isn&apos;t to estimate absolute sales, but to compare the
              relative shapes of these curves across categories and
              macroeconomic shocks. Spikes may reflect product launches,
              seasonal events, or news cycles, while longer plateaus and dips
              line up with broader changes in spending behavior.
              <br />
              <br />
              Use the toggles to isolate single categories or small groups. As
              you page forward, keep an eye on how these broad patterns echo —
              or contradict — more detailed views of sentiment and price tiers.
            </p>
          </div>
        </div>

        {/* 5: SCENE 03: INFLATION VS SENTIMENT */}
        {inflationScene && (
          <div className="page" key={inflationScene.id}>
            <div className="single-page">
              <header className="single-page-header">
                <p className="scene-label">
                  Scene {inflationScene.number}
                  {inflationScene.shortLabel &&
                    ` · ${inflationScene.shortLabel}`}
                </p>
                <h1 className="scene-title">{inflationScene.title}</h1>
                {inflationScene.description && (
                  <p className="scene-text">{inflationScene.description}</p>
                )}
              </header>

              <InflationVsSentiment />
            </div>
          </div>
        )}

        <div className="page page--macro-notes">
          <div className="text-page">
            <h1 className="text-page-title">VISUALIZATION 3 · ANALYSIS</h1>
            <p className="text-page-body">
              For this scene, we treat monthly review counts as a proxy for how
              much attention each category receives over time. We aggregate
              daily product reviews for dresses, suits, jackets, shoes, and
              sweaters from 2018–2022, and then sum them at the category-month
              level.
              <br />
              <br />
              The goal isn&apos;t to estimate absolute sales, but to compare the
              relative shapes of these curves across categories and
              macroeconomic shocks. Spikes may reflect product launches,
              seasonal events, or news cycles, while longer plateaus and dips
              line up with broader changes in spending behavior.
              <br />
              <br />
              Use the toggles to isolate single categories or small groups. As
              you page forward, keep an eye on how these broad patterns echo —
              or contradict — more detailed views of sentiment and price tiers.
            </p>
          </div>
        </div>

      
      </HTMLFlipBook>

      {/* Right arrow */}
      <button
        type="button"
        className="book-arrow book-arrow--right"
        onClick={goNext}
      >
        ›
      </button>
    </div>
  );
}

export default Book;
