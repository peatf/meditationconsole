"use client";
import React from "react";
import { P5Wrapper } from "@p5-wrapper/react";
const Animation5 = () => {
  const sketch = (p5) => {
    p5.setup = () => {
      p5.createCanvas(400, 400);
      p5.background(0);
    };

    p5.draw = () => {
      p5.fill(255);
      p5.ellipse(p5.width / 2, p5.height / 2, 50, 50);
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default Animation5;
