// POST /api/match — the home-page search. A visitor says what they want most out of
// the position; Claude picks the portfolio pages that best show it, with one line
// on why each fits. Only keys from PAGES are returned, so every result links to a
// page that exists (/?show=<key>).

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PAGES } from '@/lib/pages';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MAX_INPUT = 500;

const catalog = PAGES.map(p => `- ${p.key} | ${p.title} | ${p.category} | ${p.description}`).join('\n');

const SYSTEM = `You match hiring managers to work in Chris Heher's portfolio. Chris is a content and brand strategist and writer.

A visitor answered the question "What do you want most out of your position?", describing what they want from the person in the role they're hiring for. Pick the 3 to 6 portfolio pages that best show Chris delivering that, most relevant first.

Portfolio pages (key | title | category | description):
${catalog}

Reply with JSON only, no prose and no code fence:
{"results": [{"key": "<page key>", "why": "<one sentence, under 20 words, on how this page shows what they asked for>"}]}

Use only keys from the list. Write each "why" plainly, about the work, not about Chris's personality.`;

export async function POST(req: NextRequest) {
  const { wants } = await req.json().catch(() => ({}));
  const text = String(wants || '').trim().slice(0, MAX_INPUT);
  if (!text) return NextResponse.json({ error: 'Tell me what you want most out of the position.' }, { status: 400 });

  try {
    // Claude Opus 5.5 with server-side fallback: a declined request is retried on another model in the same call.
    const response = await (anthropic.beta.messages.create as any)({
      model: 'claude-opus-5-5',
      max_tokens: 2048,
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      messages: [{ role: 'user', content: text }],
    });
    if (response.stop_reason === 'refusal') return NextResponse.json({ results: [] });

    const raw = response.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
    const parsed = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
    const byKey = new Map(PAGES.map(p => [p.key, p]));
    const results = (parsed.results || [])
      .filter((r: any) => byKey.has(r.key))
      .slice(0, 6)
      .map((r: any) => {
        const page = byKey.get(r.key)!;
        return { key: page.key, title: page.title, category: page.category, why: String(r.why || '').slice(0, 200), url: `/?show=${page.key}` };
      });
    return NextResponse.json({ results });
  } catch (err: any) {
    console.error('match error', err?.message);
    return NextResponse.json({ error: 'Search is unavailable right now.' }, { status: 502 });
  }
}
