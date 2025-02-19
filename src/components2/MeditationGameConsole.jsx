"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic"; // ✅ Prevents p5 from running on server

const Animation2 = dynamic(() => import("./Animation2"), { ssr: false });
const Animation3 = dynamic(() => import("./Animation3"), { ssr: false });
const Animation4 = dynamic(() => import("./Animation4"), { ssr: false });
const Animation5 = dynamic(() => import("./Animation5"), { ssr: false });
const Animation6 = dynamic(() => import("./Animation6"), { ssr: false });
const Animation7 = dynamic(() => import("./Animation7"), { ssr: false });
const Animation8 = dynamic(() => import("./Animation8"), { ssr: false });
const Animation10 = dynamic(() => import("./Animation10"), { ssr: false });

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
            <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setCurrentSlide(currentSlide - 1)}>
              <ChevronLeft size={20} />
              Previous
            </button>
          )}
          {currentSlide < slides.length - 1 && (
            <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setCurrentSlide(currentSlide + 1)}>
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
