"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import styles from "./MeditationGameConsole.module.css"; // Assuming a CSS module

// Dynamic imports for animations
const Slide2Animation = dynamic(() => import("../../meditationanimations/slide2limitlessselfprotocolanimationscript"), { ssr: false });
const Slide3Animation = dynamic(() => import("../../meditationanimations/slide3limitlessselfprotocolanimationscript"), { ssr: false });
const Slide4Animation = dynamic(() => import("../../meditationanimations/slide4limitlessselfprotocolanimationscript"), { ssr: false });
const Slide5Animation = dynamic(() => import("../../meditationanimations/slide5limitlessselfprotocolanimationscript"), { ssr: false });
const Slide6Animation = dynamic(() => import("../../meditationanimations/slide6limitlessselfprotocolanimationscript"), { ssr: false });
const Slide7Animation = dynamic(() => import("../../meditationanimations/slide7limitlessselfprotocolanimationscript"), { ssr: false });
const Slide8Animation = dynamic(() => import("../../meditationanimations/slide8limitlessselfprotocolanimationscript"), { ssr: false });
const Slide10Animation = dynamic(() => import("../../meditationanimations/slide10limitlessselfprotocolanimationscript"), { ssr: false });

const slides = [
  { id: 1, text: "Are you willing and ready to connect with the limitless self?", type: "text" },
  { id: 2, text: "Swipe up to call up the limitless self.", type: "animation", animation: <Slide2Animation /> },
  { id: 3, text: "Slide to shift perspectives.", type: "animation", animation: <Slide3Animation /> },
  { id: 4, text: "Keep tapping to dive deeper.", type: "animation", animation: <Slide4Animation /> },
  { id: 5, text: "Pause and exhale to make space for the answers.", type: "animation", animation: <Slide5Animation /> },
  { id: 6, text: "Affirm until solid", type: "animation", animation: <Slide6Animation />, hasYesNo: true },
  { id: 7, text: "Pause and exhale to make space for the answers.", type: "animation", animation: <Slide7Animation /> },
  { id: 8, text: "Affirm until solid", type: "animation", animation: <Slide8Animation />, hasYesNo: true },
  { id: 9, text: "Are you open to taking on this perspective?", type: "text" },
  { id: 10, text: "Swipe to collect the limitless energy.", type: "animation", animation: <Slide10Animation /> },
];

export default function MeditationGameConsole() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [yesClicked, setYesClicked] = useState(false);

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  const goToPreviousSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleYesClick = () => {
    setYesClicked(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.screen}>
        <h2 className={styles.text}>{slides[currentSlide].text}</h2>
        {slides[currentSlide].type === "animation" && (
          <div className={styles.animationContainer}>{slides[currentSlide].animation}</div>
        )}
      </div>

      <div className={styles.controls}>
        {slides[currentSlide].hasYesNo ? (
          <div className={styles.yesNoButtons}>
            <button onClick={handleYesClick} className={styles.yesButton}>Yes</button>
            <button onClick={goToNextSlide} className={styles.noButton}>No</button>
          </div>
        ) : (
          <div className={styles.navButtons}>
            <button onClick={goToPreviousSlide} className={styles.prevButton}>Previous</button>
            <button onClick={goToNextSlide} className={styles.nextButton}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
