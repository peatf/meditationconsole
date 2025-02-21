"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import { useEffect, useState } from 'react';

export default function Slide6Animation({ clickCount = 0 }) {
  const [opacity, setOpacity] = useState(0.15);
  const [localClickCount, setLocalClickCount] = useState(0);

  useEffect(() => {
    if (clickCount > localClickCount) {
      setOpacity(prev => Math.min(prev + 0.17, 1));
      setLocalClickCount(clickCount);
    }
  }, [clickCount, localClickCount]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ReactP5Wrapper sketch={sketch} clickCount={clickCount} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'black',
        fontFamily: 'monospace',
        textAlign: 'center',
        pointerEvents: 'none',
        opacity: opacity,
        zIndex: 1,
        fontSize: '1.2rem',
        maxWidth: '80%',
        textShadow: '1px 1px 2px rgba(255,255,255,0.5)'
      }}>
        Do you feel ready and willing<br />
        to agree with that perspective<br />
        about you right now?
      </div>
    </div>
  );
}

const sketch = (p) => {
  let shaderProgram;
  let pulse = 0;

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

    vec3 colorPalette(float t, vec2 uv) {
        vec3 mainColor = hexToRGB(vec3(249.0, 251.0, 252.0));    
        vec3 softBlue = hexToRGB(vec3(164.0, 211.0, 222.0)) * 1.3;     
        vec3 brightBlue = hexToRGB(vec3(126.0, 199.0, 222.0)) * 1.4;   
        vec3 softGreen = hexToRGB(vec3(194.0, 224.0, 202.0)) * 1.3;    
        vec3 brightGreen = hexToRGB(vec3(145.0, 216.0, 163.0)) * 1.4;  
        vec3 warmOrange = hexToRGB(vec3(230.0, 174.0, 116.0)) * 1.3;   
        vec3 softRed = hexToRGB(vec3(221.0, 120.0, 109.0)) * 1.4;      
        vec3 deepRed = hexToRGB(vec3(208.0, 82.0, 75.0)) * 1.5;        

        float pi2 = 6.28318;
        vec3 color = mainColor;
        
        float distort = sin(uv.x * 3.0 + time) * 0.2 + cos(uv.y * 2.0 - time * 0.5) * 0.3;
        float t_modified = t + distort;
        
        float bluePhase = sin(t_modified * pi2 + 1.0) * 0.5 + 0.5;
        color = mix(color, softBlue, bluePhase * 0.5);
        color = mix(color, brightBlue, bluePhase * 0.3);
        
        float greenPhase = sin(t_modified * pi2 + 2.0) * 0.5 + 0.5;
        color = mix(color, softGreen, greenPhase * 0.5);
        color = mix(color, brightGreen, greenPhase * 0.3);
        
        float warmPhase = sin(t_modified * pi2 + 3.0) * 0.5 + 0.5;
        color = mix(color, warmOrange, warmPhase * 0.4);
        color = mix(color, softRed, warmPhase * 0.3);
        color = mix(color, deepRed, warmPhase * 0.2);
        
        float whiteBalance = smoothstep(0.2, 0.8, noise(uv * 2.0 + time * 0.1));
        color = mix(color, mainColor, whiteBalance * 0.7);
        
        return color;
    }

    void main() {
        vec2 uv = vTexCoord;
        uv.x *= resolution.x/resolution.y;
        
        float t = time * 0.5;
        uv.x += sin(uv.y * 10.0 + t) * 0.01 * pulse;
        uv.y += cos(uv.x * 8.0 + t) * 0.01 * pulse;
        
        vec2 grid = vec2(80.0);
        vec2 fpos = fract(uv * grid);
        float pattern = smoothstep(0.3, 0.7, length(fpos - 0.5));
        
        float stripeCount = 20.0;
        float stripePos = uv.x * stripeCount;
        float stripeFactor = fract(stripePos - time * 0.2);
        float stripePattern = smoothstep(0.0, 0.4, stripeFactor) * 
                            (1.0 - smoothstep(0.6, 1.0, stripeFactor));
        
        float grain = noise(uv * 500.0 + time * 10.0) * 0.15;
        
        vec3 color = colorPalette(length(uv - 0.5) + time * 0.1, uv);
        color = mix(color, vec3(pattern), 0.1);
        color *= 0.9 + stripePattern * 0.3;
        color += grain * 0.08;
        
        gl_FragColor = vec4(color, 1.0);
    }
  `;

  p.setup = () => {
    const container = document.querySelector('.animationScreen');
    let w = container ? container.offsetWidth : 800;
    let h = container ? container.offsetHeight : 600;
    const canvas = p.createCanvas(w, h, p.WEBGL);
    
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
      if (p.props && p.props.clickCount > p._lastClickCount) {
        pulse = 1.0;
        p._lastClickCount = p.props.clickCount;
      }

      p.shader(shaderProgram);
      shaderProgram.setUniform('resolution', [p.width, p.height]);
      shaderProgram.setUniform('time', p.millis()/1000);
      shaderProgram.setUniform('pulse', pulse);
      
      pulse = p.max(pulse - 0.02, 0);
      
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
};
