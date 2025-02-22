"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";

export default function Slide2Animation() {
  return <ReactP5Wrapper sketch={sketch} />;
}

const sketch = (p) => {
  let energyLevel = 0;
  let waves = [];
  let noiseGraphics;
  let isDragging = false;
  let lastY = 0;
  let shouldUpdatePixels = true;
  let canvasElement, containerElement;

  // Helper functions declared so they're hoisted
  function generateNoiseTexture() {
    noiseGraphics.noStroke();
    for (let x = 0; x < noiseGraphics.width; x++) {
      for (let y = 0; y < noiseGraphics.height; y++) {
        let noiseVal = p.noise(x * 0.07, y * 0.07);
        let navyBlue = p.map(noiseVal, 0, 1, 150, 200);
        noiseGraphics.fill(0, 0, navyBlue);
        noiseGraphics.rect(x, y, 1, 1);
      }
    }
  }

  function drawBackgroundGradient() {
    let backgroundColor1 = p.color(255, 200, 200);
    let backgroundColor2 = p.color(255, 100, 100);
    for (let r = p.height; r > 0; r -= 2) {
      let inter = p.map(r, 0, p.height, 1, 0);
      p.fill(p.lerpColor(backgroundColor1, backgroundColor2, inter));
      p.ellipse(p.width / 2, p.height, r * 2, r * 2);
    }
  }

  function applyGrainEffect() {
    p.loadPixels();
    for (let i = 0; i < p.pixels.length; i += 4) {
      let grain = p.random(-10, 10);
      p.pixels[i] += grain;
      p.pixels[i + 1] += grain;
      p.pixels[i + 2] += grain;
    }
    p.updatePixels();
    p.filter(p.BLUR, 0.75);
  }

  p.setup = () => {
    // Grab the container that holds the animation
    containerElement = document.querySelector(".animationScreen");
    const w = containerElement?.offsetWidth || window.innerWidth;
    const h = containerElement?.offsetHeight || window.innerHeight;

    // Create canvas
    const canvas = p.createCanvas(w, h);
    canvasElement = canvas.elt;

    if (canvasElement) {
      canvasElement.getContext("2d", { willReadFrequently: true });
    } else {
      console.error("Canvas element not found!");
    }

    // Style the canvas so it is centered and doesn't block overlay buttons
    Object.assign(canvasElement.style, {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      touchAction: "none",
      zIndex: "0", // Lower than navigation buttons
      userSelect: "none",
    });

    p.pixelDensity(1);
    p.noStroke();
    noiseGraphics = p.createGraphics(w, h);
    generateNoiseTexture();
  };

  p.draw = () => {
    p.push();
    const s = 0.7;
    p.translate((p.width - p.width * s) / 2, (p.height - p.height * s) / 2);
    p.scale(s);
    drawBackgroundGradient();

    if (p.frameCount % (60 - p.map(energyLevel, 0, 1, 10, 50)) === 0) {
      waves.push(new Wave());
    }

    for (let i = waves.length - 1; i >= 0; i--) {
      waves[i].update();
      waves[i].display();
      if (waves[i].isFinished()) waves.splice(i, 1);
    }
    p.pop();

    p.blendMode(p.SCREEN);
    p.image(noiseGraphics, 0, 0);
    p.blendMode(p.BLEND);

    if (shouldUpdatePixels) {
      applyGrainEffect();
      shouldUpdatePixels = false;
      setTimeout(() => (shouldUpdatePixels = true), 500);
    }
  };

  class Wave {
    constructor() {
      this.radius = 0;
      this.speed = p.map(energyLevel, 0, 1, 1, 5);
      this.segments = 120;
      this.glitchProbability = 0.01;
      this.lifespan = 255;
      this.noiseOffsetX = p.random(1000);
      this.noiseOffsetY = p.random(1000);
    }

    update() {
      this.radius += this.speed;
      this.lifespan -= 1;
    }

    isFinished() {
      return this.lifespan < 0;
    }

    display() {
      let baseColor = p.color(255, 150, 0, this.lifespan);
      let darkBeige = p.color(100, 90, 70, this.lifespan);
      p.push();
      p.translate(p.width / 2, p.height);

      for (let i = 0; i < this.segments; i++) {
        let angle = p.map(i, 0, this.segments, 0, p.TWO_PI);
        let noiseX = this.noiseOffsetX + this.radius * 0.01 * p.cos(angle);
        let noiseY = this.noiseOffsetY + this.radius * 0.01 * p.sin(angle);
        let radiusOffset = p.noise(noiseX, noiseY, p.frameCount * 0.01) * 20;
        let x = (this.radius + radiusOffset) * p.cos(angle);
        let y = (this.radius + radiusOffset) * p.sin(angle);
        let size = p.map(p.noise(i * 0.1, this.radius * 0.05), 0, 1, 2, 8);
        let inter = p.map(this.radius, 0, p.width, 0, 1);
        let c = p.lerpColor(baseColor, darkBeige, inter);
        let colorOffset = p.noise(this.radius * 0.02, i * 0.05, p.frameCount * 0.01) * 50 - 25;

        p.fill(
          p.constrain(p.red(c) + colorOffset, 0, 255),
          p.constrain(p.green(c) + colorOffset, 0, 255),
          p.constrain(p.blue(c) + colorOffset, 0, 255),
          this.lifespan
        );

        if (p.random(1) < this.glitchProbability * energyLevel) {
          x += p.random(-10, 10);
          y += p.random(-10, 10);
          p.fill(p.random(255), p.random(255), p.random(255));
        }
        p.ellipse(x, y, size, size);
      }
      p.pop();
    }
  }

  // Unified swipe handler for both mouse and touch events
  const handleSwipe = (y) => {
    if (isDragging) {
      const deltaY = lastY - y;
      energyLevel = p.constrain(energyLevel + deltaY * 0.002, 0, 1);
      lastY = y;
    }
  };

  // Mouse event handlers
  p.mousePressed = () => {
    isDragging = true;
    lastY = p.mouseY;
    return false;
  };
  p.mouseDragged = () => {
    handleSwipe(p.mouseY);
    return false;
  };
  p.mouseReleased = () => {
    isDragging = false;
    return true;
  };

  // Touch event handlers
  p.touchStarted = (event) => {
    isDragging = true;
    lastY = event.touches[0].clientY;
    event.preventDefault();
    return false;
  };
  p.touchMoved = (event) => {
    handleSwipe(event.touches[0].clientY);
    event.preventDefault();
    return false;
  };
  p.touchEnded = () => {
    isDragging = false;
    return true;
  };

  p.windowResized = () => {
    const newWidth = containerElement?.offsetWidth || window.innerWidth;
    const newHeight = containerElement?.offsetHeight || window.innerHeight;
    p.resizeCanvas(newWidth, newHeight);
    noiseGraphics = p.createGraphics(p.width, p.height);
    generateNoiseTexture();
  };
};
