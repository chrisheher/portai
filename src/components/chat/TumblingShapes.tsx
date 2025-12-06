'use client';

import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

interface Project {
  title: string;
  category?: string;
  src?: string;
  content?: React.ReactNode;
  type?: 'project' | 'question';
  prompt?: string;
  shape?: 'circle' | 'rectangle' | 'polygon'  | 'lessThan' | 'brace' | 'comma';
}

interface TumblingShapesProps {
  projects?: Project[];
  filterCategory?: string;
  onShapeClick?: (item: Project) => void;
}

const roughenVertices = (vertices: { x: number; y: number }[], roughness: number = 0.4) => {
  return vertices.map(v => ({
    x: v.x + (Math.random() - 0.5) * roughness * 50,
    y: v.y + (Math.random() - 0.5) * roughness * 50
  }));
};

const TumblingShapes: React.FC<TumblingShapesProps> = ({ 
  projects, 
  filterCategory,
  onShapeClick 
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  useEffect(() => {
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      console.log('TumblingShapes: No valid projects provided');
      return;
    }

    if (!sceneRef.current) {
      console.log('TumblingShapes: No scene ref');
      return;
    }

    if (engineRef.current) {
      console.log('TumblingShapes: Already initialized, skipping');
      return;
    }

    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter;

    const engine = Engine.create();
    engineRef.current = engine;
    const world = engine.world;
    
    engine.gravity.y = .8;  // Slightly stronger gravity
    engine.gravity.x = 0;
    
    // Improve collision detection
    engine.positionIterations = 10;  // Increased from default 6
    engine.velocityIterations = 8;   // Increased from default 4
    engine.constraintIterations = 4; // More constraint solving iterations
    
    // Reduce overlap tolerance
    engine.enableSleeping = false;   // Keep all bodies active for better collision response

    const width = window.innerWidth;
    const height = window.innerHeight;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: '#d4c4b0',
      },
    });
    renderRef.current = render;

    const displayProjects = filterCategory 
      ? projects.filter(p => p.category?.toLowerCase() === filterCategory.toLowerCase())
      : projects;

    const shapes: any[] = [];
    const shapeTypes = ['circle', 'rectangle', 'polygon', 'lessThan', 'brace', 'comma'];
    
    const getShapeColor = (category: string, type: string) => {
      if (type === 'link') {
        return '#3b82f6';
      }
      
      switch (category.toLowerCase()) {
        case 'web': return '#FF6B6B';
        case 'ml/ai': return '#4ECDC4';
        default: return '#95E1D3';
      }
    };

    // Helper function to create "<" shape
    const createLessThanShape = (x: number, y: number, size: number, options: any) => {
      const width = size * 0.6;
      const height = size;
      const thickness = size * 0.15;
      
      const vertices = roughenVertices([
        { x: width / 2, y: -height / 2 },
        { x: width / 2 - thickness, y: -height / 2 + thickness },
        { x: -width / 2 + thickness, y: 0 },
        { x: width / 2 - thickness, y: height / 2 - thickness },
        { x: width / 2, y: height / 2 },
        { x: -width / 2, y: 0 }
      ], 0.3);
      
      return Bodies.fromVertices(x, y, [vertices], options);
    };

    // Helper function to create "}" shape
    const createBraceShape = (x: number, y: number, size: number, options: any) => {
      const width = size * 0.5;
      const height = size;
      const thickness = size * 0.12;
      const curveDepth = width * 0.4;
      
      const vertices = roughenVertices([
        { x: -width / 2, y: -height / 2 },
        { x: -width / 2 + thickness, y: -height / 2 },
        { x: -width / 2 + thickness, y: -height / 4 },
        { x: curveDepth, y: -height / 8 },
        { x: curveDepth, y: height / 8 },
        { x: -width / 2 + thickness, y: height / 4 },
        { x: -width / 2 + thickness, y: height / 2 },
        { x: -width / 2, y: height / 2 },
        { x: -width / 2, y: height / 4 },
        { x: curveDepth - thickness, y: height / 8 },
        { x: curveDepth - thickness, y: -height / 8 },
        { x: -width / 2, y: -height / 4 }
      ], 0.3);
      
      return Bodies.fromVertices(x, y, [vertices], options);
    };

    // Helper function to create ")" shape
    const createParenShape = (x: number, y: number, size: number, options: any) => {
      const width = size * 0.4;
      const height = size;
      const thickness = size * 0.12;
      const segments = 12;
      const outerVertices = [];
      const innerVertices = [];
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments - 0.5) * Math.PI;
        const radius = height / 2;
        outerVertices.push({
          x: -Math.cos(angle) * width / 2,
          y: Math.sin(angle) * radius
        });
        innerVertices.unshift({
          x: -(Math.cos(angle) * width / 2 + thickness),
          y: Math.sin(angle) * (radius - thickness)
        });
      }
      
      const vertices = roughenVertices([...outerVertices, ...innerVertices], 0.3);
      return Bodies.fromVertices(x, y, [vertices], options);
    };

    // Helper function to create "," shape
    const createCommaShape = (x: number, y: number, size: number, options: any) => {
      const dotRadius = size * 0.2;
      const tailLength = size * 0.3;
      const tailWidth = size * 0.15;
      
      const vertices = roughenVertices([
        { x: dotRadius, y: -dotRadius },
        { x: dotRadius * 0.7, y: -dotRadius * 1.3 },
        { x: 0, y: -dotRadius * 1.4 },
        { x: -dotRadius * 0.7, y: -dotRadius * 1.3 },
        { x: -dotRadius, y: -dotRadius },
        { x: -dotRadius, y: 0 },
        { x: -dotRadius * 0.7, y: dotRadius * 0.7 },
        { x: 0, y: dotRadius },
        { x: tailWidth, y: dotRadius },
        { x: -tailWidth / 2, y: tailLength },
        { x: -tailWidth, y: dotRadius },
        { x: -dotRadius * 0.7, y: dotRadius * 0.7 }
      ], 0.3);
      
      return Bodies.fromVertices(x, y, [vertices], options);
    };

    displayProjects.forEach((project, index) => {
      if (!project || !project.title) {
        console.warn('Invalid project at index', index);
        return;
      }

      // Debug: Log the project to see what shape property it has
      console.log(`Project #${index} "${project.title}":`, {
        hasShapeProperty: 'shape' in project,
        shapeValue: project.shape,
        shapeType: typeof project.shape,
        isValidShape: project.shape && shapeTypes.includes(project.shape)
      });

      // Use shape from project data if provided, otherwise cycle through shapes
      const shapeType = project.shape && shapeTypes.includes(project.shape) 
        ? project.shape 
        : shapeTypes[index % shapeTypes.length];
      
      console.log(`  → Using shape: "${shapeType}" (${project.shape ? 'from JSON' : 'from cycle'})`);
      
      const size = 150 + Math.random() * 150; // Much larger shapes (150-300px)
      
      const initialAngle = (Math.random() - 0.5) * 0.3;
      
      const category = {
        label: project.title,
        type: shapeType,
        size: size,
        x: (width * 0.2) + Math.random() * (width * 0.6),
        y: -100 - (index * 250), // Increased spacing from 150 to 250
        project: project,
        initialAngle: initialAngle, // Store the initial angle
      };

      let body;
      const options = {
        restitution: 0.6,      // Increased bounciness for better separation
        friction: 0.8,         // Increased friction to reduce sliding
        frictionAir: 0.03,     // Slightly more air resistance
        density: 0.012,        // Increased density for more weight
        angle: initialAngle,
        render: {
          visible: false,
        },
      };

      if (category.type === 'circle') {
        const segments = 24;
        const radius = category.size / 4;
        const circleVertices = [];
        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          circleVertices.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
          });
        }
        const roughCircle = roughenVertices(circleVertices, .4);
        body = Bodies.fromVertices(category.x, category.y, [roughCircle], options);
      } else if (category.type === 'rectangle') {
        const w = category.size * .2;  // Make rectangles wider
        const h = category.size * 0.5; // Make rectangles taller
        const rectVertices = roughenVertices([
          { x: -w / 2, y: -h / 2 },
          { x: w / 2, y: -h / 2 },
          { x: w / 2, y: h / 2 },
          { x: -w / 2, y: h / 2 },
        ], 0.3);
        body = Bodies.fromVertices(category.x, category.y, [rectVertices], options);
       } else if (category.type === 'brace') {
        body = createBraceShape(category.x, category.y, category.size, options);
      } else if (category.type === 'comma') {
        body = createCommaShape(category.x, category.y, category.size, options);
      }

      if (body) {
        shapes.push({ body, ...category });
        Composite.add(world, body);
      }
    });

    const walls = [
      Bodies.rectangle(width / 2, height, width, 100, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(-25, height / 2, 50, height, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(width + 25, height / 2, 50, height, { isStatic: true, render: { visible: false } }),
    ];
    Composite.add(world, walls);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Composite.add(world, mouseConstraint);

    let hoveredShape: any = null;

    const handleMouseMove = () => {
      const mousePos = mouse.position;
      hoveredShape = null;

      shapes.forEach((shape) => {
        const dist = Math.hypot(mousePos.x - shape.body.position.x, mousePos.y - shape.body.position.y);
        if (dist < shape.size / 2) hoveredShape = shape;
      });

      if (render.canvas) {
        render.canvas.style.cursor = hoveredShape ? 'pointer' : 'default';
      }
    };

    const handleClick = () => {
      if (hoveredShape && hoveredShape.project) {
        console.log('Clicked item:', hoveredShape.project);
        if (onShapeClick) {
          onShapeClick(hoveredShape.project);
        }
      }
    };

    if (render.canvas) {
      render.canvas.addEventListener('mousemove', handleMouseMove);
      render.canvas.addEventListener('click', handleClick);
    }

    // Helper function to fit text within shape bounds with extra padding
    const fitTextInShape = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxHeight: number) => {
      const words = text.split(' ');
      let fontSize = 24; // Start with larger font size
      let lines: string[] = [];
      let fits = false;
      
      // Much more aggressive padding to account for rotation
      const paddingFactor = 0.6; // Use only 60% of available space for safety during rotation
      const effectiveMaxWidth = maxWidth * paddingFactor;
      const effectiveMaxHeight = maxHeight * paddingFactor;

      while (fontSize >= 10 && !fits) { // Minimum font size of 10 instead of 6
        ctx.font = `${fontSize}px Georgia, 'Times New Roman', serif`;
        lines = [];
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
          const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > effectiveMaxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);

        const totalHeight = lines.length * (fontSize + 4);
        if (totalHeight <= effectiveMaxHeight) {
          fits = true;
        } else {
          fontSize -= 1;
        }
      }

      return { lines, fontSize };
    };

    // Custom rendering with smart text fitting
    Events.on(render, 'afterRender', () => {
      const ctx = render.context;
      
      shapes.forEach((shape) => {
        const pos = shape.body.position;
        const angle = shape.body.angle;

        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(angle);
        
        const isQuestion = shape.project.type === 'question';
        const baseColor = isQuestion ? '#a37d8f' : '#7d8fa3';
        const hoverColor = '#d4c4b0';
        
        ctx.fillStyle = hoveredShape === shape ? hoverColor : baseColor;
        ctx.strokeStyle = 'transparent';
        ctx.lineWidth = 0;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Draw shape - the vertices already have roughness baked in
        if (shape.type === 'circle') {
          const vertices = shape.body.vertices;
          ctx.beginPath();
          ctx.moveTo(vertices[0].x - pos.x, vertices[0].y - pos.y);
          for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i].x - pos.x, vertices[i].y - pos.y);
          }
          ctx.closePath();
          ctx.fill();
        } else if (shape.type === 'rectangle') {
          const vertices = shape.body.vertices;
          ctx.beginPath();
          ctx.moveTo(vertices[0].x - pos.x, vertices[0].y - pos.y);
          for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i].x - pos.x, vertices[i].y - pos.y);
          }
          ctx.closePath();
          ctx.fill();
        } else if (shape.type === 'polygon' || shape.type === 'trapezoid' || 
                   shape.type === 'lessThan' || shape.type === 'brace' || 
                   shape.type === 'paren' || shape.type === 'comma') {
          const vertices = shape.body.vertices;
          ctx.beginPath();
          ctx.moveTo(vertices[0].x - pos.x, vertices[0].y - pos.y);
          for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i].x - pos.x, vertices[i].y - pos.y);
          }
          ctx.closePath();
          ctx.fill();
        }

        // Add paper texture overlay
        ctx.globalAlpha = 0.08;
        for (let i = 0; i < 15; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)';
          const texX = -shape.size/2 + Math.random() * shape.size;
          const texY = -shape.size/2 + Math.random() * shape.size;
          ctx.fillRect(texX, texY, Math.random() * 8, Math.random() * 8);
        }
        ctx.globalAlpha = 1;

        // Calculate available space for text based on shape type
        // Conservative values to account for rotation
        let maxWidth = shape.size * 0.5;   // Reduced for rotation safety
        let maxHeight = shape.size * 0.4;  // Reduced for rotation safety

        if (shape.type === 'circle') {
          maxWidth = shape.size * 0.4;   // More conservative for circles
          maxHeight = shape.size * 0.35;
        } else if (shape.type === 'rectangle') {
          maxWidth = shape.size * 0.5;   // Much more strict for rectangles during rotation
          maxHeight = shape.size * 0.12; // Very conservative height for rectangles
        } else if (shape.type === 'polygon') {
          maxWidth = shape.size * 0.4;
          maxHeight = shape.size * 0.4;
        } else if (shape.type === 'trapezoid') {
          maxWidth = shape.size * 0.35;
          maxHeight = shape.size * 0.25;
        } else if (shape.type === 'lessThan') {
          maxWidth = shape.size * 0.25;
          maxHeight = shape.size * 0.35;
        } else if (shape.type === 'brace') {
          maxWidth = shape.size * 0.22;
          maxHeight = shape.size * 0.45;
        } else if (shape.type === 'paren') {
          maxWidth = shape.size * 0.18;
          maxHeight = shape.size * 0.45;
        } else if (shape.type === 'comma') {
          maxWidth = shape.size * 1.22;
          maxHeight = shape.size * 0.3;
        }

        // Fit text within calculated bounds
        const { lines, fontSize } = fitTextInShape(ctx, shape.label, maxWidth, maxHeight);

        // Draw fitted text (rotates with shape)
        ctx.fillStyle = hoveredShape === shape ? baseColor : hoverColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${fontSize}px Georgia, 'Times New Roman', serif`;
        
        const lineHeight = fontSize + 6; // Slightly more spacing
        const totalHeight = lines.length * lineHeight;
        let startY = -totalHeight / 2 + lineHeight / 2;
        
        lines.forEach((line) => {
          ctx.fillText(line, 0, startY);
          startY += lineHeight;
        });
        
        ctx.restore();
      });
    });

    Render.run(render);
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    return () => {
      console.log('🧹 Cleaning up TumblingShapes');
      
      if (render.canvas) {
        render.canvas.removeEventListener('mousemove', handleMouseMove);
        render.canvas.removeEventListener('click', handleClick);
      }
      
      if (renderRef.current) {
        Render.stop(renderRef.current);
        renderRef.current = null;
      }
      
      if (runnerRef.current) {
        Runner.stop(runnerRef.current);
        runnerRef.current = null;
      }
      
      if (engineRef.current) {
        Composite.clear(engineRef.current.world, false);
        Engine.clear(engineRef.current);
        engineRef.current = null;
      }
      
      if (render.canvas && render.canvas.parentNode) {
        render.canvas.remove();
      }
    };
  }, [projects, filterCategory, onShapeClick]);

  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#d4c4b0]">
        <p className="text-neutral-600 dark:text-neutral-400">No projects to display</p>
      </div>
    );
  }

  return (
    <div ref={sceneRef} className="w-full h-full relative overflow-hidden" />
  );
};

export default TumblingShapes;