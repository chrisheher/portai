'use client';

import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
var decomp = require('poly-decomp');

// Set up poly-decomp for Matter.js
if (typeof window !== 'undefined') {
  Matter.Common.setDecomp(decomp);
}


interface Project {
  title: string;
  category?: string;
  src?: string;
  content?: React.ReactNode;
type?: 'project' | 'link' | 'campaign' | 'image' | 'question';
  prompt?: string;
  shape?: 'letterH' | 'letterC' | 'letterR' | 'letterI' | 'letterS';
  imageSrc?: string;  // ← ADD THIS
  url?: string;       // ← ADD THIS
}


interface TumblingShapesProps {
  projects?: Project[];
  filterCategory?: string;
  onShapeClick?: (item: Project) => void;
  mode?: 'initial' | 'links';
  chatCentered?: boolean;
}

const TumblingShapes: React.FC<TumblingShapesProps> = ({ projects = [], filterCategory, onShapeClick, mode = 'initial', chatCentered = false }) => {
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

    // ===== LETTER H (1.6x) =====
    function getHVertices() {
      const vertices = [];
      const stemWidth = 90;
      const totalHeight = 400;
      const archStartY = 230;
      const legWidth = 62;
      const radius = 80;
      
      vertices.push({ x: 0, y: totalHeight });
      vertices.push({ x: 0, y: -10 });
      vertices.push({ x: stemWidth, y: 0 });
      vertices.push({ x: stemWidth, y: archStartY });

      const archCx = stemWidth + 0;
      const archCy = archStartY + radius;

      for (let i = 0; i <= 20; i++) {
        const angle = -Math.PI / 2 + (i / 20) * (Math.PI / 2);
        vertices.push({
          x: archCx + radius * Math.cos(angle),
          y: archCy + radius * Math.sin(angle)
        });
      }

      const rightLegX = archCx + radius;
      vertices.push({ x: rightLegX + 8, y: totalHeight });
      vertices.push({ x: rightLegX - legWidth + 16, y: totalHeight });

      const innerRadius = radius - legWidth + 16;
      for (let i = 0; i <= 15; i++) {
        const angle = 0 - (i / 15) * (Math.PI / 2);
        vertices.push({
          x: archCx + innerRadius * Math.cos(angle),
          y: archCy + innerRadius * Math.sin(angle) + 32
        });
      }

      vertices.push({ x: stemWidth, y: totalHeight });
      return vertices;
    }

    // ===== LETTER C (1.6x) =====
    function getCVertices() {
      const vertices = [];
      const radius = 176;
      const thickness = 152;
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

      return vertices;
    }

    // ===== LETTER R (1.6x) =====
    function getRVertices() {
      const vertices = [];
      const stemWidth = 96;
      const totalHeight = 332;
      const shoulderRadius = 294;
      const shoulderStartY = 198;

      vertices.push({ x: 0, y: totalHeight });
      vertices.push({ x: 16, y: 16 });
      vertices.push({ x: stemWidth, y: 0 });
      vertices.push({ x: stemWidth, y: shoulderStartY });

      const shoulderCx = stemWidth;
      const shoulderCy = shoulderStartY + shoulderRadius * 0.3;

      for (let i = 0; i <= 20; i++) {
        const angle = -Math.PI / 2 + (i / 20) * (Math.PI / 4.9);
        vertices.push({
          x: shoulderCx + Math.cos(angle) * shoulderRadius * 0.5,
          y: shoulderCy + Math.sin(angle) * shoulderRadius * 0.9
        });
      }

      const innerRadius = shoulderRadius * 0.55;
      for (let i = 20; i >= 0; i--) {
        const angle = -Math.PI / 2 + (i / 20) * (Math.PI / 6.9);
        vertices.push({
          x: shoulderCx + Math.cos(angle) * innerRadius,
          y: shoulderCy + Math.sin(angle) * innerRadius + 16
        });
      }

      vertices.push({ x: stemWidth, y: shoulderStartY + 32 });
      vertices.push({ x: stemWidth, y: totalHeight });
      return vertices;
    }

    // ===== LETTER I (1.6x) =====
    function getIVertices() {
      const vertices = [];
      const width = 96;
      const height = 302;
      const dotRadius = 64;
      const dotGap = 4.6;

      vertices.push({ x: -width / 2, y: height / 2.1 });
      vertices.push({ x: -width / 2, y: -height / 2.1 });
      vertices.push({ x: -width / 2, y: -height / 2 - dotGap });

      const dotCenterY = -height / 2 - dotGap - dotRadius;
      const segments = 20;

      for (let i = 0; i <= segments; i++) {
        const angle = Math.PI + (i / segments) * Math.PI * 1.4;
        vertices.push({
          x: Math.cos(angle) * dotRadius,
          y: dotCenterY + Math.sin(angle) * dotRadius
        });
      }

      vertices.push({ x: width / 2, y: -height / 2 - dotGap });
      vertices.push({ x: width / 2, y: -height / 2 });
      vertices.push({ x: width / 2, y: height / 2 });
      return vertices;
    }

    // ===== TOP C SHAPE (1.6x) =====
    function getTopCVertices() {
      const vertices = [];
      const radius = 160;
      const thickness = 72;
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
        const angle = (Math.PI * 0.55) + (i / segments) * (Math.PI * 1.15);
        vertices.push({
          x: Math.cos(angle) * innerRadius,
          y: Math.sin(angle) * innerRadius
        });
      }

      return vertices;
    }

    // ===== BOTTOM C SHAPE (1.6x) =====
    function getBottomCVertices() {
      const vertices = [];
      const radius = 144;
      const thickness = 64;
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
        const angle = (Math.PI * 1.65) + (i / segments) * (Math.PI * 1.0);
        vertices.push({
          x: Math.cos(angle) * innerRadius,
          y: Math.sin(angle) * innerRadius
        });
      }

      return vertices;
    }

    // Create shapes based on mode
    const letterShapes = ['letterC', 'letterH', 'letterR', 'letterI', 'letterS'];
    const projectBodies: Matter.Body[] = [];
    bodiesRef.current = [];

    // Use provided projects or default to 5 letters
    const itemsToRender = projects.length > 0 ? projects : [
      { title: 'copywriting', type: 'project' as const },
      { title: 'humanized ai', type: 'project' as const },
      { title: 'resume scan tool', type: 'project' as const },
      { title: 'interactive/ux', type: 'project' as const },
      { title: 'simplified technical content', type: 'project' as const }
   ].filter(Boolean);

    itemsToRender.forEach((project, index) => {
         if (!project) return; // Extra safety check

      let shapeType: string;
            const isImageType = project.type === 'image' && project.imageSrc;

      // In initial mode, assign specific letters to specific titles
      if (mode === 'initial') {
        switch (project.title) {
          case 'copywriting':
            shapeType = 'letterC';
            break;
          case 'humanized ai':
            shapeType = 'letterH';
            break;
          case 'resume scan tool':
            shapeType = 'letterR';
            break;
          case 'interactive/ux':
            shapeType = 'letterI';
            break;
          case 'simplified technical content':
            shapeType = 'letterS';
            break;
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
      
      // Position items across screen
      const spacing = window.innerWidth / (itemsToRender.length + 1);
      const x = spacing * (index + 1);
      const y = -200 - (Math.floor(index) * 700);

      
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
        fillColor = '#5e4631';  // Brown shapes in links mode
        strokeColor = '#5e4631';
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
        case 'letterS':
        default:
          body = Body.create({
            parts: [
              Bodies.fromVertices(x, y - 80, [getTopCVertices()], {
                render: { fillStyle: fillColor }
              }),
              Bodies.fromVertices(x, y + 80, [getBottomCVertices()], {
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
      render: { fillStyle: '#5e4631' }
    });

    const leftWall = Bodies.rectangle(-30, window.innerHeight / 2, 30, window.innerHeight * 2, {
      isStatic: true,
      render: { fillStyle: '#5e4631' }
    });

    const rightWall = Bodies.rectangle(window.innerWidth + 30, window.innerHeight / 2, 30, window.innerHeight * 2, {
      isStatic: true,
      render: { fillStyle: '#5e4631' }
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
      
      // Smaller font for links mode to fit better inside shapes
      const fontSize = mode === 'links' ? '17px' : '20px';  // Reduced
      context.font = `${fontSize} "kcgangster", Arial`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      bodiesRef.current.forEach(({ body, project, shapeType }) => {
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
          // Render text (existing logic)
          const isHovered = hoveredBodyRef.current?.id === body.id;
          
          // Color scheme: Initial mode = brown text on beige shapes
          //               Links mode = beige text on brown shapes
          if (mode === 'initial') {
            context.fillStyle = isHovered ? '#dcd3c3' : '#1d140cff';  // Brown text (beige when hovered)
          } else {
            context.fillStyle = isHovered ? '#2e2217ff' : '#dcd3c3';  // Beige text (brown when hovered)
          }
          
          context.save();
          context.translate(position.x, position.y);
          
          // First rotate to match the body's rotation
          context.rotate(angle);
          
          // Then apply additional rotation based on shape type (all modes)
          if (shapeType === 'letterH' || shapeType === 'letterR') {
            // H, R, I shapes: 90-degree counterclockwise rotation
            context.rotate(-Math.PI / 2);
          } else if (shapeType === 'letterC'  ) {
      context.rotate(3 * -Math.PI / 1.58);
            context.rotate(Math.PI / 2);
          }  
          else if (shapeType === 'letterS'  ) {
      context.rotate( -Math.PI / 2);
       
          }  
          else if (shapeType === 'letterI' ) {
                    context.rotate(3 * -Math.PI / 2);
                 

          } else if (mode === 'links') {
            // All other shapes in links mode: default 90-degree counterclockwise
            context.rotate(-Math.PI / 2);
          }
          
          // Truncate long titles for links mode with better padding
          let displayTitle = project.title;
          if (mode === 'links') {
            // Truncate to fit inside shapes
            const maxLength = 70;  // Increased from 20
            if (displayTitle.length > maxLength) {
              displayTitle = displayTitle.substring(0, maxLength) + '...';
            }
          }
          
          // Apply offsets for text positioning inside shapes
          let xOffset = 0;
          let yOffset = 0;
          
          if (mode === 'links') {
            // Links mode: offset all text to the right
          if ( shapeType === 'letterH') {
              // All rotated shapes (C, H, R, I) get same offset
              xOffset = 20;  // Push left (up when rotated)
              yOffset = -12;    // Centered vertically
            }
                 if ( shapeType === 'letterR') {
              // All rotated shapes (C, H, R, I) get same offset
              xOffset = -30;  // Push left (up when rotated)
              yOffset = -25;    // Centered vertically
            }
               if ( shapeType === 'letterI') {
              // All rotated shapes (C, H, R, I) get same offset
              xOffset = 50;  // Push left (up when rotated)
              yOffset = 15;    // Centered vertically
            }
          } else if (mode === 'initial') {
            // Initial mode: specific offsets for rotated shapes based on shape type
            
            if ( shapeType === 'letterH' || shapeType === 'letterR') {
              // All rotated shapes (C, H, R, I) get same offset
              xOffset = -30;  // Push left (up when rotated)
              yOffset = -32;    // Centered vertically
            }
            
            // S shape (letterS) doesn't need offset (not rotated)
          }
          
          context.fillText(displayTitle, xOffset, yOffset);
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
        originalFill = '#5e4631';  // Brown in links mode
        originalStroke = '#5e4631';
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
            hoveredBodyRef.current.render.fillStyle = original.fill;
            hoveredBodyRef.current.render.strokeStyle = original.stroke;
            
            if (hoveredBodyRef.current.parts && hoveredBodyRef.current.parts.length > 1) {
              hoveredBodyRef.current.parts.forEach(part => {
                part.render.fillStyle = original.fill;
              });
            }
          }
        }
        

if (foundHover) {
  // Capture foundHover to avoid TypeScript narrowing issues
const currentHover: Matter.Body = foundHover;  // ← Explicit type annotation
  const bodyMapping = bodiesRef.current.find(m => m.body === foundHover!);

  // Check if this is an image shape - don't change color if it is
  const isImage = bodyMapping && (bodyMapping.project as any).type === 'image';
  
  if (!isImage) {
    // Hover color depends on mode:
    // Initial mode: brown hover (dark on light)
    // Links mode: beige hover (light on dark)
    const hoverColor = mode === 'initial' ? '#1b1209ff' : '#dcd3c3';
    
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

  return <div ref={sceneRef} style={{ width: '100%', height: '100vh' }} />;
};

export default TumblingShapes;