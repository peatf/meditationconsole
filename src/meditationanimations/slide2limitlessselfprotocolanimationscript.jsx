"use client";
import { ReactP5Wrapper } from "react-p5-wrapper";

export default function Slide2Animation() {
  return <ReactP5Wrapper sketch=Slide2Animation />;
}

"use client";
import { ReactP5Wrapper } from "react-p5-wrapper";

"use client";

let energyLevel = 0;
let waves = [];
let startY = 0;
let noiseGraphics;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noStroke();
  noiseGraphics = createGraphics(width, height);
  generateNoiseTexture();
}

function draw() {
  // --- Beige Background Gradient ---
  drawBackgroundGradient();

  // --- Create New Waves ---
  if (frameCount % (60 - map(energyLevel, 0, 1, 10, 50)) === 0) {
    waves.push(new Wave());
  }

  // --- Update and Display Waves ---
  for (let i = waves.length - 1; i >= 0; i--) {
    waves[i].update();
    waves[i].display();
    if (waves[i].isFinished()) {
      waves.splice(i, 1);
    }
  }

  // --- Apply Noise Texture (as an overlay) ---
  blendMode(OVERLAY);
  image(noiseGraphics, 0, 0);
  blendMode(BLEND);

  // --- Grain Effect (Post-Processing) ---
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let grain = random(-10, 10);
    pixels[i] += grain;
    pixels[i + 1] += grain;
    pixels[i + 2] += grain;
  }
  updatePixels();

  // --- Subtle Blur ---
  filter(BLUR, 0.75); // Adjust value (0.5 - 1.5) as needed.
}

// --- Wave Class ---
class Wave {
  constructor() {
    this.radius = 0;
    this.speed = map(energyLevel, 0, 1, 1, 5);
    this.brightness = map(energyLevel, 0, 1, 50, 255);
    this.segments = 120;
    this.glitchProbability = 0.01;
    this.lifespan = 255;
    this.noiseOffsetX = random(1000);
    this.noiseOffsetY = random(1000);
  }

  update() {
    this.radius += this.speed;
    this.lifespan -= 1;
  }

  isFinished() {
    return this.lifespan < 0;
  }

  display() {
    // --- More Yellowish Green ---
    let baseColor = color(180, 220, 100, this.lifespan); // Increased red, kept green high, reduced blue
    let darkBeige = color(100, 90, 70, this.lifespan); // Dark beige for fading

    push();
    translate(width / 2, height);

    for (let i = 0; i < this.segments; i++) {
      let angle = map(i, 0, this.segments, 0, TWO_PI);
      let noiseX = this.noiseOffsetX + this.radius * 0.01 * cos(angle);
      let noiseY = this.noiseOffsetY + this.radius * 0.01 * sin(angle);
      let radiusOffset = noise(noiseX, noiseY, frameCount * 0.01) * 20;

      let x = (this.radius + radiusOffset) * cos(angle);
      let y = (this.radius + radiusOffset) * sin(angle);

      let size = map(noise(i * 0.1, this.radius * 0.05), 0, 1, 2, 8);

      // --- Color Variation (using noise) WITH darkBeige---
        let inter = map(this.radius, 0, width, 0, 1); //interp value
        let c = lerpColor(baseColor, darkBeige, inter); //interp between colors.

      let colorOffset = noise(this.radius * 0.02, i * 0.05, frameCount * 0.01) * 50 - 25;
      let r = constrain(red(c) + colorOffset, 0, 255);
      let g = constrain(green(c) + colorOffset, 0, 255);
      let b = constrain(blue(c) + colorOffset, 0, 255);
      fill(r, g, b, this.lifespan);


      if (random(1) < this.glitchProbability * energyLevel) {
        x += random(-10, 10);
        y += random(-10, 10);
        fill(random(255), random(255), random(255));
      }

      ellipse(x, y, size, size);
    }
    pop();
  }
}

// --- Input Handling (Touch and Mouse) ---
function touchStarted() {
  startY = mouseY;
  return false;
}

function touchMoved() {
  let deltaY = startY - mouseY;
  energyLevel += deltaY * 0.002;
  energyLevel = constrain(energyLevel, 0, 1);
  startY = mouseY;
  return false;
}

function mousePressed() {
  startY = mouseY;
}

function mouseDragged() {
  let deltaY = startY - mouseY;
  energyLevel += deltaY * 0.002;
  energyLevel = constrain(energyLevel, 0, 1);
  startY = mouseY;
}

// --- Pre-generate Noise Texture ---
function generateNoiseTexture() {
  noiseGraphics.noStroke();
  for (let x = 0; x < noiseGraphics.width; x++) {
    for (let y = 0; y < noiseGraphics.height; y++) {
      let noiseVal = noise(x * 0.05, y * 0.05);
      let c = map(noiseVal, 0, 1, 100, 180); // Adjusted for beige tones
      noiseGraphics.fill(c);
      noiseGraphics.rect(x, y, 1, 1);
    }
  }
}

// --- Draw Beige Radial Gradient Background ---
function drawBackgroundGradient() {
  let backgroundColor1 = color(235, 225, 200); // Light Beige
  let backgroundColor2 = color(215, 205, 180); // Darker Beige

  for (let r = height; r > 0; r -= 2) {
    let inter = map(r, 0, height, 1, 0);
    let c = lerpColor(backgroundColor1, backgroundColor2, inter);
    fill(c);
    ellipse(width / 2, height, r * 2, r * 2);
  }
}

// --- Resize Canvas on Window Resize ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  noiseGraphics = createGraphics(width, height);
  generateNoiseTexture();
}