// src/Book.tsx
import { useRef, useState } from "react";
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

  const handleFlip = (e: any) => {
    setPage(e.data);

    // Nudge Recharts to recompute ResponsiveContainer sizes
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 0);
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
        onFlip={handleFlip}
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
              A visual explainer on how COVID&apos;s economic impact changed the
              wardrobe and the shelf.
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
              how they interlink with times of economic struggle. In the past,
              economic theorists have hypothesized on phenomena like the Hemline
              Index, which established a direct correlation between lengths of
              skirts and market conditions. However, we are interested in
              exploring how economic downturn during the COVID-19 pandemic
              affected the online shopping space. Specifically, in times of
              economic struggle, how are both consumers and sellers affected?
              And as a result, do fashion-related indices, like the Hemline
              Index, have merit in theory?
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

        {/* 3: SCENE 01 · METHODS & NOTES */}
        <div className="page page--macro-notes">
          <div className="text-page">
            <h1 className="text-page-title">
              How Were Different Categories Affected?
            </h1>
            <p className="text-page-body">
              To begin to analyze the relationship between online shopping and
              the pandemic, we are interested in first looking at how different
              types of professional wear changed in popularity. To accomplish
              this, we treat monthly review counts as a proxy for how much
              attention each product gets over the 2018–2022 period.
              <br />
              <br />
              In this chart, we see that some items like sweaters and jackets
              maintain their behavior before and after March of 2020, peaking in
              the winter and decreasing in the summer. However, one major
              standout for these categories is dresses, which steeply decline
              from having almost 20 times the reviews in most of 2019 to only
              twice as many post pandemic. From this, we can see that COVID
              disproportionally affected dresses versus other types of clothing
              like suits or sweaters, indicating a strong effect on workwear as
              a whole. Finally, it is worth noting that most categories did
              generally see a decrease over this time period, reflecting a more
              restricted shopper following the start of the pandemic.
              <br />
              <br />
              Use the toggles to isolate single categories or small groups to
              see these specific categories more clearly!
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

              <StarRatingMix active={page === 4} />
            </div>
          </div>
        )}

        {/* 5: SCENE 02 · METHODS & NOTES */}
        <div className="page page--macro-notes">
          <div className="text-page">
            <h1 className="text-page-title">
              How Do These Changes Affect Consumer Opinion?
            </h1>
            <p className="text-page-body">
              Here we take all fashion reviews from 2018–2022 and convert them
              into monthly proportions of 1–5 star ratings. The toggles above
              the chart allow you to isolate specific bands, such as just 1–2★
              complaints or just 4–5★ raves. The brush lets you zoom into
              shorter windows around key events.
              <br />
              <br />
              With all ratings included, the bands all appear to move as one, an
              effect that disappears when 1 and 5 star ratings are removed. This
              effect is indicative of how consumer ratings are polarized as a
              whole—often flipping between 1 and 5 star ratings over time rather
              than flowing more towards the middle. Broadly speaking, ratings
              seem to remain rather consistent over this time period; however,
              there are some spikes of negativity both in March of 2020 and
              later throughout 2021, which we deemed worth investigating
              further.
            </p>
          </div>
        </div>

        {/* 6: SCENE 03: INFLATION VS SENTIMENT */}
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

        {/* 7: SCENE 03 · ANALYSIS */}
        <div className="page page--macro-notes">
          <div className="text-page">
            <h1 className="text-page-title">
              How Does Inflation Affect Consumer Negativity?
            </h1>
            <p className="text-page-body">
              In this view, we align two series: the share of 1-star reviews in
              fashion and year-over-year inflation. Because of the relationship
              between reviews explored in the previous visual, we chose to
              isolate purely the 1 star reviews as a snapshot of sentiment as a
              whole.
              <br />
              <br />
              At a high level, we see that periods of elevated inflation often
              coincide with subtle rises in 1-star share. This is most evident
              from January 2021 to early 2022, where a large spike in inflation
              is largely paralleled by a stark increase in the proportion of
              negative reviews. This relationship is not perfect, as, for
              instance, in March 2020 negativity spikes despite very low
              inflation (which could be a byproduct of the start of lockdown).
              However, although not enough to declare a causal relationship,
              there does seem to be an interwoven pattern between inflation and
              how consumers feel about fashion products.
            </p>
          </div>
        </div>

        {/* 8: SCENE 04: RECESSION UNIFORM (OFFICE WEAR SHARE) */}
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

              <OfficeWearProportion active={page === 8} />
            </div>
          </div>
        )}

        {/* 9: SCENE 04 · ANALYSIS */}
        <div className="page page--macro-notes">
          <div className="text-page">
            <h1 className="text-page-title">
              How Do Consumer Changes Affect Sellers?
            </h1>
            <p className="text-page-body">
              To get a closer look at the &quot;recession uniform,&quot; we
              focus on reviews attached to office-coded pieces: blazers,
              tailored pants, button-downs, and other items that read as
              workplace wear. We track the share of the reviews over time, a
              proxy for the relative attention these products receive in the
              fast fashion space.
              <br />
              <br />
              From this graph, we first note a somewhat cyclical pattern with
              office-wear reviews, increasing in the first half of the year and
              decreasing in the second half. Through this lens, we can see
              across each season a relative increase in the amount of workwear
              being listed. Moreover, compared to the two pre-pandemic years, in
              which the cycles remained more or less in the same range,
              business attire gains an over 5% share in fashion listings over
              this period compared to the maximum pre-pandemic value.
            </p>
          </div>
        </div>

        {/* 10: CONCLUSION (SYNTHESIS) */}
        <div className="page page--intro">
          <div className="text-page">
            <h1 className="text-page-title">CONCLUSION · SYNTHESIS</h1>
            <p className="text-page-body">
              Taken together, these views suggest that fashion reviews do echo
              broader economic turbulence. Specifically, we note that times of
              economic turbulence seem to align with both negative consumer
              sentiment over products and abnormal willingness to change which
              categories the public chooses to buy as a whole. In turn, this has
              a demonstrated impact on what products are listed as well, with
              office wear being released at a significantly higher rate in times
              of economic struggle.
              <br />
              <br />
              In essence, rather than isolating a specific index, we are led to
              believe that the interplay between the online fashion industry and
              the broader economy is one that is causal rather than
              coincidental. From this, we believe that further analysis into
              this relationship is valuable, and that suggested &quot;indices&quot;
              are worth exploring.
            </p>
          </div>
        </div>

        {/* 11: CONCLUSION (LIMITATIONS & FUTURE WORK) */}
        <div className="page page--intro">
          <div className="text-page">
            <h1 className="text-page-title">
              CONCLUSION · LIMITATIONS & FUTURE WORK
            </h1>
            <p className="text-page-body">
              This project is constrained by the data that is publicly
              available. Specifically, while ratings do have use in both
              tracking sentiment over time and following where consumer
              attention is going, they are not a perfect proxy for what products
              are actually being bought and sold. Further analysis would benefit
              from partnership with online retailers like Amazon who hold
              backend sales data to confirm or challenge the conclusions drawn.
              Additionally, there is some margin of error for exact review
              counts due to quirks in how Amazon maintains their review API,
              which does mean that while proportional values still hold, exact
              counts could be slightly off.
              <br />
              <br />
              Future work would include further exploration of these trends in
              other spaces, including both other online retailers (especially
              specialty professional brands) and data from brick-and-mortar
              stores. Again, this data is, to our knowledge, not very publicly
              available, so partnership with such brands would be required.
              Finally, with this exploration in mind, we would be interested in
              investigating our own version of a fashion-based index through
              analyzing if these patterns are maintained in the modern day, as
              the dataset used was limited to the end of 2022.
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

