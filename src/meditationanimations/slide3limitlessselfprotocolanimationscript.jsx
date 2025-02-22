"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";

export default function Slide3Animation() {
  return <ReactP5Wrapper sketch={sketch} />;
}

const sketch = (p) => {
  let dividerX;
  let dragging = false;
  let objectSize;
  let normalBGColor;
  let alteredBGColor;
  let distortedBuffer;
  let startX = 0;
  let startY = 0;
  let touchMovedEnough = false;

  p.setup = () => {
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

    dividerX = p.width / 2;
    objectSize = p.min(p.width, p.height) * 0.4;
    p.pixelDensity(1);
    p.noStroke();
    normalBGColor = p.color(240);
    alteredBGColor = p.color(245, 231, 209);
    distortedBuffer = p.createGraphics(p.width, p.height);
  };

  p.draw = () => {
    p.background(normalBGColor);

    drawPixelatedObject(false, 0);
    distortedBuffer.clear();
    drawPixelatedObject(true, dividerX, distortedBuffer);

    distortedBuffer.filter(p.BLUR, 2);

    p.push();
    let clipWidth = 150;
    let clipX = dividerX - clipWidth / 2;

    p.fill(alteredBGColor);
    p.rect(clipX, 0, clipWidth, p.height);

    let clipPath = new Path2D();
    clipPath.rect(clipX, 0, clipWidth, p.height);
    p.drawingContext.clip(clipPath);

    p.image(distortedBuffer, 0, 0);
    p.pop();

    p.loadPixels();
    for (let i = 0; i < p.pixels.length; i += 4) {
      let grain = p.random(-10, 10);
      p.pixels[i] += grain;
      p.pixels[i + 1] += grain;
      p.pixels[i + 2] += grain;
    }
    p.updatePixels();

    p.stroke(50);
    p.strokeWeight(4);
    p.line(dividerX, 0, dividerX, p.height);
    p.noStroke();
  };

  function drawPixelatedObject(distort, clipX, buffer) {
    let target = buffer || p;
    let pixelSize = objectSize / 10;
    let xOffset = (p.width - objectSize) / 2;
    let yOffset = (p.height - objectSize) / 2;

    target.push();
    target.translate(xOffset, yOffset);

    let colorNormal1 = p.color(100, 200, 100);
    let colorNormal2 = p.color(180, 255, 180);
    let colorDistorted1 = p.color(235, 153, 144);
    let colorDistorted2 = p.color(246, 198, 98);
    let colorDistorted3 = p.color(148, 107, 176);
    let colorDistorted4 = p.color(177, 214, 237);

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        let c = distort
          ? [colorDistorted1, colorDistorted2, colorDistorted3, colorDistorted4][p.floor(p.random(4))]
          : [colorNormal1, colorNormal2][p.floor(p.random(2))];

        let dx = 0;
        let dy = 0;
        let distortedPixelSize = pixelSize;

        if (distort) {
          let distance = p.abs(x * pixelSize + xOffset - clipX);
          let distortionAmount = p.map(distance, 0, p.width / 2, 0.6, 0);
          distortionAmount = p.constrain(distortionAmount, 0, 0.6);

          dx = p.random(-pixelSize * distortionAmount, pixelSize * distortionAmount);
          dy = p.random(-pixelSize * distortionAmount, pixelSize * distortionAmount);
          distortedPixelSize = pixelSize * p.random(0.7, 1.3);

          if (p.random(1) < 0.2 * distortionAmount) continue;
        }

        target.fill(c);
        target.rect(x * pixelSize + dx, y * pixelSize + dy, distortedPixelSize, distortedPixelSize);
      }
    }
    target.pop();
  }

  // --- Mouse/Touch Interaction ---
  p.mousePressed = () => {
    if (p.mouseX > dividerX - 20 && p.mouseX < dividerX + 20) {
      dragging = true;
    }
  };

  p.mouseDragged = () => {
    if (dragging) {
      dividerX = p.constrain(p.mouseX, 50, p.width - 50);
    }
  };

  p.mouseReleased = () => {
    dragging = false;
  };

  p.touchStarted = (event) => {
    if (p.touches.length > 0) {
      startX = p.touches[0].x;
      startY = p.touches[0].y;
      touchMovedEnough = false;

      if (startX > dividerX - 50 && startX < dividerX + 50) {
        dragging = true;
        event.preventDefault(); // Stop browser scrolling immediately
      }
    }
  };

  p.touchMoved = (event) => {
    if (!dragging) {
      // Detect if the touch is mostly vertical (scrolling)
      let dx = Math.abs(p.touches[0].x - startX);
      let dy = Math.abs(p.touches[0].y - startY);

      if (dy > dx * 1.5) {
        // Vertical motion → allow scrolling
        return true;
      }
    }

    if (dragging && p.touches.length > 0) {
      dividerX = p.constrain(p.touches[0].x, 50, p.width - 50);
      touchMovedEnough = true;
      event.preventDefault(); // Stop scrolling once dragging starts
    }
    return false;
  };

  p.touchEnded = () => {
    dragging = false;
    return touchMovedEnough ? false : true; // Only allow scrolling if no dragging happened
  };

  p.windowResized = () => {
    const container = document.querySelector(".animationScreen");
    if (container) {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);

      const canvasElement = p.canvas.elt;
      canvasElement.style.position = "absolute";
      canvasElement.style.left = "50%";
      canvasElement.style.top = "50%";
      canvasElement.style.transform = "translate(-50%, -50%)";

      objectSize = p.min(p.width, p.height) * 0.4;
      dividerX = p.width / 2;
      distortedBuffer = p.createGraphics(p.width, p.height);
    }
  };
};
