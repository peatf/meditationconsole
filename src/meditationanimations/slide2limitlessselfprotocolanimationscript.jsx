"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";

export default function Slide2Animation() {
  return <ReactP5Wrapper sketch={sketch} />;
}

const sketch = (p) => {
  let energyLevel = 0;
  let waves = [];
  let noiseGraphics;
  let canvasElement;
  let containerElement;
  let isDragging = false;
  let lastY = 0;
  let bgBuffer;
  let grainTexture;

  p.setup = () => {
    containerElement = document.querySelector(".animationScreen");
    const w = containerElement?.offsetWidth || window.innerWidth;
    const h = containerElement?.offsetHeight || window.innerHeight;
    const canvas = p.createCanvas(w, h);
    
    canvasElement = canvas.elt;
    const ctx = canvasElement.getContext('2d', { willReadFrequently: true });
    
    canvasElement.style.position = "absolute";
    canvasElement.style.left = "50%";
    canvasElement.style.top = "50%";
    canvasElement.style.transform = "translate(-50%, -50%)";
    canvasElement.style.touchAction = "none";
    canvasElement.style.zIndex = "1";
    
    p.pixelDensity(1);
    p.noStroke();
    
    // Precompute background gradient
    bgBuffer = p.createGraphics(w, h);
    drawBackgroundGradient(w, h);
    
    // Generate optimized noise texture
    generateNoiseTexture(w, h);
    
    // Create static grain texture
    createGrainTexture(w, h);
  };

  const drawBackgroundGradient = (w, h) => {
    const ctx = bgBuffer.drawingContext;
    const gradient = ctx.createRadialGradient(w/2, h, 0, w/2, h, h);
    gradient.addColorStop(0, "#ffc8c8");
    gradient.addColorStop(1, "#ff6464");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  };

  const generateNoiseTexture = (w, h) => {
    noiseGraphics = p.createGraphics(w/4, h/4);
    noiseGraphics.noStroke();
    for (let x = 0; x < noiseGraphics.width; x += 2) {
      for (let y = 0; y < noiseGraphics.height; y += 2) {
        const noiseVal = p.noise(x * 0.1, y * 0.1);
        const navyBlue = p.map(noiseVal, 0, 1, 150, 200);
        noiseGraphics.fill(0, 0, navyBlue);
        noiseGraphics.rect(x, y, 2, 2);
      }
    }
  };

  const createGrainTexture = (w, h) => {
    grainTexture = p.createGraphics(w/4, h/4);
    grainTexture.loadPixels();
    for (let x = 0; x < grainTexture.width; x++) {
      for (let y = 0; y < grainTexture.height; y++) {
        const grain = p.random(-25, 25);
        grainTexture.set(x, y, [128 + grain, 128 + grain, 128 + grain, 15]);
      }
    }
    grainTexture.updatePixels();
  };

  p.draw = () => {
    p.push();
    const s = 0.7;
    p.translate((p.width - p.width * s) / 2, (p.height - p.height * s) / 2);
    p.scale(s);

    // Draw precomputed background
    p.image(bgBuffer, 0, 0);

    // Wave generation optimized
    if (p.frameCount % (60 - p.map(energyLevel, 0, 1, 10, 50)) === 0) {
      waves.push(new Wave());
    }

    // Update and draw waves
    for (let i = waves.length - 1; i >= 0; i--) {
      waves[i].update();
      waves[i].display();
      if (waves[i].isFinished()) waves.splice(i, 1);
    }
    p.pop();

    // Apply noise and grain effects
    p.blendMode(p.SCREEN);
    p.image(noiseGraphics, 0, 0, p.width, p.height);
    p.blendMode(p.OVERLAY);
    p.image(grainTexture, 0, 0, p.width, p.height);
    p.blendMode(p.BLEND);
  };

  class Wave {
    constructor() {
      this.radius = 0;
      this.speed = p.map(energyLevel, 0, 1, 1, 5);
      this.segments = 60; // Reduced from 120
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
      const baseColor = p.color(255, 150, 0, this.lifespan);
      const darkBeige = p.color(100, 90, 70, this.lifespan);
      const frameNoise = p.frameCount * 0.01;
      
      p.push();
      p.translate(p.width / 2, p.height);
      p.beginShape(p.POINTS);
      
      for (let i = 0; i < this.segments; i++) {
        const angle = p.map(i, 0, this.segments, 0, p.TWO_PI);
        const noiseX = this.noiseOffsetX + this.radius * 0.01 * p.cos(angle);
        const noiseY = this.noiseOffsetY + this.radius * 0.01 * p.sin(angle);
        const radiusOffset = p.noise(noiseX, noiseY, frameNoise) * 20;
        
        const x = (this.radius + radiusOffset) * p.cos(angle);
        const y = (this.radius + radiusOffset) * p.sin(angle);
        const size = p.map(p.noise(i * 0.1, this.radius * 0.05), 0, 1, 2, 8);
        const inter = p.map(this.radius, 0, p.width, 0, 1);
        
        let c = p.lerpColor(baseColor, darkBeige, inter);
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

  const generateNoiseTexture = () => {
    noiseGraphics.noStroke();
    for (let x = 0; x < noiseGraphics.width; x++) {
      for (let y = 0; y < noiseGraphics.height; y++) {
        let noiseVal = p.noise(x * 0.07, y * 0.07);
        let navyBlue = p.map(noiseVal, 0, 1, 150, 200);
        noiseGraphics.fill(0, 0, navyBlue);
        noiseGraphics.rect(x, y, 1, 1);
      }
    }
  };

  const drawBackgroundGradient = () => {
    let backgroundColor1 = p.color(255, 200, 200);
    let backgroundColor2 = p.color(255, 100, 100);
    for (let r = p.height; r > 0; r -= 2) {
      let inter = p.map(r, 0, p.height, 1, 0);
      let c = p.lerpColor(backgroundColor1, backgroundColor2, inter);
      p.fill(c);
      p.ellipse(p.width / 2, p.height, r * 2, r * 2);
    }
  };

  // Unified input handling
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

  // Mouse handlers
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

  // Touch handlers
  p.touchStarted = (event) => {
    const touch = event.touches[0];
    const rect = canvasElement.getBoundingClientRect();
    
    if (touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom) {
      handleStart(touch.clientY);
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    return true;
  };

  p.touchMoved = (event) => {
    if (isDragging) {
      const touch = event.touches[0];
      handleMove(touch.clientY);
      if (Math.abs(touch.clientY - lastY) > 2) {
        event.preventDefault();
        event.stopPropagation();
      }
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
    noiseGraphics = p.createGraphics(p.width, p.height);
    generateNoiseTexture();
  };
};
