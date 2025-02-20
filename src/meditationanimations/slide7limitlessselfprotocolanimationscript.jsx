"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";

export default function Slide7Animation() {
  return <ReactP5Wrapper sketch={sketch} />;
}

const sketch = (p) => {

////////////////////////////////////////////
// Pastel Meta-Balls + Blur + Dither + Glitch
// Single Question Edition with Mobile Text Wrapping
////////////////////////////////////////////

// SINGLE QUESTION
const question = "What do you believe is the perspective the limitless self has about your reality right now?";

// TEXT FADE
let questionAlpha = 0;
let questionFadingIn = true;

// META-BALLS
let numBlobs = 5; // Adjust how many “blobs” you want
let blobs = [];

// OFFSCREEN LAYER (lower res => pixelation + speed)
let blobLayer;
let layerW, layerH;

// SEPARATE TEXT LAYER
let textLayer;

// GLITCH
let glitchActive = false;
let glitchTimer = 0;
let glitchDuration = 25; // frames of glitch

    p.setup = function() {
    // First create a default canvas
    const defaultWidth = 800;
    const defaultHeight = 600;
    p.createCanvas(defaultWidth, defaultHeight);

    // Then try to resize it to the container size
    const container = document.querySelector('.animationScreen');
    if (container) {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    }
  p.noSmooth(); // Keep a pixelly vibe when scaling up

  // Offscreen buffer at half resolution for the meta-balls
  layerW = p.floor(p.width / 2);
  layerH = p.floor(p.height / 2);
  blobLayer = p.createGraphics(layerW, layerH);

  // Offscreen layer for text (full size)
  textLayer = p.createGraphics(p.width, p.height);
  textLayer.noSmooth();

  // Create random meta-balls
  for (let i = 0; i < numBlobs; i++) {
    blobs.push({
      x: p.random(layerW),
      y: p.random(layerH),
      r: p.random(40, 80), // radius
      dx: p.random(-1, 1),
      dy: p.random(-1, 1)
    });
  }

  // Text style
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(p.min(p.width, p.height) * 0.06);
  p.textFont("sans-serif");
}

    p.draw = function() {
  p.background(245, 240, 235); // A soft, warm background

  //-----------------------------------------
  // 1) DRAW META-BALLS (half-res) + BLUR + DITHER
  //-----------------------------------------
  drawMetaBalls(blobLayer);
  blobLayer.filter(p.BLUR, 3); // Big blur for dreamy edges
  applyBayerDither(blobLayer);
  // Scale up to main canvas
  p.image(blobLayer, 0, 0, p.width, p.height);

  //-----------------------------------------
  // 2) DRAW/UPDATE ARTISTIC TEXT
  //-----------------------------------------
  updateQuestionFade();
  drawArtText(); // Offscreen text, then blur/dither, then blend

  //-----------------------------------------
  // 3) GLITCH if active
  //-----------------------------------------
  if (glitchActive) {
    glitchTimer++;
    applyGlitch();
    if (glitchTimer > glitchDuration) {
      glitchActive = false;
      glitchTimer = 0;
    }
  }

  //-----------------------------------------
  // 4) FINAL GRAIN PASS
  //-----------------------------------------
  applyGrain(5); // ±5 brightness shift
}

//----------------------------------------------
// META-BALL DRAWING (to blobLayer)
//----------------------------------------------
function drawMetaBalls(gfx) {
  gfx.loadPixels();

  // Move each blob
  for (let b of blobs) {
    b.x += b.dx;
    b.y += b.dy;
    // Bounce off edges in the offscreen layer
    if (b.x < 0 || b.x > layerW) b.dx *= -1;
    if (b.y < 0 || b.y > layerH) b.dy *= -1;
  }

  // Predefine pastel color sets & thresholds
  let pastel1 = p.color(255, 230, 240); // Pinkish
  let pastel2 = p.color(250, 240, 200); // Soft peach
  let pastel3 = p.color(220, 230, 255); // Baby blue
  let thresholds = [0.8, 2.0, 3.5]; // Tune these as needed

  let d = gfx.p.pixelDensity();
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
      gfx.pixels[index + 3] = p.alpha(c) ? p.alpha(c) : 255;
    }
  }
  gfx.updatePixels();
}

