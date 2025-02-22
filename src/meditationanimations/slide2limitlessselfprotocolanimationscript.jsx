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

  p.setup = () => {
    const container = document.querySelector('.animationScreen');
    let w, h;
    if (container) {
      w = container.offsetWidth;
      h = container.offsetHeight;
    } else {
      w = window.innerWidth;
      h = window.innerHeight;
    }
    const canvas = p.createCanvas(w, h);
    // Center the canvas
    const canvasElement = canvas.elt;
    canvasElement.style.position = 'absolute';
    canvasElement.style.left = '50%';
    canvasElement.style.top = '50%';
    canvasElement.style.transform = 'translate(-50%, -50%)';

    p.pixelDensity(1);
    p.noStroke();
    noiseGraphics = p.createGraphics(w, h);
    generateNoiseTexture();
  };

  p.draw = () => {
    // Draw REDDISH Beige Radial Gradient Background
    drawBackgroundGradient();

    // Create new waves based on energyLevel
    if (p.frameCount % (60 - p.map(energyLevel, 0, 1, 10, 50)) === 0) {
      waves.push(new Wave());
    }

    // Update and display waves
    for (let i = waves.length - 1; i >= 0; i--) {
      waves[i].update();
      waves[i].display();
      if (waves[i].isFinished()) {
        waves.splice(i, 1);
      }
    }

    // Apply noise texture overlay using SCREEN blend mode
    p.blendMode(p.SCREEN);
    p.image(noiseGraphics, 0, 0);
    p.blendMode(p.BLEND);

    // Grain effect (post-processing)
    p.loadPixels();
    for (let i = 0; i < p.pixels.length; i += 4) {
      let grain = p.random(-10, 10);
      p.pixels[i] += grain;
      p.pixels[i + 1] += grain;
      p.pixels[i + 2] += grain;
    }
    p.updatePixels();

    // Apply a subtle blur
    p.filter(p.BLUR, 0.75);
  };

  class Wave {
    constructor() {
      this.radius = 0;
      this.speed = p.map(energyLevel, 0, 1, 1, 5);
      this.brightness = p.map(energyLevel, 0, 1, 50, 255);
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
      // Bright orange wave with dark beige fade
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
        let r = p.constrain(p.red(c) + colorOffset, 0, 255);
        let g = p.constrain(p.green(c) + colorOffset, 0, 255);
        let b = p.constrain(p.blue(c) + colorOffset, 0, 255);
        p.fill(r, g, b, this.lifespan);

        // Add glitch effect based on energyLevel
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

  // Generate noise texture with a subtle navy blue tint
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

  // Draw a reddish radial gradient background
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

  // Input handling
  p.touchStarted = () => {
    startY = p.mouseY;
    return false;
  };

  p.touchMoved = () => {
    let deltaY = startY - p.mouseY;
    energyLevel += deltaY * 0.002;
    energyLevel = p.constrain(energyLevel, 0, 1);
    startY = p.mouseY;
    return false;
  };

  p.mousePressed = () => {
    startY = p.mouseY;
  };

  p.mouseDragged = () => {
    let deltaY = startY - p.mouseY;
    energyLevel += deltaY * 0.002;
    energyLevel = p.constrain(energyLevel, 0, 1);
    startY = p.mouseY;
  };

  p.windowResized = () => {
    const container = document.querySelector('.animationScreen');
    let w, h;
    if (container) {
      w = container.offsetWidth;
      h = container.offsetHeight;
    } else {
      w = window.innerWidth;
      h = window.innerHeight;
    }
    p.resizeCanvas(w, h);
    const canvasElement = p.canvas.elt;
    canvasElement.style.position = 'absolute';
    canvasElement.style.left = '50%';
    canvasElement.style.top = '50%';
    canvasElement.style.transform = 'translate(-50%, -50%)';

    noiseGraphics = p.createGraphics(p.width, p.height);
    generateNoiseTexture();
  };
};
