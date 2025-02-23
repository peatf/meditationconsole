"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";

export default function Slide4Animation() {
  return <ReactP5Wrapper sketch={sketch} />;
}

const sketch = (p) => {
  /*
    CONFIG
  */
  const FISH_COUNT = 6;       // Fewer fish => lower memory & CPU usage
  const TRAIL_LENGTH = 5;     // Shorter trail => less stored data per fish
  const FRAME_RATE = 30;      // Lower framerate => less CPU overhead
  const QUESTIONS = [
    "What is the limitless self like?",
    "How would you describe them?",
    "What does it feel like to connect with them?",
  ];

  /*
    SHADER DEFINITIONS
  */
  const vertShader = `
    precision highp float;
    attribute vec3 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 vTexCoord;

    void main() {
      vTexCoord = aTexCoord;
      vec4 position = vec4(aPosition, 1.0);
      position.xy = position.xy * 2.0 - 1.0;
      gl_Position = position;
    }
  `;

  const fragShader = `
    precision highp float;
    varying vec2 vTexCoord;
    uniform float u_time;
    uniform vec2 u_resolution;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vTexCoord * 2.0 - 1.0;
      float time = u_time * 0.3;

      float n = sin(uv.x * 3.0 + time) * 0.3 + 
                sin(uv.y * 2.5 + time) * 0.4 + 
                sin((uv.x + uv.y) * 4.0 + time) * 0.3;

      // Base color gradient
      vec3 base = mix(vec3(0.16, 0.36, 0.20), vec3(0.96, 0.84, 0.65), n * 0.5);

      // Pink accent with increased saturation
      vec3 pinkAccent = vec3(0.95, 0.45, 0.60);
      vec3 greenAccent = vec3(0.24, 0.42, 0.30);
      vec3 accent = mix(pinkAccent, greenAccent, n);

      // Additional pink glow
      float pinkGlow = sin(uv.x * 2.0 + time * 0.5) * 0.5 + 0.5;
      vec3 finalColor = mix(base, accent, smoothstep(0.3, 0.7, n)) + pinkAccent * pinkGlow * 0.2;

      // Subtle paper-like noise
      float paper = hash(uv * 100.0) * 0.1;

      // Add a simple CRT-like scan line effect
      float scan = sin(gl_FragCoord.y * 2.0) * 0.05;
      finalColor -= scan;

      gl_FragColor = vec4(finalColor + paper, 0.4);
    }
  `;

  /*
    QUESTIONS & FADE STATE
  */
  let currentQuestionIndex = 0;
  let questionAlpha = 0;
  let fadeState = "waiting";
  const fadeDuration = 180;  // frames to fade in/out
  let fadeCounter = 0;
  let lastInteractionTime = 0;
  const minTimeBetweenInteractions = 2000;

  /*
    FISH
  */
  let fish = [];
  const fishColors = [
    "#FF7272", // light-ish red
    "#FF4747", // bright red
    "#FF1C1C", // bold red
    "#D41414", // deeper red
    "#FF6666", // soft red
  ];

  /*
    LAYERS
  */
  let shaderLayer;
  let shaderProgram;
  let textLayer;
  let canvasElement;

  /*
    FISH CLASS (short trail, fewer resources)
  */
  class SimpleFish {
    constructor(x, y, col) {
      this.color = p.color(col);
      this.pos = p.createVector(x, y);
      this.vel = random2DVector().mult(p.random(1, 2));
      this.acc = p.createVector();
      this.maxSpeed = 2;
      this.maxForce = 0.05;

      // Short trailing
      this.history = [];
      this.historyMax = TRAIL_LENGTH;
    }
    applyForce(force) {
      this.acc.add(force);
    }
    update() {
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.mult(0);

      // Keep a small trail
      this.history.unshift(this.pos.copy());
      if (this.history.length > this.historyMax) {
        this.history.pop();
      }
    }
    show() {
      p.noStroke();
      // Draw head
      p.fill(this.color);
      p.ellipse(this.pos.x, this.pos.y, 20, 12);

      // Minimal trailing ellipses
      let alphaDecrement = 150 / this.historyMax;
      for (let i = 0; i < this.history.length; i++) {
        let a = 150 - i * alphaDecrement;
        p.fill(p.red(this.color), p.green(this.color), p.blue(this.color), a);
        let trailPos = this.history[i];
        let size = p.map(i, 0, this.historyMax, 20, 5);
        p.ellipse(trailPos.x, trailPos.y, size, size * 0.6);
      }
    }
    showShadow() {
      // Minimal shadow, no heavy blur
      p.noStroke();
      p.fill(0, 30); // small alpha
      p.ellipse(this.pos.x + 10, this.pos.y + 10, 20, 12);
    }
    edges() {
      // Wrap around edges
      if (this.pos.x > p.width + 50) this.pos.x = -50;
      if (this.pos.x < -50) this.pos.x = p.width + 50;
      if (this.pos.y > p.height + 50) this.pos.y = -50;
      if (this.pos.y < -50) this.pos.y = p.height + 50;
    }
    flock(allFish) {
      let align = p.createVector();
      let coh = p.createVector();
      let sep = p.createVector();
      let total = 0;
      for (let other of allFish) {
        if (other === this) continue;
        let d = p.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
        if (d < 80) {
          align.add(other.vel);
          coh.add(other.pos);
          let diff = p.constructor.Vector.sub(this.pos, other.pos).div(d);
          sep.add(diff);
          total++;
        }
      }
      if (total > 0) {
        align.div(total).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
        coh.div(total).sub(this.pos).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
        sep.div(total).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
      }
      this.applyForce(align.mult(0.8));
      this.applyForce(coh.mult(0.5));
      this.applyForce(sep.mult(1.2));
    }
  }

  /*
    RANDOM 2D VECTOR FOR INSTANCE MODE
  */
  function random2DVector() {
    const angle = p.random(p.TWO_PI);
    return p.createVector(p.cos(angle), p.sin(angle));
  }

  /*
    P5 SETUP
  */
  p.setup = () => {
    const container = document.querySelector(".animationScreen");
    let w = container ? container.offsetWidth : 800;
    let h = container ? container.offsetHeight : 600;

    // Create the p5 canvas
    const canvas = p.createCanvas(w, h, p.P2D);
    canvasElement = canvas.elt;

    // Lower frame rate => fewer computations
    p.frameRate(FRAME_RATE);

    // Position absolutely, like Slide5
    canvasElement.style.position = "absolute";
    canvasElement.style.left = "50%";
    canvasElement.style.top = "50%";
    canvasElement.style.transform = "translate(-50%, -50%)";
    canvasElement.style.touchAction = "none";

    p.pixelDensity(1);

    // Create a separate WEBGL layer for the shader
    shaderLayer = p.createGraphics(w, h, p.WEBGL);
    shaderLayer.pixelDensity(1);
    shaderProgram = shaderLayer.createShader(vertShader, fragShader);
    shaderLayer.shader(shaderProgram);
    shaderLayer.noStroke();

    // Create a 2D text layer
    textLayer = p.createGraphics(w, h);
    textLayer.pixelDensity(1);
    textLayer.textAlign(p.CENTER, p.CENTER);
    textLayer.textSize(p.min(w, h) * 0.055);

    // Create fish
    fish = [];
    const cx = w / 2;
    const cy = h / 2;
    for (let i = 0; i < FISH_COUNT; i++) {
      let c = fishColors[p.int(p.random(fishColors.length))];
      fish.push(new SimpleFish(cx, cy, c));
    }
  };

  /*
    P5 DRAW
  */
  p.draw = () => {
    // 1) Render the shader background
    shaderLayer.clear();
    shaderProgram.setUniform("u_time", p.millis() * 0.001);
    shaderProgram.setUniform("u_resolution", [p.width, p.height]);
    shaderLayer.rect(0, 0, p.width, p.height);
    p.image(shaderLayer, 0, 0);

    // 2) Fish shadows (minimal, no heavy blur)
    p.push();
    p.blendMode(p.MULTIPLY);
    fish.forEach((f) => f.showShadow());
    p.pop();

    // 3) Update & draw fish
    fish.forEach((f) => {
      f.edges();
      f.flock(fish);
      f.update();
      f.show();
    });

    // 4) Handle text fade & draw text
    handleTextFade();
    p.image(textLayer, 0, 0);
  };

  /*
    TEXT FADE LOGIC
  */
  function handleTextFade() {
    textLayer.clear();
    textLayer.fill(0, 16);
    textLayer.rect(0, 0, p.width, p.height);

    switch (fadeState) {
      case "waiting":
        break;
      case "fadeIn":
        questionAlpha = p.map(fadeCounter, 0, fadeDuration, 0, 255);
        fadeCounter++;
        if (fadeCounter >= fadeDuration) {
          fadeCounter = 0;
          fadeState = "visible";
        }
        break;
      case "visible":
        break;
      case "fadeOut":
        questionAlpha = p.map(fadeCounter, 0, fadeDuration, 255, 0);
        fadeCounter++;
        if (fadeCounter >= fadeDuration) {
          fadeCounter = 0;
          currentQuestionIndex = (currentQuestionIndex + 1) % QUESTIONS.length;
          fadeState = "fadeIn";
        }
        break;
    }

    textLayer.fill(255, questionAlpha);
    textLayer.text(QUESTIONS[currentQuestionIndex], p.width / 2, p.height / 2);
  }

  /*
    MOUSE & TOUCH EVENTS
    - Make sure your nav buttons have higher z-index
      so they remain clickable.
  */
  p.mousePressed = () => {
    let now = p.millis();
    if (now - lastInteractionTime < minTimeBetweenInteractions) return;
    lastInteractionTime = now;

    switch (fadeState) {
      case "waiting":
        fadeState = "fadeIn";
        break;
      case "visible":
        fadeState = "fadeOut";
        break;
    }
  };

  p.touchStarted = (evt) => {
    if (evt.target === canvasElement) {
      p.mousePressed();
      evt.preventDefault();
      return false;
    }
    return true;
  };

  /*
    WINDOW RESIZE
  */
  p.windowResized = () => {
    const container = document.querySelector(".animationScreen");
    if (container) {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      p.resizeCanvas(w, h);

      shaderLayer.resizeCanvas(w, h);
      textLayer.resizeCanvas(w, h);
      textLayer.textSize(p.min(w, h) * 0.055);

      canvasElement.style.left = "50%";
      canvasElement.style.top = "50%";
      canvasElement.style.transform = "translate(-50%, -50%)";
    }
  };
};
