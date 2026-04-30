'use client';

import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Matter from 'matter-js';
var decomp = require('poly-decomp');

// Set up poly-decomp for Matter.js
if (typeof window !== 'undefined') {
  Matter.Common.setDecomp(decomp);
}


interface Project {
  title: string;
  hoverTitle?: string;
  category?: string;
  src?: string;
  content?: React.ReactNode;
type?: 'project' | 'link' | 'campaign' | 'image' | 'question';
  prompt?: string;
  shape?: 'letterH' | 'letterC' | 'letterR' | 'letterI' | 'letterS' | 'letterE' | 'letterU' | 'letterK' | 'letterA' | 'dollarSign' | 'slash' | 'bracketOpen' | 'bracketClose' | 'parenOpen' | 'parenClose' | 'pill' | 'rect' | 'diamond' | 'parallelogram' | 'arrowRight' | 'tree' | 'keystone';
  imageSrc?: string;
  url?: string;
}


interface TumblingShapesProps {
  projects?: Project[];
  filterCategory?: string;
  onShapeClick?: (item: Project) => void;
  onShapeHover?: (item: Project | null) => void;
  mode?: 'initial' | 'links';
  chatCentered?: boolean;
  /** id of DOM element to render canvas into; defaults to 'output_area' */
  containerId?: string;
}

