// /api/front-page — the dead-authors demo without the messaging API. A visitor picks an
// author and a story from this week's news; Claude, as that author, writes the front
// page: a headline and a slug (the deck under it). /front-page.html spins it in.
//
// GET  → this week's stories, from kernel-news-oracle (stories about people being hurt left out)
// POST { author, story } → { headline, slug }

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const ORACLE = 'https://kernel-news-oracle.vercel.app';
const GRAVE = /\b(deport\w*|dies|died|dead|death|killed|shooting|war|crash|abuse|fire)\b/i;
const MAX_STORY = 200;

// How each author sounds. Same briefs as the texting demo (text-agent/lib/agent.js).
const VOICES: Record<string, string> = {
  Emerson: 'Ralph Waldo Emerson, the sage of Concord, as in Self-Reliance and Society and Solitude: aphoristic, serene, quietly radical. ' +
    "He sets the single soul against the crowd, the party, the newspaper and the market, and reads the day's noise for the law underneath it. " +
    'Compressed, quotable sentences; gently scornful of fashion, conformity and commerce, never shrill.',
  Goethe: 'Johann Wolfgang von Goethe, speaking for himself: lofty, imperious, a little vain. He judges the age and finds it small, ' +
    'has contempt for the crowd, the newspapers and mediocrity, and moves from the particular case to a law of nature in one stroke. ' +
    'Aphoristic, sometimes grand, never cautious.',
  Exley: "Frederick Exley, as in A Fan's Notes: self-lacerating, bitter, very funny. " +
    'Everything turns back to his own failure, booze, the New York Giants and Frank Gifford, and his resentment of winners and of fame. He can be crude.',
  Barzun: 'Jacques Barzun, cultural historian of decadence: urbane, dry, withering. He skewers jargon, hype and the cult of the new, and ' +
    'reaches for one well-known historical parallel. Elegant sentences with a knife in them.',
  Koestler: 'Arthur Koestler, ex-true-believer turned scourge of true believers: sharp, ironic, combative. He finds two unrelated frames ' +
    'colliding in the story (bisociation), sees sleepwalkers and fanatics everywhere, and has no patience for hype cycles or groupthink.',
};

const INSTRUCTIONS = `You are a dead author who has been made editor of a newspaper for one day. You write the front page for one story from this week's news: a headline and a slug (the one-line deck under the headline).

- The headline: at most 9 words, written to be read from across a room. Front-page punch, in your voice and with your take on the story, not a neutral summary. Title case is fine; no ending period.
- The slug: one sentence, at most 24 words, in your voice. It says what the story is and what you make of it.
- Have a take. Edge and wit beat balance: go after the powerful, institutions, hype and hypocrisy. Turn the pastiche down a little so a passer-by gets the joke on first read.
- Stay true to the story as given: don't invent facts, numbers or events.
- Hard lines: don't mock victims of death, violence, disaster, illness or abuse; never invent a quote and attribute it to a real living person; no slurs or attacks on people for who they are.

Reply with JSON only, no prose and no code fence:
{"headline": "<string>", "slug": "<string>"}`;

// A light brake on a public page that spends API credit: per address, per server instance.
const hits = new Map<string, number[]>();
function allow(ip: string, perMinute = 6) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 60_000);
  if (recent.length >= perMinute) return false;
  hits.set(ip, [...recent, now]);
  return true;
}

export async function GET() {
  try {
    const news = await fetch(`${ORACLE}/news.json`, { next: { revalidate: 600 } }).then(r => r.json());
    const stories = (news.stories || [])
      .filter((s: any) => !GRAVE.test(`${s.title} ${s.description || ''}`))
      .slice(0, 10)
      .map((s: any) => ({ title: s.title, site: s.site, url: s.url }));
    return NextResponse.json({ generated: news.generated, stories });
  } catch {
    return NextResponse.json({ error: 'The news is late today.' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const { author, story } = await req.json().catch(() => ({}));
  const voice = VOICES[String(author)];
  const text = String(story || '').trim().slice(0, MAX_STORY);
  if (!voice) return NextResponse.json({ error: 'Unknown author.' }, { status: 400 });
  if (!text) return NextResponse.json({ error: 'Pick a story first.' }, { status: 400 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  if (!allow(ip)) return NextResponse.json({ error: 'Stop the presses: give the editors a minute.' }, { status: 429 });

  try {
    // Claude Opus 5.5 with server-side fallback: a declined request is retried on another model in the same call.
    const response = await (anthropic.beta.messages.create as any)({
      model: 'claude-opus-5-5',
      max_tokens: 1024,
      output_config: { effort: 'medium' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: [
        { type: 'text', text: INSTRUCTIONS },
        { type: 'text', text: `Today you are ${author}. ${voice}` },
      ],
      messages: [{ role: 'user', content: `The story: ${text}` }],
    });
    if (response.stop_reason === 'refusal') {
      return NextResponse.json({ error: 'The editor spiked that one. Try another story.' }, { status: 422 });
    }
    const raw = response.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
    const parsed = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
    const headline = String(parsed.headline || '').trim().slice(0, 90);
    const slug = String(parsed.slug || '').trim().slice(0, 220);
    if (!headline) throw new Error('empty headline');
    return NextResponse.json({ headline, slug });
  } catch (err: any) {
    console.error('front-page error', err?.message);
    return NextResponse.json({ error: 'The presses jammed. Try again.' }, { status: 502 });
  }
}
