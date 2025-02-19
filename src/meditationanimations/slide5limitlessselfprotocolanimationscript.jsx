"use client";
import { ReactP5Wrapper } from "@p5-wrapper/react";

import React from 'react';
const Slide5limitlessselfprotocolanimationscript = () => {
    const sketch = (p5) => {
        let energyLevel = 0;
        let waves = [];
        let startY = 0;
        let noiseGraphics;

        p5.setup = () => {
            p5.createCanvas((() => (typeof window !== "undefined" ? (() => (typeof window !== "undefined" ? p5.windowWidth : 0))() : 0))(), (() => (typeof window !== "undefined" ? (() => (typeof window !== "undefined" ? p5.windowHeight : 0))() : 0))());
            p5.pixelDensity(1);
            p5.noStroke();
            noiseGraphics = p5.createGraphics(p5.width, p5.height);
            generateNoiseTexture();
        };

        p5.draw = () => {
            drawBackgroundGradient();

            if (p5.frameCount % (60 - p5.map(energyLevel, 0, 1, 10, 50)) === 0) {
                waves.push(new Wave());
            }

            for (let i = waves.length - 1; i >= 0; i--) {
                waves[i].update();
                waves[i].display();
                if (waves[i].isFinished()) {
                    waves.splice(i, 1);
                }
            }

            p5.blendMode(p5.OVERLAY);
            p5.image(noiseGraphics, 0, 0);
            p5.blendMode(p5.BLEND);

            p5.loadPixels();
            for (let i = 0; i < p5.pixels.length; i += 4) {
                let grain = p5.random(-10, 10);
                p5.pixels[i] += grain;
                p5.pixels[i + 1] += grain;
                p5.pixels[i + 2] += grain;
            }
            p5.updatePixels();
            p5.filter(p5.BLUR, 0.75);
        };

        class Wave {
            constructor() {
                this.radius = 0;
                this.speed = p5.map(energyLevel, 0, 1, 1, 5);
                this.brightness = p5.map(energyLevel, 0, 1, 50, 255);
                this.segments = 120;
                this.glitchProbability = 0.01;
                this.lifespan = 255;
                this.noiseOffsetX = p5.random(1000);
                this.noiseOffsetY = p5.random(1000);
            }

            update() {
                this.radius += this.speed;
                this.lifespan -= 1;
            }

            isFinished() {
                return this.lifespan < 0;
            }

            display() {
                let baseColor = p5.color(180, 220, 100, this.lifespan);
                let darkBeige = p5.color(100, 90, 70, this.lifespan);

                p5.push();
                p5.translate(p5.width / 2, p5.height);

                for (let i = 0; i < this.segments; i++) {
                    let angle = p5.map(i, 0, this.segments, 0, p5.TWO_PI);
                    let noiseX = this.noiseOffsetX + this.radius * 0.01 * p5.cos(angle);
                    let noiseY = this.noiseOffsetY + this.radius * 0.01 * p5.sin(angle);
                    let radiusOffset = p5.noise(noiseX, noiseY, p5.frameCount * 0.01) * 20;

                    let x = (this.radius + radiusOffset) * p5.cos(angle);
                    let y = (this.radius + radiusOffset) * p5.sin(angle);

                    let size = p5.map(p5.noise(i * 0.1, this.radius * 0.05), 0, 1, 2, 8);
                    let inter = p5.map(this.radius, 0, p5.width, 0, 1);
                    let c = p5.lerpColor(baseColor, darkBeige, inter);

                    let colorOffset = p5.noise(this.radius * 0.02, i * 0.05, p5.frameCount * 0.01) * 50 - 25;
                    let r = p5.constrain(p5.red(c) + colorOffset, 0, 255);
                    let g = p5.constrain(p5.green(c) + colorOffset, 0, 255);
                    let b = p5.constrain(p5.blue(c) + colorOffset, 0, 255);
                    p5.fill(r, g, b, this.lifespan);

                    if (p5.random(1) < this.glitchProbability * energyLevel) {
                        x += p5.random(-10, 10);
                        y += p5.random(-10, 10);
                        p5.fill(p5.random(255), p5.random(255), p5.random(255));
                    }

                    p5.ellipse(x, y, size, size);
                }
                p5.pop();
            }
        }

        function generateNoiseTexture() {
            noiseGraphics.noStroke();
            for (let x = 0; x < noiseGraphics.width; x++) {
                for (let y = 0; y < noiseGraphics.height; y++) {
                    let noiseVal = p5.noise(x * 0.05, y * 0.05);
                    let c = p5.map(noiseVal, 0, 1, 100, 180);
                    noiseGraphics.fill(c);
                    noiseGraphics.rect(x, y, 1, 1);
                }
            }
        }

        function drawBackgroundGradient() {
            let backgroundColor1 = p5.color(235, 225, 200);
            let backgroundColor2 = p5.color(215, 205, 180);

            for (let r = p5.height; r > 0; r -= 2) {
                let inter = p5.map(r, 0, p5.height, 1, 0);
                let c = p5.lerpColor(backgroundColor1, backgroundColor2, inter);
                p5.fill(c);
                p5.ellipse(p5.width / 2, p5.height, r * 2, r * 2);
            }
        }

        p5.windowResized = () => {
            p5.resizeCanvas((() => (typeof window !== "undefined" ? (() => (typeof window !== "undefined" ? p5.windowWidth : 0))() : 0))(), (() => (typeof window !== "undefined" ? (() => (typeof window !== "undefined" ? p5.windowHeight : 0))() : 0))());
            noiseGraphics = p5.createGraphics(p5.width, p5.height);
            generateNoiseTexture();
        };

        p5.touchStarted = () => {
            startY = p5.mouseY;
            return false;
        };

        p5.touchMoved = () => {
            let deltaY = startY - p5.mouseY;
            energyLevel += deltaY * 0.002;
            energyLevel = p5.constrain(energyLevel, 0, 1);
            startY = p5.mouseY;
            return false;
        };

        p5.mousePressed = () => {
            startY = p5.mouseY;
        };

        p5.mouseDragged = () => {
            let deltaY = startY - p5.mouseY;
            energyLevel += deltaY * 0.002;
            energyLevel = p5.constrain(energyLevel, 0, 1);
            startY = p5.mouseY;
        };
    };

    return <ReactP5Wrapper sketch={sketch} />;
};

export default Slide5limitlessselfprotocolanimationscript;
