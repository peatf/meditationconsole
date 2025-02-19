"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic"; 
import styles from "./MeditationGameConsole.module.css";

// DYNAMIC IMPORTS OF ANIMATIONS (ReactP5Wrapper-based files)
const Slide2Animation = dynamic(
  () => import("@/src/meditationanimations/slide2limitlessselfprotocolanimationscript"),
  { ssr: false }
);
const Slide3Animation = dynamic(
  () => import("@/src/meditationanimations/slide3limitlessselfprotocolanimationscript"),
  { ssr: false }
);
const Slide4Animation = dynamic(
  () => import("@/src/meditationanimations/slide4limitlessselfprotocolanimationscript"),
  { ssr: false }
);
const Slide5Animation = dynamic(
  () => import("@/src/meditationanimations/slide5limitlessselfprotocolanimationscript"),
  { ssr: false }
);
const Slide6Animation = dynamic(
  () => import("@/src/meditationanimations/slide6limitlessselfprotocolanimationscript"),
  { ssr: false }
);
const Slide7Animation = dynamic(
  () => import("@/src/meditationanimations/slide7limitlessselfprotocolanimationscript"),
  { ssr: false }
);
const Slide8Animation = dynamic(
  () => import("@/src/meditationanimations/slide8limitlessselfprotocolanimationscript"),
  { ssr: false }
);
const Slide10Animation = dynamic(
  () => import("@/src/meditationanimations/slide10limitlesselfprotocolanimationscript"),
  { ssr: false }
);

// SLIDE DATA:
// hasScreen = true  => Show the debossed "screen" area for the p5.js animation
// type could be "swipe", "slider", "tap", "pause", etc., if needed
// customButton can define custom button text (e.g., "Affirm")

const slides = [
  {
    id: 1,
    text: "Are you willing and ready to connect with the limitless self?",
    type: "buttons", 
    hasScreen: false
  },
  {
    id: 2,
    text: "Swipe up to call up the limitless self.",
    type: "swipe",
    hasScreen: true
  },
  {
    id: 3,
    text: "Slide to shift perspectives.",
    type: "slider",
    hasScreen: true
  },
  {
    id: 4,
    text: "Keep tapping to dive deeper.",
    type: "tap",
    hasScreen: true
  },
  {
    id: 5,
    text: "Pause and exhale to make space for the answers.",
    type: "pause",
    hasScreen: true
  },
  {
    id: 6,
    text: "Affirm until solid",
    type: "buttons",
    hasScreen: true,
    customButton: "Affirm", // Example custom text
    animation: <Slide6Animation /> // If you want dynamic import for p5
  },
  {
    id: 7,
    text: "Pause and exhale to make space for the answers.",
    type: "pause",
    hasScreen: true
  },
  {
    id: 8,
    text: "Affirm until solid",
    type: "buttons",
    hasScreen: true,
    customButton: "Affirm",
    animation: <Slide8Animation />
  },
  {
    id: 9,
    text: "Are you open to taking on this perspective?",
    type: "buttons",
    hasScreen: false
  },
  {
    id: 10,
    text: "Swipe to collect the limitless energy.",
    type: "swipe",
    hasScreen: true,
    animation: <Slide10Animation />
  },
];

