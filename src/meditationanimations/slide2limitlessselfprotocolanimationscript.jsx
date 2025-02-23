"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";

export default function Slide2Animation() {
  return <ReactP5Wrapper sketch={sketch} />;
}

const sketch = (p) => {
  let energyLevel = 0;
  let waves = [];
  let startY = 0;
  let noiseGraphics;
  let touchBlocked = false;
  let canvasElement;
  let containerElement;
  let isDragging = false;
  let lastY = 0;
  let bgBuffer;

  p.setup = () => {
    containerElement = document.querySelector(".animationScreen");
    const w = containerElement?.offsetWidth || window.innerWidth;
    const h = containerElement?.offsetHeight || window.innerHeight;
    const canvas = p.createCanvas(w, h);
    
    canvasElement = canvas.elt;
    canvasElement.getContext("2d", { willReadFrequently: true });
    
    canvasElement.style.position = "absolute";
    canvasElement.style.left = "50%";
    canvasElement.style.top = "50%";
    canvasElement.style.transform = "translate(-50%, -50%)";
    canvasElement.style.touchAction = "none";
    canvasElement.style.zIndex = "1";
    
    p.pixelDensity(1);
    p.noStroke();
    
    // Precompute background
    bgBuffer = p.createGraphics(w, h);
    drawBackgroundGradient(w, h);
    
    // Optimized noise texture
    noiseGraphics = p.createGraphics(w, h);
    generateNoiseTexture(w, h);
  };

  const drawBackgroundGradient = (w, h) => {
    const ctx = bgBuffer.drawingContext;
    const gradient = ctx.createRadialGradient(w/2, h, 0, w/2, h, h);
    gradient.addColorStop(0, "rgb(255, 200, 200)");
    gradient.addColorStop(1, "rgb(255, 100, 100)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  };

  const generateNoiseTexture = (w, h) => {
    noiseGraphics.loadPixels();
    for (let x = 0; x < w; x += 2) {
      for (let y = 0; y < h; y += 2) {
        const noiseVal = p.noise(x * 0.05, y * 0.05);
        const navyBlue = p.map(noiseVal, 0, 1, 150, 200);
        noiseGraphics.set(x, y, [0, 0, navyBlue]);
      }
    }
    noiseGraphics.updatePixels();
  };

  p.draw = () => {
    p.push();
    const s = 0.7;
    p.translate((p.width - p.width * s) / 2, (p.height - p.height * s) / 2);
    p.scale(s);

    // Draw precomputed background
    p.image(bgBuffer, 0, 0);

    // Maintain original wave timing
    if (p.frameCount % (60 - p.map(energyLevel, 0, 1, 10, 50)) {
      waves.push(new Wave());
    }

    // Original wave behavior
    for (let i = waves.length - 1; i >= 0; i--) {
      waves[i].update();
      waves[i].display();
      if (waves[i].isFinished()) waves.splice(i, 1);
    }
    p.pop();

    // Original overlay effects
    p.blendMode(p.SCREEN);
    p.image(noiseGraphics, 0, 0);
    p.blendMode(p.BLEND);

    // Optimized grain effect
    p.loadPixels();
    for (let i = 0; i < p.pixels.length; i += 4) {
      const grain = p.random(-5, 5);
      p.pixels[i] += grain;
      p.pixels[i + 1] += grain;
      p.pixels[i + 2] += grain;
    }
    p.updatePixels();
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
      p.push();
      p.translate(p.width / 2, p.height);
      p.beginShape(p.POINTS);
      
      for (let i = 0; i < this.segments; i++) {
        const angle = p.map(i, 0, this.segments, 0, p.TWO_PI);
        const noiseX = this.noiseOffsetX + this.radius * 0.01 * p.cos(angle);
        const noiseY = this.noiseOffsetY + this.radius * 0.01 * p.sin(angle);
        const radiusOffset = p.noise(noiseX, noiseY, p.frameCount * 0.01) * 20;
        
        const x = (this.radius + radiusOffset) * p.cos(angle);
        const y = (this.radius + radiusOffset) * p.sin(angle);
        const size = p.map(p.noise(i * 0.1, this.radius * 0.05), 0, 1, 2, 8);
        const inter = p.map(this.radius, 0, p.width, 0, 1);
        
        let c = p.lerpColor(
          p.color(255, 150, 0, this.lifespan),
          p.color(100, 90, 70, this.lifespan),
          inter
        );
        
        if (p.random(1) < this.glitchProbability * energyLevel) {
          c = p.color(p.random(255), p.random(255), p.random(255), this.lifespan);
        }

        p.stroke(c);
        p.strokeWeight(size);
        p.vertex(x, y);
      }
      
      p.endShape();
      p.pop();
    }
  }

  // Original interaction handlers remain unchanged
  const handleStart = (y) => {
    isDragging = true;
    lastY = y;
  };

  const handleMove = (currentY) => {
    if (isDragging) {
      const deltaY = lastY - currentY;
      energyLevel += deltaY * 0.002;
      energyLevel = p.constrain(energyLevel, 0, 1);
      lastY = currentY;
    }
  };

  const handleEnd = () => {
    isDragging = false;
  };

  p.mousePressed = () => {
    if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
      handleStart(p.mouseY);
      return false;
    }
    return true;
  };

  p.mouseDragged = () => {
    handleMove(p.mouseY);
    return false;
  };

  p.mouseReleased = () => {
    handleEnd();
    return true;
  };

  p.touchStarted = (event) => {
    const touch = event.touches[0];
    const rect = canvasElement.getBoundingClientRect();
    
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
      handleStart(touch.clientY);
      event.preventDefault();
      return false;
    }
    return true;
  };

  p.touchMoved = (event) => {
    if (isDragging) {
      const touch = event.touches[0];
      handleMove(touch.clientY);
      event.preventDefault();
      return false;
    }
    return true;
  };

  p.touchEnded = () => {
    handleEnd();
    return true;
  };

  p.windowResized = () => {
    const w = containerElement?.offsetWidth || window.innerWidth;
    const h = containerElement?.offsetHeight || window.innerHeight;
    p.resizeCanvas(w, h);
    bgBuffer = p.createGraphics(w, h);
    drawBackgroundGradient(w, h);
    generateNoiseTexture(w, h);
  };
};
