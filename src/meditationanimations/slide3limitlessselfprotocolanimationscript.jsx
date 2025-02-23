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

    // Center the canvas in the container
    const canvasElement = canvas.elt;
    canvasElement.style.position = "absolute";
    canvasElement.style.left = "50%";
    canvasElement.style.top = "50%";
    canvasElement.style.transform = "translate(-50%, -50%)";

    dividerX = p.width / 2;
    objectSize = p.min(p.width, p.height) * 0.4;

    p.pixelDensity(1);
    p.noStroke();

    // Updated background colors
    normalBGColor = p.color(240);        // Left background (light gray)
    alteredBGColor = p.color(85, 115, 235); // Right background (the "blue"/"beige" color)

    // Create off-screen graphics buffer for distortion
    distortedBuffer = p.createGraphics(p.width, p.height);
  };

  p.draw = () => {
    // --- LEFT SIDE (Normal) ---
    p.background(normalBGColor);
    drawPixelatedObject(false, 0); // draws the normal object directly on the main canvas

    // --- RIGHT SIDE (Distorted) ---
    distortedBuffer.clear();
    distortedBuffer.background(alteredBGColor);
    drawPixelatedObject(true, dividerX, distortedBuffer);
    distortedBuffer.filter(p.BLUR, 2); // slight blur on the distorted buffer

    // Clip the distorted buffer so it only shows from 'dividerX' to the right
    p.push();
    let clipPath = new Path2D();
    clipPath.rect(dividerX, 0, p.width - dividerX, p.height);
    p.drawingContext.clip(clipPath);
    p.image(distortedBuffer, 0, 0);
    p.pop();

    // --- Grain effect across entire canvas ---
    p.loadPixels();
    for (let i = 0; i < p.pixels.length; i += 4) {
      let grain = p.random(-10, 10);
      p.pixels[i]     += grain;     // R
      p.pixels[i + 1] += grain;     // G
      p.pixels[i + 2] += grain;     // B
    }
    p.updatePixels();

    // --- Divider line ---
    p.stroke(50);
    p.strokeWeight(4);
    p.line(dividerX, 0, dividerX, p.height);
    p.noStroke();
  };

  // Draw the pixelated object; if 'distort' is true, use the distortion logic
  function drawPixelatedObject(distort, clipX, buffer) {
    let target = buffer || p; // if a buffer is provided, draw there, else draw on main canvas
    let pixelSize = objectSize / 10;
    let xOffset = (p.width - objectSize) / 2;
    let yOffset = (p.height - objectSize) / 2;

    target.push();
    target.translate(xOffset, yOffset);

    // Updated color palette
    let colorNormal1 = p.color(255, 153, 117);
    let colorNormal2 = p.color(232, 181, 148);

    let colorDistorted1 = p.color(232, 179, 220);
    let colorDistorted2 = p.color(255, 70, 57);
    let colorDistorted3 = p.color(255, 153, 117);
    let colorDistorted4 = p.color(210, 212, 177);

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        let c;

        if (distort) {
          // Randomly pick among four distorted colors
          let choice = p.floor(p.random(4));
          if      (choice === 0) c = colorDistorted1;
          else if (choice === 1) c = colorDistorted2;
          else if (choice === 2) c = colorDistorted3;
          else                   c = colorDistorted4;
        } else {
          // Randomly pick among two normal colors
          let choice = p.floor(p.random(2));
          c = (choice === 0) ? colorNormal1 : colorNormal2;
        }

        // Distortion logic
        let dx = 0;
        let dy = 0;
        let distortedPixelSize = pixelSize;

        if (distort) {
          // More distortion near the divider
          let distance = p.abs(x * pixelSize + xOffset - clipX);
          let distortionAmount = p.map(distance, 0, p.width / 2, 0.6, 0);
          distortionAmount = p.constrain(distortionAmount, 0, 0.6);

          dx = p.random(-pixelSize * distortionAmount, pixelSize * distortionAmount);
          dy = p.random(-pixelSize * distortionAmount, pixelSize * distortionAmount);
          distortedPixelSize = pixelSize * p.random(0.7, 1.3);

          // Occasionally skip drawing a pixel for a glitch effect
          if (p.random(1) < 0.2 * distortionAmount) {
            continue; // do not draw this pixel
          }
        }

        target.fill(c);
        target.rect(x * pixelSize + dx, y * pixelSize + dy, distortedPixelSize, distortedPixelSize);
      }
    }
    target.pop();
  }

  // --- MOUSE/TOUCH INTERACTION FOR DIVIDER DRAG ---

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

      // If touch is near the divider, start dragging
      if (startX > dividerX - 50 && startX < dividerX + 50) {
        dragging = true;
        event.preventDefault(); // stop browser scrolling immediately
      }
    }
  };

  p.touchMoved = (event) => {
    // If not dragging, allow vertical scrolling if motion is clearly vertical
    if (!dragging) {
      let dx = Math.abs(p.touches[0].x - startX);
      let dy = Math.abs(p.touches[0].y - startY);
      if (dy > dx * 1.5) {
        // Vertical motion => allow scrolling
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
    // Only allow scrolling if no dragging actually happened
    return touchMovedEnough ? false : true;
  };

  // --- RESIZE HANDLER ---
  p.windowResized = () => {
    const container = document.querySelector(".animationScreen");
    if (container) {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);

      // Re-center
      const canvasElement = p.canvas.elt;
      canvasElement.style.position = "absolute";
      canvasElement.style.left = "50%";
      canvasElement.style.top = "50%";
      canvasElement.style.transform = "translate(-50%, -50%)";

      // Recalculate object size, divider, and buffer
      objectSize = p.min(p.width, p.height) * 0.4;
      dividerX = p.width / 2;
      distortedBuffer = p.createGraphics(p.width, p.height);
    }
  };
};
