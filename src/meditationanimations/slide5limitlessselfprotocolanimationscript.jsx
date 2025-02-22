"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";

export default function Slide5Animation() {
  return <ReactP5Wrapper sketch={sketch} />;
}

const sketch = (p) => {
  // GLOBAL VARIABLES
  const question = "How do you think your limitless self perceives you in this moment?";

  // TEXT FADE
  let questionAlpha = 0;
  let questionFadingIn = true;

  // META-BALLS
  let numBlobs = 7;
  let blobs = [];

  // OFFSCREEN LAYERS
  let offScreen;
  let gridLayer;
  
  // GRAIN strength
  let grainStrength = 5;
  
  // GLITCH variables
  let glitchActive = false;
  let glitchTimer = 0;
  let glitchDuration = 25;
  
  // For touch handling
  let canvasElement;

  p.setup = () => {
    const container = document.querySelector(".animationScreen");
    let w = container ? container.offsetWidth : 800;
    let h = container ? container.offsetHeight : 600;
    const canvas = p.createCanvas(w, h);
    canvasElement = canvas.elt;
    // Center the canvas in the container
    canvasElement.style.position = "absolute";
    canvasElement.style.left = "50%";
    canvasElement.style.top = "50%";
    canvasElement.style.transform = "translate(-50%, -50%)";
    // Prevent default scrolling on the canvas
    canvasElement.style.touchAction = "none";
    
    p.pixelDensity(1);
    // Offscreen buffer for meta-ball field at half resolution
    offScreen = p.createGraphics(w / 2, h / 2);
    offScreen.pixelDensity(1);
    
    // Offscreen layer for retro grid overlay
    gridLayer = p.createGraphics(w, h);
    gridLayer.pixelDensity(1);
    
    // Initialize blobs with slow movement
    for (let i = 0; i < numBlobs; i++) {
      blobs.push({
        x: p.random(offScreen.width),
        y: p.random(offScreen.height),
        r: p.random(30, 70),
        dx: p.random(-1, 1),
        dy: p.random(-1, 1)
      });
    }
    
    // Text style
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(p.min(w, h) * 0.06);
    p.textFont("sans-serif");
  };
  
  p.draw = () => {
    // 1. Cosmic gradient background (deep purple to midnight blue)
    drawGradientBackground();
    
    // 2. Render the meta-ball field into offScreen with a light blue, transparent glow.
    offScreen.loadPixels();
    for (let y = 0; y < offScreen.height; y++) {
      for (let x = 0; x < offScreen.width; x++) {
        let sum = 0;
        for (let b of blobs) {
          let d = p.dist(x, y, b.x, b.y);
          if (d < 0.1) d = 0.1;
          sum += (b.r * b.r) / (d * d);
        }
        let alphaVal = p.map(sum, 0, 10, 0, 200);
        alphaVal = p.constrain(alphaVal, 0, 200);
        let orbColor = p.color(200, 230, 255, alphaVal); // light blue glow
        let index = 4 * (x + y * offScreen.width);
        offScreen.pixels[index + 0] = p.red(orbColor);
        offScreen.pixels[index + 1] = p.green(orbColor);
        offScreen.pixels[index + 2] = p.blue(orbColor);
        offScreen.pixels[index + 3] = p.alpha(orbColor);
      }
    }
    offScreen.updatePixels();
    // Apply a slight blur for a glow effect
    offScreen.filter(p.BLUR, 3);
    
    // Update blob positions (slow movement)
    for (let b of blobs) {
      b.x += b.dx;
      b.y += b.dy;
      if (b.x < 0 || b.x > offScreen.width) b.dx *= -1;
      if (b.y < 0 || b.y > offScreen.height) b.dy *= -1;
    }
    
    // Draw the meta-ball field scaled to full canvas
    p.image(offScreen, 0, 0, p.width, p.height);
    
    // 3. Draw a retro grid overlay that slowly drifts
    drawGridOverlay();
    
    // 4. Update and draw the fading text
    updateQuestionFade();
    drawText();
    
    // 5. Apply a final grain pass
    applyGrain(grainStrength);
    
    // 6. Apply extra screen distortion
    applyScreenDistortion();
    
    // 7. Glitch effect if active
    if (glitchActive) {
      glitchTimer++;
      applyGlitch();
      if (glitchTimer > glitchDuration) {
        glitchActive = false;
        glitchTimer = 0;
      }
    }
  };
  
  function drawGradientBackground() {
    let topColor = p.color(20, 20, 60);
    let bottomColor = p.color(40, 40, 90);
    for (let y = 0; y < p.height; y++) {
      let inter = p.map(y, 0, p.height, 0, 1);
      let c = p.lerpColor(topColor, bottomColor, inter);
      p.stroke(c);
      p.line(0, y, p.width, y);
    }
  }
  
  function drawGridOverlay() {
    gridLayer.clear();
    gridLayer.stroke(255, 50);
    gridLayer.strokeWeight(1);
    let spacing = 40;
    let offset = p.frameCount % spacing;
    for (let x = -offset; x < p.width; x += spacing) {
      gridLayer.line(x, 0, x, p.height);
    }
    for (let y = -offset; y < p.height; y += spacing) {
      gridLayer.line(0, y, p.width, y);
    }
    p.image(gridLayer, 0, 0);
  }
  
  function updateQuestionFade() {
    if (questionFadingIn) {
      questionAlpha += 1;
      if (questionAlpha >= 255) {
        questionAlpha = 255;
        questionFadingIn = false;
      }
    }
  }
  
  function drawText() {
    p.push();
    p.fill(255, questionAlpha);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(p.min(p.width, p.height) * 0.06);
    // Use a bounding box that leaves margins so text doesn't get cropped
    p.text(question, p.width * 0.1, p.height * 0.3, p.width * 0.8, p.height * 0.4);
    p.pop();
  }
  
  function applyGrain(strength) {
    p.loadPixels();
    for (let i = 0; i < p.pixels.length; i += 4) {
      let amt = p.random(-strength, strength);
      p.pixels[i + 0] += amt;
      p.pixels[i + 1] += amt;
      p.pixels[i + 2] += amt;
    }
    p.updatePixels();
  }
  
  function applyScreenDistortion() {
    for (let y = 0; y < p.height; y += 10) {
      let shift = p.int(p.random(-3, 3));
      p.copy(0, y, p.width, 10, shift, y, p.width, 10);
    }
  }
  
  function applyGlitch() {
    let snapshot = p.get();
    let offset = 6;
    p.tint(255, 0, 0);
    p.image(snapshot, p.random(-offset, offset), p.random(-offset, offset));
    p.tint(0, 255, 0, 180);
    p.image(snapshot, p.random(-offset, offset), p.random(-offset, offset));
    p.tint(0, 0, 255, 180);
    p.image(snapshot, p.random(-offset, offset), p.random(-offset, offset));
    p.tint(255);
  }
  
  // --- Interaction Handlers ---
  p.mousePressed = () => {
    glitchActive = true;
    glitchTimer = 0;
  };
  
  p.touchStarted = (event) => {
    // Only prevent default if touch is on the canvas
    if (event.target === canvasElement) {
      glitchActive = true;
      glitchTimer = 0;
      event.preventDefault();
      return false;
    }
    return true;
  };
  
  // p.touchEnded is not needed to block scrolling in Slide5
  // since the animation is non-interactive beyond triggering glitch.
  
  p.windowResized = () => {
    const container = document.querySelector(".animationScreen");
    let w = container ? container.offsetWidth : p.windowWidth;
    let h = container ? container.offsetHeight : p.windowHeight;
    p.resizeCanvas(w, h);
    offScreen = p.createGraphics(w / 2, h / 2);
    offScreen.pixelDensity(1);
    gridLayer = p.createGraphics(w, h);
    gridLayer.pixelDensity(1);
    p.textSize(p.min(w, h) * 0.06);
  };
};
