'use client';

// Evidence on demand: a visitor asks to see a kind of work, and gets verbatim excerpts
// from Chris's published writing (checked against the corpus by /api/evidence),
// followed by links to the full pieces.

import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { Courier_Prime, Source_Serif_4 } from 'next/font/google';

const serif = Source_Serif_4({ subsets: ['latin'], weight: ['400', '500'] });
const mono = Courier_Prime({ subsets: ['latin'], weight: ['400'] });

type Excerpt = { id: string; quote: string; why: string; title: string; label: string; link: string | null };
type Source = { title: string; label: string; link: string };
type Answer = { intro: string; excerpts: Excerpt[]; sources: Source[]; gap: string | null };

// Questions recruiters and hiring managers ask, tumbling in like the prompts on the
// Groaning Shelves (Libby) home page. Each one is answerable with writing samples.
const PROMPTS = [
  // Recruiters: checking the job requirements
  'Does he have B2B SaaS experience?',
  'Has he written for developers?',
  'Has he worked on a product launch?',
  'Any consumer brand work?',
  'Has he done employer brand or careers content?',
  // Hiring managers: judging the work
  'Show me how he explains something technical',
  'Can he write long-form for enterprise buyers?',
  'Show me a headline that does a lot in a few words',
  'Can he be funny without being cringe?',
  'Show me content built around a customer story',
];

// Book-spine greys from the Groaning Shelves cards.
const SPINES = ['#f4f1ea', '#e4e4e4', '#d6d6d6', '#eaeaea', '#dcdcdc', '#cecece'];

