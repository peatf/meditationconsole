"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";

export default function Slide7Animation() {
  return <ReactP5Wrapper sketch={sketch} />;
}

const sketch = (p) => {
  // Global Variables for Visuals
  let blobs = [];
  let numBlobs = 4; // Fewer, larger blobs
  let blobLayer, textLayer, gradientLayer, noiseLayer;
  let layerW, layerH;

  let question =
    "How do you think your limitless self perceives your reality in this moment?";
  let questionAlpha = 255; // Start fully visible
  let questionColor; // To be set from palette

  // COLORS (from the image)
  let colorPalette = [];

  // FLOW FIELD Variables
  let flowField = [];
  let flowFieldResolution = 20;
  let flowFieldZOffset = 0;
  let flowFieldIncrement = 0.01;
  let particleSpeed = 1;

  p.setup = function () {
    const container = document.querySelector(".animationScreen");
    let w = container ? container.offsetWidth : 800;
    let h = container ? container.offsetHeight : 600;
    p.createCanvas(w, h);
    p.pixelDensity(1);

    // Set up offscreen buffers
    layerW = p.floor(w / 2);
    layerH = p.floor(h / 2);

    blobLayer = p.createGraphics(layerW, layerH);
    blobLayer.pixelDensity(1);

    textLayer = p.createGraphics(w, h);
    textLayer.pixelDensity(1);
    textLayer.noSmooth();

    gradientLayer = p.createGraphics(w, h);
    gradientLayer.pixelDensity(1);

    noiseLayer = p.createGraphics(w, h);
    noiseLayer.pixelDensity(1);

    // Define a soft pastel palette
    colorPalette = [
      p.color(248, 237, 181), // Pale Yellow (Background)
      p.color(237, 156, 120), // Salmon/Orange (for blobs)
      p.color(58, 45, 43),    // Very Dark Brown (for blobs/text)
      p.color(213, 205, 163), // Light Yellow
      p.color(236, 203, 202), // Pink
    ];
    questionColor = colorPalette[2]; // Use dark brown for text

    // Initialize blobs (larger, fewer)
    for (let i = 0; i < numBlobs; i++) {
      let baseR = p.random(150, 250);
      let blobColor = p.random([colorPalette[1], colorPalette[2]]);
      blobs.push({
        x: layerW / 2 + p.random(-layerW * 0.1, layerW * 0.1),
        y: layerH / 2 + p.random(-layerH * 0.1, layerH * 0.1),
        baseR: baseR,
        r: baseR,
        dx: p.random(-0.2, 0.2),
        dy: p.random(-0.2, 0.2),
        noiseOffset: p.random(1000),
        morphSpeed: p.random(0.005, 0.015),
        color: blobColor,
      });
    }

    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(p.min(w, h) * 0.04);
    p.textFont("Georgia");

    initFlowField();
  };

  p.draw = function () {
    // 1) Background
    p.background(colorPalette[0]);

    // 2) Draw meta-ball field
    drawIrregularOrbs(blobLayer);
    applyPixelation(blobLayer, 3);
    blobLayer.filter(p.BLUR, 3);
    applyEdgeNoise(blobLayer);
    p.image(blobLayer, 0, 0, p.width, p.height);

    // 3) Draw subtle gradient overlay
    drawSubtleGradient(gradientLayer);
    p.image(gradientLayer, 0, 0);

    // 4) Apply flow field distortion
    applyFlowFieldDistortion();

    // 5) Apply subtle noise overlay
    applySubtleNoise(noiseLayer);
    p.image(noiseLayer, 0, 0);

    // 6) Draw text on top
    drawArtText();
  };

  // FLOW FIELD FUNCTIONS
  function initFlowField() {
    for (let y = 0; y < p.height; y += flowFieldResolution) {
      for (let x = 0; x < p.width; x += flowFieldResolution) {
        flowField.push(p.createVector(x, y));
      }
    }
  }

  function applyFlowFieldDistortion() {
    p.loadPixels();
    let tempPixels = p.pixels.slice();

    for (let i = 0; i < flowField.length; i++) {
      let v = flowField[i];
      let angle = p.noise(v.x * 0.005, v.y * 0.005, flowFieldZOffset) * p.TWO_PI * 2;
      // Use p.createVector with cosine and sine:
      let vec = p.createVector(p.cos(angle), p.sin(angle));
      vec.setMag(particleSpeed);

      let sourceX = p.floor(v.x + vec.x);
      let sourceY = p.floor(v.y + vec.y);

      sourceX = p.constrain(sourceX, 0, p.width - 1);
      sourceY = p.constrain(sourceY, 0, p.height - 1);

      let sourceIdx = (sourceY * p.width + sourceX) * 4;
      let destIdx = (p.floor(v.y) * p.width + p.floor(v.x)) * 4;

      p.pixels[destIdx] = tempPixels[sourceIdx];
      p.pixels[destIdx + 1] = tempPixels[sourceIdx + 1];
      p.pixels[destIdx + 2] = tempPixels[sourceIdx + 2];
      p.pixels[destIdx + 3] = tempPixels[sourceIdx + 3];
    }

    p.updatePixels();
    flowFieldZOffset += flowFieldIncrement;
  }

  // META-BALLS
  function drawIrregularOrbs(gfx) {
    gfx.clear();
    gfx.noStroke();

    for (let b of blobs) {
      let n = p.noise(b.noiseOffset + p.frameCount * b.morphSpeed);
      b.r = b.baseR * (1 + 0.3 * (n - 0.5));

      gfx.fill(b.color);
      gfx.ellipse(b.x, b.y, b.r * 2, b.r * 2);

      b.x += b.dx;
      b.y += b.dy;
      if (b.x < -b.r || b.x > gfx.width + b.r) b.dx *= -1;
      if (b.y < -b.r || b.y > gfx.height + b.r) b.dy *= -1;
    }
  }

  // GRADIENT OVERLAY
  function drawSubtleGradient(gfx) {
    gfx.clear();
    gfx.noStroke();

    for (let y = 0; y < gfx.height; y++) {
      let t = y / (gfx.height - 1);
      let c = p.lerpColor(colorPalette[0], colorPalette[4], t);
      gfx.stroke(c);
      gfx.line(0, y, gfx.width, y);
    }
  }

  // TEXT: Vertically center and allow wrapping on mobile
  function drawArtText() {
    textLayer.clear();
    textLayer.textWrap(p.WORD);
    // Use LEFT, TOP for text so we can manually position it.
    textLayer.textAlign(p.LEFT, p.TOP);
    textLayer.textSize(p.min(p.width, p.height) * 0.04);
    textLayer.textFont("Georgia");

    // Compute a bounding box: 80% width and 50% height, centered
    let boxW = p.width * 0.8;
    let boxH = p.height * 0.5;
    let boxX = (p.width - boxW) / 2;
    let boxY = (p.height - boxH) / 2;
    
    // Optionally, draw a translucent shadow (for glow effect)
    textLayer.fill(p.red(questionColor), p.green(questionColor), p.blue(questionColor), 50);
    textLayer.text(question, boxX + 2, boxY + 2, boxW, boxH);
    textLayer.filter(p.BLUR, 1);
    
    // Draw main text
    textLayer.fill(questionColor);
    textLayer.text(question, boxX, boxY, boxW, boxH);
    
    p.image(textLayer, 0, 0);
  }

  // NOISE OVERLAY
  function applySubtleNoise(gfx) {
    gfx.clear();
    gfx.loadPixels();
    for (let y = 0; y < gfx.height; y++) {
      for (let x = 0; x < gfx.width; x++) {
        let idx = 4 * (x + y * gfx.width);
        let noiseVal = p.random(50);
        gfx.pixels[idx + 0] = noiseVal;
        gfx.pixels[idx + 1] = noiseVal;
        gfx.pixels[idx + 2] = noiseVal;
        gfx.pixels[idx + 3] = 50;
      }
    }
    gfx.updatePixels();
  }

  // Pixelation function
  function applyPixelation(gfx, blockSize) {
    gfx.loadPixels();
    let d = gfx.pixelDensity();
    let totalW = gfx.width * d;
    let totalH = gfx.height * d;

    for (let y = 0; y < totalH; y += blockSize) {
      for (let x = 0; x < totalW; x += blockSize) {
        let idx = 4 * (x + y * totalW);
        let r = gfx.pixels[idx + 0];
        let g = gfx.pixels[idx + 1];
        let b = gfx.pixels[idx + 2];
        let a = gfx.pixels[idx + 3];
        for (let py = 0; py < blockSize; py++) {
          for (let px = 0; px < blockSize; px++) {
            let x2 = x + px;
            let y2 = y + py;
            if (x2 < totalW && y2 < totalH) {
              let idx2 = 4 * (x2 + y2 * totalW);
              gfx.pixels[idx2 + 0] = r;
              gfx.pixels[idx2 + 1] = g;
              gfx.pixels[idx2 + 2] = b;
              gfx.pixels[idx2 + 3] = a;
            }
          }
        }
      }
    }
    gfx.updatePixels();
  }

  // Edge Noise function
  function applyEdgeNoise(gfx) {
    gfx.loadPixels();
    let d = gfx.pixelDensity();
    let totalW = gfx.width * d;
    let totalH = gfx.height * d;
    let originalPixels = gfx.pixels.slice();

    for (let y = 1; y < totalH - 1; y++) {
      for (let x = 1; x < totalW - 1; x++) {
        let idx = 4 * (x + y * totalW);
        let a = originalPixels[idx + 3];
        if (a > 50) {
          let alphaDiff = 0;
          for (let ny = -1; ny <= 1; ny++) {
            for (let nx = -1; nx <= 1; nx++) {
              let nIdx = 4 * ((x + nx) + (y + ny) * totalW);
              alphaDiff += p.abs(a - originalPixels[nIdx + 3]);
            }
          }
          if (alphaDiff > 200) {
            let noiseVal = p.random(-40, 40);
            gfx.pixels[idx + 0] = p.constrain(gfx.pixels[idx + 0] + noiseVal, 0, 255);
            gfx.pixels[idx + 1] = p.constrain(gfx.pixels[idx + 1] + noiseVal, 0, 255);
            gfx.pixels[idx + 2] = p.constrain(gfx.pixels[idx + 2] + noiseVal, 0, 255);
          }
        }
      }
    }
    gfx.updatePixels();
  }

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    layerW = p.floor(p.width / 2);
    layerH = p.floor(p.height / 2);

    blobLayer = p.createGraphics(layerW, layerH);
    blobLayer.pixelDensity(1);

    textLayer = p.createGraphics(p.width, p.height);
    textLayer.noSmooth();

    gradientLayer = p.createGraphics(p.width, p.height);
    gradientLayer.pixelDensity(1);

    noiseLayer = p.createGraphics(p.width, p.height);
    noiseLayer.pixelDensity(1);

    blobs = [];
    for (let i = 0; i < numBlobs; i++) {
      let baseR = p.random(150, 250);
      let blobColor = p.random(colorPalette.slice(1, 3));
      blobs.push({
        x: layerW / 2 + p.random(-layerW * 0.1, layerW * 0.1),
        y: layerH / 2 + p.random(-layerH * 0.1, layerH * 0.1),
        baseR: baseR,
        r: baseR,
        dx: p.random(-0.2, 0.2),
        dy: p.random(-0.2, 0.2),
        noiseOffset: p.random(1000),
        morphSpeed: p.random(0.005, 0.015),
        color: blobColor,
      });
    }

    flowField = [];
    initFlowField();
    p.textSize(p.min(p.width, p.height) * 0.04);
  };
};
