"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";

export default function Slide4Animation() {
  return <ReactP5Wrapper sketch={sketch} />;
}

const sketch = (p) => {
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
      
      vec3 base = mix(vec3(0.16, 0.36, 0.20), vec3(0.96, 0.84, 0.65), n * 0.5);
      vec3 pinkAccent = vec3(0.95, 0.45, 0.60);
      vec3 greenAccent = vec3(0.24, 0.42, 0.30);
      vec3 accent = mix(pinkAccent, greenAccent, n);
      
      float pinkGlow = sin(uv.x * 2.0 + time * 0.5) * 0.5 + 0.5;
      vec3 finalColor = mix(base, accent, smoothstep(0.3, 0.7, n)) + pinkAccent * pinkGlow * 0.2;
      
      float paper = hash(uv * 50.0) * 0.05;
      float scan = sin(gl_FragCoord.y * 1.5) * 0.03;
      finalColor -= scan;

      gl_FragColor = vec4(finalColor + paper, 0.4);
    }
  `;

  const questions = [
    "What is the limitless self like?",
    "How would you describe them?",
    "What does it feel like to connect with them?"
  ];

  const FISH_COUNT = 5;
  const fishColors = ["#FF7272", "#FF4747", "#FF1C1C", "#D41414", "#FF6666"];

  let shaderLayer, shaderProgram, textLayer;
  let currentQuestionIndex = 0, questionAlpha = 0;
  let fadeDuration = 180, fadeCounter = 0, fadeState = "waiting";
  let lastInteractionTime = 0, minTimeBetweenInteractions = 2000;
  let fish = [];

  class EtherealFish {
    constructor(x, y, fishColor) {
      this.color = p.color(fishColor);
      this.position = p.createVector(x + p.random(-100, 100), y + p.random(-100, 100));
      this.velocity = random2DVector().mult(p.random(1, 2));
      this.acceleration = p.createVector();
      this.maxSpeed = 2;
      this.maxForce = 0.05;
      this.baseSize = p.random(20, 35);
      this.bodyLength = this.baseSize * 2;
      this.body = new Array(p.int(this.bodyLength)).fill().map(() => this.position.copy());
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

      this.body.forEach((pos, index) => {
        let progress = index / this.bodyLength;
        let time = p.frameCount * this.pulseRate + this.timeOffset;
        let noiseVal = p.noise(pos.x * 0.05, pos.y * 0.05, time * 0.5);

        for (let layer = 0; layer < 2; layer++) {
          let blobShape = (p.cos(progress * p.PI) + 1) * this.baseSize;
          let pulse = p.sin(time) * 0.1 + 1;
          let wave = p.sin(progress * 3 + time) * this.waveAmplitude;
          let size = p.max(0, blobShape * pulse + wave);
          size *= (1 + (noiseVal - 0.5) * 0.2);

          let layerAlpha = p.map(index, 0, this.bodyLength, 40, 0) * (layer + 1) / 4;
          let fishColor = p.color(p.red(this.color), p.green(this.color), p.blue(this.color), layerAlpha);
          
          p.push();
          p.translate(pos.x, pos.y);
          p.rotate(angle);
          
          let layerSize = size * (1 - layer * 0.15);
          p.fill(fishColor);
          p.ellipse(0, 0, layerSize * 1.6, layerSize);

          if (layer === 0) {
            fishColor.setAlpha(layerAlpha * 0.3);
            p.fill(fishColor);
            p.ellipse(0, 0, layerSize * 2, layerSize * 1.2);
          }
          p.pop();
        }
      });
    }

    showShadow() {
      p.noStroke();
      this.body.forEach((pos, index) => {
        let progress = index / this.bodyLength;
        let time = p.frameCount * this.pulseRate + this.timeOffset;
        let shadowAlpha = p.map(index, 0, this.bodyLength, 3, 0);

        p.push();
        p.translate(pos.x + 30, pos.y + 30);
        p.rotate(this.velocity.heading());
        
        p.fill(0, 0, 0, shadowAlpha);
        let blobShape = (p.cos(progress * p.PI) + 1) * this.baseSize;
        let layerSize = blobShape * (p.sin(time) * 0.1 + 1);
        p.ellipse(0, 0, layerSize * 1.6, layerSize);
        p.pop();
      });
    }

    edges() {
      if (this.position.x > p.width + 50) this.position.x = -50;
      if (this.position.x < -50) this.position.x = p.width + 50;
      if (this.position.y > p.height + 50) this.position.y = -50;
      if (this.position.y < -50) this.position.y = p.height + 50;
    }

    flock(fishArr) {
      let alignment = p.createVector(), cohesion = p.createVector(), separation = p.createVector();
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

  function random2DVector() {
    return p.createVector(p.cos(p.random(p.TWO_PI)), p.sin(p.random(p.TWO_PI)));
  }

  let canvasElement;
  p.setup = () => {
    const container = document.querySelector(".animationScreen");
    let w = container ? container.offsetWidth : 800;
    let h = container ? container.offsetHeight : 600;
    
    const canvas = p.createCanvas(w, h, p.P2D);
    canvasElement = canvas.elt;
    canvasElement.style.position = "absolute";
    canvasElement.style.left = "50%";
    canvasElement.style.top = "50%";
    canvasElement.style.transform = "translate(-50%, -50%)";
    canvasElement.style.touchAction = "none";

    p.pixelDensity(1);
    
    shaderLayer = p.createGraphics(w, h, p.WEBGL);
    shaderLayer.pixelDensity(1);
    shaderProgram = shaderLayer.createShader(vertShader, fragShader);
    
    textLayer = p.createGraphics(w, h);
    textLayer.textAlign(p.CENTER, p.CENTER);
    textLayer.textSize(p.min(w, h) * 0.055);

    const centerX = w / 2, centerY = h / 2;
    for (let i = 0; i < FISH_COUNT; i++) {
      let fishColor = p.color(fishColors[p.int(p.random(fishColors.length))]);
      fishColor.setAlpha(150);
      fish.push(new EtherealFish(centerX, centerY, fishColor));
    }
  };

  p.draw = () => {
    shaderLayer.shader(shaderProgram);
    shaderProgram.setUniform("u_time", p.millis() * 0.001);
    shaderProgram.setUniform("u_resolution", [p.width, p.height]);
    shaderLayer.rect(0, 0, p.width, p.height);
    p.image(shaderLayer, 0, 0, p.width, p.height);

    p.push();
    p.blendMode(p.MULTIPLY);
    fish.forEach(f => f.showShadow());
    p.pop();

    fish.forEach(f => {
      f.edges();
      f.flock(fish);
      f.update();
      f.show();
    });

    handleTextAnimation();
    textLayer.clear();
    textLayer.fill(0, 8);
    textLayer.rect(0, 0, p.width, p.height);
    // Change the fill to royal blue:
    textLayer.fill(65, 105, 225, questionAlpha);
    textLayer.text(questions[currentQuestionIndex], p.width / 2, p.height / 2);
    p.image(textLayer, 0, 0, p.width, p.height);
  };

  function handleTextAnimation() {
    switch (fadeState) {
      case "fadeIn":
        questionAlpha = p.map(fadeCounter, 0, fadeDuration, 0, 255);
        if (++fadeCounter >= fadeDuration) {
          fadeCounter = 0;
          fadeState = "visible";
        }
        break;
      case "fadeOut":
        questionAlpha = p.map(fadeCounter, 0, fadeDuration, 255, 0);
        if (++fadeCounter >= fadeDuration) {
          currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
          fadeState = "fadeIn";
        }
        break;
    }
  }

  p.mousePressed = () => {
    let currentTime = p.millis();
    if (currentTime - lastInteractionTime < minTimeBetweenInteractions) return;
    lastInteractionTime = currentTime;

    if (fadeState === "waiting") fadeState = "fadeIn";
    else if (fadeState === "visible") fadeState = "fadeOut";
  };

  p.touchStarted = (evt) => {
    // Always trigger the mousePressed behavior on touch.
    p.mousePressed();
    evt.preventDefault();
    return false;
  };

  p.windowResized = () => {
    const container = document.querySelector(".animationScreen");
    if (container) {
      let w = container.offsetWidth, h = container.offsetHeight;
      p.resizeCanvas(w, h);
      shaderLayer.resizeCanvas(w, h);
      textLayer.resizeCanvas(w, h);
      textLayer.textSize(p.min(w, h) * 0.055);
      canvasElement.style.left = "50%";
      canvasElement.style.top = "50%";
    }
  };
};
