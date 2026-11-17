'use client';

// Home page: a visitor picks one of the falling prompts (p1–p5), and that prompt's
// hand-picked pieces fall into view as cards (Matter.js): title, blurb, impact, and
// bracketed links to the published work. The pieces live in src/lib/home-prompts.ts.

import { useCallback, useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import localFont from 'next/font/local';
import { HOME_PROMPTS, type HomePrompt, type PieceImage, type PieceLink } from '@/lib/home-prompts';

// Ioskeley Mono (an Iosevka build styled after Berkeley Mono; SIL Open Font License), cut
// down to Latin characters as WOFF2, about 30 KB per weight.
const ioskeley = localFont({
  src: [
    { path: '../../../public/fonts/ioskeley/IoskeleyMono-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../../public/fonts/ioskeley/IoskeleyMono-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../../public/fonts/ioskeley/IoskeleyMono-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../../../public/fonts/ioskeley/IoskeleyMono-ExtraBold.woff2', weight: '800', style: 'normal' },
  ],
  display: 'swap',
  fallback: ['ui-monospace', 'Menlo', 'Consolas', 'monospace'],
});


// Height of the area the cards fall into.
const STAGE_H = 600;

export default function SearchHome() {
  const [active, setActive] = useState<HomePrompt | null>(null);
  const [lightbox, setLightbox] = useState<{ title: string; images: PieceImage[]; opener: HTMLElement } | null>(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const stageRef = useRef<HTMLDivElement>(null);
  const [staticLayout, setStaticLayout] = useState(false);
  const pillsRef = useRef<HTMLDivElement>(null);
  const [pillsStatic, setPillsStatic] = useState(false);

  // Drop the result cards into the stage.
  useEffect(() => {
    const box = stageRef.current;
    if (!box || !active) return;
    const cards = [...box.querySelectorAll<HTMLElement>('[data-card]')];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setStaticLayout(reduce);
    if (reduce) return;

    const { Engine, Runner, Bodies, Composite, Events } = Matter;
    const W = box.clientWidth;
    const sizes = cards.map(el => ({ w: el.offsetWidth, h: el.offsetHeight, col: 0 }));
    const cols = Math.max(1, Math.min(3, Math.floor(W / (Math.max(...sizes.map(s => s.w)) + 16))));
    // Each card collides as a box shorter than the card, centred on it, so cards overlap
    // and the pile fits the stage. Hovering a card lifts it to the front.
    // The stage is a fixed STAGE_H tall, at the very top of the page; cards overlap as much as
    // it takes to fit, but never more than SOLID_MIN allows.
    const SOLID_MIN = 0.15;
    const MAX_H = STAGE_H;
    const maxCard = Math.max(...sizes.map(s => s.h));
    const raw = Array(cols).fill(0), gaps = Array(cols).fill(0);
    sizes.forEach((s, i) => { s.col = i % cols; raw[s.col] += s.h; gaps[s.col] += 8; });
    const tallest = raw.indexOf(Math.max(...raw));
    // The pile needs SOLID * raw + gaps, plus one overhang below the bottom body and one above
    // the top body: SOLID * raw + gaps + maxCard * (1 - SOLID) + 24 <= MAX_H.
    const spare = raw[tallest] - maxCard;
    const fit = spare > 0 ? (MAX_H - 24 - gaps[tallest] - maxCard) / spare : 1;
    const SOLID = Math.max(SOLID_MIN, Math.min(1, fit));
    const overhang = maxCard * (1 - SOLID) / 2;
    const H = STAGE_H;
    box.style.height = `${H}px`;

    const engine = Engine.create({ gravity: { x: 0, y: 0.45 }, enableSleeping: true });
    Composite.add(engine.world, [
      // The floor sits one overhang up, so the bottom card's lower edge stays in view.
      Bodies.rectangle(W / 2, H - overhang + 30, W + 200, 60, { isStatic: true }),
      Bodies.rectangle(-30, H / 2, 60, H * 3, { isStatic: true }),
      Bodies.rectangle(W + 30, H / 2, 60, H * 3, { isStatic: true }),
    ]);
    const bodies = sizes.map((s, i) => Bodies.rectangle(
      (s.col + 0.5) * (W / cols) + (Math.random() - 0.5) * Math.max(0, W / cols - s.w - 16),
      -s.h - i * 90, s.w, s.h * SOLID,
      { restitution: 0.25, friction: 0.2, frictionAir: 0.02, chamfer: { radius: 16 }, inertia: Infinity, angle: (Math.random() - 0.5) * 0.06 },
    ));
    Composite.add(engine.world, bodies);
    const sync = () => bodies.forEach((b, i) => {
      const t = `translate(${Math.round(b.position.x - sizes[i].w / 2)}px, ${Math.round(b.position.y - sizes[i].h / 2)}px) rotate(${b.angle.toFixed(3)}rad)`;
      if (cards[i].style.transform !== t) cards[i].style.transform = t;
    });
    Events.on(engine, 'afterUpdate', sync);
    sync();
    const runner = Runner.create();
    Runner.run(runner, engine);
    return () => { Runner.stop(runner); Events.off(engine, 'afterUpdate', sync); Composite.clear(engine.world, false); Engine.clear(engine); };
  }, [active]);

  const started = active !== null;

  // The suggestion buttons drift down from above and pile up on the bottom of the page,
  // slow and floaty like the prompts on /raglib. They stay real buttons throughout.
  useEffect(() => {
    const box = pillsRef.current;
    if (!box || started) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPillsStatic(reduce);
    if (reduce) return;

    const { Engine, Runner, Bodies, Body, Composite, Events } = Matter;
    const pills = [...box.querySelectorAll<HTMLElement>('[data-pill]')];
    let stop = () => {};

    const start = () => {
      const W = box.clientWidth;
      // The stage runs from under the search box to the bottom of the window.
      const H = Math.max(240, Math.round(window.innerHeight - box.getBoundingClientRect().top));
      box.style.height = `${H}px`;
      const sizes = pills.map(el => ({ w: el.offsetWidth, h: el.offsetHeight }));

      const engine = Engine.create({ gravity: { x: 0, y: 0.09 } });
      const FLOOR_LIFT = 100; // the pile rests this far above the bottom of the stage
      Composite.add(engine.world, [
        Bodies.rectangle(W / 2, H - FLOOR_LIFT + 30, W + 200, 60, { isStatic: true }),
        Bodies.rectangle(-30, H / 2, 60, H * 6, { isStatic: true }),
        Bodies.rectangle(W + 30, H / 2, 60, H * 6, { isStatic: true }),
      ]);
      const bodies = sizes.map((s, i) => Bodies.rectangle(
        s.w / 2 + 8 + Math.random() * Math.max(1, W - s.w - 16),
        -60 - i * 120, s.w, s.h,
        { restitution: 0.3, friction: 0.05, frictionAir: 0.002, density: 0.00008, inertia: Infinity },
      ));
      Composite.add(engine.world, bodies);

      // Balloon drift: an occasional gentle sideways nudge, so they wander as they fall.
      const drift = () => bodies.forEach(b => {
        if (Math.random() < 0.04) {
          Body.applyForce(b, b.position, { x: (Math.random() - 0.5) * 0.00002 * b.mass, y: (Math.random() - 0.5) * 0.00001 * b.mass });
        }
      });
      const sync = () => bodies.forEach((b, i) => {
        const t = `translate(${Math.round(b.position.x - sizes[i].w / 2)}px, ${Math.round(b.position.y - sizes[i].h / 2)}px)`;
        if (pills[i].style.transform !== t) pills[i].style.transform = t;
      });
      Events.on(engine, 'beforeUpdate', drift);
      Events.on(engine, 'afterUpdate', sync);
      sync();
      const runner = Runner.create();
      Runner.run(runner, engine);
      stop = () => {
        Runner.stop(runner);
        Events.off(engine, 'beforeUpdate', drift);
        Events.off(engine, 'afterUpdate', sync);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
      };
    };
    // Measure the buttons only once Alyona has loaded: measured in the fallback font, their
    // physics boxes come out the wrong size and the pile overlaps when the real font swaps in.
    let cancelled = false;
    document.fonts.ready.then(() => { if (!cancelled) start(); });

    // Rebuild when the width changes (not on mobile URL-bar height changes).
    let lastW = window.innerWidth;
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      clearTimeout(timer);
      timer = setTimeout(() => { stop(); start(); }, 150);
    };
    window.addEventListener('resize', onResize);
    return () => { cancelled = true; window.removeEventListener('resize', onResize); clearTimeout(timer); stop(); };
  }, [started]);

  return (
    <main className={`${ioskeley.className} min-h-screen w-full bg-[#faf9f5] text-[#1f1e1d] [&_.w-full]:[font-family:inherit] md:flex md:items-start`} style={ioskeley.style}>
      {/* The headline gets its own gutter on the far left; on phones it sits above everything. */}
      <header className={`px-4 transition-[padding] duration-500 md:sticky md:top-0 md:w-[15vw] md:max-w-[220px] md:shrink-0 md:pl-4 md:pr-4 ${started ? 'pt-16' : 'pt-[16vh]'}`}>
        {/* The home-page headline shows only on the prompt screen; once a prompt is picked,
            that prompt's heading takes its place as the page's h1. */}
        {active ? (
          <h1 className="text-[1.25rem] font-medium leading-[1.4]">{active.heading}</h1>
        ) : (
          <h1 className="text-left text-[1.3rem] font-medium leading-[1.4] [margin:-80px_-14px_-47px_33px]">
            <span className="mt-[20px] block">Content nourishes users until they become satisfied customers.</span>
            <span className="mt-[20px] block">AI supplies the heat so chef Chris can whip up the content your audience hungers for.</span>
          </h1>
        )}
        {started && (
          <button type="button" onClick={() => setActive(null)}
            className="mb-6 mt-8 rounded-full border border-[#e8e6dc] bg-[#faf9f5] px-2.5 py-1 text-left text-[0.75rem] leading-[1.4] text-[#3d3d3a] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c96442] md:mb-0">
            ← Back to prompts
          </button>
        )}
      </header>

      <div className={`mx-auto flex w-full min-w-0 max-w-[1140px] flex-col items-center px-4 md:flex-1 ${started ? 'md:pt-0' : 'md:pt-[16vh]'}`}>

        {!started && (
          <div
            ref={pillsRef}
            className={pillsStatic ? 'mt-5 flex max-w-[680px] flex-wrap justify-center gap-2' : 'relative mt-2 w-full overflow-hidden'}
          >
            {HOME_PROMPTS.map(p => (
              <button key={p.id} type="button" data-pill onClick={() => setActive(p)}
                className={`${pillsStatic ? '' : 'absolute left-0 top-0 max-w-[calc(100%-16px)] -translate-y-[999px] will-change-transform'} rounded-full border border-[#e8e6dc] bg-[#faf9f5] px-7 py-3 text-[1.3rem] leading-[1.4] text-[#3d3d3a] transition-colors hover:bg-white`}>
                {p.prompt}
              </button>
            ))}
          </div>
        )}

        {active && (
          <section aria-label={active.prompt} className="mt-4 w-full md:mt-0">
            <div
              ref={stageRef}
              className={staticLayout ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3' : 'relative w-full overflow-hidden'}
              style={staticLayout ? undefined : { height: STAGE_H }}
            >
              {active.pieces.map((piece, i) => {
                const links = piece.links.filter(l => l.url || l.images?.length);
                // A card with a single link ([Read], [Explore], [Listen]) shows it top right,
                // beside the title; cards with several links list them along the bottom.
                const corner = links.length === 1 ? links[0] : null;
                const linkClass = 'pl-[15px] text-[#c96442] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c96442]';
                // A link with images opens the lightbox; any other link opens in a new tab.
                const cardLink = (l: PieceLink, extra = '') => l.images?.length ? (
                  <button key={l.label} type="button" className={`${extra} ${linkClass}`}
                    onClick={e => setLightbox({ title: `${piece.title}: ${l.label}`, images: l.images!, opener: e.currentTarget })}>
                    [{l.label}]
                  </button>
                ) : (
                  <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className={`${extra} ${linkClass}`}>
                    [{l.label}]
                  </a>
                );
                return (
                  // Cards that land first sit lower in the pile and in front, so the overlap hides
                  // the bottom of the card above rather than this card's title.
                  <div key={piece.title} data-card style={{ '--z': active.pieces.length - i } as React.CSSProperties}
                    className={`${staticLayout ? '' : 'absolute left-0 top-0 -translate-y-[999px] z-[var(--z)] hover:z-50 focus-within:z-50'} w-[942px] max-w-[calc(100%-24px)] rounded-2xl border border-[#e8e6dc] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)]`}>
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="text-[1.1rem] font-extrabold leading-snug">{piece.title}</h2>
                      {corner && cardLink(corner, 'shrink-0 text-base leading-snug')}
                    </div>
                    <p className="mt-2 text-base leading-relaxed text-[#5e5d59]">{piece.blurb}</p>
                    {piece.impact && <p className="mt-2 text-base leading-relaxed text-[#1f1e1d]"><span className="font-bold text-[#1f1e1d]">Impact: </span>{piece.impact}</p>}
                    {links.length > 1 && (
                      <p className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-base leading-snug">
                        {links.map(l => cardLink(l))}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
      {lightbox && <Lightbox title={lightbox.title} images={lightbox.images} opener={lightbox.opener} onClose={closeLightbox} />}
    </main>
  );
}

// Full-screen viewer for a card's images, shown stacked. Closes on Escape, the close
// button, or a click outside the images; focus returns to the link that opened it.
function Lightbox({ title, images, opener, onClose }: { title: string; images: PieceImage[]; opener: HTMLElement; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; opener.focus(); };
  }, [onClose, opener]);
  return (
    <div role="dialog" aria-modal="true" aria-label={title}
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[rgba(20,18,15,0.82)] p-6 md:items-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative flex w-full max-w-[900px] flex-col gap-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close"
          className="self-end rounded-full bg-white/90 px-3 py-1 text-base text-[#1f1e1d] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c96442]">
          ✕ Close
        </button>
        {images.map(img => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={img.src} src={img.src} alt={img.alt} className="mx-auto block h-auto max-w-full rounded-lg shadow-2xl" />
        ))}
      </div>
    </div>
  );
}
