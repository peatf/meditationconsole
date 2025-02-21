"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";

export default function Slide4Animation() {
  return <ReactP5Wrapper sketch={sketch} />;
}

const sketch = (p) => {
  // Move all variables inside sketch
  let questions = [
    "What is the limitless self like?",
    "How would you describe them?",
    "What does it feel like to connect with them?"
  ];
  let currentQuestionIndex = 0;
  let questionAlpha = 0;
  let questionFadingIn = true;
  let questionDisplayed = true;

  // Meta-balls variables
  let numBlobs = 5;
  let blobs = [];
  let blobLayer;
  let layerW, layerH;
  let textLayer;

  // Glitch variables
  let glitchActive = false;
  let glitchTimer = 0;
  let glitchDuration = 25;

  p.setup = () => {
    // Container-based canvas setup
    const defaultWidth = 800;
    const defaultHeight = 600;
    p.createCanvas(defaultWidth, defaultHeight);
    p.noSmooth();

    const container = document.querySelector('.animationScreen');
    if (container) {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    }

    // Initialize offscreen buffers
    layerW = p.floor(p.width / 2);
    layerH = p.floor(p.height / 2);
    blobLayer = p.createGraphics(layerW, layerH);
    textLayer = p.createGraphics(p.width, p.height);
    textLayer.noSmooth();

    // Initialize blobs
    for (let i = 0; i < numBlobs; i++) {
      blobs.push({
        x: p.random(layerW),
        y: p.random(layerH),
        r: p.random(40, 80),
        dx: p.random(-1, 1),
        dy: p.random(-1, 1)
      });
    }

    // Text setup
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(p.min(p.width, p.height) * 0.06);
  };

  p.draw = () => {
    p.background(245, 240, 235);

    // 1) Meta-balls layer
    drawMetaBalls(blobLayer);
    blobLayer.filter(p.BLUR, 3);
    applyBayerDither(blobLayer);
    p.image(blobLayer, 0, 0, p.width, p.height);

    // 2) Text layer
    updateQuestionFade();
    drawArtText();

    // 3) Glitch effect
    if (glitchActive) {
      glitchTimer++;
      applyGlitch();
      if (glitchTimer > glitchDuration) {
        glitchActive = false;
        glitchTimer = 0;
      }
    }

    // 4) Grain effect
    applyGrain(5);
  };

  const drawMetaBalls = (gfx) => {
    gfx.loadPixels();
    for (let b of blobs) {
      b.x += b.dx;
      b.y += b.dy;
      if (b.x < 0 || b.x > layerW) b.dx *= -1;
      if (b.y < 0 || b.y > layerH) b.dy *= -1;
    }

    let pastel1 = p.color(255, 230, 240);
    let pastel2 = p.color(250, 240, 200);
    let pastel3 = p.color(220, 230, 255);
    let thresholds = [0.8, 2.0, 3.5];

    let d = gfx.pixelDensity();
    for (let y = 0; y < gfx.height; y++) {
      for (let x = 0; x < gfx.width; x++) {
        let fieldValue = 0;
        for (let b of blobs) {
          let dx = x - b.x;
          let dy = y - b.y;
          let distSq = dx * dx + dy * dy;
          if (distSq < 0.0001) distSq = 0.0001;
          fieldValue += (b.r * b.r) / distSq;
        }

        let c = p.color(255, 255, 255, 0);
        if (fieldValue > thresholds[0]) c = pastel1;
        if (fieldValue > thresholds[1]) c = pastel2;
        if (fieldValue > thresholds[2]) c = pastel3;

        let index = 4 * (x + y * gfx.width) * d * d;
        gfx.pixels[index + 0] = p.red(c);
        gfx.pixels[index + 1] = p.green(c);
        gfx.pixels[index + 2] = p.blue(c);
        gfx.pixels[index + 3] = p.alpha(c) || 255;
      }
    }
    gfx.updatePixels();
  };

  const drawArtText = () => {
    textLayer.clear();
    textLayer.fill(40, 30, 30, questionAlpha);
    textLayer.textAlign(p.CENTER, p.CENTER);
    textLayer.textSize(p.min(p.width, p.height) * 0.06);
    textLayer.text(questions[currentQuestionIndex], p.width / 2, p.height * 0.5);
    textLayer.filter(p.BLUR, 2);
    applyBayerDither(textLayer);

    p.blendMode(p.MULTIPLY);
    p.image(textLayer, 0, 0);
    p.blendMode(p.BLEND);
  };

  const updateQuestionFade = () => {
    if (questionFadingIn) {
      questionAlpha = p.min(questionAlpha + 4, 255);
      if (questionAlpha === 255) questionFadingIn = false;
    } else if (!questionDisplayed) {
      questionAlpha = p.max(questionAlpha - 4, 0);
      if (questionAlpha === 0) {
        currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
        questionDisplayed = true;
        questionFadingIn = true;
      }
    }
  };

  const applyBayerDither = (gfx) => {
    gfx.loadPixels();
    const bayer = [[1, 9, 3, 11], [13, 5, 15, 7], [4, 12, 2, 10], [16, 8, 14, 6]];
    
    for (let y = 0; y < gfx.height; y++) {
      for (let x = 0; x < gfx.width; x++) {
        let index = 4 * (x + y * gfx.width) * gfx.pixelDensity() ** 2;
        if (gfx.pixels[index + 3] < 1) continue;

        let brightness = (gfx.pixels[index] + gfx.pixels[index + 1] + gfx.pixels[index + 2]) / 3;
        let threshold = (bayer[x % 4][y % 4] / 17) * 255;

        if (brightness < threshold) {
          gfx.pixels[index] = p.lerp(gfx.pixels[index], 245, 0.6);
          gfx.pixels[index + 1] = p.lerp(gfx.pixels[index + 1], 240, 0.6);
          gfx.pixels[index + 2] = p.lerp(gfx.pixels[index + 2], 235, 0.6);
        }
      }
    }
    gfx.updatePixels();
  };

  const applyGlitch = () => {
    let snapshot = p.get();
    let offset = 6;

    p.tint(255, 0, 0);
    p.image(snapshot, p.random(-offset, offset), p.random(-offset, offset));
    p.tint(0, 255, 0, 180);
    p.image(snapshot, p.random(-offset, offset), p.random(-offset, offset));
    p.tint(0, 0, 255, 180);
    p.image(snapshot, p.random(-offset, offset), p.random(-offset, offset));
    p.tint(255);
  };

  const applyGrain = (strength) => {
    p.loadPixels();
    for (let i = 0; i < p.pixels.length; i += 4) {
      let amt = p.random(-strength, strength);
      p.pixels[i] += amt;
      p.pixels[i + 1] += amt;
      p.pixels[i + 2] += amt;
    }
    p.updatePixels();
  };

  // Event handlers
  p.mousePressed = () => {
    if (questionDisplayed) {
      questionDisplayed = false;
      questionFadingIn = false;
      glitchActive = true;
      glitchTimer = 0;
    }
  };

  p.touchStarted = () => {
    p.mousePressed();
    return false;
  };

  p.windowResized = () => {
    const container = document.querySelector('.animationScreen');
    if (container) {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);
      layerW = p.floor(p.width / 2);
      layerH = p.floor(p.height / 2);
      blobLayer = p.createGraphics(layerW, layerH);
      textLayer = p.createGraphics(p.width, p.height);
      textLayer.noSmooth();
      p.textSize(p.min(p.width, p.height) * 0.06);
    }
  };
};
