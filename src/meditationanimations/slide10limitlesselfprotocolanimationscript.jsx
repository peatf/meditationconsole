"use client";
import { ReactP5Wrapper } from "react-p5-wrapper";

export default function Slide10Animation() {
  return <ReactP5Wrapper sketch={sketch} />;
}



// Background color + palette
const BG_COLOR = "#E0DCD0";
const SHAPE_COLORS = [
    "#CD5A52", "#C8CD7C", "#74AC5C", "#CC868F",
    "#C7A8AE", "#6F6B8F", "#74AC5C"
];
const NUM_BALLS = 10;
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

const sketch = (p) => {
    p.setup = function() {
    p.createCanvas(windowWidth, windowHeight);
    p.pixelDensity(1);
    noSmooth();
    mbuffer = createGraphics(floor(width / 2), floor(height / 2));
    mbuffer.noSmooth();
    wipeMap = new Float32Array(width * height);
    lastUpdateTime = millis();
    for (let i = 0; i < NUM_BALLS; i++) {
        const col = i % 3;  const row = floor(i / 3);
        const x = map(col, 0, 2, width * 0.2, width * 0.8);
        const y = map(row, 0, 3, height * 0.2, height * 0.8);
        balls.push(new MetaBall(x, y));
    }
     console.log("width:", width, "height:", height); // Debugging
}

    p.draw = function() {
    const currentTime = millis();
    const deltaTime = min((currentTime - lastUpdateTime) / 16.67, 3);
    lastUpdateTime = currentTime; // CRUCIAL: Update lastUpdateTime every frame

    p.background(BG_COLOR);
    threshold = lerp(threshold, targetThreshold, THRESHOLD_SMOOTHING);
    updateBalls(deltaTime);
    updateWipeMap(deltaTime);
    drawMetaballs(mbuffer);
    mbuffer.filter(BLUR, 4);
    p.image(mbuffer, 0, 0, width, height);
    applyBayerDither();
}

class MetaBall {
    constructor(x, y) {
        this.x = x;  this.y = y; this.r = random(80, 150);
        this.c = color(random(SHAPE_COLORS));
        this.vx = 0; this.vy = 0;  this.baseRadius = this.r;
        this.targetVx = 0; this.targetVy = 0;
    }
    update(deltaTime) {
        this.vx = lerp(this.vx, this.targetVx, BALL_MOTION_SMOOTHING);
        this.vy = lerp(this.vy, this.targetVy, BALL_MOTION_SMOOTHING);
        this.x += this.vx * deltaTime; this.y += this.vy * deltaTime;
        const damping = isInteracting ? BALL_DAMPING_ACTIVE : BALL_DAMPING_BASE;
        this.targetVx *= damping; this.targetVy *= damping;
        if (this.x - this.r < 0) { this.x = this.r; this.targetVx = abs(this.vx) * BALL_BOUNCE_DAMPING; }
        if (this.x + this.r > width) { this.x = width - this.r; this.targetVx = -abs(this.vx) * BALL_BOUNCE_DAMPING; }
        if (this.y - this.r < 0) { this.y = this.r; this.targetVy = abs(this.vy) * BALL_BOUNCE_DAMPING; }
        if (this.y + this.r > height) { this.y = height - this.r; this.targetVy = -abs(this.vy) * BALL_BOUNCE_DAMPING; }
        const speed = sqrt(this.vx * this.vx + this.vy * this.vy);
        this.r = lerp(this.r, this.baseRadius * (1 + speed * BALL_RADIUS_INFLUENCE), 0.1 * deltaTime);
    }
}

function drawMetaballs(gfx) {
    gfx.loadPixels();
    const scaleX = gfx.width / width;  const scaleY = gfx.height / height;
    const sumField = new Float32Array(gfx.width * gfx.height);
    const colSumR = new Float32Array(gfx.width * gfx.height);
    const colSumG = new Float32Array(gfx.width * gfx.height);
    const colSumB = new Float32Array(gfx.width * gfx.height);
    for (const b of balls) {
        const x = b.x * scaleX; const y = b.y * scaleY; const r = b.r * scaleX;
        const rSq = r * r; const col = b.c;
        const minX = max(0, floor(x - r)); const maxX = min(gfx.width - 1, ceil(x + r));
        const minY = max(0, floor(y - r)); const maxY = min(gfx.height - 1, ceil(y + r));
        for (let py = minY; py <= maxY; py++) {
            for (let px = minX; px <= maxX; px++) {
                const dx = px - x; const dy = py - y; const distSq = dx * dx + dy * dy;
                if (distSq < rSq) {
                    const contrib = rSq / (distSq + 1e-4); const idx = px + py * gfx.width;
                    sumField[idx] += contrib; colSumR[idx] += red(col) * contrib;
                    colSumG[idx] += green(col) * contrib; colSumB[idx] += blue(col) * contrib;
                }
            }
        }
    }
    const bg = color(BG_COLOR); const bgR = red(bg); const bgG = green(bg); const bgB = blue(bg);
    const safeThreshold = max(threshold, 0.001); // Prevent division by zero
    for (let i = 0; i < gfx.pixels.length; i += 4) {
        const idx = i / 4;
        const screenX = floor((idx % gfx.width) * (width / gfx.width));
        const screenY = floor((idx / gfx.width) * (height / gfx.height));
        const wipeIdx = screenX + screenY * width;  const wipeAmount = wipeMap[wipeIdx] || 0;
        const sf = sumField[idx];
        if (sf > 0) {
            let alpha = constrain(map(sf / safeThreshold, 0.5, 2.0, 0, 1), 0, 1);
            alpha *= (1 - wipeAmount);
            const r = lerp(bgR, colSumR[idx] / sf, alpha);
            const g = lerp(bgG, colSumG[idx] / sf, alpha);
            const b = lerp(bgB, colSumB[idx] / sf, alpha);
            gfx.pixels[i] = r; gfx.pixels[i + 1] = g; gfx.pixels[i + 2] = b; gfx.pixels[i + 3] = alpha * 255;
        } else { gfx.pixels[i + 3] = 0; }
    }
    gfx.updatePixels();
}

function applyBayerDither() {
    loadPixels();
    const bayer = [[1, 9, 3, 11], [13, 5, 15, 7], [4, 12, 2, 10], [16, 8, 14, 6]];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = 4 * (x + y * width);
            if (pixels[i + 3] < 1) continue;
            const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
            const threshold_val = (bayer[x % 4][y % 4] / 17) * 255;
            if (brightness < threshold_val) {
                pixels[i] = lerp(pixels[i], 255, 0.3);
                pixels[i + 1] = lerp(pixels[i + 1], 255, 0.3);
                pixels[i + 2] = lerp(pixels[i + 2], 255, 0.3);
            }
        }
    }
    updatePixels();
}

