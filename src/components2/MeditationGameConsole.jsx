"use client";

import { useState } from "react";
import dynamic from "next/dynamic"; // ✅ Prevents p5 from running on server

// Corrected dynamic imports with the right file paths and fixed filenames
const Slide2Animation = dynamic(() => import("../../meditationanimations/slide2limitlessselfprotocolanimationscript"), { ssr: false });
const Slide3Animation = dynamic(() => import("../../meditationanimations/slide3limitlessselfprotocolanimationscript"), { ssr: false });
const Slide4Animation = dynamic(() => import("../../meditationanimations/slide4limitlessselfprotocolanimationscript"), { ssr: false });
const Slide5Animation = dynamic(() => import("../../meditationanimations/slide5limitlessselfprotocolanimationscript"), { ssr: false });
const Slide6Animation = dynamic(() => import("../../meditationanimations/slide6limitlessselfprotocolanimationscript"), { ssr: false });
const Slide7Animation = dynamic(() => import("../../meditationanimations/slide7limitlessselfprotocolanimationscript"), { ssr: false });
const Slide8Animation = dynamic(() => import("../../meditationanimations/slide8limitlessselfprotocolanimationscript"), { ssr: false });
const Slide10Animation = dynamic(() => import("../../meditationanimations/slide10limitlesselfprotocolanimationscript"), { ssr: false });

// Define the slides array
const slides = [
  { id: 1, text: "Are you willing and ready to connect with the limitless self?", type: "text" },
  { id: 2, text: "Swipe up to call up the limitless self.", type: "animation", animation: <Slide2Animation /> },
  { id: 3, text: "Slide to shift perspectives.", type: "animation", animation: <Slide3Animation /> },
  { id: 4, text: "Keep tapping to dive deeper.", type: "animation", animation: <Slide4Animation /> },
  { id: 5, text: "Pause and exhale to make space for the answers.", type: "animation", animation: <Slide5Animation /> },
  { id: 6, text: "Affirm until solid.", type: "animation", animation: <Slide6Animation /> },
  { id: 7, text: "Pause and exhale to make space for the answers.", type: "animation", animation: <Slide7Animation /> },
  { id: 8, text: "Affirm until solid.", type: "animation", animation: <Slide8Animation /> },
  { id: 9, text: "Are you open to taking on this perspective?", type: "text" },
  { id: 10, text: "Swipe to collect the limitless energy.", type: "animation", animation: <Slide10Animation /> },
];

export default function MeditationGameConsole() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  const goToPreviousSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  return (
    <div className="p-4">
      {/* Slide text */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{slides[currentSlide].text}</h2>
      </div>

      {/* Conditionally render the animation based on the current slide */}
      {slides[currentSlide].type === "animation" && (
        <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
          {slides[currentSlide].animation}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-4 flex gap-2">
        <button onClick={goToPreviousSlide} className="px-4 py-2 bg-gray-300 rounded">Previous</button>
        <button onClick={goToNextSlide} className="px-4 py-2 bg-blue-500 text-white rounded">Next</button>
      </div>
    </div>
  );
}
