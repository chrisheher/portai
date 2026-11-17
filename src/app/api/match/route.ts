// POST /api/match — the home-page search. A visitor picks a prompt; Claude picks the
// published pieces that best answer it, with one line on why each fits. Only ids from
// PIECES are returned, so every result links to a real published URL.

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PAGES } from '@/lib/pages';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MAX_INPUT = 500;

// Every published piece, once each (several pages link the same piece), with the page it belongs to.
const PIECES = (() => {
  const seen = new Set<string>();
  return PAGES.flatMap(page => page.sources.map((s, i) => ({ id: `${page.key}-${i + 1}`, ...s, page })))
    .filter(p => !seen.has(p.url) && seen.add(p.url));
})();

// Prompts whose first result is fixed, keyed by the prompt text (lowercased). The rest
// of the results still come from Claude.
const PINNED: Record<string, string> = {
  'does he understand gtm content?': 'https://blog.sentry.io/see-slow-faster-with-performance-monitoring/',
};

// Chris's strongest pieces. Claude is told to include them wherever they fit and rank
// them above comparable pieces; relevance to the question still comes first.
const FEATURED = new Set([
  'https://blog.sentry.io/how-slow-is-slow/',
  'https://www.dronedeploy.com/blog/safety-smarter-artificial-intelligence-and-your-work-site',
  'https://blog.sentry.io/asking-the-right-query-with-discover/',
  'https://blog.sentry.io/great-moments-in-application-monitoring/',
  'https://cdn.prod.website-files.com/66116a8e721f15266645ab67/67aa6b9436a6d6d815c14eef_HP_newoffice.pdf',
  'https://www.youtube.com/watch?v=pZyGYUMZAeg', // GPay API demo (web)
  'https://www.youtube.com/watch?v=rP_UAPcIG4I', // GPay API: what to know
  'https://www.youtube.com/watch?v=SZorG5Hqjzc', // GPay API for Android
  'https://blog.sentry.io/why-debugging-javascript-sucks-and-what-you-can-do-about-it/',
]);

const catalog = PIECES.map(p => {
  const impact = p.page.impact?.length ? ` Results: ${p.page.impact.join('; ')}.` : '';
  return `- ${p.id}${FEATURED.has(p.url) ? ' [featured]' : ''} | ${p.name} | ${p.page.title} (${p.page.category}): ${p.page.description.replace(/<br\/?>/g, ' ')}${impact}`;
}).join('\n');

const SYSTEM = `You match hiring managers to work in Chris Heher's portfolio. Chris is a content and brand strategist and writer.

A visitor, usually a hiring manager, asked a question about Chris's work or said what they want from the person in the role. Pick the 3 to 6 published pieces that best answer it, most relevant first. Pieces marked [featured] are Chris's strongest work: whenever one genuinely answers the question, include it and rank it above comparable pieces, but never above a piece that answers the question more directly (for a social media question, actual social posts come first). The [featured] tag is for your ranking only: never mention it, or call a piece "featured", in a "why". Use at most one GPay video per answer. Prefer pieces from different projects. When the question is about results, pipeline or revenue, favor pieces whose project has the strongest results.

Published pieces (id | piece | project it belongs to: what the project was, and its results where known):
${catalog}

Reply with JSON only, no prose and no code fence:
{"results": [{"id": "<piece id>", "why": "<one sentence, under 20 words, on how this piece answers what they asked>"}]}

Use only ids from the list. Write each "why" plainly, about the work, not about Chris's personality.`;

export async function POST(req: NextRequest) {
  const { wants } = await req.json().catch(() => ({}));
  const text = String(wants || '').trim().slice(0, MAX_INPUT);
  if (!text) return NextResponse.json({ error: 'Pick a question to see the work.' }, { status: 400 });

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
    const byId = new Map(PIECES.map(p => [p.id, p]));
    let picks: { id: string; why?: string }[] = (parsed.results || []).filter((r: any) => byId.has(r.id));
    const pinned = PIECES.find(p => p.url === PINNED[text.toLowerCase()]);
    if (pinned) {
      const own = picks.find(r => r.id === pinned.id);
      picks = [{ id: pinned.id, why: own?.why || 'The release blog at the center of a GTM launch that drove $850k in attributed pipeline.' }, ...picks.filter(r => r.id !== pinned.id)];
    }
    const results = picks
      .slice(0, 6)
      .map((r: any) => {
        const piece = byId.get(r.id)!;
        return { key: piece.id, title: piece.name, category: piece.page.title, why: String(r.why || '').slice(0, 200), url: piece.url };
      });
    return NextResponse.json({ results });
  } catch (err: any) {
    console.error('match error', err?.message);
    return NextResponse.json({ error: 'Search is unavailable right now.' }, { status: 502 });
  }
}
