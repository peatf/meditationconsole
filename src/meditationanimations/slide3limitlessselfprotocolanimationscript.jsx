"use client";
import { ReactP5Wrapper } from "react-p5-wrapper";

export default function Slide3Animation() {
  return <ReactP5Wrapper sketch=Slide3Animation />;
}

"use client";
import { ReactP5Wrapper } from "react-p5-wrapper";

"use client";

let dividerX;
let dragging = false;
let objectSize;
let normalBGColor;
let alteredBGColor;
let distortedBuffer;

function setup() {
  createCanvas(windowWidth, windowHeight);
  dividerX = width / 2;
  objectSize = min(width, height) * 0.4;
  pixelDensity(1);
  noStroke();
  normalBGColor = color(240); // Light gray
  alteredBGColor = color(245, 231, 209); // Beige
  distortedBuffer = createGraphics(width, height); // Create the buffer
}

function draw() {
  background(normalBGColor);

  // --- Draw the "Normal" Object ---
  drawPixelatedObject(false, 0);

  // --- Prepare the Distorted Object (on the buffer) ---
  distortedBuffer.clear(); // Clear the buffer
  drawPixelatedObject(true, dividerX, distortedBuffer); // Draw distorted object ONTO the buffer

  // --- Apply Blur to the ENTIRE Distorted Buffer ---
  distortedBuffer.filter(BLUR, 2); // Apply blur to the whole buffer ONCE

  // --- Apply Clipping and Draw Distorted Object ---
  push();
  let clipWidth = 150;
  let clipX = dividerX - clipWidth / 2;

  // Draw altered background within clip
  fill(alteredBGColor);
  rect(clipX, 0, clipWidth, height);

  let clipPath = new Path2D();
  clipPath.rect(clipX, 0, clipWidth, height);
  drawingContext.clip(clipPath);

  image(distortedBuffer, 0, 0); // Draw the blurred, distorted buffer

  pop(); // Restore drawing state

  // --- Grain Effect (Post-Processing) ---
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let grain = random(-10, 10);
    pixels[i] += grain;
    pixels[i + 1] += grain;
    pixels[i + 2] += grain;
  }
  updatePixels();

  // --- Draw the Divider ---
  stroke(50);
  strokeWeight(4);
  line(dividerX, 0, dividerX, height);
  noStroke();
}
// --- Function to Draw the Pixelated Object ---
function drawPixelatedObject(distort, clipX, buffer) {
    let target = buffer || window; // Draw to buffer if provided, otherwise to main canvas
  let pixelSize = objectSize / 10;
  let xOffset = (width - objectSize) / 2;
  let yOffset = (height - objectSize) / 2;

  target.push();
  target.translate(xOffset, yOffset);

  // --- Colors ---
  let colorNormal1 = color(100, 200, 100); // Original Green
  let colorNormal2 = color(180, 255, 180); // Original Light Green
  let colorDistorted1 = color(235, 153, 144); // Reddish (from Laughter I)
  let colorDistorted2 = color(246, 198, 98);  // Yellowish (from Laughter I)
  let colorDistorted3 = color(148, 107, 176);  // Purple-ish (from Laughter I)
  let colorDistorted4 = color(177, 214, 237); // Light blue (from Laughter I)

  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      let c;

      if (distort) {
        let choice = floor(random(4));
        if (choice === 0) c = colorDistorted1;
        else if (choice === 1) c = colorDistorted2;
        else if (choice === 2) c = colorDistorted3;
        else c = colorDistorted4;
      } else {
        let choice = floor(random(2));
        c = (choice === 0) ? colorNormal1 : colorNormal2;
      }

      // --- Distortion (if distort is true) ---
      let dx = 0;
      let dy = 0;
      let distortedPixelSize = pixelSize;

      if (distort) {
        let distance = abs(x * pixelSize + xOffset - clipX);
        let distortionAmount = map(distance, 0, width / 2, 0.6, 0); // was 0.6
        distortionAmount = constrain(distortionAmount, 0, 0.6);

        dx = random(-pixelSize * distortionAmount, pixelSize * distortionAmount);
        dy = random(-pixelSize * distortionAmount, pixelSize * distortionAmount);
        distortedPixelSize = pixelSize * random(0.7, 1.3);

        if (random(1) < 0.2 * distortionAmount) {
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
function mousePressed() {
  if (mouseX > dividerX - 20 && mouseX < dividerX + 20) {
    dragging = true;
  }
}

function mouseDragged() {
  if (dragging) {
    dividerX = constrain(mouseX, 50, width - 50);
  }
}

function mouseReleased() {
  dragging = false;
}
function touchStarted() {
 if (touches.length > 0 && touches[0].x > dividerX - 50 && touches[0].x < dividerX + 50) {
        dragging = true;
    }
  return false;
}

function touchMoved() {
    if (dragging && touches.length > 0) {
        dividerX = constrain(touches[0].x, 50, width-50)
    }
  return false;

}

function touchEnded() {
  dragging = false;
}

// --- Resize Canvas on Window Resize ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  objectSize = min(width, height) * 0.4;
  dividerX = width / 2;
  distortedBuffer = createGraphics(width, height); // Recreate the buffer
}