function TumblingPrompts({ onPick }: { onPick: (q: string) => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const box = stageRef.current;
    if (!box) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduce(still);
    if (still) return;

    const { Engine, Runner, Bodies, Body, Composite, Events } = Matter;
    const cards = [...box.querySelectorAll<HTMLElement>('[data-prompt]')];
    const W = box.clientWidth;
    const sizes = cards.map(el => ({ w: el.offsetWidth, h: el.offsetHeight, col: 0 }));
    // Drop into columns so the cards pile side by side, and size the stage to hold them.
    const cols = Math.max(1, Math.min(3, Math.floor(W / (Math.max(...sizes.map(s => s.w)) + 8))));
    const colH = Array(cols).fill(0);
    sizes.forEach((s, i) => { s.col = i % cols; colH[s.col] += s.h + 6; });
    const H = Math.max(300, Math.round(Math.max(...colH) * 1.08 + 24));
    box.style.height = `${H}px`;

    // Same feel as the Libby canvas: very low gravity, a little bounce, almost no air drag.
    const engine = Engine.create({ gravity: { x: 0, y: 0.09 } });
    Composite.add(engine.world, [
      Bodies.rectangle(W / 2, H + 30, W + 200, 60, { isStatic: true }),
      Bodies.rectangle(-30, H / 2, 60, H * 4, { isStatic: true }),
      Bodies.rectangle(W + 30, H / 2, 60, H * 4, { isStatic: true }),
    ]);
    const bodies = sizes.map((s, i) => Bodies.rectangle(
      (s.col + 0.5) * (W / cols) + (Math.random() - 0.5) * Math.max(0, W / cols - s.w - 16), -60 - i * 90, s.w, s.h,
      { restitution: 0.3, friction: 0.05, frictionAir: 0.002, density: 0.00008, inertia: Infinity, chamfer: { radius: 10 } },
    ));
    Composite.add(engine.world, bodies);

    // Balloon drift: gentle random nudges so the pile never quite settles.
    const drift = () => bodies.forEach(b => {
      if (Math.random() < 0.04) Body.applyForce(b, b.position, { x: (Math.random() - 0.5) * 0.00003, y: (Math.random() - 0.5) * 0.000015 });
    });
    const sync = () => bodies.forEach((b, i) => {
      cards[i].style.transform = `translate(${Math.round(b.position.x - sizes[i].w / 2)}px, ${Math.round(b.position.y - sizes[i].h / 2)}px) rotate(${b.angle.toFixed(3)}rad)`;
    });
    Events.on(engine, 'beforeUpdate', drift);
    Events.on(engine, 'afterUpdate', sync);
    sync();
    const runner = Runner.create();
    Runner.run(runner, engine);
    return () => {
      Runner.stop(runner);
      Events.off(engine, 'beforeUpdate', drift);
      Events.off(engine, 'afterUpdate', sync);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      aria-label="Questions you can ask"
      className={reduce ? 'mt-8 flex max-w-[680px] flex-wrap justify-center gap-2' : 'relative mt-8 h-[300px] w-full overflow-hidden'}
      style={reduce ? undefined : { backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 62px, rgba(31,30,29,0.05) 62px 63px)' }}
    >
      {PROMPTS.map((q, i) => (
        <button
          key={q} type="button" data-prompt onClick={() => onPick(q)}
          className={`${mono.className} ${reduce ? '' : 'absolute left-0 top-0 -translate-y-[999px]'} max-w-[164px] rounded-[10px] px-3 py-2 text-center text-[0.8rem] sm:max-w-[236px] sm:px-4 sm:py-2.5 sm:text-[0.9rem] leading-snug text-[#141414] shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_4px_14px_rgba(0,0,0,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c96442]`}
          style={{ backgroundColor: SPINES[i % SPINES.length] }}
        >
          {q}
        </button>
      ))}
    </div>
  );
}

export default function EvidencePage() {
  const [value, setValue] = useState('');
  const [asked, setAsked] = useState('');
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function ask(text: string) {
    const question = text.trim();
    if (!question || loading) return;
    setAsked(question);
    setLoading(true);
    setError('');
    setAnswer(null);
    try {
      const r = await fetch('/api/evidence', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Something went wrong');
      setAnswer(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
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

  const started = loading || answer !== null || !!error;

  return (
    <main className="min-h-screen w-full bg-[#faf9f5] text-[#1f1e1d]">
      <div className={`mx-auto flex w-full max-w-[760px] flex-col items-center px-4 pb-24 transition-[padding] duration-500 ${started ? 'pt-16' : 'pt-[12vh]'}`}>
        <h1 className={`${serif.className} mb-8 text-center text-[2rem] font-normal leading-tight tracking-[-0.01em] sm:text-[2.6rem]`}>
          What do you want to see Chris write?
        </h1>

        <form
          className="w-full max-w-[680px] rounded-[20px] border border-[#e8e6dc] bg-white p-3 shadow-[0_4px_24px_rgba(0,0,0,0.05)] focus-within:border-[#d6d3c7]"
          onSubmit={e => { e.preventDefault(); ask(value); }}
        >
          <label htmlFor="question" className="sr-only">What do you want to see Chris write?</label>
          <textarea
            id="question" ref={inputRef} rows={2} value={value} maxLength={500}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(value); } }}
            placeholder="An audience, a format, a tone, or a result…"
            className="block w-full resize-none bg-transparent px-2 pt-1 text-[1.05rem] leading-relaxed outline-none placeholder:text-[#8f8d86]"
          />
          <div className="flex items-center justify-between pt-2">
            <span className="px-2 text-xs text-[#8f8d86]">Answers with exact quotes from published work</span>
            <button
              type="submit" disabled={!value.trim() || loading} aria-label="Ask"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c96442] text-white transition hover:bg-[#b5573a] disabled:bg-[#e3c2b5]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 13V3M8 3L3.5 7.5M8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </form>

        {!started && <TumblingPrompts onPick={q => { setValue(q); ask(q); }} />}

        {loading && <p className="mt-10 animate-pulse text-sm text-[#73726c]">Finding work that shows “{asked}”…</p>}
        {error && !loading && <p className="mt-10 text-sm text-[#73726c]">{error}</p>}

        {answer && !loading && (
          <section aria-label={`Evidence for: ${asked}`} className="mt-10 w-full">
            {answer.gap && <p className="text-center text-[#5e5d59]">{answer.gap}</p>}
            {answer.intro && <p className="mb-5 text-[#3d3d3a]">{answer.intro}</p>}

            <div className="flex flex-col gap-4">
              {answer.excerpts.map((e, i) => (
                <figure key={`${e.id}-${i}`} className="rounded-2xl border border-[#e8e6dc] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                  <blockquote className={`${serif.className} whitespace-pre-line text-[1.12rem] leading-relaxed`}>{e.quote}</blockquote>
                  <figcaption className="mt-3 text-sm leading-relaxed">
                    <span className="block text-[0.7rem] uppercase tracking-[0.12em] text-[#8f8d86]">{e.label}</span>
                    <span className="mt-0.5 block font-medium text-[#3d3d3a]">{e.title}</span>
                    {e.why && <span className="mt-1 block text-[#5e5d59]">{e.why}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>

            {answer.sources.length > 0 && (
              <nav aria-label="Full pieces" className="mt-6 border-t border-[#e8e6dc] pt-4">
                <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[#8f8d86]">Read the full {answer.sources.length === 1 ? 'piece' : 'pieces'}</p>
                <ul className="flex flex-col gap-1.5">
                  {answer.sources.map(s => (
                    <li key={s.link}>
                      <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-[#c96442] underline-offset-2 hover:underline">
                        {s.title} →
                      </a>
                      <span className="ml-2 text-sm text-[#8f8d86]">{s.label}</span>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <button type="button" onClick={() => { setAnswer(null); setValue(''); inputRef.current?.focus(); }}
              className="mt-8 text-sm text-[#73726c] underline-offset-2 hover:underline">
              Ask about something else
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
