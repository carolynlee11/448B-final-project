// src/Book.tsx
import React, { useRef, useState } from "react";
import HTMLFlipBookDefault from "react-pageflip";
import "./Book.css";
import { MacroTrends } from "./MacroTrends";
import { InflationVsSentiment } from "./InflationVsSentiment";
import { StarRatingMix } from "./StarRatingMix";
import { OfficeWearProportion } from "./OfficeWearProportion";

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
      "We follow how ‘office-coded’ pieces ebb and flow across the COVID years, from the work-from-home collapse of office wear to its gradual return.",
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
  const uniformScene = SCENES.find((s) => s.id === "uniform") as Scene;

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
        {/* ------------------------------------------------------ */}
        {/* 0: COVER PAGE                                          */}
        {/* ------------------------------------------------------ */}
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
              A visual explainer on how COVID&apos;s economic impact changed the
              wardrobe and the shelf.
            </p>

            <p className="cover-byline">Carolyn Lee · Colin McKhann</p>
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* 1: INTRO TEXT PAGE                                     */}
        {/* ------------------------------------------------------ */}
        <div className="page page--intro">
          <div className="text-page">
            <h1 className="text-page-title">INTRODUCTION</h1>

            <p className="text-page-body">
              In this visualization project, we investigate fashion trends and
              how they interlink with times of economic struggle. In the past,
              economic theorists have hypothesized on phenomena like the Hemline
              Index, which established a direct correlation between lengths of
              skirts and market conditions. However, we are interested in
              exploring how economic downturn during the COVID-19 pandemic
              affected the online shopping space. Specifically, in times of
              economic struggle, how are both consumers and sellers affected?
              <br />
              <br />
              With the present fast-fashion industry cycling trends at
              unprecedented speeds, it becomes even more difficult to determine
              how trends are interlinked with economic conditions. As such, we
              also seek to gain a better understanding of how such an analysis
              is limited in the modern day and age. For this project, we focus
              primarily on the Fashion section of the Amazon Reviews dataset
              from McAuley Lab, interwoven with economic trends provided by the
              Federal Reserve.
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* 2: SCENE 01: MACRO (INTERACTIVE)                       */}
        {/* ------------------------------------------------------ */}
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

        {/* ------------------------------------------------------ */}
        {/* 3: SCENE 01 · METHODS & NOTES                          */}
        {/* ------------------------------------------------------ */}
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
              you page forward, keep an eye on how these broad patterns echo — or
              contradict — more detailed views of sentiment, inflation, and
              office-coded outfits.
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* 4: SCENE 02: STAR RATING MIX                           */}
        {/* ------------------------------------------------------ */}
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

        {/* ------------------------------------------------------ */}
        {/* 5: SCENE 02 · METHODS & NOTES                          */}
        {/* ------------------------------------------------------ */}
        <div className="page page--macro-notes">
          <div className="text-page">
            <h1 className="text-page-title">SCENE 02 · METHODS & NOTES</h1>
            <p className="text-page-body">
              Here we take all fashion reviews from 2018–2022 and convert them
              into monthly proportions of 1–5 star ratings. Instead of focusing
              on raw counts, we normalize each month so that the stacked areas
              sum to 100%, which makes it easier to compare the relative weight
              of harsh vs. glowing reviews over time.
              <br />
              <br />
              The toggles above the chart allow you to isolate specific bands,
              such as just 1–2★ complaints or just 4–5★ raves. The brush lets
              you zoom into shorter windows around key events. As you adjust the
              view, watch how the mix compresses or stretches: do mid-tier
              ratings hollow out, or do extremes become more common?
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* 6: SCENE 03: INFLATION VS SENTIMENT                    */}
        {/* ------------------------------------------------------ */}
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

        {/* ------------------------------------------------------ */}
        {/* 7: SCENE 03 · ANALYSIS                                 */}
        {/* ------------------------------------------------------ */}
        <div className="page page--macro-notes">
          <div className="text-page">
            <h1 className="text-page-title">SCENE 03 · ANALYSIS</h1>
            <p className="text-page-body">
              In this view, we align two series: the share of 1-star reviews in
              fashion and year-over-year inflation. The goal is not to prove a
              strict causal relationship, but to explore whether spikes in the
              cost of living co-occur with a harsher reviewing climate.
              <br />
              <br />
              At a high level, we see that periods of elevated inflation often
              coincide with subtle rises in 1-star share, especially around the
              sharpest COVID-era dislocations. However, the relationship is
              noisy: promotional cycles, supply-chain issues, and changing
              product mixes all add variance. The chart invites you to visually
              compare local peaks rather than rely on a single summary statistic.
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* 8: SCENE 04: RECESSION UNIFORM (OFFICE WEAR SHARE)     */}
        {/* ------------------------------------------------------ */}
        {uniformScene && (
          <div className="page" key={uniformScene.id}>
            <div className="single-page">
              <header className="single-page-header">
                <p className="scene-label">
                  Scene {uniformScene.number}
                  {uniformScene.shortLabel && ` · ${uniformScene.shortLabel}`}
                </p>
                <h1 className="scene-title">{uniformScene.title}</h1>
                {uniformScene.description && (
                  <p className="scene-text">{uniformScene.description}</p>
                )}
              </header>

              <OfficeWearProportion />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------ */}
        {/* 9: SCENE 04 · ANALYSIS                                 */}
        {/* ------------------------------------------------------ */}
        <div className="page page--macro-notes">
          <div className="text-page">
            <h1 className="text-page-title">SCENE 04 · ANALYSIS</h1>
            <p className="text-page-body">
              To get a closer look at the &quot;recession uniform,&quot; we
              focus on reviews attached to office-coded pieces: blazers, tailored
              pants, button-downs, and other items that read as workplace wear.
              We track their share of reviews over time rather than their raw
              volume, which highlights how prominent office outfits are relative
              to the rest of the closet.
              <br />
              <br />
              Unsurprisingly, the pandemic years show a sharp break from the
              pre-2020 trend, with office wear receding as loungewear and casual
              basics take over. As return-to-office policies roll out, the share
              of office-coded reviews begins to recover, but not fully to
              pre-pandemic levels within our window. This suggests a more
              hybrid, flexible dress code emerging from the shock.
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* 10: CONCLUSION (SYNTHESIS)                             */}
        {/* ------------------------------------------------------ */}
        <div className="page page--intro">
          <div className="text-page">
            <h1 className="text-page-title">CONCLUSION · SYNTHESIS</h1>
            <p className="text-page-body">
              Taken together, these views suggest that fashion reviews do echo
              broader economic turbulence, but in textured and sometimes
              surprising ways. Category-level attention shows how shoppers
              rebalance the closet as routines change. The star rating mix and
              1-star share hint at shifts in tolerance for quality, fit, and
              shipping friction when budgets feel tighter. Office-coded outfits
              reveal how work, home, and social life reconfigure the demand for
              more formal silhouettes.
              <br />
              <br />
              Rather than a single &quot;index&quot; such as skirt length, our
              results point toward a bundle of weak signals that, when layered
              together, help narrate how people materially live through a
              downturn. Fashion reviews become a noisy, but human-scale,
              complement to macro indicators like inflation and unemployment.
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* 11: CONCLUSION (LIMITATIONS & FUTURE WORK)             */}
        {/* ------------------------------------------------------ */}
        <div className="page page--intro">
          <div className="text-page">
            <h1 className="text-page-title">
              CONCLUSION · LIMITATIONS & FUTURE WORK
            </h1>
            <p className="text-page-body">
              This project is constrained by several factors. Amazon reviews are
              an imperfect proxy for true demand: they reflect who chooses to
              write, what gets surfaced in search, and which products survive on
              the platform. Our heuristics for &quot;office wear&quot; and
              other categories inevitably miss edge cases and cultural
              differences in how people dress for work. We also focus on a
              relatively short window around COVID, so we cannot fully separate
              pandemic-specific shifts from longer fashion cycles.
              <br />
              <br />
              A more complete analysis would combine richer product metadata,
              cross-retailer data, and more formal statistical modeling of the
              relationships hinted at here. It would also benefit from qualitative
              work: talking to shoppers and sellers about how they navigated
              price shocks and changing routines. Still, our interactive views
              aim to make the link between macro indicators and everyday
              wardrobe decisions feel tangible — and to show how visualization
              can stitch those layers together.
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
