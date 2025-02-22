"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";

export default function Slide7Animation() {
  return <ReactP5Wrapper sketch={sketch} />;
}

const sketch = (p) => {
  let blobs = [];
  let numBlobs = 4; // Fewer, larger blobs
  let blobLayer, textLayer, gradientLayer, noiseLayer;
  let layerW, layerH;

  let question = "How do you think your limitless self perceives your reality in this moment?";
  let questionAlpha = 255;
  let questionColor;
  let colorPalette = [];

  // Flow Field
  let flowField = [];
  let flowFieldResolution = 20;
  let flowFieldZOffset = 0;
  let flowFieldIncrement = 0.01;
  let particleSpeed = 1;

  p.setup = function () {
    const container = document.querySelector(".animationScreen");
    let w = container ? container.offsetWidth : 800;
    let h = container ? container.offsetHeight : 600;
    const canvas = p.createCanvas(w, h);

    // Center the canvas
    const canvasElement = canvas.elt;
    canvasElement.style.position = "absolute";
    canvasElement.style.left = "50%";
    canvasElement.style.top = "50%";
    canvasElement.style.transform = "translate(-50%, -50%)";

    p.pixelDensity(1);

    layerW = p.floor(w / 2);
    layerH = p.floor(h / 2);

    blobLayer = p.createGraphics(layerW, layerH);
    blobLayer.pixelDensity(1);

    textLayer = p.createGraphics(w, h);
    textLayer.noSmooth();

    gradientLayer = p.createGraphics(w, h);
    gradientLayer.pixelDensity(1);

    noiseLayer = p.createGraphics(w, h);
    noiseLayer.pixelDensity(1);

    // Extracted colors (soft pastel palette)
    colorPalette = [
      p.color(248, 237, 181),
      p.color(237, 156, 120),
      p.color(58, 45, 43),
      p.color(213, 205, 163),
      p.color(236, 203, 202),
    ];
    questionColor = colorPalette[2];

    // Initialize blobs (larger, fewer, using palette colors)
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

    // Initialize Flow Field
    initFlowField();
  };
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

  p.draw = function () {
    p.background(colorPalette[0]);

    drawIrregularOrbs(blobLayer);
    applyPixelation(blobLayer, 3);
    blobLayer.filter(p.BLUR, 3);
    applyEdgeNoise(blobLayer);
    p.image(blobLayer, 0, 0, p.width, p.height);

    drawSubtleGradient(gradientLayer);
    p.image(gradientLayer, 0, 0);

    drawText();

    applyFlowFieldDistortion();
    applySubtleNoise(noiseLayer);
    p.image(noiseLayer, 0, 0);
  };

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
      let p1 = flowField[i];
      let angle = p.noise(p1.x * 0.005, p1.y * 0.005, flowFieldZOffset) * p.TWO_PI * 2;
      let v = p5.Vector.fromAngle(angle);
      v.setMag(particleSpeed);

      let sourceX = p.floor(p1.x + v.x);
      let sourceY = p.floor(p1.y + v.y);

      sourceX = p.constrain(sourceX, 0, p.width - 1);
      sourceY = p.constrain(sourceY, 0, p.height - 1);

      let sourceIdx = (sourceY * p.width + sourceX) * 4;
      let destIdx = (p.floor(p1.y) * p.width + p.floor(p1.x)) * 4;

      p.pixels[destIdx] = tempPixels[sourceIdx];
      p.pixels[destIdx + 1] = tempPixels[sourceIdx + 1];
      p.pixels[destIdx + 2] = tempPixels[sourceIdx + 2];
      p.pixels[destIdx + 3] = tempPixels[sourceIdx + 3];
    }

    p.updatePixels();
    flowFieldZOffset += flowFieldIncrement;
  }

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

  function drawText() {
    textLayer.clear();
    textLayer.textWrap(p.WORD);
    textLayer.textAlign(p.CENTER, p.CENTER);
    textLayer.textSize(p.min(p.width, p.height) * 0.04);

    textLayer.fill(p.red(questionColor), p.green(questionColor), p.blue(questionColor), 50);
    textLayer.text(question, p.width * 0.1 + 2, p.height * 0.3 + 2, p.width * 0.8, p.height * 0.4);
    textLayer.filter(p.BLUR, 2);

    textLayer.fill(questionColor);
    textLayer.text(question, p.width * 0.1, p.height * 0.3, p.width * 0.8, p.height * 0.4);
    p.image(textLayer, 0, 0);
  }

  function applySubtleNoise(gfx) {
    gfx.clear();
    gfx.loadPixels();
    for (let i = 0; i < gfx.pixels.length; i += 4) {
      let noiseVal = p.random(50);
      gfx.pixels[i] = noiseVal;
      gfx.pixels[i + 1] = noiseVal;
      gfx.pixels[i + 2] = noiseVal;
      gfx.pixels[i + 3] = 50;
    }
    gfx.updatePixels();
  }
};
