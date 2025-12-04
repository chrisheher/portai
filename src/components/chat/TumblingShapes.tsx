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
}

interface TumblingShapesProps {
  projects?: Project[];
  filterCategory?: string;
  onShapeClick?: (item: Project) => void;
}

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
    
    engine.world.gravity.y = 0.5;
    engine.world.gravity.x = 0;

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
    const shapeTypes = ['circle', 'rectangle', 'polygon', 'trapezoid'];
    
const getShapeColor = (category: string, type: string) => {
  if (type === 'link') {
    return '#3b82f6'; // Blue color for links
  }
  
  // Your existing color logic for projects and questions
  switch (category.toLowerCase()) {
    case 'web': return '#FF6B6B';
    case 'ml/ai': return '#4ECDC4';
    // ... rest of your categories
    default: return '#95E1D3';
  }
};

    displayProjects.forEach((project, index) => {
      if (!project || !project.title) {
        console.warn('Invalid project at index', index);
        return;
      }

      const shapeType = shapeTypes[index % shapeTypes.length];
      const size = 100 + Math.random() * 100;
      
      const category = {
        label: project.title,
        type: shapeType,
        size: size,
        x: (width * 0.2) + Math.random() * (width * 0.6),
        y: -100 - (index * 150),
        project: project,
      };

      let body;
      const options = {
        restitution: 0.3,
        friction: 0.5,
        frictionAir: 0.02,
        density: 0.001,
        angle: (Math.random() - 0.5) * 0.3,
        render: {
          visible: false,
        },
      };

      if (category.type === 'circle') {
        body = Bodies.circle(category.x, category.y, category.size / 2, options);
      } else if (category.type === 'rectangle') {
        body = Bodies.rectangle(category.x, category.y, category.size, category.size * .2, options);
      } else if (category.type === 'polygon') {
        const sides = 5 + Math.floor(Math.random() * 2);
        body = Bodies.polygon(category.x, category.y, sides, category.size / 2, options);
      } else if (category.type === 'trapezoid') {
        const w = category.size;
        const h = category.size * 0.4;
        const topWidth = w * 0.6;
        body = Bodies.fromVertices(
          category.x, 
          category.y, 
          [
            { x: -topWidth / 2, y: -h / 2 },
            { x: topWidth / 2, y: -h / 2 },
            { x: w / 2, y: h / 2 },
            { x: -w / 2, y: h / 2 },
          ],
          options
        );
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

    // ✅ Helper function to fit text within shape bounds
    const fitTextInShape = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxHeight: number) => {
      const words = text.split(' ');
      let fontSize = 14;
      let lines: string[] = [];
      let fits = false;

      // Try decreasing font sizes until text fits
      while (fontSize >= 8 && !fits) {
        ctx.font = `bold ${fontSize}px Arial`;
        lines = [];
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
          const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);

        // Check if total height fits
        const totalHeight = lines.length * (fontSize + 4);
        if (totalHeight <= maxHeight) {
          fits = true;
        } else {
          fontSize -= 1;
        }
      }

      return { lines, fontSize };
    };

    // ✅ Custom rendering with smart text fitting
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

        // Draw shape
        if (shape.type === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (shape.type === 'rectangle') {
          const w = shape.size * 1.3;
          const h = shape.size * 0.3;
          ctx.fillRect(-w / 2, -h / 2, w, h);
        } else if (shape.type === 'polygon' || shape.type === 'trapezoid') {
          const vertices = shape.body.vertices;
          ctx.beginPath();
          ctx.moveTo(vertices[0].x - pos.x, vertices[0].y - pos.y);
          for (let i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i].x - pos.x, vertices[i].y - pos.y);
          }
          ctx.closePath();
          ctx.fill();
        }

        // ✅ Calculate available space for text based on shape type
        let maxWidth, maxHeight;
        
        if (shape.type === 'circle') {
          // For circles, text area is about 70% of diameter
          maxWidth = shape.size * 0.7;
          maxHeight = shape.size * 0.6;
        } else if (shape.type === 'rectangle') {
          // For rectangles, use 90% of dimensions
          maxWidth = shape.size * 0.9;
          maxHeight = shape.size * 0.15;
        } else if (shape.type === 'polygon') {
          // For polygons, use inscribed circle (about 70% of size)
          maxWidth = shape.size * 0.6;
          maxHeight = shape.size * 0.6;
        } else if (shape.type === 'trapezoid') {
          // For trapezoids, use the smaller top width
          maxWidth = shape.size * 0.5;
          maxHeight = shape.size * 0.3;
        }

        // ✅ Fit text within calculated bounds
        const { lines, fontSize } = fitTextInShape(ctx, shape.label, maxWidth, maxHeight);

        // Draw fitted text
        ctx.fillStyle = hoveredShape === shape ? baseColor : hoverColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${fontSize}px Arial`;
        
        const lineHeight = fontSize + 4;
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