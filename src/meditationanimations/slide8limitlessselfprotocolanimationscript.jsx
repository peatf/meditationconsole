"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import { useEffect, useState } from "react";

export default function Slide8Animation({ clickCount = 0 }) {
  const [opacity, setOpacity] = useState(0.15);

  useEffect(() => {
    setOpacity(0.15 + clickCount * 0.17);
  }, [clickCount]);

  return (
    <div className="animationScreen" style={{ position: "relative", width: "100%", height: "100%" }}>
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
  let shaderProgram;
  let pulse = 0;
  let prevClickCount = 0; // Moved inside sketch

  // Vertex shader (same as Slide6)
  const vert = `
    attribute vec3 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 vTexCoord;
    void main() {
      vTexCoord = aTexCoord;
      gl_Position = vec4(aPosition, 1.0);
    }
  `;

  // Fragment shader (Slide8's visual style)
  const frag = `
    precision highp float;
    varying vec2 vTexCoord;
    uniform vec2 resolution;
    uniform float time;
    uniform float pulse;

    // ... [Keep Slide8's existing fragment shader code here] ...
  `;

  p.setup = () => {
    const container = document.querySelector(".animationScreen");
    const w = container?.offsetWidth || 800;
    const h = container?.offsetHeight || 600;
    
    const canvas = p.createCanvas(w, h, p.WEBGL);
    const canvasElement = canvas.elt;
    
    // Positioning styles
    canvasElement.style.position = "absolute";
    canvasElement.style.left = "50%";
    canvasElement.style.top = "50%";
    canvasElement.style.transform = "translate(-50%, -50%)";
    
    // Mobile fixes (same as Slide6)
    canvasElement.style.touchAction = "manipulation";
    canvasElement.style.zIndex = "0";
    p.pixelDensity(1);

    try {
      shaderProgram = p.createShader(vert, frag);
      p.shader(shaderProgram);
    } catch (e) {
      console.error("Shader error:", e);
    }
    p.noStroke();
  };

  p.draw = () => {
    if (!shaderProgram) return;
    
    p.shader(shaderProgram);
    shaderProgram.setUniform("resolution", [p.width, p.height]);
    shaderProgram.setUniform("time", p.millis() / 1000);
    shaderProgram.setUniform("pulse", pulse);
    
    pulse = p.max(pulse - 0.02, 0);
    p.quad(-1, -1, 1, -1, 1, 1, -1, 1);
  };

  // Critical fix: Proper prop handling
  p.updateWithProps = (props) => {
    if (props.clickCount > prevClickCount) {
      pulse = 1.0;
      prevClickCount = props.clickCount;
    }
  };

  // Mobile fix: Unified event handling
  p.mousePressed = p.touchStarted = () => {
    pulse = 1.0;
    return true; // Allow event propagation
  };

  p.windowResized = () => {
    const container = document.querySelector(".animationScreen");
    if (container) {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    }
  };
};
