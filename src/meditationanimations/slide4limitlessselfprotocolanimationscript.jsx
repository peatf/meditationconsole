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

      // Add a simple CRT-like scan line effect
      float scan = sin(gl_FragCoord.y * 2.0) * 0.05;
      finalColor -= scan;

      gl_FragColor = vec4(finalColor + paper, 0.4);
    }
  `;

  /*
    GLOBALS & FISH CLASS
  */
  let shaderLayer;
  let shaderProgram;
  let textLayer;

  const questions = [
    "What is the limitless self like?",
    "How would you describe them?",
    "What does it feel like to connect with them?"
  ];

  let currentQuestionIndex = 0;
  let questionAlpha = 0;
  const fadeDuration = 180;
  let fadeCounter = 0;
  let fadeState = "waiting";
  let lastInteractionTime = 0;
  const minTimeBetweenInteractions = 2000;

  let fish = [];

  // Reds for fish
  const fishColors = [
    "#FF7272", // light-ish red
    "#FF4747", // bright red
    "#FF1C1C", // bold red
    "#D41414", // deeper red
    "#FF6666"  // soft red
  ];

  // Helper for random2D in instance mode
  function random2DVector() {
    const angle = p.random(p.TWO_PI);
    return p.createVector(p.cos(angle), p.sin(angle));
  }

  class EtherealFish {
    constructor(x, y, fishColor) {
      this.color = p.color(fishColor);
      this.position = p.createVector(
        x + p.random(-100, 100),
        y + p.random(-100, 100)
      );
      this.velocity = random2DVector().mult(p.random(1, 2));
      this.acceleration = p.createVector();
      this.maxSpeed = 2;
      this.maxForce = 0.05;

      this.baseSize = p.random(15, 25);
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

      this.body.unshift(this.position.copy());
      this.body.pop();
    }

    show() {
      let angle = this.velocity.heading();
      p.noStroke();

      // We'll reduce blur sizes to help Chrome performance
      for (let layer = 0; layer < 3; layer++) {
        this.body.forEach((pos, index) => {
          let progress = index / this.bodyLength;
          let time = p.frameCount * this.pulseRate + this.timeOffset;
          let noiseVal = p.noise(pos.x * 0.05, pos.y * 0.05, time * 0.5);

          let blobShape = (p.cos(progress * p.PI) + 1) * this.baseSize;
          let pulse = p.sin(time) * 0.1 + 1;
          let wave = p.sin(progress * 3 + time) * this.waveAmplitude;
          let size = p.max(0, blobShape * pulse + wave);
          size *= 1 + (noiseVal - 0.5) * 0.2;

          let baseAlpha = p.map(index, 0, this.bodyLength, 40, 0);
          let layerAlpha = baseAlpha * (layer + 1) / 5;

          let fishColor = p.color(
            p.red(this.color),
            p.green(this.color),
            p.blue(this.color),
            layerAlpha
          );

          p.push();
          p.translate(pos.x, pos.y);
          p.rotate(angle);

          // Smaller blur amounts:
          if (layer === 0) {
            // front layer
            p.drawingContext.filter = "blur(3px)";
          } else if (layer === 1) {
            // middle
            p.drawingContext.filter = "blur(2px)";
          } else {
            // back
            p.drawingContext.filter = "none";
          }

          p.fill(fishColor);
          let layerSize = size * (1 - layer * 0.15);

          // A bit of texture in the middle layer
          if (layer === 1) {
            let textureColor = p.color(
              p.red(this.color),
              p.green(this.color),
              p.blue(this.color),
              layerAlpha * 0.7
            );
            p.fill(textureColor);
            for (let i = 0; i < 2; i++) {
              let offset = p.noise(time + i, progress * 2) * 5;
              p.ellipse(offset, offset, layerSize * 1.2, layerSize * 0.8);
            }
          }

          p.ellipse(0, 0, layerSize * 1.6, layerSize);
          p.pop();
        });
      }
    }

    showShadow() {
      // Single blur pass for shadows
      p.noStroke();
      p.drawingContext.filter = "blur(4px)";

      this.body.forEach((pos, index) => {
        let progress = index / this.bodyLength;
        let time = p.frameCount * this.pulseRate + this.timeOffset;
        let blobShape = (p.cos(progress * p.PI) + 1) * this.baseSize;
        let pulse = p.sin(time) * 0.1 + 1;
        let wave = p.sin(progress * 3 + time) * this.waveAmplitude;
        let size = p.max(0, blobShape * pulse + wave);

        let shadowAlpha = p.map(index, 0, this.bodyLength, 5, 0);
        p.fill(0, 0, 0, shadowAlpha);

        p.push();
        p.translate(pos.x + 20, pos.y + 20);
        p.rotate(this.velocity.heading());
        p.ellipse(0, 0, size * 1.6, size);
        p.pop();
      });

      p.drawingContext.filter = "none";
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
        let d = p.dist(
          this.position.x,
          this.position.y,
          other.position.x,
          other.position.y
        );
        if (other !== this && d < 100) {
          alignment.add(other.velocity);
          cohesion.add(other.position);
          // Use p.constructor.Vector for instance mode
          let diff = p.constructor.Vector.sub(this.position, other.position).div(
            d
          );
          separation.add(diff);
          total++;
        }
      }

      if (total > 0) {
        alignment
          .div(total)
          .setMag(this.maxSpeed)
          .sub(this.velocity)
          .limit(this.maxForce);

        cohesion
          .div(total)
          .sub(this.position)
          .setMag(this.maxSpeed)
          .sub(this.velocity)
          .limit(this.maxForce);

        separation
          .div(total)
          .setMag(this.maxSpeed)
          .sub(this.velocity)
          .limit(this.maxForce);
      }

      this.applyForce(alignment.mult(0.8));
      this.applyForce(cohesion.mult(0.5));
      this.applyForce(separation.mult(1.2));
    }
  }

  /*
    P5 SETUP
  */
  let canvasElement;
  p.setup = () => {
    // Match your Slide5 approach:
    const container = document.querySelector(".animationScreen");
    let w = container ? container.offsetWidth : 800;
    let h = container ? container.offsetHeight : 600;
    
    const canvas = p.createCanvas(w, h, p.P2D);
    canvasElement = canvas.elt;

    // Absolutely position the canvas
    canvasElement.style.position = "absolute";
    canvasElement.style.left = "50%";
    canvasElement.style.top = "50%";
    canvasElement.style.transform = "translate(-50%, -50%)";

    // Prevent default scroll on touch
    canvasElement.style.touchAction = "none";

    p.pixelDensity(1);

    // Initialize shader layer
    shaderLayer = p.createGraphics(w, h, p.WEBGL);
    shaderLayer.pixelDensity(1);
    shaderLayer.noStroke();
    shaderProgram = shaderLayer.createShader(vertShader, fragShader);
    shaderLayer.shader(shaderProgram);

    // Initialize text layer
    textLayer = p.createGraphics(w, h);
    textLayer.pixelDensity(1);
    textLayer.textAlign(p.CENTER, p.CENTER);
    textLayer.textSize(p.min(w, h) * 0.055);

    // Create fish
    fish = [];
    const centerX = w / 2;
    const centerY = h / 2;
    for (let i = 0; i < 15; i++) {
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

    // 2) Fish shadows
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

    // 4) Handle text fade and display
    handleTextAnimation();
    textLayer.clear();
    textLayer.fill(0, 16);
    textLayer.rect(0, 0, p.width, p.height);
    textLayer.fill(255, questionAlpha);
    textLayer.text(
      questions[currentQuestionIndex],
      p.width / 2,
      p.height / 2
    );
    p.image(textLayer, 0, 0, p.width, p.height);
  };

  /*
    HELPER: QUESTION FADE STATE MACHINE
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
          currentQuestionIndex =
            (currentQuestionIndex + 1) % questions.length;
          fadeState = "fadeIn";
        }
        break;
    }
  }

  /*
    INTERACTION EVENTS
    - We DO NOT use pointer-events:none here,
      so the canvas can still receive taps/clicks.
    - Make sure your next/prev buttons
      have a higher z-index than this canvas.
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

  p.touchStarted = (event) => {
    // Only do fade logic if user taps the canvas
    if (event.target === canvasElement) {
      p.mousePressed();
      event.preventDefault();
      return false;
    }
    // If user taps elsewhere (e.g. a button), let it pass
    return true;
  };

  /*
    HANDLE RESIZE
  */
  p.windowResized = () => {
    const container = document.querySelector(".animationScreen");
    if (container) {
      let w = container.offsetWidth;
      let h = container.offsetHeight;
      p.resizeCanvas(w, h);

      // Reposition absolute
      canvasElement.style.left = "50%";
      canvasElement.style.top = "50%";
      canvasElement.style.transform = "translate(-50%, -50%)";

      // Resize layers
      shaderLayer.resizeCanvas(w, h);
      textLayer.resizeCanvas(w, h);
      textLayer.textSize(p.min(w, h) * 0.055);
    }
  };
};
