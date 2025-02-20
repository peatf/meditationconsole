"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import styles from "./MeditationGameConsole.module.css";

// DYNAMIC IMPORTS OF ANIMATIONS (Updated to align with @p5-wrapper/react)
const Slide2Animation = dynamic(() => import("@/meditationanimations/slide2limitlessselfprotocolanimationscript"), { ssr: false });
const Slide3Animation = dynamic(() => import("@/meditationanimations/slide3limitlessselfprotocolanimationscript"), { ssr: false });
const Slide4Animation = dynamic(() => import("@/meditationanimations/slide4limitlessselfprotocolanimationscript"), { ssr: false });
const Slide5Animation = dynamic(() => import("@/meditationanimations/slide5limitlessselfprotocolanimationscript"), { ssr: false });
const Slide6Animation = dynamic(() => import("@/meditationanimations/slide6limitlessselfprotocolanimationscript"), { ssr: false });
const Slide7Animation = dynamic(() => import("@/meditationanimations/slide7limitlessselfprotocolanimationscript"), { ssr: false });
const Slide8Animation = dynamic(() => import("@/meditationanimations/slide8limitlessselfprotocolanimationscript"), { ssr: false });
const Slide10Animation = dynamic(() => import("@/meditationanimations/slide10limitlessselfprotocolanimationscript"), { ssr: false });

// SLIDE DATA:
const slides = [
  { id: 1, text: "Are you willing and ready to connect with the limitless self?", type: "buttons", hasScreen: false },
  { id: 2, text: "Swipe up to call up the limitless self.", type: "swipe", hasScreen: true, animation: <Slide2Animation /> },
  { id: 3, text: "Slide to shift perspectives.", type: "slider", hasScreen: true, animation: <Slide3Animation /> },
  { id: 4, text: "Keep tapping to dive deeper.", type: "tap", hasScreen: true, animation: <Slide4Animation /> },
  { id: 5, text: "Pause and exhale to make space for the answers.", type: "pause", hasScreen: true, animation: <Slide5Animation /> },
  { id: 6, text: "Affirm until solid", type: "buttons", hasScreen: true, customButton: "Affirm", animation: <Slide6Animation /> },
  { id: 7, text: "Pause and exhale to make space for the answers.", type: "pause", hasScreen: true, animation: <Slide7Animation /> },
  { id: 8, text: "Affirm until solid", type: "buttons", hasScreen: true, customButton: "Affirm", animation: <Slide8Animation /> },
  { id: 9, text: "Are you open to taking on this perspective?", type: "buttons", hasScreen: false },
  { id: 10, text: "Swipe to collect the limitless energy.", type: "swipe", hasScreen: true, animation: <Slide10Animation /> },
];

export default function MeditationGameConsole() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [yesClicked, setYesClicked] = useState(false);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
      setYesClicked(false);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      setYesClicked(false);
    }
  };

  const handleYesClick = () => {
    setYesClicked(true);
  };

  const slide = slides[currentSlide];

  return (
    <div className={styles.container}>
      <div className={styles.console}>
        {/* LED Lights */}
        <div className={styles.ledContainer}>
          <div className={`${styles.led} ${styles.red}`} />
          <div className={`${styles.led} ${styles.yellow}`} />
          <div className={`${styles.led} ${styles.green}`} />
        </div>

        {/* Animation Screen */}
        {slide.hasScreen && (
          <div className={styles.animationScreen}>
            {slide.animation ? (
              <div className={styles.animationContainer}>{slide.animation}</div>
            ) : (
              <p className={styles.animationPlaceholder}>(Animation Space)</p>
            )}
          </div>
        )}

        {/* Slide Text */}
        <p className={styles.slideText}>{slide.text}</p>

        {/* Buttons */}
        {slide.type === "buttons" && (
          <div className={styles.buttonContainer}>
            <button className={`${styles.button} ${styles.yesButton}`} onClick={handleYesClick}>
              {slide.customButton || "Yes"}
            </button>
            <button className={`${styles.button} ${styles.noButton}`} onClick={nextSlide}>
              No
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        {slide.type !== "buttons" && (
          <div className={styles.navButtonContainer}>
            {currentSlide > 0 && (
              <button className={styles.navButton} onClick={prevSlide}>
                <ChevronLeft size={20} />
                Previous
              </button>
            )}
            {currentSlide < slides.length - 1 && (
              <button className={styles.navButton} onClick={nextSlide}>
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