function updateWipeMap(deltaTime) {
    const restoration = WIPE_RECOVERY_SPEED * deltaTime;
    for (let i = 0; i < wipeMap.length; i++) {
        wipeMap[i] = max(0, wipeMap[i] - restoration);
    }

    if (isInteracting && motionHistory.length > 0) {
        const smoothVel = getSmoothedVelocity();
        const speed = sqrt(smoothVel.x * smoothVel.x + smoothVel.y * smoothVel.y);
        const wipeMagnitude = speed * WIPE_STRENGTH * deltaTime;
        let dx = lastX - prevX;
        let dy = lastY - prevY;
        let steps = WIPE_DETAIL;
        if (abs(dx) > 0 || abs(dy) > 0){
            let xIncrement = dx / steps;
            let yIncrement = dy / steps;
            let x = prevX;
            let y = prevY;
            for (let i = 0; i <= steps; i++) {
                applyWipe(round(x), round(y), wipeMagnitude);
                x += xIncrement;
                y += yIncrement;
            }
        }
    }
}

function applyWipe(centerX, centerY, wipeMagnitude) {
    const radiusSq = WIPE_RADIUS * WIPE_RADIUS;
    const minX = max(0, floor(centerX - WIPE_RADIUS));
    const maxX = min(width - 1, ceil(centerX + WIPE_RADIUS));
    const minY = max(0, floor(centerY - WIPE_RADIUS));
    const maxY = min(height - 1, ceil(centerY + WIPE_RADIUS));

    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distSq = dx * dx + dy * dy;
            if (distSq < radiusSq) {
                const factor = pow(1 - distSq / radiusSq, 2);
                const idx = x + y * width;
                wipeMap[idx] = min(1, wipeMap[idx] + factor * wipeMagnitude);
            }
        }
    }
}

