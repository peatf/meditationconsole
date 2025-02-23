"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";

export default function Slide4Animation() {
  return <ReactP5Wrapper sketch={sketch} />;
}

const sketch = (p) => {
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

      // CRT-like scan line
      float scan = sin(gl_FragCoord.y * 2.0) * 0.05;
      finalColor -= scan;

      gl_FragColor = vec4(finalColor + paper, 0.4);
    }
  `;

  /*
    GLOBALS & FISH CLASS
  */
  const questions = [
    "What is the limitless self like?",
    "How would you describe them?",
    "What does it feel like to connect with them?"
  ];

  // Let’s stick to ~6 fish for better performance
  const FISH_COUNT = 6;

  // Reds for fish
  const fishColors = [
    "#FF7272", // light-ish red
    "#FF4747", // bright red
    "#FF1C1C", // bold red
    "#D41414", // deeper red
    "#FF6666"  // soft red
  ];

  let shaderLayer;
  let shaderProgram;
  let textLayer;

  // For question fade
  let currentQuestionIndex = 0;
  let questionAlpha = 0;
  const fadeDuration = 180;
  let fadeCounter = 0;
  let fadeState = "waiting";
  let lastInteractionTime = 0;
  const minTimeBetweenInteractions = 2000;

  // Fish array
  let fish = [];

  /*
    ETHERAL FISH, closer to the original
  */
  class EtherealFish {
    constructor(x, y, fishColor) {
      this.color = p.color(fishColor);

      // Position somewhat near center
      this.position = p.createVector(
        x + p.random(-100, 100),
        y + p.random(-100, 100)
      );
      // Random velocity
      this.velocity = random2DVector().mult(p.random(1, 2));
      this.acceleration = p.createVector();

      this.maxSpeed = 2;
      this.maxForce = 0.05;
      
      // Larger base size for bigger fish
      this.baseSize = p.random(25, 40);
      this.bodyLength = this.baseSize * 3; 
      this.body = new Array(p.int(this.bodyLength))
        .fill()
        .map(() => this.position.copy());
      
      this.timeOffset = p.random(1000);
      this.pulseRate = p.random(0.01, 0.02);
      this.waveAmplitude = p.random(0.8, 1.2);
    }

    applyForce(force) {
      this.acceleration.add(force);
    }

    update() {
      this.velocity.add(this.acceleration);
      this.velocity.limit(this.maxSpeed);
      this.position.add(this.velocity);
      this.acceleration.mult(0);
      
      // Shift the body history
      this.body.unshift(this.position.copy());
      this.body.pop();
    }

    show() {
      let angle = this.velocity.heading();
      p.noStroke();
      
      // 3 layers for that "ethereal" effect
      for (let layer = 0; layer < 3; layer++) {
        this.body.forEach((pos, index) => {
          let progress = index / this.bodyLength;
          let time = p.frameCount * this.pulseRate + this.timeOffset;

          // noise-based variation
          let noiseVal = p.noise(pos.x * 0.05, pos.y * 0.05, time * 0.5);

          // base shape
          let blobShape = (p.cos(progress * p.PI) + 1) * this.baseSize;
          let pulse = p.sin(time) * 0.1 + 1;
          let wave = p.sin(progress * 3 + time) * this.waveAmplitude;
          let size = p.max(0, blobShape * pulse + wave);

          size *= (1 + (noiseVal - 0.5) * 0.2);

          let baseAlpha = p.map(index, 0, this.bodyLength, 40, 0);
          let layerAlpha = baseAlpha * (layer + 1) / 5;
          
          let fishColor = p.color(
            p.red(this.color),
            p.green(this.color),
            p.blue(this.color),
            layerAlpha
          );
          p.fill(fishColor);
          
          p.push();
          p.translate(pos.x, pos.y);
          p.rotate(angle);

          let layerSize = size * (1 - layer * 0.15);
          p.drawingContext.filter = "blur(8px)";

          if (layer === 1) {
            // Additional texture pass
            let textureColor = p.color(
              p.red(this.color),
              p.green(this.color),
              p.blue(this.color),
              layerAlpha * 0.7
            );
            p.fill(textureColor);
            for (let i = 0; i < 3; i++) {
              let offset = p.noise(time + i, progress * 2) * 5;
              p.ellipse(offset, offset, layerSize * 1.3, layerSize * 0.9);
            }
          }

          // main ellipse
          p.ellipse(0, 0, layerSize * 1.6, layerSize);

          // front glow pass
          if (layer === 0) {
            fishColor.setAlpha(layerAlpha * 0.3);
            p.fill(fishColor);
            p.drawingContext.filter = "blur(12px)";
            p.ellipse(0, 0, layerSize * 2, layerSize * 1.2);
          }
          
          p.drawingContext.filter = "none";
          p.pop();
        });
      }
    }

    showShadow() {
      p.noStroke();
      // simpler shadow pass, using smaller blur
      for (let layer = 0; layer < 2; layer++) {
        this.body.forEach((pos, index) => {
          let progress = index / this.bodyLength;
          let time = p.frameCount * this.pulseRate + this.timeOffset;
          
          let blobShape = (p.cos(progress * p.PI) + 1) * this.baseSize;
          let pulse = p.sin(time) * 0.1 + 1;
          let wave = p.sin(progress * 3 + time) * this.waveAmplitude;
          let size = p.max(0, blobShape * pulse + wave);

          let shadowAlpha = p.map(index, 0, this.bodyLength, 3, 0);
          p.fill(0, 0, 0, shadowAlpha);
          
          p.push();
          p.translate(pos.x + 30, pos.y + 30);
          p.rotate(this.velocity.heading());
          
          p.drawingContext.filter = "blur(10px)";
          let layerSize = size * (1 - layer * 0.15);
          p.ellipse(0, 0, layerSize * 1.6, layerSize);
          
          if (layer === 0) {
            p.drawingContext.filter = "blur(14px)";
            p.ellipse(0, 0, layerSize * 2, layerSize * 1.2);
          }
          
          p.drawingContext.filter = "none";
          p.pop();
        });
      }
    }

    edges() {
      if (this.position.x > p.width + 50) this.position.x = -50;
      if (this.position.x < -50) this.position.x = p.width + 50;
      if (this.position.y > p.height + 50) this.position.y = -50;
      if (this.position.y < -50) this.position.y = p.height + 50;
    }

    flock(fishArr) {
      let alignment = p.createVector();
      let cohesion = p.createVector();
      let separation = p.createVector();
      let total = 0;

      for (let other of fishArr) {
        let d = p.dist(this.position.x, this.position.y, other.position.x, other.position.y);
        if (other !== this && d < 100) {
          alignment.add(other.velocity);
          cohesion.add(other.position);
          let diff = p.constructor.Vector.sub(this.position, other.position).div(d);
          separation.add(diff);
          total++;
        }
      }

      if (total > 0) {
        alignment.div(total).setMag(this.maxSpeed).sub(this.velocity).limit(this.maxForce);
        cohesion.div(total).sub(this.position).setMag(this.maxSpeed).sub(this.velocity).limit(this.maxForce);
        separation.div(total).setMag(this.maxSpeed).sub(this.velocity).limit(this.maxForce);
      }

      this.applyForce(alignment.mult(0.8));
      this.applyForce(cohesion.mult(0.5));
      this.applyForce(separation.mult(1.2));
    }
  }

  // Helper for random2D vectors in instance mode
  function random2DVector() {
    const angle = p.random(p.TWO_PI);
    return p.createVector(p.cos(angle), p.sin(angle));
  }

  /*
    P5 SETUP
  */
  let canvasElement;
  p.setup = () => {
    // Container-based approach
    const container = document.querySelector(".animationScreen");
    let w = container ? container.offsetWidth : 800;
    let h = container ? container.offsetHeight : 600;
    
    const canvas = p.createCanvas(w, h, p.P2D);
    canvasElement = canvas.elt;

    // Absolutely position the canvas so nav buttons can float above it
    canvasElement.style.position = "absolute";
    canvasElement.style.left = "50%";
    canvasElement.style.top = "50%";
    canvasElement.style.transform = "translate(-50%, -50%)";

    // No default scrolling on canvas
    canvasElement.style.touchAction = "none";

    p.pixelDensity(1);

    // Shader layer
    shaderLayer = p.createGraphics(w, h, p.WEBGL);
    shaderLayer.pixelDensity(1);
    shaderLayer.noStroke();
    shaderProgram = shaderLayer.createShader(vertShader, fragShader);
    shaderLayer.shader(shaderProgram);

    // Text layer
    textLayer = p.createGraphics(w, h);
    textLayer.pixelDensity(1);
    textLayer.textAlign(p.CENTER, p.CENTER);
    textLayer.textSize(p.min(w, h) * 0.055);

    // Create fewer fish for improved performance
    fish = [];
    const centerX = w / 2;
    const centerY = h / 2;
    for (let i = 0; i < FISH_COUNT; i++) {
      const fishColor = p.color(
        fishColors[p.int(p.random(fishColors.length))]
      );
      fishColor.setAlpha(150);
      fish.push(new EtherealFish(centerX, centerY, fishColor));
    }
  };

  /*
    P5 DRAW
  */
  p.draw = () => {
    // 1) Draw the shader background
    shaderLayer.clear();
    shaderProgram.setUniform("u_time", p.millis() * 0.001);
    shaderProgram.setUniform("u_resolution", [p.width, p.height]);
    shaderLayer.rect(0, 0, p.width, p.height);
    p.image(shaderLayer, 0, 0, p.width, p.height);

    // 2) Draw fish shadows
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

    // 4) Text fade in/out
    handleTextAnimation();
    textLayer.clear();
    textLayer.fill(0, 16);
    textLayer.rect(0, 0, p.width, p.height);
    textLayer.fill(255, questionAlpha);
    textLayer.text(questions[currentQuestionIndex], p.width / 2, p.height / 2);
    p.image(textLayer, 0, 0, p.width, p.height);
  };

  /*
    TEXT FADE STATE
  */
  function handleTextAnimation() {
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
          currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
          fadeState = "fadeIn";
        }
        break;
    }
  }

  /*
    INTERACTION EVENTS
  */
  p.mousePressed = () => {
    const currentTime = p.millis();
    if (currentTime - lastInteractionTime < minTimeBetweenInteractions) return;
    lastInteractionTime = currentTime;

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
    // Trigger fade logic only if tap is on canvas
    if (evt.target === canvasElement) {
      p.mousePressed();
      evt.preventDefault();
      return false;
    }
    // If tapped a button or elsewhere, let it pass
    return true;
  };

  /*
    WINDOW RESIZE
  */
  p.windowResized = () => {
    const container = document.querySelector(".animationScreen");
    if (container) {
      let w = container.offsetWidth;
      let h = container.offsetHeight;
      p.resizeCanvas(w, h);

      // Resize layers
      shaderLayer.resizeCanvas(w, h);
      textLayer.resizeCanvas(w, h);
      textLayer.textSize(p.min(w, h) * 0.055);

      // Re-center the canvas
      canvasElement.style.left = "50%";
      canvasElement.style.top = "50%";
      canvasElement.style.transform = "translate(-50%, -50%)";
    }
  };
};