//----------------------------------------------
// DRAW ARTISTIC TEXT on textLayer with mobile wrapping
//----------------------------------------------
function drawArtText() {
  // Clear text layer each frame
  textLayer.clear();

  // Enable word wrapping
  textLayer.textWrap(p.WORD);

  // Set text properties
  textLayer.fill(40, 30, 30, questionAlpha);
  textLayer.textAlign(p.CENTER, p.CENTER);
  textLayer.textSize(p.min(p.width, p.height) * 0.06);

  // Draw the question within a bounding box so it stacks on small screens:
  // left margin = width * 0.1, available width = width * 0.8,
  // starting at height * 0.3, with available height = height * 0.4.
  textLayer.text(question, p.width * 0.1, p.height * 0.3, p.width * 0.8, p.height * 0.4);

  // Blur the text for a dreamy edge
  textLayer.filter(p.BLUR, 2);

  // Dither the text for a digital artifact vibe
  applyBayerDither(textLayer);

  // Blend it onto the main canvas
  p.push();
  p.blendMode(p.MULTIPLY);
  p.image(textLayer, 0, 0);
  p.pop();
}

//----------------------------------------------
// FADE LOGIC FOR SINGLE QUESTION
//----------------------------------------------
function updateQuestionFade() {
  // Only fade in once
  if (questionFadingIn) {
    questionAlpha += 4;
    if (questionAlpha >= 255) {
      questionAlpha = 255;
      questionFadingIn = false;
    }
  }
}

//----------------------------------------------
// SIMPLE BAYER DITHER (applied to a p5.Graphics)
//----------------------------------------------
function applyBayerDither(gfx) {
  gfx.loadPixels();
  let d = gfx.p.pixelDensity();

  // 4x4 Bayer matrix
  let bayer = [
    [1, 9, 3, 11],
    [13, 5, 15, 7],
    [4, 12, 2, 10],
    [16, 8, 14, 6]
  ];

  for (let y = 0; y < gfx.height; y++) {
    for (let x = 0; x < gfx.width; x++) {
      let index = 4 * (x + y * gfx.width) * d * d;
      let r = gfx.pixels[index + 0];
      let g = gfx.pixels[index + 1];
      let b = gfx.pixels[index + 2];
      let a = gfx.pixels[index + 3];

      if (a < 1) continue; // Skip fully transparent pixels

      let brightnessVal = (r + g + b) / 3.0;
      let threshold = (bayer[x % 4][y % 4] / 17) * 255;

      if (brightnessVal < threshold) {
        // Push color toward a soft background
        gfx.pixels[index + 0] = p.lerp(r, 245, 0.6);
        gfx.pixels[index + 1] = p.lerp(g, 240, 0.6);
        gfx.pixels[index + 2] = p.lerp(b, 235, 0.6);
      }
    }
  }
  gfx.updatePixels();
}

//----------------------------------------------
// GLITCH (R/G/B channel offset) on main canvas
//----------------------------------------------
function applyGlitch() {
  let snapshot = p.get();
  let offset = 6;

  // Red
  p.tint(255, 0, 0);
  p.image(snapshot, p.random(-offset, offset), p.random(-offset, offset));

  // Green
  p.tint(0, 255, 0, 180);
  p.image(snapshot, p.random(-offset, offset), p.random(-offset, offset));

  // Blue
  p.tint(0, 0, 255, 180);
  p.image(snapshot, p.random(-offset, offset), p.random(-offset, offset));

  p.tint(255);
}

//----------------------------------------------
// FINAL GRAIN PASS
//----------------------------------------------
function applyGrain(strength) {
  p.loadPixels();
  for (let i = 0; i < p.pixels.length; i += 4) {
    let amt = p.random(-strength, strength);
    p.pixels[i + 0] += amt; // R
    p.pixels[i + 1] += amt; // G
    p.pixels[i + 2] += amt; // B
  }
  p.updatePixels();
}

//----------------------------------------------
// CLICK/TAP => GLITCH ONLY
//----------------------------------------------
p.mousePressed = function() {
  glitchActive = true;
  glitchTimer = 0;
}

p.touchStarted = function() {
  glitchActive = true;
  glitchTimer = 0;
  return false;
}

//----------------------------------------------
// RESIZE
//----------------------------------------------
p.windowResized = function() {
  p.resizeCanvas(p.windowWidth, p.windowHeight);
  layerW = p.floor(p.width / 2);
  layerH = p.floor(p.height / 2);
  blobLayer = p.createGraphics(layerW, layerH);
  textLayer = p.createGraphics(p.width, p.height);
  textLayer.noSmooth();

  p.textSize(p.min(p.width, p.height) * 0.06);
}

};
