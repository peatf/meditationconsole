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

    p.setup = () => {
    // First create a default canvas
    const defaultWidth = 800;
    const defaultHeight = 600;
    p.createCanvas(defaultWidth, defaultHeight);

    // Then try to resize it to the container size
    const container = document.querySelector('.animationScreen');
    if (container) {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    }

  dividerX = p.width / 2;
  objectSize = p.min(p.width, p.height) * 0.4;
  p.pixelDensity(1);
  p.noStroke();
  normalBGColor = p.color(240); // Light gray
  alteredBGColor = p.color(245, 231, 209); // Beige
  distortedBuffer = p.createGraphics(p.width, p.height); // Create the buffer
}

    p.draw = () => {
  p.background(normalBGColor);

  // --- Draw the "Normal" Object ---
  drawPixelatedObject(false, 0);

  // --- Prepare the Distorted Object (on the buffer) ---
  distortedBuffer.clear(); // Clear the buffer
  drawPixelatedObject(true, dividerX, distortedBuffer); // Draw distorted object ONTO the buffer

  // --- Apply Blur to the ENTIRE Distorted Buffer ---
  distortedBuffer.filter(p.BLUR, 2); // Apply blur to the whole buffer ONCE

  // --- Apply Clipping and Draw Distorted Object ---
  p.push();
  let clipWidth = 150;
  let clipX = dividerX - clipWidth / 2;

  // Draw altered background within clip
  p.fill(alteredBGColor);
  p.rect(clipX, 0, clipWidth, p.height);

  let clipPath = new Path2D();
  clipPath.rect(clipX, 0, clipWidth, p.height);
  p.drawingContext.clip(clipPath);

  p.image(distortedBuffer, 0, 0); // Draw the blurred, distorted buffer

  p.pop(); // Restore drawing state

  // --- Grain Effect (Post-Processing) ---
  p.loadPixels();
  for (let i = 0; i < p.pixels.length; i += 4) {
    let grain = p.random(-10, 10);
    p.pixels[i] += grain;
    p.pixels[i + 1] += grain;
    p.pixels[i + 2] += grain;
  }
  p.updatePixels();

  // --- Draw the Divider ---
  p.stroke(50);
  p.strokeWeight(4);
  p.line(dividerX, 0, dividerX, p.height);
  p.noStroke();
}
// --- Function to Draw the Pixelated Object ---
function drawPixelatedObject(distort, clipX, buffer) {
    let target = buffer || p; // Draw to buffer if provided, otherwise to main canvas
  let pixelSize = objectSize / 10;
  let xOffset = (p.width - objectSize) / 2;
  let yOffset = (p.height - objectSize) / 2;

  target.push();
  target.translate(xOffset, yOffset);

  // --- Colors ---
  let colorNormal1 = p.color(100, 200, 100); // Original Green
  let colorNormal2 = p.color(180, 255, 180); // Original Light Green
  let colorDistorted1 = p.color(235, 153, 144); // Reddish (from Laughter I)
  let colorDistorted2 = p.color(246, 198, 98);  // Yellowish (from Laughter I)
  let colorDistorted3 = p.color(148, 107, 176);  // Purple-ish (from Laughter I)
  let colorDistorted4 = p.color(177, 214, 237); // Light blue (from Laughter I)

  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      let c;

      if (distort) {
        let choice = p.floor(p.random(4));
        if (choice === 0) c = colorDistorted1;
        else if (choice === 1) c = colorDistorted2;
        else if (choice === 2) c = colorDistorted3;
        else c = colorDistorted4;
      } else {
        let choice = p.floor(p.random(2));
        c = (choice === 0) ? colorNormal1 : colorNormal2;
      }

      // --- Distortion (if distort is true) ---
      let dx = 0;
      let dy = 0;
      let distortedPixelSize = pixelSize;

      if (distort) {
        let distance = p.abs(x * pixelSize + xOffset - clipX);
        let distortionAmount = p.map(distance, 0, p.width / 2, 0.6, 0); // was 0.6
        distortionAmount = p.constrain(distortionAmount, 0, 0.6);

        dx = p.random(-pixelSize * distortionAmount, pixelSize * distortionAmount);
        dy = p.random(-pixelSize * distortionAmount, pixelSize * distortionAmount);
        distortedPixelSize = pixelSize * p.random(0.7, 1.3);

        if (p.random(1) < 0.2 * distortionAmount) {
          continue; // Skip drawing
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
}

p.mouseDragged = () => {
  if (dragging) {
    dividerX = p.constrain(p.mouseX, 50, p.width - 50);
  }
}

p.mouseReleased = () => {
  dragging = false;
}
p.touchStarted = () => {
 if (p.touches.length > 0 && p.touches[0].x > dividerX - 50 && p.touches[0].x < dividerX + 50) {
        dragging = true;
    }
  return false;
}

p.touchMoved = () => {
    if (dragging && p.touches.length > 0) {
        dividerX = p.constrain(p.touches[0].x, 50, p.width-50)
    }
  return false;

}

p.touchEnded = () => {
  dragging = false;
  return false;
}

// --- Resize Canvas on Window Resize ---
p.windowResized = () => {
  p.resizeCanvas(p.windowWidth, p.windowHeight);
  objectSize = p.min(p.width, p.height) * 0.4;
  dividerX = p.width / 2;
  distortedBuffer = p.createGraphics(p.width, p.height); // Recreate the buffer
}
};
