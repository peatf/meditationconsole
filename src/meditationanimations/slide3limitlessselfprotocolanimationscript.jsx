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

  p.setup = () => {
    const container = document.querySelector('.animationScreen');
    let w = container ? container.offsetWidth : 800;
    let h = container ? container.offsetHeight : 600;
    const canvas = p.createCanvas(w, h);

    // Center the canvas in the container
    const canvasElement = canvas.elt;
    canvasElement.style.position = 'absolute';
    canvasElement.style.left = '50%';
    canvasElement.style.top = '50%';
    canvasElement.style.transform = 'translate(-50%, -50%)';

    dividerX = p.width / 2;
    objectSize = p.min(p.width, p.height) * 0.4;
    p.pixelDensity(1);
    p.noStroke();
    normalBGColor = p.color(240); // Light gray
    alteredBGColor = p.color(245, 231, 209); // Beige
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
        let c;

        if (distort) {
          let choice = p.floor(p.random(4));
          c = [colorDistorted1, colorDistorted2, colorDistorted3, colorDistorted4][choice];
        } else {
          let choice = p.floor(p.random(2));
          c = choice === 0 ? colorNormal1 : colorNormal2;
        }

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

          if (p.random(1) < 0.2 * distortionAmount) {
            continue;
          }
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

  p.touchStarted = () => {
    startX = p.mouseX;
    startY = p.mouseY;

    if (p.touches.length > 0 && p.touches[0].x > dividerX - 50 && p.touches[0].x < dividerX + 50) {
      dragging = true;
    }
    return true;
  };

  p.touchMoved = () => {
    if (!dragging) {
      let deltaY = startY - p.mouseY;
      let deltaX = p.mouseX - startX;

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return true;
      }
      return false;
    }

    if (dragging && p.touches.length > 0) {
      dividerX = p.constrain(p.touches[0].x, 50, p.width - 50);
    }
    return false;
  };

  p.touchEnded = () => {
    dragging = false;
    return false;
  };

  p.windowResized = () => {
    const container = document.querySelector('.animationScreen');
    if (container) {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);

      // Update canvas positioning on resize
      const canvasElement = p.canvas.elt;
      canvasElement.style.position = 'absolute';
      canvasElement.style.left = '50%';
      canvasElement.style.top = '50%';
      canvasElement.style.transform = 'translate(-50%, -50%)';

      objectSize = p.min(p.width, p.height) * 0.4;
      dividerX = p.width / 2;
      distortedBuffer = p.createGraphics(p.width, p.height);
    }
  };
};
