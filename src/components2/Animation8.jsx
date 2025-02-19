"use client";
import React from "react";
import { ReactP5Wrapper } from "react-p5-wrapper";

const Animation8 = () => {
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

export default Animation8;