export default function MeditationGameConsole() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Example state/callback for slides 6 & 8
  const [yesClicked, setYesClicked] = useState(false);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
      setYesClicked(false); // reset if needed
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      setYesClicked(false);
    }
  };

  const handleYesClick = () => {
    // This can trigger some shared state for p5, e.g. yesClicked
    setYesClicked(true);
    // Or automatically go to next slide, if desired
    // nextSlide();
  };

  const slide = slides[currentSlide];

  return (
    <div style={{ "--dur2": "12s" }} className="min-h-screen flex flex-col justify-center items-center p-8 bg-gray-100">
      {/* 
        All styling from "MeditationGameConsole Code.txt" is moved to MeditationGameConsole.module.css
        but we keep any color variables or custom CSS states here if needed.
      */}
      <div className={`${styles["max-w-4xl"]} w-full p-8 rounded-3xl relative flex flex-col items-center`}
           style={{
             backgroundColor: "var(--primary-bg, #E8E9E3)",
             boxShadow:
               "-8px -4px 12px rgba(255, 255, 250, 0.8), 8px 4px 16px rgba(166, 167, 161, 0.3)",
             paddingBottom: "2rem"
           }}>

        {/* LED Lights in top-left */}
        <div className="absolute top-4 left-4 flex gap-3">
          <div className={`${styles.led} ${styles.red}`} />
          <div className={`${styles.led} ${styles.yellow}`} />
          <div className={`${styles.led} ${styles.green}`} />
        </div>

        {/* Slide 1 => Rainbow Loader */}
        {currentSlide === 0 && (
          <div className={styles.loader}>
            <span></span>
          </div>
        )}

        {/* Slide 9 => Quatrefoil Loader */}
        {currentSlide === 8 && (
          <div className={styles.preloader}>
            <div className={styles.preloader__square}>
              <div className={styles.quatrefoil}></div>
            </div>
            <div className={styles.preloader__square}>
              <div className={styles.quatrefoil}></div>
            </div>
            <div className={styles.preloader__square}>
              <div className={styles.quatrefoil}></div>
            </div>
            <div className={styles.preloader__square}>
              <div className={styles.quatrefoil}></div>
            </div>
          </div>
        )}

        {/* Debossed Screen => if hasScreen is true */}
        {slide.hasScreen && (
          <div className="w-full h-96 rounded-xl flex items-center justify-center mb-8"
               style={{
                 backgroundColor: "var(--primary-bg, #E8E9E3)",
                 boxShadow:
                   "inset 8px 8px 16px #CACBC5, inset -8px -8px 16px #F2F3ED",
                 borderRadius: "20px",
                 overflow: "hidden"
               }}>
            {/* If we have an associated animation property, render it */}
            {slide.animation ? (
              <div className="w-full h-full flex justify-center items-center">
                {slide.animation}
              </div>
            ) : (
              <p className="text-sm text-center text-gray-600 opacity-50">
                (Animation Space)
              </p>
            )}
          </div>
        )}

        {/* Slide Text */}
        <p className="text-lg text-center mb-8 font-medium bg-gradient-to-r from-gray-700 to-blue-800 bg-clip-text text-transparent">
          {slide.text}
        </p>

        {/* Buttons */}
        {slide.type === "buttons" && (
          <div className="flex justify-center gap-6 mb-8">
            <button
              className="neu-button yes-button"
              onClick={handleYesClick}
              style={{
                backgroundColor: "#28a745",
                color: "#fff",
                padding: "0.75rem 1.25rem",
                borderRadius: "24px",
                border: "2px solid rgba(40,167,69,0.5)",
                boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.2)"
              }}
            >
              {slide.customButton ? slide.customButton : "Yes"}
            </button>
            <button
              className="neu-button no-button"
              onClick={nextSlide}
              style={{
                backgroundColor: "#dc3545",
                color: "#fff",
                padding: "0.75rem 1.25rem",
                borderRadius: "24px",
                border: "2px solid rgba(220,53,69,0.5)",
                boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.2)"
              }}
            >
              No
            </button>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        {slide.type !== "buttons" && (
          <div className="flex justify-center gap-4 mt-4">
            {currentSlide > 0 && (
              <button
                className="nav-button flex items-center gap-2"
                onClick={prevSlide}
                style={{
                  backgroundColor: "#e0e0e0",
                  padding: "0.5rem 1rem",
                  borderRadius: "12px"
                }}
              >
                <ChevronLeft size={20} />
                Previous
              </button>
            )}
            {currentSlide < slides.length - 1 && (
              <button
                className="nav-button flex items-center gap-2"
                onClick={nextSlide}
                style={{
                  backgroundColor: "#4182e4",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  borderRadius: "12px"
                }}
              >
                Next
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
