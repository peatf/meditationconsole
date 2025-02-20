"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";

// Constants
const BG_COLOR = "#E0DCD0";
const SHAPE_COLORS = [
  "#CD5A52", "#C8CD7C", "#74AC5C", "#CC868F",
  "#C7A8AE", "#6F6B8F", "#74AC5C"
];
const NUM_BALLS = 10;

const sketch = (p) => {
  // Variables moved inside sketch
  let balls = [];
  let mbuffer;
  let wipeMap;
  let isInteracting = false;
  let threshold = 1.0;
  let targetThreshold = 1.0;
  let lastX = 0;
  let lastY = 0;
  let prevX = 0;
  let prevY = 0;
  let lastUpdateTime = 0;
  let motionHistory = [];

  // Configuration constants
  const MOTION_HISTORY_SIZE = 10;
  const THRESHOLD_SMOOTHING = 0.05;
  const SWIPE_INFLUENCE = 4.0;
  const VELOCITY_MULTIPLIER = 25;
  const WIPE_RADIUS = 100;
  const WIPE_STRENGTH = 0.25;
  const WIPE_RECOVERY_SPEED = 0.005;
  const BALL_MOTION_SMOOTHING = 0.9;
  const BALL_DAMPING_BASE = 0.997;
  const BALL_DAMPING_ACTIVE = 0.98;
  const BALL_BOUNCE_DAMPING = 0.6;
  const BALL_RADIUS_INFLUENCE = 0.3;
  const PUSH_STRENGTH = 6;
  const WIPE_DETAIL = 10;
  const MAX_SPEED = 5;

  p.setup = () => {
    // Canvas setup with container sizing
    const defaultWidth = 800;
    const defaultHeight = 600;
    p.createCanvas(defaultWidth, defaultHeight);
    p.pixelDensity(1);
    p.noSmooth();

    const container = document.querySelector('.animationScreen');
    if (container) {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    }

    // Initialize buffers
    mbuffer = p.createGraphics(p.floor(p.width / 2), p.floor(p.height / 2));
    mbuffer.noSmooth();
    wipeMap = new Float32Array(p.width * p.height);
    lastUpdateTime = p.millis();

    // Initialize balls
    for (let i = 0; i < NUM_BALLS; i++) {
      const col = i % 3;
      const row = p.floor(i / 3);
      const x = p.map(col, 0, 2, p.width * 0.2, p.width * 0.8);
      const y = p.map(row, 0, 3, p.height * 0.2, p.height * 0.8);
      balls.push(new MetaBall(x, y));
    }
  };

  p.draw = () => {
    const currentTime = p.millis();
    const deltaTime = p.min((currentTime - lastUpdateTime) / 16.67, 3);
    lastUpdateTime = currentTime;

    p.background(BG_COLOR);
    threshold = p.lerp(threshold, targetThreshold, THRESHOLD_SMOOTHING);
    updateBalls(deltaTime);
    updateWipeMap(deltaTime);
    drawMetaballs(mbuffer);
    mbuffer.filter(p.BLUR, 4);
    p.image(mbuffer, 0, 0, p.width, p.height);
    applyBayerDither();
  };

  class MetaBall {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.r = p.random(80, 150);
      this.c = p.color(p.random(SHAPE_COLORS));
      this.vx = 0;
      this.vy = 0;
      this.baseRadius = this.r;
      this.targetVx = 0;
      this.targetVy = 0;
    }

    update(deltaTime) {
      this.vx = p.lerp(this.vx, this.targetVx, BALL_MOTION_SMOOTHING);
      this.vy = p.lerp(this.vy, this.targetVy, BALL_MOTION_SMOOTHING);
      this.x += this.vx * deltaTime;
      this.y += this.vy * deltaTime;
      
      const damping = isInteracting ? BALL_DAMPING_ACTIVE : BALL_DAMPING_BASE;
      this.targetVx *= damping;
      this.targetVy *= damping;

      // Boundary checks
      if (this.x - this.r < 0) {
        this.x = this.r;
        this.targetVx = p.abs(this.vx) * BALL_BOUNCE_DAMPING;
      }
      if (this.x + this.r > p.width) {
        this.x = p.width - this.r;
        this.targetVx = -p.abs(this.vx) * BALL_BOUNCE_DAMPING;
      }
      if (this.y - this.r < 0) {
        this.y = this.r;
        this.targetVy = p.abs(this.vy) * BALL_BOUNCE_DAMPING;
      }
      if (this.y + this.r > p.height) {
        this.y = p.height - this.r;
        this.targetVy = -p.abs(this.vy) * BALL_BOUNCE_DAMPING;
      }

      const speed = p.sqrt(this.vx * this.vx + this.vy * this.vy);
      this.r = p.lerp(this.r, this.baseRadius * (1 + speed * BALL_RADIUS_INFLUENCE), 0.1 * deltaTime);
    }
  }

  const drawMetaballs = (gfx) => {
    gfx.loadPixels();
    const scaleX = gfx.width / p.width;
    const scaleY = gfx.height / p.height;
    const sumField = new Float32Array(gfx.width * gfx.height);
    const colSumR = new Float32Array(gfx.width * gfx.height);
    const colSumG = new Float32Array(gfx.width * gfx.height);
    const colSumB = new Float32Array(gfx.width * gfx.height);

    for (const b of balls) {
      const x = b.x * scaleX;
      const y = b.y * scaleY;
      const r = b.r * scaleX;
      const rSq = r * r;
      const col = b.c;

      const minX = p.max(0, p.floor(x - r));
      const maxX = p.min(gfx.width - 1, p.ceil(x + r));
      const minY = p.max(0, p.floor(y - r));
      const maxY = p.min(gfx.height - 1, p.ceil(y + r));

      for (let py = minY; py <= maxY; py++) {
        for (let px = minX; px <= maxX; px++) {
          const dx = px - x;
          const dy = py - y;
          const distSq = dx * dx + dy * dy;
          if (distSq < rSq) {
            const contrib = rSq / (distSq + 1e-4);
            const idx = px + py * gfx.width;
            sumField[idx] += contrib;
            colSumR[idx] += p.red(col) * contrib;
            colSumG[idx] += p.green(col) * contrib;
            colSumB[idx] += p.blue(col) * contrib;
          }
        }
      }
    }

    const bg = p.color(BG_COLOR);
    const bgR = p.red(bg);
    const bgG = p.green(bg);
    const bgB = p.blue(bg);
    const safeThreshold = p.max(threshold, 0.001);

    for (let i = 0; i < gfx.pixels.length; i += 4) {
      const idx = i / 4;
      const screenX = p.floor((idx % gfx.width) * (p.width / gfx.width));
      const screenY = p.floor((idx / gfx.width) * (p.height / gfx.height));
      const wipeIdx = screenX + screenY * p.width;
      const wipeAmount = wipeMap[wipeIdx] || 0;
      const sf = sumField[idx];

      if (sf > 0) {
        let alpha = p.constrain(p.map(sf / safeThreshold, 0.5, 2.0, 0, 1), 0, 1);
        alpha *= (1 - wipeAmount);
        const r = p.lerp(bgR, colSumR[idx] / sf, alpha);
        const g = p.lerp(bgG, colSumG[idx] / sf, alpha);
        const b = p.lerp(bgB, colSumB[idx] / sf, alpha);
        gfx.pixels[i] = r;
        gfx.pixels[i + 1] = g;
        gfx.pixels[i + 2] = b;
        gfx.pixels[i + 3] = alpha * 255;
      } else {
        gfx.pixels[i + 3] = 0;
      }
    }
    gfx.updatePixels();
  };

  const applyBayerDither = () => {
    p.loadPixels();
    const bayer = [[1, 9, 3, 11], [13, 5, 15, 7], [4, 12, 2, 10], [16, 8, 14, 6]];
    
    for (let y = 0; y < p.height; y++) {
      for (let x = 0; x < p.width; x++) {
        const i = 4 * (x + y * p.width);
        if (p.pixels[i + 3] < 1) continue;

        const brightness = (p.pixels[i] + p.pixels[i + 1] + p.pixels[i + 2]) / 3;
        const threshold_val = (bayer[x % 4][y % 4] / 17) * 255;
        
        if (brightness < threshold_val) {
          p.pixels[i] = p.lerp(p.pixels[i], 255, 0.3);
          p.pixels[i + 1] = p.lerp(p.pixels[i + 1], 255, 0.3);
          p.pixels[i + 2] = p.lerp(p.pixels[i + 2], 255, 0.3);
        }
      }
    }
    p.updatePixels();
  };

  // Event handlers
  p.mousePressed = () => {
    isInteracting = true;
    lastX = p.mouseX;
    lastY = p.mouseY;
    prevX = p.mouseX;
    prevY = p.mouseY;
    motionHistory = [];
    return false;
  };

  p.mouseDragged = () => {
    handleInteraction(p.mouseX, p.mouseY);
    return false;
  };

  p.mouseReleased = () => {
    isInteracting = false;
    return false;
  };

  p.touchStarted = () => {
    if (p.touches.length > 0) {
      isInteracting = true;
      lastX = p.touches[0].x;
      lastY = p.touches[0].y;
      prevX = p.touches[0].x;
      prevY = p.touches[0].y;
      motionHistory = [];
    }
    return false;
  };

  p.touchMoved = () => {
    if (p.touches.length > 0) {
      handleInteraction(p.touches[0].x, p.touches[0].y);
    }
    return false;
  };

  p.touchEnded = () => {
    isInteracting = false;
    return false;
  };

  p.windowResized = () => {
    const container = document.querySelector('.animationScreen');
    if (container) {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);
      mbuffer = p.createGraphics(p.floor(p.width / 2), p.floor(p.height / 2));
      mbuffer.noSmooth();
      wipeMap = new Float32Array(p.width * p.height);
    }
  };

  // Helper functions
  const updateWipeMap = (deltaTime) => {
    const restoration = WIPE_RECOVERY_SPEED * deltaTime;
    for (let i = 0; i < wipeMap.length; i++) {
      wipeMap[i] = p.max(0, wipeMap[i] - restoration);
    }

    if (isInteracting && motionHistory.length > 0) {
      const smoothVel = getSmoothedVelocity();
      const speed = p.sqrt(smoothVel.x * smoothVel.x + smoothVel.y * smoothVel.y);
      const wipeMagnitude = speed * WIPE_STRENGTH * deltaTime;
      let dx = lastX - prevX;
      let dy = lastY - prevY;
      let steps = WIPE_DETAIL;

      if (p.abs(dx) > 0 || p.abs(dy) > 0) {
        let xIncrement = dx / steps;
        let yIncrement = dy / steps;
        let x = prevX;
        let y = prevY;

        for (let i = 0; i <= steps; i++) {
          applyWipe(p.round(x), p.round(y), wipeMagnitude);
          x += xIncrement;
          y += yIncrement;
        }
      }
    }
  };

  const applyWipe = (centerX, centerY, wipeMagnitude) => {
    const radiusSq = WIPE_RADIUS * WIPE_RADIUS;
    const minX = p.max(0, p.floor(centerX - WIPE_RADIUS));
    const maxX = p.min(p.width - 1, p.ceil(centerX + WIPE_RADIUS));
    const minY = p.max(0, p.floor(centerY - WIPE_RADIUS));
    const maxY = p.min(p.height - 1, p.ceil(centerY + WIPE_RADIUS));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distSq = dx * dx + dy * dy;
        if (distSq < radiusSq) {
          const factor = p.pow(1 - distSq / radiusSq, 2);
          const idx = x + y * p.width;
          wipeMap[idx] = p.min(1, wipeMap[idx] + factor * wipeMagnitude);
        }
      }
    }
  };

  const updateBalls = (deltaTime) => {
    const smoothVel = getSmoothedVelocity();
    balls.forEach(ball => {
      ball.targetVx += smoothVel.x * SWIPE_INFLUENCE * deltaTime;
      ball.targetVy += smoothVel.y * SWIPE_INFLUENCE * deltaTime;

      if (isInteracting) {
        let dx = ball.x - lastX;
        let dy = ball.y - lastY;
        let dist = p.sqrt(dx * dx + dy * dy);

        if (dist < WIPE_RADIUS && dist > 0) {
          dx /= dist;
          dy /= dist;
          let pushForce = PUSH_STRENGTH * p.pow(1 - dist / WIPE_RADIUS, 2) * deltaTime / dist;
          pushForce = p.min(pushForce, 0.5);
          ball.targetVx += dx * pushForce;
          ball.targetVy += dy * pushForce;
        }
      }
      ball.update(deltaTime);
    });
  };

  const getSmoothedVelocity = (maxSpeed = MAX_SPEED) => {
    if (motionHistory.length === 0) return { x: 0, y: 0 };
    let weightedSumX = 0;
    let weightedSumY = 0;
    let totalWeight = 0;

    for (let i = 0; i < motionHistory.length; i++) {
      const weight = Math.exp(-0.15 * (motionHistory.length - 1 - i));
      weightedSumX += motionHistory[i].x * weight;
      weightedSumY += motionHistory[i].y * weight;
      totalWeight += weight;
    }

    let smoothedX = weightedSumX / totalWeight;
    let smoothedY = weightedSumY / totalWeight;
    smoothedX = p.constrain(smoothedX, -maxSpeed, maxSpeed);
    smoothedY = p.constrain(smoothedY, -maxSpeed, maxSpeed);
    return { x: smoothedX, y: smoothedY };
  };

  const handleInteraction = (currentX, currentY) => {
    if (!isInteracting) return;

    const dx = (currentX - lastX) / p.width;
    const dy = (currentY - lastY) / p.height;
    const deltaTime = (p.millis() - lastUpdateTime) / 16.67;

    let velocityX = dx * VELOCITY_MULTIPLIER / deltaTime;
    let velocityY = dy * VELOCITY_MULTIPLIER / deltaTime;

    velocityX = p.constrain(velocityX, -MAX_SPEED * 2, MAX_SPEED * 2);
    velocityY = p.constrain(velocityY, -MAX_SPEED * 2, MAX_SPEED * 2);

    motionHistory.push({ x: velocityX, y: velocityY });
    if (motionHistory.length > MOTION_HISTORY_SIZE) {
      motionHistory.shift();
    }

    prevX = lastX;
    prevY = lastY;
    lastX = currentX;
    lastY = currentY;

    const smoothVel = getSmoothedVelocity();
    const speed = p.sqrt(smoothVel.x * smoothVel.x + smoothVel.y * smoothVel.y);
    targetThreshold = p.constrain(p.map(speed, 0, 3, 1.0, 4.0), 1.0, 4.0);
  };
};

export default function Slide10Animation() {
  return <ReactP5Wrapper sketch={sketch} />;
}
