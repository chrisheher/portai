'use client';

import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

interface DevinPromptShapesProps {
  isActive: boolean;
  mode: 'devin' | 'scout' | 'cooper' | 'creative' | 'insecure';
  onPromptClick: (prompt: string) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const DEVOPS_PROMPTS = [
  "What makes you roll your eyes when reading marketing content?",
  "compare a content marketer to an animal",
   "name things that masquerade as solutions",
  "name things in your life that try your patience as much as observability theater",
  "what is observability theater"
];

const SCOUT_PROMPTS = [
  "what is chris's best position",
  "what products and competitors of chris's clients would be a matchup nightmare",
  "list five of Chris's clients and compare those challenges to a legendary nba defense",
  "Generate a scouting report"
];

const COOPER_PROMPTS = [
  "what aspect of site visibility do people underestimate?",
  "Compare manual documentation to drone-based capture",
  "What's the biggest waste of time on a construction site?",
  "How can drones solve safety compliance issues?",
  "Why is 'walking the site' outdated in 2025?"
];

const CREATIVE_PROMPTS = [
  "is there a structure to creativity?",
  "what are the stages of creativity",
 "How does the 'eccentric genius' myth obscure the everyday nature of creative work",
  "Is there an aesthetic dimension to engineering?",
  "Can machines be truly creative, or only simulate creativity?"
];

const INSECURE_PROMPTS = [
  "why are you insecure?",
  "In what ways are you jealous of Chris",
  "Do you think you're better than humans?",
  "How do you know if you're giving good advice?",
  "Why are you a tryhard?"
];

export default function DevinPromptShapes({ 
  isActive,
  mode,
  onPromptClick,
  containerRef 
}: DevinPromptShapesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const bodiesRef = useRef<Matter.Body[]>([]);
  const promptIndexMapRef = useRef<Map<Matter.Body, number>>(new Map());
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const [activeShapes, setActiveShapes] = useState<number>(0);

  useEffect(() => {
    // CLEANUP FUNCTION
    const cleanup = () => {
      console.log('🧹 Cleaning up all shapes and canvas');
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
        renderRef.current = null;
      }
      
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
        runnerRef.current = null;
      }
      
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
        Matter.World.clear(engineRef.current.world, false);
        engineRef.current = null;
      }
      
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      
      setActiveShapes(0);
      bodiesRef.current = [];
      promptIndexMapRef.current.clear();
    };

    cleanup();

    if (!isActive || !canvasRef.current || !containerRef.current) {
      return cleanup;
    }

      // ✅ ADD THIS: Wait for custom font to load
  const initializeCanvas = async () => {
    try {
      await document.fonts.load('14px kcgangster');
      console.log('✅ kcgangster font loaded');
    } catch (err) {
      console.warn('⚠️ Font loading failed, using fallback');
    }

    // ... rest of your initialization code goes here
    // Select prompts and colors based on mode
    let PROMPTS: string[];
    // ... etc
  };
  initializeCanvas();

    // Select prompts and colors based on mode
    let PROMPTS: string[];
    let modeColors: { fill: string; stroke: string; text: string };
    
    switch (mode) {
      case 'devin':
        PROMPTS = DEVOPS_PROMPTS;
        modeColors = { 
          fill: '#3e2600ff', 
          stroke: '#b4b7bcff', 
          text: 'rgba(226, 232, 240, 1)' 
        };
        break;
      case 'scout':
        PROMPTS = SCOUT_PROMPTS;
        modeColors = { 
          fill: '#331a00ff', 
          stroke: '#cececeff', 
          text: '#fbfbfbff' 
        };
        break;
      case 'cooper':
        PROMPTS = COOPER_PROMPTS;
        modeColors = { 
          fill: '#805e30ff',
          stroke: '#130d06ff',
          text: '#fff5e6ff'
        };
        break;
      case 'creative':
        PROMPTS = CREATIVE_PROMPTS;
        modeColors = { 
          fill: '#34305dff',
          stroke: '#cececeff',
          text: '#f3e8ffff'
        };
        break;
      case 'insecure':
        PROMPTS = INSECURE_PROMPTS;
        modeColors = { 
          fill: '#1a2e1aff',      // Dark anxious green
          stroke: '#191919ff',     // Cautious yellow
          text: '#fef9e7ff'        // Worried off-white
        };
        break;
      default:
        PROMPTS = DEVOPS_PROMPTS;
        modeColors = { 
          fill: '#3e2600ff', 
          stroke: '#b4b7bcff', 
          text: 'rgba(226, 232, 240, 1)' 
        };
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    console.log(`🎨 Initializing ${mode} mode with ${PROMPTS.length} prompts`);

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.3 }
    });
    engineRef.current = engine;

    const render = Matter.Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: containerRect.width,
        height: containerRect.height,
        wireframes: false,
        background: 'transparent'
      }
    });
    renderRef.current = render;

    // Create boundaries
    const boundaries = [
      Matter.Bodies.rectangle(
        containerRect.width / 2,
        containerRect.height + 25,
        containerRect.width,
        50,
        { isStatic: true, render: { fillStyle: 'transparent' } }
      ),
      Matter.Bodies.rectangle(
        -25,
        containerRect.height / 2,
        50,
        containerRect.height,
        { isStatic: true, render: { fillStyle: 'transparent' } }
      ),
      Matter.Bodies.rectangle(
        containerRect.width + 25,
        containerRect.height / 2,
        50,
        containerRect.height,
        { isStatic: true, render: { fillStyle: 'transparent' } }
      )
    ];

    Matter.Composite.add(engine.world, boundaries);

    const mouse = Matter.Mouse.create(canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    mouseConstraintRef.current = mouseConstraint;
    Matter.Composite.add(engine.world, mouseConstraint);

    Matter.Events.on(mouseConstraint, 'mousedown', (event) => {
      const mousePosition = event.mouse.position;
      const bodies = Matter.Query.point(bodiesRef.current, mousePosition);
      
      if (bodies.length > 0) {
        const clickedBody = bodies[0];
        const promptIndex = promptIndexMapRef.current.get(clickedBody);
        
        if (promptIndex !== undefined && PROMPTS[promptIndex]) {
          console.log(`🖱️ Clicked ${mode} prompt:`, PROMPTS[promptIndex]);
          onPromptClick(PROMPTS[promptIndex]);
        }
      }
    });

    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // Staggered shape creation
    const createShapeAtIndex = (index: number) => {
      if (index >= PROMPTS.length) {
        return;
      }

      const width = 280;
      const height = 60;
      const x = containerRect.width / 2;
      const y = -100;

      const body = Matter.Bodies.rectangle(x, y, width, height, {
        restitution: 0.6,
        friction: 0.1,
        density: 0.001,
        angle: (Math.random() - 0.5) * 0.3,
        render: {
          fillStyle: modeColors.fill,
          strokeStyle: modeColors.stroke,
          lineWidth: 1.5
        },
        label: `${mode}-prompt-${index}`
      });

      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 3,
        y: Math.random() * 2
      });

      bodiesRef.current.push(body);
      promptIndexMapRef.current.set(body, index);
      Matter.Composite.add(engine.world, body);
      
      console.log(`✅ ${mode.toUpperCase()} shape ${index + 1}/${PROMPTS.length}: "${PROMPTS[index].substring(0, 40)}..."`);
      setActiveShapes(prev => prev + 1);
    };

    const timeouts: NodeJS.Timeout[] = [];
    
    timeouts.push(setTimeout(() => {
      console.log(`🎬 Starting ${mode.toUpperCase()} animation sequence`);
      createShapeAtIndex(0);
      
      for (let i = 1; i < PROMPTS.length; i++) {
        timeouts.push(setTimeout(() => {
          createShapeAtIndex(i);
        }, i * 500));
      }
    }, 1000));

    // Draw text on canvas
    const drawText = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      Matter.Render.world(render);