function updateBalls(deltaTime) {
    const smoothVel = getSmoothedVelocity();
    balls.forEach(ball => {
        ball.targetVx += smoothVel.x * SWIPE_INFLUENCE * deltaTime;
        ball.targetVy += smoothVel.y * SWIPE_INFLUENCE * deltaTime;
        if (isInteracting) {
            let dx = ball.x - lastX;
            let dy = ball.y - lastY;
            let dist = sqrt(dx * dx + dy * dy);
            if (dist < WIPE_RADIUS && dist > 0) {
                dx /= dist;
                dy /= dist;
                let pushForce = PUSH_STRENGTH * pow(1 - dist / WIPE_RADIUS, 2) * deltaTime / dist;
                pushForce = min(pushForce, 0.5);
                ball.targetVx += dx * pushForce;
                ball.targetVy += dy * pushForce;
            }
        }
        ball.update(deltaTime);
    });
}
function getSmoothedVelocity(maxSpeed = MAX_SPEED) {
    if (motionHistory.length === 0) return { x: 0, y: 0 };
    let weightedSumX = 0; let weightedSumY = 0; let totalWeight = 0;
    for (let i = 0; i < motionHistory.length; i++) {
        const weight = Math.exp(-0.15 * (motionHistory.length - 1 - i));
        weightedSumX += motionHistory[i].x * weight;
        weightedSumY += motionHistory[i].y * weight;
        totalWeight += weight;
    }
    let smoothedX = weightedSumX / totalWeight;
    let smoothedY = weightedSumY / totalWeight;
    smoothedX = constrain(smoothedX, -maxSpeed, maxSpeed);
    smoothedY = constrain(smoothedY, -maxSpeed, maxSpeed);
    return { x: smoothedX, y: smoothedY };
}

function handleInteraction(currentX, currentY) {
    if (!isInteracting) return;

    const dx = (currentX - lastX) / width;
    const dy = (currentY - lastY) / height;
    const deltaTime = (millis() - lastUpdateTime) / 16.67;
     console.log("deltaTime:", deltaTime, "lastUpdateTime:", lastUpdateTime, "millis():", millis()); // Debugging

    // Calculate velocity
    let velocityX = dx * VELOCITY_MULTIPLIER / deltaTime;
    let velocityY = dy * VELOCITY_MULTIPLIER / deltaTime;

    // Clamp the velocities *before* adding to history
    velocityX = constrain(velocityX, -MAX_SPEED * 2, MAX_SPEED * 2);
    velocityY = constrain(velocityY, -MAX_SPEED * 2, MAX_SPEED * 2);


    motionHistory.push({ x: velocityX, y: velocityY });
    if (motionHistory.length > MOTION_HISTORY_SIZE) {
        motionHistory.shift();
    }

    prevX = lastX;
    prevY = lastY;
    lastX = currentX;
    lastY = currentY;

    const smoothVel = getSmoothedVelocity();
    const speed = sqrt(smoothVel.x * smoothVel.x + smoothVel.y * smoothVel.y);
    targetThreshold = constrain(map(speed, 0, 3, 1.0, 4.0), 1.0, 4.0);
     console.log("dx:", dx, "dy:", dy, "velocityX:", velocityX, "velocityY:", velocityY); // Debugging

}

// --- Input Handling --- (Corrected with return false;)
function mousePressed() {
    isInteracting = true;
    lastX = mouseX;
    lastY = mouseY;
    prevX = mouseX; // Initialize prevX and prevY
    prevY = mouseY;
    motionHistory = [];
    console.log("Mouse Pressed"); // Debugging
}

function mouseDragged() {
    handleInteraction(mouseX, mouseY);
}

function mouseReleased() {
    isInteracting = false;
}

function touchStarted() {
    if (touches.length > 0) {
        isInteracting = true;
        lastX = touches[0].x;
        lastY = touches[0].y;
        prevX = touches[0].x; // Initialize prevX and prevY
        prevY = touches[0].y;
        motionHistory = [];
    }
    return false; // PREVENT DEFAULT BEHAVIOR
}

function touchMoved() {
    if (touches.length > 0) {
        handleInteraction(touches[0].x, touches[0].y);
    }
    return false; // PREVENT DEFAULT BEHAVIOR
}

function touchEnded() {
    isInteracting = false;
    return false; // PREVENT DEFAULT BEHAVIOR
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    mbuffer = createGraphics(floor(windowWidth / 2), floor(windowHeight / 2));
    mbuffer.noSmooth();
    wipeMap = new Float32Array(width * height);
}
};