const TumblingShapes: React.FC<TumblingShapesProps> = ({ projects = [], filterCategory, onShapeClick, onShapeHover, mode = 'initial', chatCentered = false, containerId = 'output_area' }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
const bodiesRef = useRef<{ body: Matter.Body; project: Project; shapeType?: string }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoveredBodyRef = useRef<Matter.Body | null>(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Body = Matter.Body,
          Composite = Matter.Composite,
          Mouse = Matter.Mouse,
          MouseConstraint = Matter.MouseConstraint,
          Events = Matter.Events;

    const engine = Engine.create();
    engineRef.current = engine;
    const world = engine.world;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
background: mode === 'initial' ? '#1f1409a1' : '#dcd3c3'
      }
    });
    renderRef.current = render;
    canvasRef.current = render.canvas;
    
    // Set canvas z-index to appear above beige overlay (z-index 500)
    if (render.canvas) {
      render.canvas.style.position = 'relative';
      render.canvas.style.zIndex = '600';  // Above overlay (500) but below UI (1000+)
    }

    // ===== LETTER H =====
    function getHVertices() {
      const vertices = [];
      const stemWidth = 68;
      const totalHeight = 300;
      const archStartY = 173;
      const legWidth = 47;
      const radius = 60;

      vertices.push({ x: 0, y: totalHeight });
      vertices.push({ x: 0, y: -8 });
      vertices.push({ x: stemWidth, y: 0 });
      vertices.push({ x: stemWidth, y: archStartY });

      const archCx = stemWidth;
      const archCy = archStartY + radius;

      for (let i = 0; i <= 20; i++) {
        const angle = -Math.PI / 2 + (i / 20) * (Math.PI / 2);
        vertices.push({
          x: archCx + radius * Math.cos(angle),
          y: archCy + radius * Math.sin(angle)
        });
      }

      const rightLegX = archCx + radius;
      vertices.push({ x: rightLegX + 6, y: totalHeight });
      vertices.push({ x: rightLegX - legWidth + 12, y: totalHeight });

      const innerRadius = radius - legWidth + 12;
      for (let i = 0; i <= 15; i++) {
        const angle = 0 - (i / 15) * (Math.PI / 2);
        vertices.push({
          x: archCx + innerRadius * Math.cos(angle),
          y: archCy + innerRadius * Math.sin(angle) + 24
        });
      }

      vertices.push({ x: stemWidth, y: totalHeight });
      return vertices.map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== LETTER C =====
    function getCVertices() {
      const vertices = [];
      const radius = 132;
      const thickness = 114;
      const segments = 40;

      for (let i = 0; i <= segments; i++) {
        const angle = (Math.PI * 0.6) + (i / segments) * (Math.PI * 1.00);
        vertices.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        });
      }

      const innerRadius = radius - thickness;
      for (let i = segments; i >= 0; i--) {
        const angle = (Math.PI * 0.55) + (i / segments) * (Math.PI * 1.15);
        vertices.push({
          x: Math.cos(angle) * innerRadius,
          y: Math.sin(angle) * innerRadius
        });
      }

      return vertices.map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== LETTER r (lowercase) =====
    function getRVertices() {
      const vertices = [];
      const stemW     = 55;  // stem width
      const height    = 175; // total height
      const armR      = 70;  // outer arm radius; arc center at (stemW, armR)
      const armInnerR = 12;  // inner arm radius (arm thickness ≈ 42)
      const N = 22;          // quarter-circle segments

      // Stem: BL → TL
      vertices.push({ x: 0, y: height });
      vertices.push({ x: 0, y: 0 });

      // Outer arm arc: CW quarter-circle from (stemW, 0) → (stemW + armR, armR)
      for (let i = 0; i <= N; i++) {
        const angle = -Math.PI / 2 + (i / N) * (Math.PI / 2);
        vertices.push({
          x: stemW + armR * Math.cos(angle),
          y: armR  + armR * Math.sin(angle)
        });
      }
      // Now at (125, 70) — outer arm tip

      // Flat tip → inner arc: CCW quarter-circle back to (stemW, armR - armInnerR)
      for (let i = N; i >= 0; i--) {
        const angle = -Math.PI / 2 + (i / N) * (Math.PI / 2);
        vertices.push({
          x: stemW + armInnerR * Math.cos(angle),
          y: armR  + armInnerR * Math.sin(angle)
        });
      }
      // Now at (55, 42) — arm root on stem right side

      // Stem right side down to BR; bottom edge closes back to BL
      vertices.push({ x: stemW, y: height });

      return vertices.map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== LETTER I =====
    function getIVertices() {
      const vertices = [];
      const width = 72;
      const height = 227;
      const dotRadius = 48;
      const dotGap = 3.5;

      vertices.push({ x: -width / 2, y: -height / 2.1 });
      vertices.push({ x: -width / 2, y: height / 2.1 });
      vertices.push({ x: -width / 2, y: height / 2 + dotGap });

      const dotCenterY = height / 2 + dotGap + dotRadius;
      const segments = 20;

      // Arc traces the BOTTOM of the dot (away from stem) via negated sin
      for (let i = 0; i <= segments; i++) {
        const angle = Math.PI + (i / segments) * Math.PI * 1.4;
        vertices.push({
          x: Math.cos(angle) * dotRadius,
          y: dotCenterY - Math.sin(angle) * dotRadius
        });
      }

      vertices.push({ x: width / 2, y: height / 2 + dotGap });
      vertices.push({ x: width / 2, y: height / 2 });
      vertices.push({ x: width / 2, y: -height / 2 });
      return vertices.map(v => ({ x: v.x * 1.15 * 0.8, y: v.y * 1.15 }));
    }

    // ===== TOP C SHAPE =====
    function getTopCVertices(apertureExtend = 0) {
      const vertices = [];
      const radius = 120;
      const thickness = 54;
      const segments = 40;

      for (let i = 0; i <= segments; i++) {
        const angle = (Math.PI * 0.65) + (i / segments) * (Math.PI * 1.0);
        vertices.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        });
      }

      const innerRadius = radius - thickness;
      for (let i = segments; i >= 0; i--) {
        const angle = (Math.PI * (0.55 - apertureExtend)) + (i / segments) * (Math.PI * (1.15 + apertureExtend * 2));
        vertices.push({
          x: Math.cos(angle) * innerRadius,
          y: Math.sin(angle) * innerRadius
        });
      }

      return vertices.map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== BOTTOM C SHAPE =====
    function getBottomCVertices(apertureExtend = 0) {
      const vertices = [];
      const radius = 108;
      const thickness = 48;
      const segments = 25;

      for (let i = 0; i <= segments; i++) {
        const angle = (Math.PI * 1.65) + (i / segments) * (Math.PI * 1.3);
        vertices.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        });
      }

      const innerRadius = radius - thickness;
      for (let i = segments; i >= 0; i--) {
        const angle = (Math.PI * (1.65 - apertureExtend)) + (i / segments) * (Math.PI * (1.0 + apertureExtend * 2));
        vertices.push({
          x: Math.cos(angle) * innerRadius,
          y: Math.sin(angle) * innerRadius
        });
      }

      return vertices.map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== LETTER e (lowercase) =====
    function getEVertices() {
      // Lowercase e:
      //   • Outer arc: full traversal from bar-right (angle 0) clockwise to upper-right tail
      //   • Inner arc: from tail back counterclockwise only to angle π (inner-LEFT)
      //   • Bar: closing edge from inner-left → outer-right at midheight
      //           = (cx - innerR, cy) → (cx + outerR, cy)
      //           length = outerR + innerR  ← wide, prominent bar
      const cx = 90;
      const cy = 98;
      const outerR = 98;
      const innerR = 40; // visible inner counter
      const N = 28;
      const openAngle = 0.2 * Math.PI; // ~40° gap between tail and bar
      const yScale = .95; // flatten the bowl vertically — less upward curve

      const verts: { x: number; y: number }[] = [];

      // Outer arc: elliptical (yScale < 1) so bowl curves less upward.
      for (let i = 0; i <= N; i++) {
        const angle = (i / N) * (2 * Math.PI - openAngle);
        verts.push({ x: cx + outerR * Math.cos(angle), y: cy - outerR * yScale * Math.sin(angle) });
      }

      // Flat terminal: straight cut from outer arc end to inner arc start.
      // (No intermediate points needed — the polygon edge is already a straight line.)

      // Inner arc: same yScale applied so counter matches outer bowl
      for (let i = 1; i <= N; i++) {
        const angle = (2 * Math.PI - openAngle) - (i / N) * (Math.PI - openAngle);
        verts.push({ x: cx + innerR * Math.cos(angle), y: cy - innerR * yScale * Math.sin(angle) });
      }
      // Bar stays at y=cy (sin=0 at both endpoints), closing edge unchanged.
      // Reverse restores CW winding after the vertical mirror.
      return verts.reverse();
    }

    // ===== LETTER U =====
    function getUVertices() {
      const totalW = 155;
      const totalH = 150;
      const legW = 50;
      const outerR = totalW / 2;              // 77.5 — full outer semicircle
      const cx = totalW / 2;                  // 77.5
      const archY = totalH - outerR;          // 72.5 — outer arc centre
      const innerR = cx - legW;               // 37.5 — wide counter opening
      const innerArcDepth = 30;               // scoop depth from top
      const innerArchY = 0;                   // no inner legs — arc starts at y=0
      const vertices: { x: number; y: number }[] = [];

      // Outer top-left corner
      vertices.push({ x: 0, y: 0 });

      // Outer arc: π → 0 (sin ≥ 0, curves DOWN)
      for (let i = 0; i <= 20; i++) {
        const angle = Math.PI - (i / 20) * Math.PI;
        vertices.push({ x: cx + outerR * Math.cos(angle), y: archY + outerR * Math.sin(angle) });
      }

      // Outer top-right corner
      vertices.push({ x: totalW, y: 0 });

      // Inner top-right corner → straight leg down (arc starts exactly at leg x)
      vertices.push({ x: totalW - legW, y: 0 });

      // Inner arc: 0 → π, elliptical — full width span, only 25% of the depth
      for (let i = 0; i <= 20; i++) {
        const angle = (i / 20) * Math.PI;
        vertices.push({ x: cx + innerR * Math.cos(angle), y: innerArchY + innerArcDepth * Math.sin(angle) });
      }

      // Straight leg up → inner top-left corner
      vertices.push({ x: legW, y: 0 });

      return vertices.map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== LETTER K (lowercase, squat) =====
    function getKVertices() {
      // Stem matches H: 68 wide × 300 tall. Arms extend 32px beyond stem.
      // Y positions scaled proportionally from original 233-tall version.
      return [
        { x: 0,   y: 0   },
        { x: 68,  y: 0   },
        { x: 68,  y: 219 },  // stem right edge
        { x: 100, y: 183 },  // upper arm tip
        { x: 100, y: 221 },  // upper arm bottom
        { x: 84,  y: 224 },  // waist junction
        { x: 100, y: 228 },  // lower leg top
        { x: 100, y: 300 },  // lower leg bottom
        { x: 68,  y: 277 },  // stem inner edge
        { x: 68,  y: 300 },
        { x: 0,   y: 300 }
      ].map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== LETTER A (lowercase) =====
    function getAVertices() {
      // Single-story lowercase 'a': circular bowl + right stem + arched top.
      // Bowl is centred lower so the arch has vertical room above it.
      const cx = 90;           // bowl centre x
      const cy = 130;          // bowl centre y (lower than before)
      const R  = 88;           // outer bowl radius
      const N  = 24;

      // Right-side opening where stem meets bowl
      const openFrac  = 0.50;
      const openAngle = Math.acos(openFrac);            // 60°
      const juncX     = Math.round(cx + R * openFrac);  // ≈ 134
      const juncYTop  = Math.round(cy - R * Math.sin(openAngle)); // ≈ 54
      const juncYBot  = Math.round(cy + R * Math.sin(openAngle)); // ≈ 206

      const stemR = 180;  // right edge of stem

      // Arch: quadratic Bézier from (juncX, juncYTop) up through ctrl to (stemR, juncYTop)
      const archCtrlX = Math.round((juncX + stemR) / 2);  // ≈ 157 (midpoint)
      const archCtrlY = juncYTop - 50;                      // ≈ 4  (50px above junctions)
      const N_arch = 14;

      const verts: { x: number; y: number }[] = [];

      // Stem: top-right → bottom-right (clockwise)
      verts.push({ x: stemR, y: juncYTop });
      verts.push({ x: stemR, y: juncYBot });

      // Bowl arc: lower junction → CW → bottom → left → top → upper junction
      for (let i = 0; i <= N; i++) {
        const angle = openAngle + (i / N) * (2 * Math.PI - 2 * openAngle);
        verts.push({ x: Math.round(cx + R * Math.cos(angle)), y: Math.round(cy + R * Math.sin(angle)) });
      }
      // now at (juncX, juncYTop)

      // Arch: upper bowl junction → arched peak → stem top-right
      for (let i = 1; i <= N_arch; i++) {
        const t = i / N_arch;
        verts.push({
          x: Math.round((1 - t) * (1 - t) * juncX    + 2 * (1 - t) * t * archCtrlX + t * t * stemR),
          y: Math.round((1 - t) * (1 - t) * juncYTop + 2 * (1 - t) * t * archCtrlY + t * t * juncYTop),
        });
      }

      return verts.map(v => ({ x: v.x * 0.9775 * 0.8, y: v.y * 1.15 }));
    }

    // ===== PENNSYLVANIA KEYSTONE =====
    function getKeystoneVertices() {
      // Wide top with trapezoidal notch cut from center, sides taper to narrower bottom.
      return [
        { x: 30,  y: 0   },  // top-left outer
        { x: 95,  y: 0   },  // notch left-top
        { x: 112, y: 58  },  // notch left-bottom (diagonal cut)
        { x: 168, y: 58  },  // notch right-bottom
        { x: 185, y: 0   },  // notch right-top
        { x: 250, y: 0   },  // top-right outer
        { x: 215, y: 270 },  // bottom-right (sides taper inward)
        { x: 65,  y: 270 },  // bottom-left
      ].map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== EVERGREEN TREE =====
    function getTreeVertices() {
      // 3-tier stepped evergreen silhouette + trunk. Center x=140.
      return [
        { x: 114, y: 414 },  // trunk BL (slanted left, -25%)
        { x: 122, y: 280 },  // trunk TL / tree base left
        { x: 65,  y: 280 },  // tier 1 left tip
        { x: 105, y: 210 },  // tier 1 left edge at tier 2 base height
        { x: 73,  y: 210 },  // tier 2 left tip
        { x: 109, y: 145 },  // tier 2 left edge at tier 3 base height
        { x: 93,  y: 145 },  // tier 3 left tip
        { x: 140, y: 20  },  // apex
        { x: 187, y: 145 },  // tier 3 right tip
        { x: 171, y: 145 },  // tier 2 right edge at tier 3 base height
        { x: 207, y: 210 },  // tier 2 right tip
        { x: 175, y: 210 },  // tier 1 right edge at tier 2 base height
        { x: 215, y: 280 },  // tier 1 right tip
        { x: 158, y: 280 },  // trunk TR / tree base right
        { x: 158, y: 411 },  // trunk BR (slanted left, -25%)
      ].map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== PILL (rounded rectangle) =====
    function getPillVertices() {
      const totalW = 200;
      const h = 80;
      const r = h / 2;
      const N = 15;
      const vertices: { x: number; y: number }[] = [];
      // Right cap: top → bottom
      for (let i = 0; i <= N; i++) {
        const angle = -Math.PI / 2 + (i / N) * Math.PI;
        vertices.push({ x: (totalW - r) + r * Math.cos(angle), y: r + r * Math.sin(angle) });
      }
      // Left cap: bottom → top
      for (let i = 0; i <= N; i++) {
        const angle = Math.PI / 2 + (i / N) * Math.PI;
        vertices.push({ x: r + r * Math.cos(angle), y: r + r * Math.sin(angle) });
      }
      return vertices.map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== RECTANGLE =====
    function getRectVertices() {
      return [
        { x: 0,   y: 0   },
        { x: 200, y: 0   },
        { x: 200, y: 90 },
        { x: 0,   y: 90 }
      ].map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== DIAMOND =====
    function getDiamondVertices() {
      const w = 180;
      const h = 130;
      return [
        { x: w / 2, y: 0     },
        { x: w,     y: h / 2 },
        { x: w / 2, y: h     },
        { x: 0,     y: h / 2 }
      ].map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== PARALLELOGRAM =====
    function getParallelogramVertices() {
      const w = 200;
      const h = 100;
      const lean = 60;
      return [
        { x: lean,     y: 0 },
        { x: lean + w, y: 0 },
        { x: w,        y: h },
        { x: 0,        y: h }
      ].map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== RIGHT ARROW =====
    function getArrowRightVertices() {
      const shaftLen = 160;
      const shaftH   = 70;
      const headW    = 90;
      const headH    = 140;
      const shaftY1  = (headH - shaftH) / 2;
      const shaftY2  = (headH + shaftH) / 2;
      return [
        { x: 0,              y: shaftY1 },
        { x: shaftLen,       y: shaftY1 },
        { x: shaftLen,       y: 0       },
        { x: shaftLen + headW, y: headH / 2 },
        { x: shaftLen,       y: headH   },
        { x: shaftLen,       y: shaftY2 },
        { x: 0,              y: shaftY2 }
      ].map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== SLASH '/' =====
    function getSlashVertices() {
      const strokeW = 65;
      const h = 310;
      const lean = 90;
      return [
        { x: 0,            y: h },
        { x: strokeW,      y: h },
        { x: strokeW + lean, y: 0 },
        { x: lean,         y: 0 }
      ].map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== LEFT BRACKET '[' =====
    function getBracketOpenVertices() {
      const barH = 22;
      const stemW = 42;
      const w = 90;
      const h = 300;
      return [
        { x: 0,    y: 0 },
        { x: w,    y: 0 },
        { x: w,    y: barH },
        { x: stemW, y: barH },
        { x: stemW, y: h - barH },
        { x: w,    y: h - barH },
        { x: w,    y: h },
        { x: 0,    y: h }
      ].map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== RIGHT BRACKET ']' =====
    function getBracketCloseVertices() {
      const barH = 22;
      const stemW = 52;
      const w = 100;
      const h = 280;
      return [
        { x: w,        y: 0 },
        { x: 0,        y: 0 },
        { x: 0,        y: barH },
        { x: w - stemW, y: barH },
        { x: w - stemW, y: h - barH },
        { x: 0,        y: h - barH },
        { x: 0,        y: h },
        { x: w,        y: h }
      ].map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== LEFT PAREN '(' =====
    function getParenOpenVertices() {
      const vertices: { x: number; y: number }[] = [];
      const outerXR = 72;   // shallow horizontal depth (+15% curl)
      const outerYR = 153;    // tall vertical reach
      const innerXR = 22;  // thin tip (+15% curl)
      const innerYR = 153;    // inner height — 40px end-caps
      const N = 30;
      // Outer arc: top → leftmost → bottom (left half of ellipse)
      for (let i = 0; i <= N; i++) {
        const angle = Math.PI / 2 + (i / N) * Math.PI;
        vertices.push({ x: outerXR * Math.cos(angle), y: outerYR * Math.sin(angle) });
      }
      // Inner arc: bottom → leftmost → top (reversed)
      for (let i = N; i >= 0; i--) {
        const angle = Math.PI / 2 + (i / N) * Math.PI;
        vertices.push({ x: innerXR * Math.cos(angle), y: innerYR * Math.sin(angle) });
      }
      return vertices.map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // ===== RIGHT PAREN ')' — elliptical, tall and shallow =====
    function getParenCloseVertices() {
      const vertices: { x: number; y: number }[] = [];
      const outerXR = 72;  // +15% curl
      const outerYR = 153;
      const innerXR = 22; // +15% curl
      const innerYR = 153;
      const N = 30;
      // Outer arc: top → rightmost → bottom (right half of ellipse)
      for (let i = 0; i <= N; i++) {
        const angle = Math.PI / 2 - (i / N) * Math.PI;
        vertices.push({ x: outerXR * Math.cos(angle), y: outerYR * Math.sin(angle) });
      }
      // Inner arc: bottom → rightmost → top (reversed)
      for (let i = N; i >= 0; i--) {
        const angle = Math.PI / 2 - (i / N) * Math.PI;
        vertices.push({ x: innerXR * Math.cos(angle), y: innerYR * Math.sin(angle) });
      }
      return vertices.map(v => ({ x: v.x * 1.15, y: v.y * 1.15 }));
    }

    // Create shapes based on mode
    const letterShapes = ['letterC', 'letterH', 'letterR', 'letterI', 'letterS', 'letterE', 'letterU', 'letterK', 'letterA'];
    const projectBodies: Matter.Body[] = [];
    bodiesRef.current = [];

    // List of canonical consciousness questions we can drop if no projects are provided
    const consciousnessQuestions = [
      "Is consciousness fundamentally physical?",
      "Can consciousness exist without a brain?",
      "What is the relationship between awareness and self?",
      "Is consciousness continuous or discrete?",
      "How does subjective experience arise?",
      "Does consciousness imply free will?",
      "Can machines ever be conscious?",
      "Is there a difference between human and animal consciousness?",
      "Does the universe itself have consciousness?",
      "Can consciousness be measured objectively?"
    ];

    // Use provided projects or default to those ten questions encoded as "project" items
    const itemsToRender = projects.length > 0 ? projects : consciousnessQuestions.map(q => ({
      title: q,
      type: 'question' as const
    }));

    itemsToRender.forEach((project, index) => {
         if (!project) return; // Extra safety check

      let shapeType: string;
            const isImageType = project.type === 'image' && project.imageSrc;

      // In initial mode, assign specific letters to specific titles
      if (mode === 'initial') {
        switch (project.title) {
          case 'heuristic':
            shapeType = 'letterH';
            break;
          case 'evangelism':
            shapeType = 'letterE';
            break;
          case 'ux writing':
            shapeType = 'letterU';
            break;
          case 'revops content':
            shapeType = 'letterR';
            break;
          case 'evergreen':
            shapeType = 'letterE';
            break;
          case 'keystone content':
            shapeType = 'letterK';
            break;
          case 'authority content':
            shapeType = 'letterA';
            break;
          case 'personal projects':
            shapeType = 'letterI';
            break;
          // legacy
          case 'copywriting': shapeType = 'letterC'; break;
          case 'humanized ai': shapeType = 'letterH'; break;
          case 'resume scan tool': shapeType = 'letterR'; break;
          case 'interactive/ux': shapeType = 'letterI'; break;
          case 'simplified technical content': shapeType = 'letterS'; break;
          default:
            shapeType = letterShapes[index % letterShapes.length];
        }
     } else {
  // Check manual shape first
  if ((project as any).shape) {
    shapeType = (project as any).shape;  // Use manual shape
    console.log(`🎨 Manual: "${project.title}" → ${shapeType}`);
  } else if (project.title.length > 40) {
    shapeType = 'letterH';  // Auto H for long titles
  } else if (index < letterShapes.length) {
    shapeType = letterShapes[index];  // Sequential
  } else {
    shapeType = letterShapes[Math.floor(Math.random() * letterShapes.length)];  // Random
  }
}
      
      // Fixed lane order: H E U R E K A !
      // Each title gets a dedicated lane (0–7) so shapes always fall in left→right order.
      const laneMap: Record<string, number> = {
        'heuristic':         0,
        'evangelism':        1,
        'ux writing':        2,
        'revops content':    3,
        'evergreen':         4,
        'keystone content':  5,
        'authority content': 6,
        'personal projects': 7,
      };
      const totalLanes = mode === 'initial' ? 8 : itemsToRender.length;
      const laneIndex = laneMap[project.title] ?? index;
      const spacing = window.innerWidth / (totalLanes + 1);
      const xOffsets: Record<string, number> = { 'keystone content': 10 };

      const x = spacing * (laneIndex + 1) + (xOffsets[project.title] ?? 0);
      const isTree = (project as any).shape === 'tree';
      const yStagger = isTree ? 600 : 350;
      const y = mode === 'links' ? -200 - (index * yStagger) : -200;

      
      let body: Matter.Body;

      // Check if this is an image - make the shape invisible

      
      // Color scheme: Initial mode = beige shapes, Links mode = brown shapes
      let fillColor: string;
      let strokeColor: string;
      
      if (isImageType) {
        fillColor = 'rgba(0,0,0,0)';  // Transparent for images
        strokeColor = 'rgba(0,0,0,0)';
      } else if (mode === 'initial') {
        fillColor = '#dcd3c3';  // Beige shapes in initial mode
        strokeColor = '#dcd3c3';
        console.log('Initial mode - creating shape with beige:', fillColor);
      } else {
        fillColor = '#312113';  // Brown shapes in links mode
        strokeColor = '#312113';
        console.log('Links mode - creating shape with brown:', fillColor);
      }

      switch (shapeType) {
        case 'letterC':
          body = Bodies.fromVertices(x, y, [getCVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1,
            friction: 1,
            slop: .02
          }, true);
          break;
        case 'letterH':
          body = Bodies.fromVertices(x, y, [getHVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1,
            friction: 50,
            slop: .02
          }, true);
          break;
        case 'letterR':
          body = Bodies.fromVertices(x, y, [getRVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1,
            friction: 50,
            slop: .02
          }, true);
          break;
        case 'letterI':
          body = Bodies.fromVertices(x, y, [getIVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1,
            friction: 50,
            slop: .02
          }, true);
          break;
        case 'letterE':
          body = Bodies.fromVertices(x, y, [getEVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1,
            friction: 1,
            slop: .02
          }, true);
          break;
        case 'letterU':
          body = Bodies.fromVertices(x, y, [getUVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1,
            friction: 1,
            slop: .02
          }, true);
          break;
        case 'letterK':
          body = Bodies.fromVertices(x, y, [getKVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1,
            friction: 1,
            slop: .02
          }, true);
          break;
        case 'letterA':
          body = Bodies.fromVertices(x, y, [getAVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1,
            friction: 1,
            slop: .02
          }, true);
          break;
        case 'keystone':
          body = Bodies.fromVertices(x, y, [getKeystoneVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'tree':
          body = Bodies.fromVertices(x, y, [getTreeVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          if (body) Matter.Body.setCentre(body, { x: 0, y: -80 }, true);
          break;
        case 'pill':
          body = Bodies.fromVertices(x, y, [getPillVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'rect':
          body = Bodies.fromVertices(x, y, [getRectVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'diamond':
          body = Bodies.fromVertices(x, y, [getDiamondVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'parallelogram':
          body = Bodies.fromVertices(x, y, [getParallelogramVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'arrowRight':
          body = Bodies.fromVertices(x, y, [getArrowRightVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'slash':
          body = Bodies.fromVertices(x, y, [getSlashVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'bracketOpen':
          body = Bodies.fromVertices(x, y, [getBracketOpenVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'bracketClose':
          body = Bodies.fromVertices(x, y, [getBracketCloseVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'parenOpen':
          body = Bodies.fromVertices(x, y, [getParenOpenVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          Body.setAngle(body, Math.PI / 6);
          break;
        case 'parenClose':
          body = Bodies.fromVertices(x, y, [getParenCloseVertices()], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'dollarSign': {
          const ds = 2 / 3;
          // Single solid rectangle approximating the dollar sign bounding box.
          // Visual is drawn entirely in afterRender, so the physics body only needs
          // to be a reliable collision primitive — compound bodies cause overlap issues.
          const dsW = 66 * 1.15 * ds;           // ≈ 50.8  (bar width only — narrow base so it tips)
          const dsH = 416 * 1.15 * 1.15 * 0.8 * ds; // ≈ 294  (full stem height)
          body = Bodies.rectangle(x, y, dsW, dsH, {
            render: { fillStyle: 'rgba(0,0,0,0)', strokeStyle: 'rgba(0,0,0,0)', lineWidth: 0 },
            restitution: 0.1, friction: 1, density: 0.002, slop: 0.02
          });
          Body.setCentre(body, { x: -dsW * 0.2, y: -dsH * 0.3 }, true);
          Body.setAngle(body, -Math.PI / 18);
          break;
        }
        case 'letterS':
        default:
          body = Body.create({
            parts: [
              Bodies.fromVertices(x, y - 60, [getTopCVertices()], {
                render: { fillStyle: fillColor }
              }),
              Bodies.fromVertices(x, y + 60, [getBottomCVertices()], {
                render: { fillStyle: fillColor }
              })
            ]
          });
          break;
      }

      projectBodies.push(body);
      bodiesRef.current.push({ 
        body, 
        project: project,
        shapeType: shapeType  // Store shape type for rotation logic
      });
    });

    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, 60, {
      isStatic: true,
      render: { fillStyle: '#180f07' }
    });

    const leftWall = Bodies.rectangle(-30, window.innerHeight / 2, 30, window.innerHeight * 2, {
      isStatic: true,
      render: { fillStyle: '#1e1208' }
    });

    const rightWall = Bodies.rectangle(window.innerWidth + 30, window.innerHeight / 2, 30, window.innerHeight * 2, {
      isStatic: true,
      render: { fillStyle: '#1a0e04' }
    });

    Composite.add(world, [...projectBodies, ground, leftWall, rightWall]);

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Manual animation loop
    const delta = 1000 / 160;
    engine.timing.timeScale = 0.5;

    let animationFrameId: number;
    const animate = () => {
      Engine.update(engine, delta);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Draw text labels and images on shapes
    // Preload images
    const imageCache = new Map<string, HTMLImageElement>();
    
    bodiesRef.current.forEach(({ project }) => {
      if ((project as any).imageSrc) {
        const img = new Image();
        img.src = (project as any).imageSrc;
        imageCache.set((project as any).imageSrc, img);
      }
    });
    
    Events.on(render, 'afterRender', () => {
      const context = render.context;
      
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      bodiesRef.current.forEach(({ body, project, shapeType }) => {
        const campaignTitle = (project as any).campaignTitle ?? '';
        const isSmallCampaign = campaignTitle === 'DroneDeploy | Safety AI' || campaignTitle === 'Sentry Dogfooding Chronicles' || campaignTitle === 'HP Presence | thought leadership';
        const fontSize = mode === 'links' ? (isSmallCampaign ? '12px' : '16px') : '20px';
        context.font = `${fontSize} "kcgangster", Arial`;
        const { position, angle } = body;
        
        // Check if this is an image shape
        const isImageShape = (project as any).type === 'image' && (project as any).imageSrc;
        
        if (isImageShape) {
          // Render image WITH physics (shape is invisible)
          const imageSrc = (project as any).imageSrc;
          const img = imageCache.get(imageSrc);
          
          if (img && img.complete) {
            context.save();
            context.translate(position.x, position.y);
            context.rotate(angle);
            
            // Apply additional 90-degree rotation for vertical orientation
            if (mode === 'links') {
              context.rotate(-Math.PI / 2);
            }
            
            const imgWidth = 170;
            const imgHeight = 170;
            context.drawImage(img, -imgWidth/2, -imgHeight/2, imgWidth, imgHeight);
            
            context.restore();
          }
        } else {
          context.save();
          context.translate(position.x, position.y);
          context.rotate(angle);

          // Rotation needed for semicircle overlay positioning
          if (shapeType === 'letterH' || shapeType === 'letterR' || shapeType === 'letterK' || shapeType === 'letterA') {
            context.rotate(-Math.PI / 2);
          }

          // Donut hole for letterE: semicircle punched through the ring material at
          // the leftmost (fattest) point. After vertical flip of the 'e' shape:
          //   • Centroid ≈ letter-local (85.8, 114) (mirror of original 82 around cy=98)
          //   • Ring midpoint at letter-local (24, 98) → centroid-relative (-61.8, -16)
          //   • After rotate(-π/2): drawing coords (16, -62)
          //   • Dome faces left (−x in drawing space), flat edge vertical on right
          if (shapeType === 'letterE') {
            const hcx = 10;
            const hcy = -40;
            const hr  = 18;
            context.save();
            context.globalCompositeOperation = 'destination-out';
            context.fillStyle = 'rgba(0,0,0,1)';
            context.beginPath();
            context.moveTo(hcx - hr, hcy);
            context.arc(hcx, hcy, hr, Math.PI, 0, false); // dome up
            context.closePath();
            context.fill();
            context.restore();
          }

          if (shapeType === 'letterA') {
            const hcx = 0;
            const hcy = 0;
            const hr  = 20.7;
            context.save();
            context.globalCompositeOperation = 'destination-out';
            context.fillStyle = 'rgba(0,0,0,1)';
            context.beginPath();
            context.moveTo(hcx - hr, hcy);
            context.arc(hcx, hcy, hr, Math.PI, 0, false); // dome up
            context.closePath();
            context.fill();
            context.restore();
          }

          // Dollar sign: draw manually (parts are transparent) then punch counter holes
          if (shapeType === 'dollarSign') {
            const isHov = hoveredBodyRef.current === body;
            const shapeFill = mode === 'initial'
              ? (isHov ? 'rgb(18, 11, 5)' : '#dcd3c3')
              : (isHov ? '#dcd3c3' : '#312113');
            const ds = 2 / 3;
            const bW  = 66  * 1.15 * ds / 2; // ≈ 25.4   bar half-width
            const bH  = 416 * 1.15 * 1.15 * 0.8 * ds / 2; // ≈ 146.7  bar half-height (-20%)
            const arcShift = bH * 0.3;       // 15% of full stem height downward
            const tcy = -(65 * ds) - (416 * 1.15 * ds * 0.1) + arcShift;  // top C shifted down 15%
            const bcy =  (65 * ds) + arcShift;                              // bottom C shifted down 15%
            const toR = 120 * 1.15 * ds;     // ≈ 92     top C outer radius
            const tiR = 66  * 1.15 * ds;     // ≈ 50.6   top C inner radius
            const boR = 108 * 1.15 * ds;     // ≈ 82.8   bottom C outer radius
            const biR = 60  * 1.15 * ds;     // ≈ 46     bottom C inner radius

            const stemBottom = bcy + boR + 20; // 20px below bottom arc

            context.fillStyle = shapeFill;

            // Bar with bottom edge angled 25° left (bottom-left lower, bottom-right higher)
            const bottomAngle = Math.tan(25 * Math.PI / 180) * (bW * 2);
            context.beginPath();
            context.moveTo(-bW, -bH);
            context.lineTo(bW, -bH);
            context.lineTo(bW, stemBottom - bottomAngle / 2);
            context.lineTo(-bW, stemBottom + bottomAngle / 2);
            context.closePath();
            context.fill();

            // Top C — stroked thick arc, butt caps = clean flat ends, no aperture protrusions
            context.save();
            context.strokeStyle = shapeFill;
            context.lineWidth = toR - tiR;
            context.lineCap = 'butt';
            context.beginPath();
            context.arc(0, tcy, (toR + tiR) / 2, 0.55 * Math.PI, 1.65 * Math.PI, false);
            context.stroke();
            context.restore();

            // Bottom C
            context.save();
            context.strokeStyle = shapeFill;
            context.lineWidth = boR - biR;
            context.lineCap = 'butt';
            context.beginPath();
            context.arc(0, bcy, (boR + biR) / 2, 1.45 * Math.PI, 2.95 * Math.PI, false);
            context.stroke();
            context.restore();

          }

          // Draw title label on shape
          const isHovered = hoveredBodyRef.current === body;
          const textColor = mode === 'initial'
            ? (isHovered ? '#dcd3c3' : '#312113')
            : (isHovered ? '#312113' : '#dcd3c3');
          context.fillStyle = textColor;
          const textYOffset = shapeType === 'letterA' ? 30 : shapeType === 'letterE' ? -15 : shapeType === 'letterR' ? -25 : 0;
          const rotateShapes = ['letterI', 'tree', 'slash', 'bracketOpen', 'bracketClose', 'parenOpen', 'parenClose', 'dollarSign'];
          if (shapeType && rotateShapes.includes(shapeType)) {
            context.save();
            if (shapeType === 'dollarSign') {
              context.font = `20px "kcgangster", Arial`;
            }
            const angle = shapeType === 'tree' ? -Math.PI / 2
              : shapeType === 'slash' ? Math.atan2(-280, 90)
              : ['bracketOpen', 'parenOpen'].includes(shapeType) ? -Math.PI / 2
              : shapeType === 'parenClose' ? Math.PI / 2
              : shapeType === 'bracketClose' ? -Math.PI / 2
              : Math.PI / 2;
            context.rotate(angle);
            const textX = shapeType === 'tree' ? -110 : 0;
            context.fillText(project.title, textX, 0);
            context.restore();
          } else {
            context.fillText(project.title, 0, textYOffset);
          }

          context.restore();
        }
      });
    });

    // Mouse Control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: false } }
    });
    Composite.add(world, mouseConstraint);

    // Store original colors for all bodies and their parts
    const originalColors = new Map();
    bodiesRef.current.forEach(({ body, project }) => {
      // For images, store transparent as original color
      const isImageType = (project as any).type === 'image';
      
      // Original colors depend on mode:
      // Initial mode: beige shapes, Links mode: brown shapes
      let originalFill: string;
      let originalStroke: string;
      
      if (isImageType) {
        originalFill = 'rgba(0,0,0,0)';
        originalStroke = 'rgba(0,0,0,0)';
      } else if (mode === 'initial') {
        originalFill = '#dcd3c3';  // Beige in initial mode
        originalStroke = '#dcd3c3';
      } else {
        originalFill = '#2a1a0b';  // Brown in links mode
        originalStroke = '#27180c';
      }
      
      // Store color for main body
      originalColors.set(body.id, {
        fill: originalFill,
        stroke: originalStroke
      });
      
      // Store colors for compound body parts (like S letter)
      if (body.parts && body.parts.length > 1) {
        body.parts.forEach(part => {
          if (part.id !== body.id) {  // Don't duplicate the main body
            originalColors.set(part.id, {
              fill: originalFill,
              stroke: originalStroke
            });
          }
        });
      }
    });

    // Hover detection
    Events.on(mouseConstraint, 'mousemove', (event) => {
      const mousePosition = event.mouse.position;
   let foundHover: Matter.Body | null = null;  // ✅ Explicitly typed

      
      bodiesRef.current.forEach(({ body }) => {
        if (Matter.Bounds.contains(body.bounds, mousePosition)) {
          const vertices = body.vertices;
          if (Matter.Vertices.contains(vertices, mousePosition)) {
            foundHover = body;
          }
        }
      });
      
      // Update colors based on hover
      if (foundHover !== hoveredBodyRef.current) {
        // Reset previous hover
        if (hoveredBodyRef.current) {
          const original = originalColors.get(hoveredBodyRef.current.id);
          if (original) {  // Safety check
            const prevMapping = bodiesRef.current.find(m => m.body === hoveredBodyRef.current);
            if (prevMapping?.shapeType !== 'dollarSign') {
              hoveredBodyRef.current.render.fillStyle = original.fill;
              hoveredBodyRef.current.render.strokeStyle = original.stroke;
              if (hoveredBodyRef.current.parts && hoveredBodyRef.current.parts.length > 1) {
                hoveredBodyRef.current.parts.forEach(part => {
                  part.render.fillStyle = original.fill;
                });
              }
            }
          }
        }
        

if (foundHover) {
  // Capture foundHover to avoid TypeScript narrowing issues
const currentHover: Matter.Body = foundHover;  // ← Explicit type annotation
  const bodyMapping = bodiesRef.current.find(m => m.body === foundHover!);

  // Check if this is an image shape - don't change color if it is
  const isImage = bodyMapping && (bodyMapping.project as any).type === 'image';
  
  if (!isImage && bodyMapping?.shapeType !== 'dollarSign') {
    // Hover color depends on mode:
    // Initial mode: brown hover (dark on light)
    // Links mode: beige hover (light on dark)
    const hoverColor = mode === 'initial' ? 'rgb(18, 11, 5)' : '#dcd3c3';

    currentHover.render.fillStyle = hoverColor;
    currentHover.render.strokeStyle = hoverColor;

    if (currentHover.parts && currentHover.parts.length > 1) {
      currentHover.parts.forEach(part => {
        part.render.fillStyle = hoverColor;
      });
    }
  }
  // For images, do nothing - shape stays transparent
}


hoveredBodyRef.current = foundHover;

        // Notify parent of hover change
        const hoveredMapping = foundHover
          ? bodiesRef.current.find(m => m.body === foundHover!)
          : null;
        onShapeHover?.(hoveredMapping?.project ?? null);
      }
      });
    // Click handler with popup
    Events.on(mouseConstraint, 'mousedown', (event) => {
      const mousePosition = event.mouse.position;
      
      for (const bodyMapping of bodiesRef.current) {
        if (Matter.Bounds.contains(bodyMapping.body.bounds, mousePosition)) {
          const vertices = bodyMapping.body.vertices;
          if (Matter.Vertices.contains(vertices, mousePosition)) {
            // Only show alert if not in links mode
           
            // Call the callback
            if (onShapeClick) {
              onShapeClick(bodyMapping.project);
            }
            break;
          }
        }
      }
    });

    // Cursor styles
    render.canvas.style.cursor = 'grab';
    Events.on(mouseConstraint, 'startdrag', () => {
      render.canvas.style.cursor = 'grabbing';
    });
    Events.on(mouseConstraint, 'enddrag', () => {
      render.canvas.style.cursor = 'grab';
    });

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(world, false);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, 
  [projects, filterCategory, onShapeClick]);

  const containerEl = typeof window !== 'undefined' ? document.getElementById(containerId) : null;
  const content = <div ref={sceneRef} style={{ width: '100%', height: '100%' }} />;
  if (containerEl) {
    // render inside specified container using portal
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return ReactDOM.createPortal(content, containerEl);
  }
  return content;
};

export default TumblingShapes;