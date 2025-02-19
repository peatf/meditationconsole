"use client";
import { ReactP5Wrapper } from "react-p5-wrapper";

export default function Slide4Animation() {
  return <ReactP5Wrapper sketch=Slide4Animation />;
}

"use client";
import { ReactP5Wrapper } from "react-p5-wrapper";

"use client";

////////////////////////////////////////////
// Pastel Meta-Balls + Blur + Dither + Glitch
// + Artistic Text Layer
////////////////////////////////////////////

// QUESTIONS
let questions = [
  "What is the limitless self like?",
  "How would you describe them?",
  "What does it feel like to connect with them?"
];
let currentQuestionIndex = 0;
let questionAlpha = 0;
let questionFadingIn = true;
let questionDisplayed = true;

// META-BALLS
let numBlobs = 5; // Adjust how many “blobs” you want
let blobs = [];

// OFFSCREEN LAYER (lower res => pixelation + speed)
let blobLayer;
let layerW, layerH;

// SEPARATE TEXT LAYER (full res, but we'll still blur & dither)
let textLayer;

// GLITCH
let glitchActive = false;
let glitchTimer = 0;
let glitchDuration = 25; // frames of glitch

function setup() {
  createCanvas(windowWidth, windowHeight);
  noSmooth(); // Helps keep a pixelly vibe when scaling up

  // Offscreen buffer at half resolution for the meta-balls
  layerW = floor(width / 2);
  layerH = floor(height / 2);
  blobLayer = createGraphics(layerW, layerH);

  // Offscreen layer for text (full size so it lines up precisely)
  textLayer = createGraphics(width, height);
  textLayer.noSmooth();

  // Create random meta-balls
  for (let i = 0; i < numBlobs; i++) {
    blobs.push({
      x: random(layerW),
      y: random(layerH),
      r: random(40, 80), // radius
      dx: random(-1, 1),
      dy: random(-1, 1)
    });
  }

  // Initialize text style
  textAlign(CENTER, CENTER);
  textSize(min(width, height) * 0.06);
  textFont("sans-serif");
}

function draw() {
  background(245, 240, 235); // A soft, warm background

  //-----------------------------------------
  // 1) DRAW META-BALLS (half-res) + BLUR + DITHER
  //-----------------------------------------
  drawMetaBalls(blobLayer);
  blobLayer.filter(BLUR, 3); // big blur for dreamy edges
  applyBayerDither(blobLayer);
  // Scale up to main canvas
  image(blobLayer, 0, 0, width, height);

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
  let pastel1 = color(255, 230, 240); // pinkish
  let pastel2 = color(250, 240, 200); // soft peach
  let pastel3 = color(220, 230, 255); // baby blue
  let thresholds = [0.8, 2.0, 3.5]; // tune these

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

      let c = color(255, 255, 255, 0);
      if (fieldValue > thresholds[0]) c = pastel1;
      if (fieldValue > thresholds[1]) c = pastel2;
      if (fieldValue > thresholds[2]) c = pastel3;

      let index = 4 * (x + y * gfx.width) * d * d;
      gfx.pixels[index + 0] = red(c);
      gfx.pixels[index + 1] = green(c);
      gfx.pixels[index + 2] = blue(c);
      gfx.pixels[index + 3] = alpha(c) ? alpha(c) : 255;
    }
  }
  gfx.updatePixels();
}

//----------------------------------------------
// DRAW ARTISTIC TEXT on textLayer
//----------------------------------------------
function drawArtText() {
  // Clear text layer each frame
  textLayer.clear();

  // Draw the question text
  textLayer.fill(40, 30, 30, questionAlpha);
  textLayer.textAlign(CENTER, CENTER);
  textLayer.textSize(min(width, height) * 0.06);
  textLayer.text(questions[currentQuestionIndex], width / 2, height * 0.5);

  // Blur the text for a dreamy edge
  textLayer.filter(BLUR, 2);

  // Dither the text for a digital artifact vibe
  applyBayerDither(textLayer);

  // Blend it onto the main canvas
  push();
  blendMode(MULTIPLY);
  image(textLayer, 0, 0);
  pop();
}

//----------------------------------------------
// FADE LOGIC FOR QUESTIONS
//----------------------------------------------
function updateQuestionFade() {
  if (questionFadingIn) {
    questionAlpha += 4;
    if (questionAlpha >= 255) {
      questionAlpha = 255;
      questionFadingIn = false;
    }
  } else if (!questionFadingIn && !questionDisplayed) {
    // fade out
    questionAlpha -= 4;
    if (questionAlpha <= 0) {
      questionAlpha = 0;
      // Move to next question
      currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
      questionDisplayed = true;
      questionFadingIn = true;
    }
  }
}

//----------------------------------------------
// SIMPLE BAYER DITHER (applied to a p5.Graphics)
//----------------------------------------------
function applyBayerDither(gfx) {
  gfx.loadPixels();
  let d = gfx.pixelDensity();

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

      if (a < 1) continue; // skip fully transparent

      let brightnessVal = (r + g + b) / 3.0;
      let threshold = (bayer[x % 4][y % 4] / 17) * 255;

      if (brightnessVal < threshold) {
        // push color toward a soft background
        gfx.pixels[index + 0] = lerp(r, 245, 0.6);
        gfx.pixels[index + 1] = lerp(g, 240, 0.6);
        gfx.pixels[index + 2] = lerp(b, 235, 0.6);
      }
    }
  }
  gfx.updatePixels();
}

//----------------------------------------------
// GLITCH (R/G/B channel offset) on main canvas
//----------------------------------------------
function applyGlitch() {
  let snapshot = get();
  let offset = 6;

  // Red
  tint(255, 0, 0);
  image(snapshot, random(-offset, offset), random(-offset, offset));

  // Green
  tint(0, 255, 0, 180);
  image(snapshot, random(-offset, offset), random(-offset, offset));

  // Blue
  tint(0, 0, 255, 180);
  image(snapshot, random(-offset, offset), random(-offset, offset));

  tint(255);
}

//----------------------------------------------
// FINAL GRAIN PASS
//----------------------------------------------
function applyGrain(strength) {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let amt = random(-strength, strength);
    pixels[i + 0] += amt; // R
    pixels[i + 1] += amt; // G
    pixels[i + 2] += amt; // B
  }
  updatePixels();
}

//----------------------------------------------
// CLICK/TAP => GLITCH & NEXT QUESTION
//----------------------------------------------
function mousePressed() {
  if (questionDisplayed) {
    questionDisplayed = false;
    questionFadingIn = false;
    glitchActive = true;
    glitchTimer = 0;
  }
}

function touchStarted() {
  mousePressed();
  return false;
}

//----------------------------------------------
// RESIZE
//----------------------------------------------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  layerW = floor(width / 2);
  layerH = floor(height / 2);
  blobLayer = createGraphics(layerW, layerH);
  textLayer = createGraphics(width, height);
  textLayer.noSmooth();

  textSize(min(width, height) * 0.06);
}
