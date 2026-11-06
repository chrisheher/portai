// POST /api/evidence — "evidence on demand". A visitor asks for proof of a skill
// ("show me writing for skeptical developers") and Claude answers only with verbatim
// excerpts from Chris's published work. Every excerpt is checked against the corpus
// before it's returned, so nothing invented reaches the page. Each answer ends with
// links to the pieces it quoted.
//
// The corpus is exported from ~/corpus with scripts/export.py (NDA pieces excluded).

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import CORPUS from '@/lib/evidence-corpus.json';

type Piece = (typeof CORPUS)[number];

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MAX_INPUT = 500;
const MAX_EXCERPTS = 4;

const byId = new Map<string, Piece>(CORPUS.map(p => [p.id, p]));

// Stable, so it caches: instructions first, then every piece.
const INSTRUCTIONS = `You answer recruiters and hiring managers who want proof of what Chris Heher can do as a writer, content marketer and content strategist. You answer only with verbatim excerpts from his published work, below.

Rules:
- Quote exactly. Copy each excerpt character for character from one piece's text: no edits, no ellipses joining separate passages, no markdown symbols added. One to four sentences per excerpt, or a whole headline or post.
- Choose 1 to ${MAX_EXCERPTS} excerpts that best answer the question, strongest first, ideally from different pieces.
- Quote only Chris's own words. Never quote customer testimonials, quotes attributed to named people, survey statistics presented as other organizations' findings, or a client's existing company values.
- For each excerpt, add "why": one plain sentence, under 25 words, on what it shows. Describe the writing, not Chris's personality, and make no claims the piece doesn't support.
- "intro" is one short sentence framing the answer, or "" if the excerpts speak for themselves.
- If nothing in the corpus answers the question, return no excerpts and set "gap" to one honest sentence naming what isn't there. Don't stretch a weak match.
- Never write new copy, imitate his voice, or answer questions unrelated to his work.

Reply with JSON only, no prose and no code fence:
{"intro": "<string>", "excerpts": [{"id": "<piece id>", "quote": "<verbatim text>", "why": "<sentence>"}], "gap": "<string or null>"}

Each piece below starts with its id and details. "role" says how Chris contributed: sole-author, co-author, lead-writer or ghostwriter.`;

const CORPUS_TEXT = CORPUS.map(p =>
  `<piece id="${p.id}" client="${p.client}" date="${p.date}" type="${p.type}" audience="${p.audience}" role="${p.role}">\n# ${p.title}\n\n${p.text}\n</piece>`
).join('\n\n');

// Compare text the way a reader would: ignore markdown, curly quotes, dash styles and spacing.
function normalize(s: string) {
  return s
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/[‘’′]/g, "'")
    .replace(/[“”″]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
const normalizedText = new Map(CORPUS.map(p => [p.id, normalize(`${p.title}\n${p.text}`)]));

function label(p: Piece) {
  const role = { 'sole-author': '', 'co-author': 'co-authored', 'lead-writer': 'lead writer', ghostwriter: 'ghostwritten', editor: 'edited' }[p.role] ?? p.role;
  return [p.client, p.date, p.type.replace(/-/g, ' '), role].filter(Boolean).join(' · ');
}

export async function POST(req: NextRequest) {
  const { question } = await req.json().catch(() => ({}));
  const text = String(question || '').trim().slice(0, MAX_INPUT);
  if (!text) return NextResponse.json({ error: 'Ask for the kind of work you want to see.' }, { status: 400 });

  try {
    // Claude Opus 5.5 with server-side fallback: a declined request is retried on another model in the same call.
    const response = await (anthropic.beta.messages.create as any)({
      model: 'claude-opus-5-5',
      max_tokens: 4096,
      output_config: { effort: 'medium' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: [
        { type: 'text', text: INSTRUCTIONS },
        { type: 'text', text: CORPUS_TEXT, cache_control: { type: 'ephemeral', ttl: '1h' } },
      ],
      messages: [{ role: 'user', content: text }],
    });
    if (response.stop_reason === 'refusal') {
      return NextResponse.json({ intro: '', excerpts: [], sources: [], gap: "I can't help with that one. Try asking about a kind of writing." });
    }

    const raw = response.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
    const parsed = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));

    // Keep only excerpts that appear word for word in the piece they cite.
    const excerpts = (Array.isArray(parsed.excerpts) ? parsed.excerpts : [])
      .filter((e: any) => {
        const body = normalizedText.get(String(e?.id));
        const quote = normalize(String(e?.quote || ''));
        const ok = !!body && quote.length >= 12 && body.includes(quote);
        if (!ok) console.warn('evidence: dropped unverified excerpt', e?.id);
        return ok;
      })
      .slice(0, MAX_EXCERPTS)
      .map((e: any) => {
        const p = byId.get(e.id)!;
        return { id: p.id, quote: String(e.quote).trim(), why: String(e.why || '').slice(0, 220), title: p.title, label: label(p), link: p.link || null };
      });

    // One link per quoted piece, after the answer, in the order they were quoted.
    const seen = new Set<string>();
    const sources = excerpts
      .filter((e: any) => e.link && !seen.has(e.id) && seen.add(e.id))
      .map((e: any) => ({ title: e.title, label: e.label, link: e.link }));

    const gap = excerpts.length ? null : (parsed.gap ? String(parsed.gap).slice(0, 240) : 'Nothing in the portfolio shows that yet.');
    return NextResponse.json({ intro: excerpts.length ? String(parsed.intro || '').slice(0, 240) : '', excerpts, sources, gap });
  } catch (err: any) {
    console.error('evidence error', err?.message);
    return NextResponse.json({ error: 'The evidence search is unavailable right now.' }, { status: 502 });
  }
}