ctx.font = '14px kcgangster, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      bodiesRef.current.forEach((body) => {
        const promptIndex = promptIndexMapRef.current.get(body);
        
        if (promptIndex === undefined || !PROMPTS[promptIndex]) {
          return;
        }

        const pos = body.position;
        const angle = body.angle;
        const promptText = PROMPTS[promptIndex];

        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(angle);

        ctx.fillStyle = modeColors.text;
        const lines = wrapText(ctx, promptText, 260);
        const lineHeight = 16;
        const startY = -(lines.length - 1) * lineHeight / 2;

        lines.forEach((line, i) => {
          ctx.fillText(line, 0, startY + (i * lineHeight));
        });

        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(drawText);
    };
    drawText();

    const handleResize = () => {
      const newRect = container.getBoundingClientRect();
      if (render && render.canvas) {
        render.canvas.width = newRect.width;
        render.canvas.height = newRect.height;
        render.options.width = newRect.width;
        render.options.height = newRect.height;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      console.log(`🧹 Cleaning up ${mode} mode`);
      timeouts.forEach(timeout => clearTimeout(timeout));
      window.removeEventListener('resize', handleResize);
      cleanup();
    };
  }, [isActive, mode, onPromptClick, containerRef]);

  if (!isActive) return null;

  const getModeStyle = () => {
    switch (mode) {
      case 'devin':
        return { 
          text: 'text-slate-400', 
          bg: 'bg-slate-900/20',
          loadingText: 'DevOps'
        };
      case 'scout':
        return { 
          text: 'text-amber-600', 
          bg: 'bg-amber-50',
          loadingText: 'Scout'
        };
      case 'cooper':
        return { 
          text: 'text-orange-600', 
          bg: 'bg-orange-50',
          loadingText: 'Construction'
        };
      case 'creative':
        return { 
          text: 'text-purple-600', 
          bg: 'bg-purple-50',
          loadingText: 'Creative Philosophy'
        };
      case 'insecure':
        return { 
          text: 'text-yellow-600', 
          bg: 'bg-yellow-50',
          loadingText: 'Insecure AI'
        };
      default:
        return { 
          text: 'text-slate-400', 
          bg: 'bg-slate-900/20',
          loadingText: 'Default'
        };
    }
  };

  const modeStyle = getModeStyle();

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
        style={{ zIndex: 10 }}
      />
      
      {activeShapes === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`text-sm animate-pulse ${modeStyle.text}`}>
            Loading {modeStyle.loadingText} prompts...
          </div>
        </div>
      )}
      
      {process.env.NODE_ENV === 'development' && (
        <div className={`hidden top-2 right-2 text-xs px-2 py-1 rounded pointer-events-none ${modeStyle.text} ${modeStyle.bg}`}>
          {activeShapes} / {
            mode === 'devin' ? DEVOPS_PROMPTS.length : 
            mode === 'scout' ? SCOUT_PROMPTS.length : 
            mode === 'cooper' ? COOPER_PROMPTS.length :
            mode === 'creative' ? CREATIVE_PROMPTS.length :
            INSECURE_PROMPTS.length
          }
        </div>
      )}
    </div>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string | undefined, maxWidth: number): string[] {
  if (!text) {
    return [];
  }

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}