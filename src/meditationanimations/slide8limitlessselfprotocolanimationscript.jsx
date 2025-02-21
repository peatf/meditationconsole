"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";

export default function Slide8Animation({ onYesClick }) {
  return <ReactP5Wrapper sketch={(p) => sketch(p, onYesClick)} />;
}

const sketch = (p, onYesClick) => {
  // Global variables for text opacity (0–255) and pulse effect
  let textAlpha = 0;
  let pulse = 0;

  let shaderProgram;

  const vert = `
    attribute vec3 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 vTexCoord;
    void main() {
      vTexCoord = aTexCoord;
      gl_Position = vec4(aPosition, 1.0);
    }
  `;

  const frag = `
    precision highp float;
    varying vec2 vTexCoord;
    uniform vec2 resolution;
    uniform float time;
    uniform float pulse;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    vec3 hexToRGB(vec3 c) {
      return c / 255.0;
    }

    float organicPattern(vec2 uv, float time) {
      float shape = 0.0;
      for(float i = 1.0; i < 4.0; i++) {
        vec2 offset = vec2(
          sin(time * 0.5 * i) * 0.1,
          cos(time * 0.3 * i) * 0.1
        );
        shape += smoothstep(
          0.5 + sin(time * 0.2) * 0.1,
          0.6 + cos(time * 0.3) * 0.1,
          length(uv + offset)
        );
      }
      return shape / 3.0;
    }

    vec3 colorPalette(float t, vec2 uv, float time) {
      vec3 mainColor  = hexToRGB(vec3(195.0, 189.0, 189.0));  // C3BDBD
      vec3 deepBlue   = hexToRGB(vec3(20.0,  28.0, 105.0));   // 141C69
      vec3 midTone    = hexToRGB(vec3(154.0, 149.0, 167.0));  // 9A95A7
      vec3 shadow     = hexToRGB(vec3(107.0, 104.0, 137.0));  // 6B6889
      vec3 mintSplash = hexToRGB(vec3(227.0, 255.0, 200.0));  // E3FFC8

      float pi2 = 6.28318;
      float cloudPattern = organicPattern(uv - 0.5, time);
      float t_modified = t + cloudPattern * 0.3;

      vec3 color = mainColor;
      float phase = sin(t_modified * pi2) * 0.5 + 0.5;

      color = mix(color, deepBlue,  phase * 0.3);
      color = mix(color, midTone,   phase * 0.4);
      color = mix(color, shadow,    phase * 0.5);

      float mintPhase = cos(t_modified * pi2 * 2.0) * 0.5 + 0.5;
      float mintNoise = noise(uv * 3.0 + time);
      color = mix(color, mintSplash, mintPhase * mintNoise * 0.15);

      float whiteBalance = smoothstep(0.2, 0.8, noise(uv * 2.0 + time * 0.1));
      color = mix(color, mainColor, whiteBalance * 0.6);

      return color;
    }

    void main() {
      vec2 uv = vTexCoord;
      uv.x *= resolution.x / resolution.y;

      float t = time * 0.5;

      uv.x += sin(uv.y * 8.0 + t) * 0.01 * pulse;
      uv.y += cos(uv.x * 6.0 + t) * 0.01 * pulse;

      vec3 color = colorPalette(length(uv - 0.5) + time * 0.1, uv, time);
      float grain = noise(uv * 500.0 + time * 10.0) * 0.12;
      color += grain;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  p.setup = () => {
    // Create canvas and get container dimensions
    const container = document.querySelector('.animationScreen');
    let w = container ? container.offsetWidth : 800;
    let h = container ? container.offsetHeight : 600;
    const canvas = p.createCanvas(w, h, p.WEBGL);
    
    // Center the canvas in the container
    const canvasElement = canvas.elt;
    canvasElement.style.position = 'absolute';
    canvasElement.style.left = '50%';
    canvasElement.style.top = '50%';
    canvasElement.style.transform = 'translate(-50%, -50%)';
    
    try {
      shaderProgram = p.createShader(vert, frag);
      p.shader(shaderProgram);
    } catch (e) {
      console.error("Error creating shader:", e);
    }
    p.noStroke();
  };

  p.draw = () => {
    if (!shaderProgram) return;
    try {
      p.shader(shaderProgram);
      shaderProgram.setUniform('resolution', [p.width, p.height]);
      shaderProgram.setUniform('time', p.millis() / 1000);
      shaderProgram.setUniform('pulse', pulse);

      // Gradually reduce pulse
      pulse = p.max(pulse - 0.02, 0);

      // Render a full-screen quad
      p.quad(-1, -1, 1, -1, 1, 1, -1, 1);

    } catch (e) {
      console.error("Error in draw:", e);
    }
  };

  p.windowResized = () => {
    const container = document.querySelector('.animationScreen');
    if (container) {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    }
  };

  // Handle interaction through props instead of direct DOM manipulation
  p.handleYesClick = () => {
    pulse = 1.0;
    textAlpha = p.min(textAlpha + 50, 255);
    if (onYesClick) onYesClick();
  };

  p.mousePressed = () => {
    p.handleYesClick();
  };

  p.touchStarted = () => {
    p.handleYesClick();
    return false;
  };
};
