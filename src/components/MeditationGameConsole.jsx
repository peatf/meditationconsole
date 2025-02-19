import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
// Import animation components (future imports for actual animations)
import Animation2 from "./Animation2";
import Animation3 from "./Animation3";
import Animation4 from "./Animation4";
import Animation5 from "./Animation5";
import Animation6 from "./Animation6";
import Animation7 from "./Animation7";
import Animation8 from "./Animation8";
import Animation10 from "./Animation10";

const slides = [
  { id: 1, text: "Are you willing and ready to connect with the limitless self?", type: "text" },
  { id: 2, text: "Swipe up to call up the limitless self.", type: "animation" },
  { id: 3, text: "Slide to shift perspectives.", type: "animation" },
  { id: 4, text: "Keep tapping to dive deeper.", type: "animation" },
  { id: 5, text: "Pause and exhale to make space for the answers.", type: "animation" },
  { id: 6, text: "Affirm until solid", type: "animation" },
  { id: 7, text: "Pause and exhale to make space for the answers.", type: "animation" },
  { id: 8, text: "Affirm until solid", type: "animation" },
  { id: 9, text: "Are you open to taking on this perspective?", type: "text" },
  { id: 10, text: "Swipe to collect the limitless energy.", type: "animation" },
];

const MeditationGameConsole = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 bg-gray-100">
      <div className="max-w-4xl w-full p-8 rounded-3xl relative flex flex-col items-center bg-white shadow-lg">
        <div className="text-center text-lg font-medium mb-8">
          {slides[currentSlide].text}
        </div>

        {slides[currentSlide].type === "animation" && (
          <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            {currentSlide === 1 && <Animation2 />}
            {currentSlide === 2 && <Animation3 />}
            {currentSlide === 3 && <Animation4 />}
            {currentSlide === 4 && <Animation5 />}
            {currentSlide === 5 && <Animation6 />}
            {currentSlide === 6 && <Animation7 />}
            {currentSlide === 7 && <Animation8 />}
            {currentSlide === 9 && <Animation10 />}
          </div>
        )}

        <div className="flex justify-center gap-4 mt-4">
          {currentSlide > 0 && (
            <button className="bg-gray-300 px-4 py-2 rounded" onClick={prevSlide}>
              <ChevronLeft size={20} />
              Previous
            </button>
          )}
          {currentSlide < slides.length - 1 && (
            <button className="bg-gray-300 px-4 py-2 rounded" onClick={nextSlide}>
              Next
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeditationGameConsole;
