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
  shape?: 'letterH' | 'letterC' | 'letterR' | 'letterI' | 'letterS' | 'letterE' | 'letterU' | 'letterK' | 'letterA' | 'letterD' | 'dollarSign' | 'slash' | 'bracketOpen' | 'bracketClose' | 'parenOpen' | 'parenClose' | 'pill' | 'rect' | 'diamond' | 'parallelogram' | 'arrowRight' | 'tree' | 'keystone' | 'chatBubble' | 'videoCamera' | 'telephone' | 'drone' | 'dogBowl' | 'curlyOpen' | 'curlyClose' | 'speaker' | 'microphone' | 'videoConference';
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
    const deviceScale = window.innerWidth >= 1440 ? 1.25 : 1.0;
    const scaleVerts = (verts: { x: number; y: number }[]) => verts.map(v => ({ x: v.x * deviceScale, y: v.y * deviceScale }));
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
      const stemWidth = 58;
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
      const height    = 219; // total height
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

    // ===== LOWERCASE 'd' =====
    function getDVertices() {
      // Same bowl as 'a' but stem extends UP as ascender instead of arching back.
      const cx = 90;
      const cy = 155;   // lower than 'a' to leave room for ascender above
      const R  = 88;
      const N  = 24;

      const openFrac  = 0.50;
      const openAngle = Math.acos(openFrac);
      const juncX     = Math.round(cx + R * openFrac);
      const juncYTop  = Math.round(cy - R * Math.sin(openAngle));
      const juncYBot  = Math.round(cy + R * Math.sin(openAngle));

      const stemR   = 180;
      const stemTop = -75;  // ascender

      const verts: { x: number; y: number }[] = [];

      // Right edge: ascender top → bowl bottom junction
      verts.push({ x: stemR, y: stemTop });
      verts.push({ x: stemR, y: juncYBot });

      // Bowl arc: lower junction CW around left to upper junction (identical to 'a')
      for (let i = 0; i <= N; i++) {
        const angle = openAngle + (i / N) * (2 * Math.PI - 2 * openAngle);
        verts.push({ x: Math.round(cx + R * Math.cos(angle)), y: Math.round(cy + R * Math.sin(angle)) });
      }

      // Left edge: bowl top junction straight up to ascender top-left
      verts.push({ x: juncX, y: stemTop });

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
      const strokeW = 45;
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
      const w = 70;
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
    const letterShapes = ['letterC', 'letterH', 'letterR', 'letterI', 'letterS', 'letterE', 'letterU', 'letterK', 'letterA', 'letterD'];
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
          case 'copywriting': shapeType = 'letterC'; break;
          case 'heureka creative process': shapeType = 'letterH'; break;
          case 'relatable developer content': shapeType = 'letterR'; break;
          case 'interactive content': shapeType = 'letterI'; break;
          case 'simple, direct, technical': shapeType = 'letterS'; break;
          // legacy
          case 'heuristic':        shapeType = 'letterH'; break;
          case 'evangelism':       shapeType = 'letterE'; break;
          case 'ux writing':       shapeType = 'letterU'; break;
          case 'revops content':   shapeType = 'letterR'; break;
          case 'evergreen':        shapeType = 'letterE'; break;
          case 'keystone content': shapeType = 'letterK'; break;
          case 'authority content':shapeType = 'letterA'; break;
          case 'personal projects':shapeType = 'letterI'; break;
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
      
      // Fixed lane order: C H R I S
      const laneMap: Record<string, number> = {
        'copywriting': 0,
        'heureka creative process': 1,
        'relatable developer content': 2,
        'interactive content': 3,
        'simple, direct, technical': 4,
        // legacy
        'heuristic':         0,
        'evangelism':        1,
        'ux writing':        2,
        'revops content':    3,
        'evergreen':         4,
        'keystone content':  5,
        'authority content': 6,
        'personal projects': 7,
      };
      const totalLanes = mode === 'initial' ? 5 : itemsToRender.length;
      const laneIndex = laneMap[project.title] ?? index;
      const spacing = window.innerWidth / (totalLanes + 1);
      const xOffsets: Record<string, number> = { 'keystone content': 10, 'awareness | use case': -40, 'consideration | blog post': 40, 'decision | product page': 40, 'Using Sentry Performance to get Sentry Performant': 35 };

      const x = spacing * (laneIndex + 1) + (xOffsets[project.title] ?? 0);
      const isTree = (project as any).shape === 'tree';
      const isDrone = shapeType === 'drone';
      const yStagger = isTree ? 600 : isDrone ? 500 : 800;
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
          body = Bodies.fromVertices(x, y, [scaleVerts(getCVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1,
            friction: 1,
            slop: .02
          }, true);
          break;
        case 'letterH':
          body = Bodies.fromVertices(x, y, [scaleVerts(getHVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1,
            friction: 50,
            slop: .02
          }, true);
          break;
        case 'letterR':
          body = Bodies.fromVertices(x, y, [scaleVerts(getRVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1,
            friction: 50,
            slop: .02
          }, true);
          break;
        case 'letterI': {
          const iStemW = 66 * deviceScale;
          const iStemH = 250 * deviceScale;
          const iGap = 28 * deviceScale;
          const iDotR = 44 * deviceScale;
          const iStemPart = Bodies.rectangle(x, y, iStemW, iStemH, {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 }
          });
          const iDotPart = Bodies.circle(x, y + iStemH / 2 + iGap + iDotR, iDotR, {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 }
          });
          body = Body.create({
            parts: [iStemPart, iDotPart],
            restitution: 0.1,
            friction: 50,
            slop: 0.02
          });
          Body.setAngle(body, Math.PI);
          break;
        }
        case 'letterE':
          body = Bodies.fromVertices(x, y, [scaleVerts(getEVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1,
            friction: 1,
            slop: .02
          }, true);
          break;
        case 'letterU':
          body = Bodies.fromVertices(x, y, [scaleVerts(getUVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1,
            friction: 1,
            slop: .02
          }, true);
          break;
        case 'letterK':
          body = Bodies.fromVertices(x, y, [scaleVerts(getKVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1,
            friction: 1,
            slop: .02
          }, true);
          break;
        case 'letterA':
          body = Bodies.fromVertices(x, y, [scaleVerts(getAVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1,
            friction: 1,
            slop: .02
          }, true);
          break;
        case 'letterD':
          body = Bodies.fromVertices(x, y, [scaleVerts(getDVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1,
            friction: 1,
            slop: .02
          }, true);
          break;
        case 'keystone':
          body = Bodies.fromVertices(x, y, [scaleVerts(getKeystoneVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'tree':
          body = Bodies.fromVertices(x, y, [scaleVerts(getTreeVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          if (body) Matter.Body.setCentre(body, { x: 0, y: -80 * deviceScale }, true);
          break;
        case 'pill':
          body = Bodies.fromVertices(x, y, [scaleVerts(getPillVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'rect':
          body = Bodies.fromVertices(x, y, [scaleVerts(getRectVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'diamond':
          body = Bodies.fromVertices(x, y, [scaleVerts(getDiamondVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'parallelogram':
          body = Bodies.fromVertices(x, y, [scaleVerts(getParallelogramVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'arrowRight':
          body = Bodies.fromVertices(x, y, [scaleVerts(getArrowRightVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'slash':
          body = Bodies.fromVertices(x, y, [scaleVerts(getSlashVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'bracketOpen':
          body = Bodies.fromVertices(x, y, [scaleVerts(getBracketOpenVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          break;
        case 'bracketClose':
          body = Bodies.fromVertices(x, y, [scaleVerts(getBracketCloseVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          Body.setAngle(body, Math.PI / 12);
          break;
        case 'parenOpen':
          body = Bodies.fromVertices(x, y, [scaleVerts(getParenOpenVertices())], {
            render: { fillStyle: fillColor, strokeStyle: strokeColor, lineWidth: 1 },
            restitution: 0.1, friction: 1, slop: .02
          }, true);
          Body.setAngle(body, Math.PI / 6);
          break;
        case 'parenClose':
          body = Bodies.fromVertices(x, y, [scaleVerts(getParenCloseVertices())], {
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
          body = Bodies.rectangle(x, y, dsW * deviceScale, dsH * deviceScale, {
            render: { fillStyle: 'rgba(0,0,0,0)', strokeStyle: 'rgba(0,0,0,0)', lineWidth: 0 },
            restitution: 0.1, friction: 1, density: 0.002, slop: 0.02
          });
          Body.setCentre(body, { x: -dsW * 0.2, y: -dsH * 0.3 }, true);
          Body.setAngle(body, -Math.PI / 18);
          break;
        }
        case 'dogBowl': {
          const isWideBowl = project.title === 'Using Sentry Performance to get Sentry Performant';
          const isDogfoodingBowl = (project as any).campaignTitle === 'Sentry Dogfooding Chronicles';
          const dfScale = isDogfoodingBowl ? 0.85 : 1;
          body = Bodies.rectangle(x, y, (isWideBowl ? 295 * 1.5 : 295) * dfScale * deviceScale, 125 * dfScale * deviceScale, {
            render: { fillStyle: 'rgba(0,0,0,0)', strokeStyle: 'rgba(0,0,0,0)', lineWidth: 0 },
            restitution: 0.1, friction: 1, density: 0.003
          });
          break;
        }
        case 'drone': {
          const isSafetyAiDrone = (project as any).campaignTitle === 'DroneDeploy | Safety AI';
          const isDdPagesDrone = (project as any).campaignTitle === 'DroneDeploy | Product pages';
          const droneW = isSafetyAiDrone ? 265 : isDdPagesDrone ? 280 : 368;
          const droneH = isSafetyAiDrone ? 128 : isDdPagesDrone ? 113 : 160;
          body = Bodies.rectangle(x, y, droneW * deviceScale, droneH * deviceScale, {
            render: { fillStyle: 'rgba(0,0,0,0)', strokeStyle: 'rgba(0,0,0,0)', lineWidth: 0 },
            restitution: 0.15, friction: 0.5, density: 0.001
          });
          break;
        }
        case 'chatBubble': {
          const isHp = (project as any).campaignTitle === 'HP Presence | thought leadership';
          body = Bodies.circle(x, y, (isHp ? 150 : 100) * deviceScale, {
            render: { fillStyle: 'rgba(0,0,0,0)', strokeStyle: 'rgba(0,0,0,0)', lineWidth: 0 },
            restitution: 0.2, friction: 0.9
          });
          break;
        }
        case 'videoCamera': {
          const isHp = (project as any).campaignTitle === 'HP Presence | thought leadership';
          body = Bodies.rectangle(x, y, (isHp ? 345 : 230) * deviceScale, (isHp ? 210 : 140) * deviceScale, {
            render: { fillStyle: 'rgba(0,0,0,0)', strokeStyle: 'rgba(0,0,0,0)', lineWidth: 0 },
            restitution: 0.2, friction: 0.9
          });
          break;
        }
        case 'telephone': {
          const isHp = (project as any).campaignTitle === 'HP Presence | thought leadership';
          body = Bodies.rectangle(x, y, (isHp ? 240 : 160) * deviceScale, (isHp ? 240 : 160) * deviceScale, {
            render: { fillStyle: 'rgba(0,0,0,0)', strokeStyle: 'rgba(0,0,0,0)', lineWidth: 0 },
            restitution: 0.2, friction: 0.9
          });
          break;
        }
        case 'speaker': {
          const isHp = (project as any).campaignTitle === 'HP Presence | thought leadership';
          body = Bodies.rectangle(x, y, (isHp ? 300 : 200) * deviceScale, (isHp ? 195 : 130) * deviceScale, {
            render: { fillStyle: 'rgba(0,0,0,0)', strokeStyle: 'rgba(0,0,0,0)', lineWidth: 0 },
            restitution: 0.2, friction: 0.9
          });
          break;
        }
        case 'videoConference': {
          const isHp = (project as any).campaignTitle === 'HP Presence | thought leadership';
          body = Bodies.rectangle(x, y, (isHp ? 330 : 220) * deviceScale, (isHp ? 320 : 213) * deviceScale, {
            render: { fillStyle: 'rgba(0,0,0,0)', strokeStyle: 'rgba(0,0,0,0)', lineWidth: 0 },
            restitution: 0.2, friction: 0.9
          });
          break;
        }
        case 'microphone': {
          body = Bodies.rectangle(x, y, 140 * deviceScale, 195 * deviceScale, {
            render: { fillStyle: 'rgba(0,0,0,0)', strokeStyle: 'rgba(0,0,0,0)', lineWidth: 0 },
            restitution: 0.2, friction: 0.9
          });
          Body.setAngle(body, 75 * Math.PI / 180);
          break;
        }
        case 'curlyOpen': {
          body = Bodies.rectangle(x, y, 110 * deviceScale, 340 * deviceScale, {
            render: { fillStyle: 'rgba(0,0,0,0)', strokeStyle: 'rgba(0,0,0,0)', lineWidth: 0 },
            restitution: 0.15, friction: 0.9
          });
          Body.setAngle(body, -Math.PI / 9);
          break;
        }
        case 'curlyClose': {
          body = Bodies.rectangle(x, y, 110 * deviceScale, 340 * deviceScale, {
            render: { fillStyle: 'rgba(0,0,0,0)', strokeStyle: 'rgba(0,0,0,0)', lineWidth: 0 },
            restitution: 0.15, friction: 0.9
          });
          Body.setAngle(body, -Math.PI / 36);
          break;
        }
        case 'letterS':
        default:
          body = Body.create({
            parts: [
              Bodies.fromVertices(x, y - 60 * deviceScale, [scaleVerts(getTopCVertices())], {
                render: { fillStyle: fillColor }
              }),
              Bodies.fromVertices(x, y + 60 * deviceScale, [scaleVerts(getBottomCVertices())], {
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

    const hasDrones = bodiesRef.current.some(({ shapeType }) => shapeType === 'drone');
    if (hasDrones) engine.gravity.y = 0.16;

    // Drones fall 1.5x faster via continuous extra downward force
    const droneEntries = bodiesRef.current.filter(({ shapeType }) => shapeType === 'drone');
    if (droneEntries.length > 0) {
      const allDroneBodies = droneEntries.map(({ body }) => body);
      Events.on(engine, 'beforeUpdate', () => {
        allDroneBodies.forEach(b => {
          Body.applyForce(b, b.position, { x: 0, y: b.mass * engine.gravity.y * 0.001 * 0.5 });
        });
      });

      // First drone: 2-second head start (pre-position + initial velocity)
      const firstDrone = allDroneBodies[0];
      Body.setPosition(firstDrone, { x: firstDrone.position.x, y: firstDrone.position.y + 300 });
      Body.setVelocity(firstDrone, { x: 0, y: 8 });
    }

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
        const isSmallCampaign = campaignTitle === 'Sentry Dogfooding Chronicles';
        const isSentryDev = campaignTitle === 'Sentry developer content';
        const isSafetyAi = campaignTitle === 'DroneDeploy | Safety AI';
        const isSentryPerformance = campaignTitle === 'Sentry | Performance GTM campaign';
        const isSentryPages = campaignTitle === 'Sentry | Product pages';
        const isHpPresence = campaignTitle === 'HP Presence | thought leadership';
        const isWideBowlTitle = project.title === 'Using Sentry Performance to get Sentry Performant';
        const baseFontSize = mode === 'links' ? (isSentryDev ? 14 : isSafetyAi ? 23 : isSentryPerformance ? 23 : isSentryPages ? 32 : isHpPresence ? 16 : isWideBowlTitle ? 6 : isSmallCampaign ? 10 : 15) : 18;
        const fontSize = `${shapeType === 'drone' ? baseFontSize - 6 : baseFontSize}px`;
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
          if (shapeType === 'letterH' || shapeType === 'letterR' || shapeType === 'letterK' || shapeType === 'letterA' || shapeType === 'letterD') {
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

          if (shapeType === 'letterD') {
            const hcx = -39;
            const hcy = -27;
            const hr  = 19;
            context.save();
            context.globalCompositeOperation = 'destination-out';
            context.fillStyle = 'rgba(0,0,0,1)';
            context.beginPath();
            context.arc(hcx, hcy, hr, 0, 2 * Math.PI);
            context.fill();
            context.restore();
          }

          // Dollar sign: draw manually (parts are transparent) then punch counter holes
          if (shapeType === 'dollarSign') {
            const isHov = hoveredBodyRef.current === body;
            const shapeFill = mode === 'initial'
              ? (isHov ? 'rgb(18, 11, 5)' : '#dcd3c3')
              : (isHov ? '#dcd3c3' : '#312113');
            context.save();
            context.scale(deviceScale, deviceScale);
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

            context.restore();
          }

          // ── Chat bubble ──────────────────────────────────────────
          if (shapeType === 'chatBubble') {
            const isHov = hoveredBodyRef.current === body;
            const shapeFill = mode === 'initial'
              ? (isHov ? 'rgb(18,11,5)' : '#dcd3c3')
              : (isHov ? '#dcd3c3' : '#312113');
            const hpScale = (project as any).campaignTitle === 'HP Presence | thought leadership' ? 1.5 : 1;
            context.save();
            context.scale(deviceScale * hpScale, deviceScale * hpScale);
            const rx = 95, ry = 72, cy2 = -18, sw = 13;
            context.fillStyle = shapeFill;
            // Outer ellipse
            context.beginPath();
            context.ellipse(0, cy2, rx, ry, 0, 0, Math.PI * 2);
            context.fill();
            // Tail
            context.beginPath();
            context.moveTo(-rx * 0.18, cy2 + ry - sw * 0.5);
            context.lineTo(-rx * 0.62, cy2 + ry + 34);
            context.lineTo(rx * 0.06, cy2 + ry - sw * 0.8);
            context.closePath();
            context.fill();
            context.restore();
          }

          // ── Video camera ─────────────────────────────────────────
          if (shapeType === 'videoCamera') {
            const isHov = hoveredBodyRef.current === body;
            const col = mode === 'initial'
              ? (isHov ? 'rgb(18,11,5)' : '#dcd3c3')
              : (isHov ? '#dcd3c3' : '#312113');
            const hpScale = (project as any).campaignTitle === 'HP Presence | thought leadership' ? 1.5 : 1;
            context.save();
            context.scale(deviceScale * hpScale, deviceScale * hpScale);
            context.fillStyle = col;
            context.strokeStyle = col;
            context.lineWidth = 13;
            context.lineJoin = 'round';
            const bx = -110, by = -60, bw = 155, bh = 120, r = 18;
            // Rounded rect body
            context.beginPath();
            context.moveTo(bx + r, by);
            context.lineTo(bx + bw - r, by);
            context.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
            context.lineTo(bx + bw, by + bh - r);
            context.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
            context.lineTo(bx + r, by + bh);
            context.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
            context.lineTo(bx, by + r);
            context.quadraticCurveTo(bx, by, bx + r, by);
            context.closePath();
            context.fill();
            context.stroke();
            // Triangle lens
            const tx = bx + bw + 6;
            context.beginPath();
            context.moveTo(tx, by + 22);
            context.lineTo(tx + 58, by + bh / 2);
            context.lineTo(tx, by + bh - 22);
            context.closePath();
            context.fill();
            context.stroke();
            context.restore();
          }

          // ── Telephone ────────────────────────────────────────────
          if (shapeType === 'telephone') {
            const isHov = hoveredBodyRef.current === body;
            const col = mode === 'initial'
              ? (isHov ? 'rgb(18,11,5)' : '#dcd3c3')
              : (isHov ? '#dcd3c3' : '#312113');
            const hpScale = (project as any).campaignTitle === 'HP Presence | thought leadership' ? 1.5 : 1;
            context.save();
            context.scale(deviceScale * hpScale, deviceScale * hpScale);
            context.fillStyle = col;
            // Body base (trapezoid)
            context.beginPath();
            context.moveTo(-65, 10);
            context.lineTo(65, 10);
            context.lineTo(55, 80);
            context.lineTo(-55, 80);
            context.closePath();
            context.fill();
            // Handset arch
            context.strokeStyle = col;
            context.lineWidth = 18;
            context.lineCap = 'round';
            context.beginPath();
            context.arc(0, 10, 60, Math.PI, 0, false);
            context.stroke();
            // Punch keypad buttons (3×3 grid)
            context.save();
            context.globalCompositeOperation = 'destination-out';
            context.fillStyle = 'rgba(0,0,0,1)';
            const btnW = 11, btnH = 9, gapX = 17, gapY = 13;
            const startX = -btnW / 2 - gapX, startY = 22;
            for (let row = 0; row < 3; row++) {
              for (let col2 = 0; col2 < 3; col2++) {
                context.fillRect(
                  startX + col2 * (btnW + gapX),
                  startY + row * (btnH + gapY),
                  btnW, btnH
                );
              }
            }
            context.restore();
            context.restore();
          }

          // ── Speaker ──────────────────────────────────────────────
          if (shapeType === 'speaker') {
            const isHov = hoveredBodyRef.current === body;
            const col = mode === 'initial'
              ? (isHov ? 'rgb(18,11,5)' : '#dcd3c3')
              : (isHov ? '#dcd3c3' : '#312113');
            const hpScale = (project as any).campaignTitle === 'HP Presence | thought leadership' ? 1.5 : 1;
            context.save();
            context.scale(deviceScale * hpScale, deviceScale * hpScale);
            context.fillStyle = col;
            context.strokeStyle = col;
            context.lineCap = 'round';
            context.lineJoin = 'round';

            // Speaker body + cone
            context.beginPath();
            context.moveTo(-52, -22);
            context.lineTo(-14, -22);
            context.lineTo(36, -52);
            context.lineTo(36, 52);
            context.lineTo(-14, 22);
            context.lineTo(-52, 22);
            context.closePath();
            context.fill();

            // Sound waves
            context.lineWidth = 9;
            context.beginPath();
            context.arc(36, 0, 22, -Math.PI * 0.38, Math.PI * 0.38);
            context.stroke();
            context.beginPath();
            context.arc(36, 0, 38, -Math.PI * 0.38, Math.PI * 0.38);
            context.stroke();
            context.beginPath();
            context.arc(36, 0, 54, -Math.PI * 0.38, Math.PI * 0.38);
            context.stroke();

            context.restore();
          }

          // ── Microphone ───────────────────────────────────────────
          if (shapeType === 'microphone') {
            const isHov = hoveredBodyRef.current === body;
            const col = mode === 'initial'
              ? (isHov ? 'rgb(18,11,5)' : '#dcd3c3')
              : (isHov ? '#dcd3c3' : '#312113');
            context.save();
            context.scale(deviceScale * 0.85, deviceScale * 0.85);
            context.fillStyle = col;
            context.strokeStyle = col;
            context.lineCap = 'round';
            context.lineJoin = 'round';

            // Solid filled capsule
            const capR = 36, capTop = -100, capBottom = -25;
            context.beginPath();
            context.arc(0, capTop + capR, capR, Math.PI, 0, false);
            context.lineTo(capR, capBottom - capR);
            context.arc(0, capBottom - capR, capR, 0, Math.PI, false);
            context.closePath();
            context.fill();

            // U-arch — 270° sweep with upward-angled endpoints, thick rounded stroke
            const archCY = 8, archR = 62;
            context.lineWidth = 16;
            context.beginPath();
            context.arc(0, archCY, archR, -Math.PI / 4, 5 * Math.PI / 4, false);
            context.stroke();

            // Short vertical stem below arch
            context.lineWidth = 16;
            context.beginPath();
            context.moveTo(0, archCY + archR);
            context.lineTo(0, archCY + archR + 36);
            context.stroke();

            context.restore();
          }

          // ── Video conference monitor ─────────────────────────────
          if (shapeType === 'videoConference') {
            const isHov = hoveredBodyRef.current === body;
            const col = mode === 'initial'
              ? (isHov ? 'rgb(18,11,5)' : '#dcd3c3')
              : (isHov ? '#dcd3c3' : '#312113');
            const invCol = mode === 'initial' ? '#312113' : '#dcd3c3';
            const hpScale = (project as any).campaignTitle === 'HP Presence | thought leadership' ? 1.5 : 1;
            context.save();
            context.scale(deviceScale * hpScale, deviceScale * hpScale);
            context.lineCap = 'round';
            context.lineJoin = 'round';

            const mx = -105, my = -75, mw = 210, mh = 143, mr = 14;
            const screenBottom = my + mh - 30;
            const wcx = -16, wcy = -100, wcw = 32, wch = 22, wcr = 5;

            // Helper: draw rounded rect path
            const roundedRect = (rx: number, ry: number, rw: number, rh: number, rr: number) => {
              context.beginPath();
              context.moveTo(rx + rr, ry);
              context.lineTo(rx + rw - rr, ry);
              context.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rr);
              context.lineTo(rx + rw, ry + rh - rr);
              context.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rr, ry + rh);
              context.lineTo(rx + rr, ry + rh);
              context.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rr);
              context.lineTo(rx, ry + rr);
              context.quadraticCurveTo(rx, ry, rx + rr, ry);
              context.closePath();
            };

            // Fill monitor body
            context.fillStyle = col;
            roundedRect(mx, my, mw, mh, mr);
            context.fill();

            // Fill webcam body
            roundedRect(wcx, wcy, wcw, wch, wcr);
            context.fill();

            // Fill webcam connector stem
            context.fillRect(-5, wcy + wch, 10, my - (wcy + wch));

            // Fill stand neck
            context.fillRect(-5, my + mh, 10, 22);

            // Fill stand base
            context.fillRect(-58, my + mh + 16, 116, 12);

            // --- Details in inverted colour ---
            context.strokeStyle = invCol;
            context.fillStyle = invCol;
            context.lineWidth = 8;

            // Webcam lens pill
            context.lineWidth = 5;
            context.beginPath();
            context.moveTo(-7, wcy + wch / 2);
            context.lineTo(7, wcy + wch / 2);
            context.stroke();

            context.lineWidth = 8;

            // Screen bottom bezel divider
            context.beginPath();
            context.moveTo(mx + 6, screenBottom);
            context.lineTo(mx + mw - 6, screenBottom);
            context.stroke();

            // Bottom pill button
            context.lineWidth = 5;
            context.beginPath();
            context.moveTo(-13, screenBottom + 16);
            context.lineTo(13, screenBottom + 16);
            context.stroke();

            context.lineWidth = 8;

            // Vertical screen divider
            context.beginPath();
            context.moveTo(0, my + 6);
            context.lineTo(0, screenBottom - 3);
            context.stroke();

            // Person left — head (filled)
            context.beginPath();
            context.arc(-54, my + 38, 17, 0, Math.PI * 2);
            context.fill();

            // Person left — shoulders (filled arch)
            context.beginPath();
            context.arc(-54, my + 72, 25, Math.PI, 0, true);
            context.stroke();

            // Person right — head
            context.beginPath();
            context.arc(54, my + 38, 17, 0, Math.PI * 2);
            context.fill();

            // Person right — shoulders
            context.beginPath();
            context.arc(54, my + 72, 25, Math.PI, 0, true);
            context.stroke();

            context.restore();
          }

          // ── Drone ────────────────────────────────────────────────
          if (shapeType === 'drone') {
            const isHov = hoveredBodyRef.current === body;
            const col = mode === 'initial'
              ? (isHov ? 'rgb(18,11,5)' : '#dcd3c3')
              : (isHov ? '#dcd3c3' : '#312113');
            context.fillStyle = col;
            context.strokeStyle = col;
            context.lineJoin = 'round';
            context.lineCap = 'round';

            context.save();
            const isSafetyAiDrone = (project as any).campaignTitle === 'DroneDeploy | Safety AI';
            const droneXScale = isSafetyAiDrone ? 2 * deviceScale * 0.67 * 0.9 * 1.15 * 0.8 : 2 * deviceScale * 0.67 * 1.15;
            const droneYScale = isSafetyAiDrone ? 2 * deviceScale * 0.67 * 0.8 : 2 * deviceScale * 0.67;
            context.scale(droneXScale, droneYScale);

            // Central hexagonal body
            context.beginPath();
            context.moveTo(-56, -22); context.lineTo(56, -22);
            context.lineTo(84, 0);    context.lineTo(56, 22);
            context.lineTo(-56, 22);  context.lineTo(-84, 0);
            context.closePath();
            context.fill();

            // Arms (four diagonal struts) — endpoints 10% shorter
            const arms = [[-42, -10, -81, -34], [42, -10, 81, -34], [-42, 10, -81, 34], [42, 10, 81, 34]];
            context.lineWidth = 13;
            arms.forEach(([x1, y1, x2, y2]) => {
              context.beginPath();
              context.moveTo(x1, y1); context.lineTo(x2, y2);
              context.stroke();
            });

            // Rotor mounts (small circles at arm ends)
            [[-81, -34], [81, -34], [-81, 34], [81, 34]].forEach(([mx, my]) => {
              context.beginPath();
              context.arc(mx, my, 8, 0, Math.PI * 2);
              context.fill();
            });

            // Propeller blades
            context.lineWidth = 6;
            const propSpan = (project as any).campaignTitle === 'DroneDeploy | Product pages' ? 10 : 19;
            [[-81, -34], [81, -34], [-81, 34], [81, 34]].forEach(([mx, my]) => {
              context.beginPath();
              context.moveTo(mx - propSpan, my); context.lineTo(mx + propSpan, my);
              context.stroke();
            });

            context.restore();
          }

          // ── Dog bowl ─────────────────────────────────────────────
          if (shapeType === 'dogBowl') {
            const isHov = hoveredBodyRef.current === body;
            const col = mode === 'initial'
              ? (isHov ? 'rgb(18,11,5)' : '#dcd3c3')
              : (isHov ? '#dcd3c3' : '#312113');
            context.fillStyle = col;

            context.save();
            const isSentryDogfoodingBowl = (project as any).campaignTitle === 'Sentry Dogfooding Chronicles';
            const bowlDfScale = isSentryDogfoodingBowl ? 0.85 : 1;
            const bowlXScale = project.title === 'Using Sentry Performance to get Sentry Performant' ? 0.84375 * 1.5 * deviceScale * bowlDfScale : 0.84375 * deviceScale * bowlDfScale;
            context.scale(bowlXScale, 0.5625 * deviceScale * bowlDfScale);

            const rimY = 5, rimW = 149, kibbleR = 9;
            const rows = [
              { cy: rimY -  9, xs: [-82, -50, -17, 17,  50, 82] },
              { cy: rimY - 31, xs: [-67, -34,   0, 34,  67] },
              { cy: rimY - 51, xs: [-52, -19,  15, 48] },
              { cy: rimY - 69, xs: [-36,  -4,  28] },
              { cy: rimY - 84, xs: [-17,  15] },
            ];

            // 1. Kibble circles (solid, no highlights)
            rows.forEach(({ cy, xs }) => xs.forEach(cx => {
              context.beginPath();
              context.arc(cx, cy, kibbleR, 0, Math.PI * 2);
              context.fill();
            }));

            // 2. Bowl body — heavier walls, wider settled base
            context.beginPath();
            context.moveTo(-rimW, rimY);
            context.lineTo(rimW, rimY);
            context.bezierCurveTo(rimW + 12, rimY + 38, rimW + 16, rimY + 78, rimW * 0.96, rimY + 115);
            context.bezierCurveTo(rimW * 0.58, rimY + 133, -rimW * 0.58, rimY + 133, -rimW * 0.96, rimY + 115);
            context.bezierCurveTo(-rimW - 16, rimY + 78, -rimW - 12, rimY + 38, -rimW, rimY);
            context.closePath();
            context.fill();

            // 3. Punch rim + paw print only
            context.save();
            context.globalCompositeOperation = 'destination-out';
            context.fillStyle = 'rgba(0,0,0,1)';

            context.fillRect(-rimW + 2, rimY - 3, (rimW - 2) * 2, 6);

            const pawX = 0, pawY = rimY + 109;
            context.beginPath();
            context.ellipse(pawX, pawY, 8, 6.5, 0, 0, Math.PI * 2);
            context.fill();
            ([[-21, pawY - 20, 4, 3], [-8, pawY - 26, 4, 3],
              [  8, pawY - 26, 4, 3], [21, pawY - 20, 4, 3]] as number[][]).forEach(([tx, ty, rx, ry]) => {
              context.beginPath();
              context.ellipse(tx, ty, rx, ry, 0, 0, Math.PI * 2);
              context.fill();
            });

            context.restore(); // restore destination-out
            context.restore(); // restore scale
          }

          // ── Curly braces { } ──────────────────────────────────────
          if (shapeType === 'curlyOpen' || shapeType === 'curlyClose') {
            const isHov = hoveredBodyRef.current === body;
            const col = mode === 'initial'
              ? (isHov ? 'rgb(18,11,5)' : '#dcd3c3')
              : (isHov ? '#dcd3c3' : '#312113');
            context.strokeStyle = col;
            context.lineWidth = 51;
            context.lineCap = 'round';
            context.lineJoin = 'round';

            context.save();
            context.scale(deviceScale * 0.85, deviceScale * 0.85);
            // Mirror for }
            if (shapeType === 'curlyClose') context.scale(-1, 1);

            // SVG path centered at origin (offset by -106, -243.5 from original coords)
            // CP1 and last CP2 angled at 110° (20° past horizontal) for stem flare
            context.beginPath();
            context.moveTo(62, -198.5);
            context.bezierCurveTo(-2, -175, -6, -173.5, -6, -113.5);
            context.bezierCurveTo(-6, -53.5, -14, -26.5, -62, -3.5);
            context.bezierCurveTo(7, 10.5, -6, 66.5, -6, 126.5);
            context.bezierCurveTo(-6, 186.5, -2, 222, 62, 198.5);
            context.stroke();

            context.restore();
          }

          // Draw title label on shape
          const isHovered = hoveredBodyRef.current === body;
          const textColor = mode === 'initial'
            ? (isHovered ? '#dcd3c3' : '#312113')
            : (isHovered ? '#312113' : '#dcd3c3');
          context.fillStyle = textColor;
          const textYOffset = shapeType === 'letterA' ? 30 : shapeType === 'letterD' ? 30 : shapeType === 'letterE' ? -15 : shapeType === 'letterR' ? -25 : shapeType === 'letterH' ? -25 : shapeType === 'dogBowl' ? 25 : 0;
          const textXOffset = shapeType === 'letterR' ? -15 : 0;
          const rotateShapes = ['letterC', 'letterI', 'letterS', 'tree', 'slash', 'bracketOpen', 'bracketClose', 'parenOpen', 'parenClose', 'dollarSign', 'curlyOpen', 'curlyClose'];
          if (shapeType && rotateShapes.includes(shapeType)) {
            context.save();
            if (shapeType === 'dollarSign') {
              context.font = `18px "kcgangster", Arial`;
            }
            const angle = shapeType === 'letterC' ? Math.PI / 2
              : shapeType === 'letterS' ? -Math.PI / 2
              : shapeType === 'tree' ? -Math.PI / 2
              : shapeType === 'slash' ? Math.atan2(-280, 90)
              : shapeType === 'parenOpen' ? Math.PI / 2
              : shapeType === 'bracketOpen' ? Math.PI / 2
              : shapeType === 'parenClose' ? -Math.PI / 2
              : shapeType === 'bracketClose' ? -Math.PI / 2
              : shapeType === 'curlyOpen' ? Math.PI / 2
              : shapeType === 'curlyClose' ? Math.PI / 2
              : Math.PI / 2;
            context.rotate(angle);
            const textX = shapeType === 'tree' ? -110 : shapeType === 'letterI' ? -50 : shapeType === 'curlyOpen' ? -10 : shapeType === 'curlyClose' ? 25 : 0;
            const textYRotated = shapeType === 'letterI' ? -5 : shapeType === 'curlyOpen' ? 15 : shapeType === 'curlyClose' ? -10 : 0;
            if (project.title === 'The new office for the way people want to work') {
              const lineH = parseFloat(fontSize) * 1.3;
              context.fillText('The new office for', textX, textYRotated - lineH / 2);
              context.fillText('the way people want to work', textX, textYRotated + lineH / 2);
            } else {
              context.fillText(project.title, textX, textYRotated);
            }
            context.restore();
          } else {
            if (shapeType === 'dogBowl') {
              const baseSize = mode === 'links' ? 15 : 18;
              const dfTextScale = (project as any).campaignTitle === 'Sentry Dogfooding Chronicles' ? 0.85 : 1;
              context.font = `${baseSize * 1.25 * dfTextScale}px "kcgangster", Arial`;
            }
            if (shapeType === 'drone') {
              const baseSize = parseFloat(fontSize);
              context.font = `${baseSize * 0.8}px "kcgangster", Arial`;
            }
            if (project.title === 'The new office for the way people want to work') {
              const lineH = parseFloat(fontSize) * 1.3;
              context.fillText('The new office for', textXOffset, textYOffset - lineH / 2);
              context.fillText('the way people want to work', textXOffset, textYOffset + lineH / 2);
            } else if (project.title === 'A new blueprint for an uncertain world') {
              const lineH = parseFloat(fontSize) * 1.3;
              context.fillText('A new blueprint for', textXOffset, textYOffset - lineH / 2);
              context.fillText('an uncertain world', textXOffset, textYOffset + lineH / 2);
            } else {
              context.fillText(project.title, textXOffset, textYOffset);
            }
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
            const customDrawn = ['dollarSign', 'chatBubble', 'videoCamera', 'telephone', 'speaker', 'microphone', 'videoConference', 'drone', 'dogBowl', 'curlyOpen', 'curlyClose'];
            if (!customDrawn.includes(prevMapping?.shapeType ?? '')) {
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
  
  const customDrawnShapes = ['dollarSign', 'chatBubble', 'videoCamera', 'telephone', 'speaker', 'microphone', 'videoConference', 'drone', 'dogBowl', 'curlyOpen', 'curlyClose'];
  if (!isImage && !customDrawnShapes.includes(bodyMapping?.shapeType ?? '')) {
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