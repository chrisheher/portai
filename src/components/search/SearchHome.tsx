'use client';

// Home-page search: a visitor says what they want most out of the position, and the
// portfolio pages that best show it fall into view as cards (Matter.js), each
// linking to its existing page (/?show=<key>).

import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { Source_Serif_4 } from 'next/font/google';

const serif = Source_Serif_4({ subsets: ['latin'], weight: ['400', '500'] });

type Result = { key: string; title: string; category: string; why: string; url: string };

const SUGGESTIONS = [
  'Someone who owns the voice end to end',
  'Content that drives pipeline',
  'A writer engineers trust',
  'A brand launch that cuts through',
  'Content that keeps working for years',
];

export default function SearchHome() {
  const [value, setValue] = useState('');
  const [asked, setAsked] = useState('');
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const stageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [staticLayout, setStaticLayout] = useState(false);

  async function search(text: string) {
    const wants = text.trim();
    if (!wants || loading) return;
    setAsked(wants);
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const r = await fetch('/api/match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wants }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Search failed');
      setResults(data.results);
      if (!data.results.length) setError('Nothing matched that. Try describing the work you need done.');
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  // Grow the textarea with its text, like a chat box.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  // Drop the result cards into the stage.
  useEffect(() => {
    const box = stageRef.current;
    if (!box || !results?.length) return;
    const cards = [...box.querySelectorAll<HTMLElement>('[data-card]')];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setStaticLayout(reduce);
    if (reduce) return;

    const { Engine, Runner, Bodies, Composite, Events } = Matter;
    const W = box.clientWidth;
    const sizes = cards.map(el => ({ w: el.offsetWidth, h: el.offsetHeight, col: 0 }));
    const cols = Math.max(1, Math.min(3, Math.floor(W / (Math.max(...sizes.map(s => s.w)) + 16))));
    const colH = Array(cols).fill(0);
    sizes.forEach((s, i) => { s.col = i % cols; colH[s.col] += s.h + 8; });
    const H = Math.max(260, Math.round(Math.max(...colH) * 1.1 + 40));
    box.style.height = `${H}px`;

    const engine = Engine.create({ gravity: { x: 0, y: 0.45 }, enableSleeping: true });
    Composite.add(engine.world, [
      Bodies.rectangle(W / 2, H + 30, W + 200, 60, { isStatic: true }),
      Bodies.rectangle(-30, H / 2, 60, H * 3, { isStatic: true }),
      Bodies.rectangle(W + 30, H / 2, 60, H * 3, { isStatic: true }),
    ]);
    const bodies = sizes.map((s, i) => Bodies.rectangle(
      (s.col + 0.5) * (W / cols) + (Math.random() - 0.5) * Math.max(0, W / cols - s.w - 16),
      -s.h - i * 90, s.w, s.h,
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
  }, [results]);

  const started = loading || results !== null || !!error;

  return (
    <main className="min-h-screen w-full bg-[#faf9f5] text-[#1f1e1d]">
      <div className={`mx-auto flex w-full max-w-[880px] flex-col items-center px-4 transition-[padding] duration-500 ${started ? 'pt-16' : 'pt-[24vh]'}`}>
        <h1 className={`${serif.className} mb-8 text-center text-[2rem] font-normal leading-tight tracking-[-0.01em] sm:text-[2.6rem]`}>
          What do you want most out of your position?
        </h1>

        <form
          className="w-full max-w-[680px] rounded-[20px] border border-[#e8e6dc] bg-white p-3 shadow-[0_4px_24px_rgba(0,0,0,0.05)] focus-within:border-[#d6d3c7]"
          onSubmit={e => { e.preventDefault(); search(value); }}
        >
          <label htmlFor="wants" className="sr-only">What do you want most out of your position?</label>
          <textarea
            id="wants" ref={inputRef} rows={2} value={value} maxLength={500}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); search(value); } }}
            placeholder="Describe the person, the work, or the result you need…"
            className="block w-full resize-none bg-transparent px-2 pt-1 text-[1.05rem] leading-relaxed outline-none placeholder:text-[#8f8d86]"
          />
          <div className="flex items-center justify-between pt-2">
            <span className="px-2 text-xs text-[#8f8d86]">Matches you to work in Chris Heher’s portfolio</span>
            <button
              type="submit" disabled={!value.trim() || loading} aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c96442] text-white transition hover:bg-[#b5573a] disabled:bg-[#e3c2b5]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 13V3M8 3L3.5 7.5M8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </form>

        {!started && (
          <div className="mt-5 flex max-w-[680px] flex-wrap justify-center gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} type="button" onClick={() => { setValue(s); search(s); }}
                className="rounded-full border border-[#e8e6dc] bg-[#faf9f5] px-3.5 py-1.5 text-sm text-[#3d3d3a] transition hover:bg-white">
                {s}
              </button>
            ))}
          </div>
        )}

        {loading && <p className="mt-10 animate-pulse text-sm text-[#73726c]">Finding the work that shows “{asked}”…</p>}
        {error && !loading && <p className="mt-10 text-sm text-[#73726c]">{error}</p>}

        {results && results.length > 0 && (
          <section aria-label={`Work that shows: ${asked}`} className="mt-10 w-full">
            <p className="mb-3 text-center text-xs uppercase tracking-[0.14em] text-[#8f8d86]">{results.length} pages that show it</p>
            <div
              ref={stageRef}
              className={staticLayout ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3' : 'relative w-full overflow-hidden rounded-[20px] border border-[#ece9df]'}
              style={staticLayout ? undefined : { height: 480 }}
            >
              {results.map(r => (
                <a key={r.key} href={r.url} data-card
                  className={`${staticLayout ? '' : 'absolute left-0 top-0 -translate-y-[999px]'} block w-[260px] max-w-[calc(100%-24px)] rounded-2xl border border-[#e8e6dc] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c96442]`}>
                  <span className="text-[0.66rem] uppercase tracking-[0.14em] text-[#8f8d86]">{r.category}</span>
                  <span className={`${serif.className} mt-1 block text-[1.1rem] leading-snug`}>{r.title}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-[#5e5d59]">{r.why}</span>
                  <span className="mt-3 block text-sm font-medium text-[#c96442]">Open →</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
