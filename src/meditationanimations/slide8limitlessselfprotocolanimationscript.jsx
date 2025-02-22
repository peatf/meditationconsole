"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import { useEffect, useState } from "react";

export default function Slide8Animation({ clickCount = 0 }) {
  const [opacity, setOpacity] = useState(0.15);

  useEffect(() => {
    setOpacity(0.15 + clickCount * 0.17); // This will reach close to 1 after ~5 clicks
  }, [clickCount]);

  return (
    <div
      className="animationScreen"
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <ReactP5Wrapper sketch={sketch} clickCount={clickCount} />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "#fff",
          fontFamily: "monospace",
          textAlign: "center",
          pointerEvents: "none",
          opacity: opacity,
          zIndex: 1,
          fontSize: "1.2rem",
          maxWidth: "80%"
        }}
      >
        I am seeing my current reality through the lens of my non-physical self.
      </div>
    </div>
  );
}

const sketch = (p) => {
  // Global variables
  let textAlpha = 0;
  let pulse = 0;
  let shaderProgram;
  let gradientScale = 1.0;
  let noiseScale = 0.5;
  let time = 0;
  let prevClickCount = 0;

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
    uniform float gradientScale;
    uniform float noiseScale;

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

    vec3 colorPalette(float t, vec2 uv, float time) {
      vec3 mainColor  = hexToRGB(vec3(195.0, 189.0, 189.0));  // C3BDBD
      vec3 deepBlue   = hexToRGB(vec3(20.0,  28.0, 105.0));   // 141C69
      vec3 midTone    = hexToRGB(vec3(154.0, 149.0, 167.0));  // 9A95A7
      vec3 shadow     = hexToRGB(vec3(107.0, 104.0, 137.0));  // 6B6889
      vec3 mintSplash = hexToRGB(vec3(227.0, 255.0, 200.0));  // E3FFC8
      vec3 highlight  = hexToRGB(vec3(235.0, 235.0, 245.0));  // EBEBF5

      float pi2 = 6.28318;
      float cloudPattern = sin(uv.x * 3.0 + time) * 0.2;
      float t_modified = t + cloudPattern;
      
      float bluePhase = sin(t_modified * pi2 + 1.0) * 0.5 + 0.5;
      vec3 color = mix(mainColor, deepBlue,  bluePhase * 0.3);
      
      float greenPhase = sin(t_modified * pi2 + 2.0) * 0.5 + 0.5;
      color = mix(color, midTone,   greenPhase * 0.4);
      
      float warmPhase = sin(t_modified * pi2 + 3.0) * 0.5 + 0.5;
      color = mix(color, shadow,    warmPhase * 0.5);
      
      float whiteBalance = smoothstep(0.2, 0.8, noise(uv * 2.0 + time * 0.1));
      color = mix(color, mainColor, whiteBalance * 0.6);
      
      return color;
    }

    void main() {
      vec2 uv = vTexCoord;
      uv.x *= resolution.x / resolution.y;
      
      float t = time * 0.5;
      float distortionStrength = 0.01 * pulse;
      uv.x += sin(uv.y * 8.0 + t) * distortionStrength;
      uv.y += cos(uv.x * 6.0 + t) * distortionStrength;
      
      float grain = noise(uv * 500.0 + time * 10.0) * 0.12 * noiseScale;
      
      vec3 color = colorPalette(length(uv - 0.5) + time * 0.1, uv, time);
      color = pow(color, vec3(0.8));
      color += grain;
      color = clamp(color, 0.0, 1.0);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  p.setup = () => {
    const container = document.querySelector(".animationScreen");
    let w = container ? container.offsetWidth : 800;
    let h = container ? container.offsetHeight : 600;
    const canvas = p.createCanvas(w, h, p.WEBGL);
    const canvasElement = canvas.elt;
    canvasElement.style.position = "absolute";
    canvasElement.style.left = "50%";
    canvasElement.style.top = "50%";
    canvasElement.style.transform = "translate(-50%, -50%)";
    // Ensure touch events register correctly on mobile:
    canvasElement.style.touchAction = "none";

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
      shaderProgram.setUniform("resolution", [p.width, p.height]);
      shaderProgram.setUniform("time", p.millis() / 1000);
      shaderProgram.setUniform("pulse", pulse);
      // Gradually decay pulse so the effect fades out
      pulse = p.max(pulse - 0.02, 0);
      gradientScale = 1.0 + 0.2 * p.sin(p.millis() / 1000 * 0.5);
      noiseScale = 0.5 + 0.2 * p.cos(p.millis() / 1000 * 0.3);
      p.quad(-1, -1, 1, -1, 1, 1, -1, 1);
    } catch (e) {
      console.error("Error in draw:", e);
    }
  };

  p.updateWithProps = (props) => {
    if (props.clickCount !== undefined && props.clickCount > prevClickCount) {
      pulse = 1.0;
      prevClickCount = props.clickCount;
    }
  };

  p.windowResized = () => {
    const container = document.querySelector(".animationScreen");
    if (container) {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    }
  };

  p.mousePressed = () => {
    pulse = 1.0;
  };

  p.touchStarted = () => {
    pulse = 1.0;
    return false;
  };
};
