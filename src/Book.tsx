// src/Book.tsx
import React from "react";
import HTMLFlipBookDefault from "react-pageflip";
import "./Book.css";
import { RecessionUniform } from "./RecessionUniform";

const HTMLFlipBook = HTMLFlipBookDefault as any;

type Scene = {
  id: string;
  number: string;
  shortLabel: string;
  title: string;
  description: string;
  leftTitle: string;
  leftTag: string;
  filmFrames: string[];
};

const SCENES: Scene[] = [
  {
    id: "scene1",
    number: "01",
    shortLabel: "Macro trends",
    title: "Unemployment vs. category mix",
    description:"",
    leftTitle: "",
    leftTag: "",
    filmFrames: [],
  },
  {
    id: "scene2",
    number: "02",
    shortLabel: "Recession uniform",
    title: "What does a ‘downturn outfit’ look like?",
    description:
      "From structured coats to denim blues, we sketch a collage of silhouettes and textures that show up more often in recession years.",
    leftTitle: "…do our outfits follow?",
    leftTag: "Wardrobe shift",
    filmFrames: ["Denim", "Black coat", "White tee", "Tote", "Sneaker", "Heels"],
  },
  {
    id: "scene3",
    number: "03",
    shortLabel: "Spending power",
    title: "Price tiers through the crash",
    description:
      "We compare how budget basics, mid-range staples, and quiet luxury pieces expand or shrink as spending power drops.",
    leftTitle: "Or is it just about budget?",
    leftTag: "Price tiers",
    filmFrames: ["Budget", "$$", "$$$", "Pre-crash", "Crash", "After"],
  },
];

function Book() {
  return (
    <div className="book-root">
      <HTMLFlipBook
        width={650}
        height={700}
        maxShadowOpacity={0.5}
        drawShadow={true}
        showCover={false}
        size="fixed"
        className="book-flipbook"
        showPageCorners={false}
        style={{}}
      >
        {/* ------------------------------------------------------ */}
        {/* COVER PAGE */}
        {/* ------------------------------------------------------ */}
        <div className="page page--cover">
          <div className="cover-page">
            <div className="cover-top-row">
              <span className="cover-label">CS 448B Final Project</span>
              <span className="cover-date">Autumn 2025</span>
            </div>

            <h1 className="cover-title">
              <span className="cover-word">Fashion</span>
              <img src="./icons/outfit.png" className="cover-icon"  style={{ height: "5rem" }}/>
              <span className="cover-word">Trends</span>
              <img src="/icons/shoe.png" className="cover-icon" style={{ height: "3.5rem" }}/>
              <span className="cover-word">as</span>
              <img src="/icons/glasses.png" className="cover-icon"style={{ height: "3.5rem" }} />
              <span className="cover-word">Recession</span>
              <img src="/icons/recession.jpg" className="cover-icon" style={{ height: "3.5rem" }}/>
              <span className="cover-word">Indicators</span>
            </h1>

            <p className="cover-tagline">
              A visual explainer on how downturns reshape the closet,
              stitched from fashion products and macro-economic indicators.
            </p>

            <p className="cover-byline">Carolyn Lee · Colin McKhann</p>
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* INTRO TEXT PAGE */}
        {/* ------------------------------------------------------ */}
        <div className="page page--intro">
          <div className="text-page">
            <h1 className="text-page-title">INTRODUCTION</h1>

            <p className="text-page-body">
              In this visualization project, we investigate fashion trends and whether they are reliable indicators of broader economic conditions, particularly recessions. In the past, economic theorists have hypothesized on phenomena like the Hemline Index, which established a direct correlation between lengths of skirts and market conditions. For example, in 2010, Marjolein van Baardwijk and Philip Hans Franse published “The hemline and the economy: is there any match?” which investigated data from 1921 to 2009. They found that shorter skirts were more present during positive economic conditions. Despite data supporting this theory, it is a simplification of a complex relationship between fashion culture and economic activity. 
              <br/> <br/>
              Additionally, with the present fast-fashion industry cycling trends at unprecedented speeds, it becomes even more difficult to determine whether such trends could even be classified as an indicator of economic conditions. Our project builds upon earlier theories to understand whether they reflect or diverge from traditional economic indicators. 
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* SCENE SPREADS */}
        {/* ------------------------------------------------------ */}
        {SCENES.map((scene) => (
          <div className="page" key={scene.id}>
            {scene.id === "scene2" ? (
              // --------- SINGLE FULL PAGE FOR SCENE 02 ----------
              <div className="single-page">
                <header className="single-page-header">
                  <p className="scene-label">
                    Scene {scene.number} · {scene.shortLabel}
                  </p>
                  <h1 className="scene-title">{scene.title}</h1>
                  <p className="scene-text">{scene.description}</p>
                </header>

                {/* wide interactive panel */}
                <RecessionUniform />
              </div>
            ) : (
              // --------- TWO-COLUMN SPREAD FOR OTHER SCENES ------
              <div className="spread">
                <div className="spread-spine" />

                {/* LEFT PAGE */}
                <section className="spread-page">
                </section>

                {/* RIGHT PAGE */}
                <section className="spread-page right-page">
                  {/* simple placeholder for now */}
                  <div className="film-strip">
                    {scene.filmFrames.map((label) => (
                      <div key={label} className="film-frame">
                        <span className="placeholder-text">{label}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        ))}

        <div className="page page--intro">
          <div className="text-page">
            <h1 className="text-page-title">INTRODUCTION</h1>

            <p className="text-page-body">
              In this visualization project, we investigate fashion trends and whether they are reliable indicators of broader economic conditions, particularly recessions. In the past, economic theorists have hypothesized on phenomena like the Hemline Index, which established a direct correlation between lengths of skirts and market conditions. For example, in 2010, Marjolein van Baardwijk and Philip Hans Franse published “The hemline and the economy: is there any match?” which investigated data from 1921 to 2009. They found that shorter skirts were more present during positive economic conditions. Despite data supporting this theory, it is a simplification of a complex relationship between fashion culture and economic activity. 
              <br/> <br/>
              Additionally, with the present fast-fashion industry cycling trends at unprecedented speeds, it becomes even more difficult to determine whether such trends could even be classified as an indicator of economic conditions. Our project builds upon earlier theories to understand whether they reflect or diverge from traditional economic indicators. 
            </p>
          </div>
        </div>
      </HTMLFlipBook>
    </div>
  );
}

export default Book;
