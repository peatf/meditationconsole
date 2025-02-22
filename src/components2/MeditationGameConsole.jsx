"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import styles from "./MeditationGameConsole.module.css";

// DYNAMIC IMPORTS OF ANIMATIONS
const Slide2Animation = dynamic(() => import("@/meditationanimations/slide2limitlessselfprotocolanimationscript"), { ssr: false });
const Slide3Animation = dynamic(() => import("@/meditationanimations/slide3limitlessselfprotocolanimationscript"), { ssr: false });
const Slide4Animation = dynamic(() => import("@/meditationanimations/slide4limitlessselfprotocolanimationscript"), { ssr: false });
const Slide5Animation = dynamic(() => import("@/meditationanimations/slide5limitlessselfprotocolanimationscript"), { ssr: false });
const Slide6Animation = dynamic(() => import("@/meditationanimations/slide6limitlessselfprotocolanimationscript"), { ssr: false });
const Slide7Animation = dynamic(() => import("@/meditationanimations/slide7limitlessselfprotocolanimationscript"), { ssr: false });
const Slide8Animation = dynamic(() => import("@/meditationanimations/slide8limitlessselfprotocolanimationscript"), { ssr: false });
const Slide10Animation = dynamic(() => import("@/meditationanimations/slide10limitlessselfprotocolanimationscript"), { ssr: false });

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
  const [slide6Clicks, setSlide6Clicks] = useState(0);
  const [slide8Clicks, setSlide8Clicks] = useState(0);

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
    // Handle click counts for slides 6 and 8
    if (currentSlide === 5) {
      setSlide6Clicks(prev => Math.min(prev + 1, 5)); // Max 5 clicks
    }
    if (currentSlide === 7) {
      setSlide8Clicks(prev => Math.min(prev + 1, 5)); // Max 5 clicks
    }
    
    setTimeout(() => {
      const btn = document.querySelector(`.${styles.yesButton}`);
      if (btn) {
        btn.classList.add(styles.active);
        setTimeout(() => btn.classList.remove(styles.active), 2000);
      }
    }, 0);
  };

  // Reset click counts when leaving respective slides
  useEffect(() => {
    if (currentSlide !== 5) setSlide6Clicks(0);
    if (currentSlide !== 7) setSlide8Clicks(0);
  }, [currentSlide]);

  const slide = slides[currentSlide];

  // Update the animations array to include click counts
  const getSlideAnimation = () => {
    if (currentSlide === 5) {
      return <Slide6Animation clickCount={slide6Clicks} />;
    }
    if (currentSlide === 7) {
      return <Slide8Animation clickCount={slide8Clicks} />;
    }
    return slide.animation;
  };

  return (
    <div className={styles.container}>
      <div className={styles.console}>
        {/* LED Lights */}
        <div className={styles.ledContainer}>
          <div className={`${styles.led} ${styles.red}`} />
          <div className={`${styles.led} ${styles.yellow}`} />
          <div className={`${styles.led} ${styles.green}`} />
        </div>

        {/* Rainbow Loader for Slide 1 */}
        {currentSlide === 0 && (
          <div className={styles.loader}>
            <span></span>
          </div>
        )}

        {/* Quatrefoil Loader for Slide 9 */}
        {currentSlide === 8 && (
          <div className={styles.preloader}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={styles.preloaderSquare}>
                <div className={styles.quatrefoil}></div>
              </div>
            ))}
          </div>
        )}

        {/* Animation Screen */}
        {slide.hasScreen && (
          <div className={styles.animationScreen}>
            {slide.animation ? (
              <div className={styles.animationContainer}>
                {getSlideAnimation()}
              </div>
            ) : (
              <p className={styles.animationPlaceholder}>(Animation Space)</p>
            )}
          </div>
        )}

        {/* Slide Text */}
        <p className={styles.directionsText}>{slide.text}</p>

        {/* Buttons */}
        {slide.type === "buttons" && (
          <div className={styles.buttonContainer}>
            <button 
              className={`${styles.button} ${styles.yesButton} ${yesClicked ? styles.active : ''}`} 
              onClick={handleYesClick}
            >
              {slide.customButton || "Yes"}
            </button>
            {!slide.customButton && (
              <button className={`${styles.button} ${styles.noButton}`}>
                No
              </button>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className={styles.navButtonContainer}>
          {currentSlide > 0 && (
            <button className={styles.navButton} onClick={prevSlide}>
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>
          )}
          {currentSlide < slides.length - 1 && (
            <button className={styles.navButton} onClick={nextSlide}>
              <span>Next</span>
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
