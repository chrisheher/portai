// src/app/api/chat/tools/analyzeJob.ts
import { tool } from "ai";
import { z } from "zod";
import Anthropic from '@anthropic-ai/sdk';
import portfolioConfig from '@/lib/portfolio-config.json';

function loadLinkedInProfile(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path') as typeof import('path');
    return fs.readFileSync(
      path.join(process.cwd(), 'christopher_heher_linkedin.md'),
      'utf-8'
    );
  } catch {
    console.error('⚠️  christopher_heher_linkedin.md not found');
    return '';
  }
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface KeywordMatches {
  critical: string[];
  recommended: string[];
  categories: {
    core: string[];
    technical: string[];
    marketing: string[];
    soft: string[];
    industry: string[];
    tools: string[];
  };
  jobKeywords: string[];
  synonymMatches: Array<{ jobTerm: string; portfolioTerm: string }>;
}

function isURL(text: string): boolean {
  try {
    const url = new URL(text.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function extractMatchingKeywords(
  jobText: string,
  portfolioKeywords: typeof portfolioConfig.ATSKeywords
): KeywordMatches {
  const matches: KeywordMatches = {
    critical: [],
    recommended: [],
    categories: { core: [], technical: [], marketing: [], soft: [], industry: [], tools: [] },
    jobKeywords: [],
    synonymMatches: []
  };

  const jobKeywordPatterns = [
    /\b(api|sdk|saas|b2b|ai|ml|devops|cloud|react|python|javascript|typescript|cms|automation)\b/gi,
    /\b(content\s+(?:strategy|marketing|writer|engineer)|technical\s+writing|developer\s+relations|product\s+marketing|brand\s+voice|thought\s+leadership)\b/gi,
    /\b(leadership|collaboration|cross-functional|stakeholder|strategic|communication|storytelling)\b/gi,
    /\b(pipeline|campaign|launch|demand\s+generation|lead\s+generation|conversion|inbound)\b/gi,
  ];

  jobKeywordPatterns.forEach(pattern => {
    (jobText.match(pattern) || []).forEach(kw => {
      const normalized = kw.toLowerCase().trim();
      if (!matches.jobKeywords.includes(normalized)) matches.jobKeywords.push(normalized);
    });
  });

  const synonymMap: Record<string, string[]> = {
    'content strategy': ['content planning', 'content development', 'editorial strategy'],
    'technical writing': ['technical documentation', 'technical communication', 'tech writing'],
    'developer relations': ['devrel', 'developer advocacy', 'developer marketing'],
    'go-to-market': ['gtm', 'go to market', 'product launch'],
    'saas': ['software as a service', 'cloud software'],
    'b2b': ['business to business', 'enterprise'],
    'api': ['apis', 'rest api', 'api documentation'],
    'social media': ['social', 'social content', 'social marketing']
  };

  Object.entries(portfolioKeywords).forEach(([category, keywords]) => {
    if (!Array.isArray(keywords)) return;
    keywords.forEach((keyword: string) => {
      const keywordLower = keyword.toLowerCase();
      const escaped = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');

      if (regex.test(jobText)) {
        const key = category as keyof typeof matches.categories;
        if (matches.categories[key] && !matches.categories[key].includes(keyword)) {
          matches.categories[key].push(keyword);
        }
        const bucket = (category === 'core' || category === 'technical' || category === 'tools')
          ? 'critical' : 'recommended';
        if (!matches[bucket].includes(keyword)) matches[bucket].push(keyword);
      }

      (synonymMap[keywordLower] || []).forEach(synonym => {
        const sr = new RegExp(`\\b${synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (sr.test(jobText)) {
          matches.synonymMatches.push({ jobTerm: synonym, portfolioTerm: keyword });
          if (!matches.recommended.includes(keyword)) matches.recommended.push(keyword);
        }
      });
    });
  });

  return matches;
}

function fixMalformedJSON(jsonText: string): string {
  let fixed = jsonText.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
  if (!fixed.startsWith('{')) {
    const m = fixed.match(/\{[\s\S]*\}/);
    if (m) fixed = m[0];
  }
  if (fixed.endsWith(',')) fixed = fixed.slice(0, -1) + ']}';
  if (!fixed.endsWith('}')) {
    const open = (fixed.match(/\{/g) || []).length;
    const close = (fixed.match(/\}/g) || []).length;
    fixed += '}'.repeat(Math.max(0, open - close));
  }
  return fixed;
}

async function calculateMatchScore(
  keywordMatches: KeywordMatches,
  jobContent: string
): Promise<number> {
  const portfolioSummary = {
    roles: ((portfolioConfig as any).experience || []).map((e: any) => `${e.title} — ${e.company} (${e.duration})`),
    unique_strengths: portfolioConfig.unique_strengths,
    tools_and_platforms: (portfolioConfig as any).tools_and_platforms,
    devrel_expertise: (portfolioConfig as any).devrel_expertise?.overview,
    freelance_clients: ((portfolioConfig as any).experience?.[0]?.clients || []).map((c: any) => `${c.name}: ${c.deliverable}`),
    keyProjects: ((portfolioConfig as any).projects || []).slice(0, 12).map((p: any) => ({
      title: p.title,
      company: p.company,
      category: p.category,
      skill_tags: Array.isArray(p.skill_tags) ? p.skill_tags.slice(0, 6) : [],
      topImpact: Array.isArray(p.impact) ? p.impact[0] : ''
    })),
    matchedKeywords: keywordMatches.critical.slice(0, 20)
  };

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Score this candidate-job match on 5 dimensions (0–20 each). Return ONLY valid JSON, no commentary.

CANDIDATE: ${JSON.stringify(portfolioSummary)}
JOB (first 1500 chars): ${jobContent.slice(0, 1500)}

CALIBRATION: This is a senior candidate (15+ years) with a strong B2B tech content and DevRel track record. Score on a curve where 82–92 = strong fit worth advancing, 70–81 = reasonable fit with questions, below 70 = clear mismatch. Do not anchor to a theoretical perfect candidate. Do not penalize for gaps unless they are genuinely disqualifying — adjacent experience and transferable portfolio work count as coverage.

Score each dimension 0–20:

1. role_alignment — Does the candidate's title history, seniority, and scope match this role?
   20=strong match on title and scope | 17=adjacent title, same seniority | 13=transferable function, similar scope | 7=meaningful stretch | 0=clear mismatch

2. domain_coverage — Does the candidate's industry/domain background overlap with this role's domain?
   20=same or overlapping industry | 17=related tech/B2B space | 12=partial overlap | 5=tangential | 0=unrelated

3. skill_match — How completely do the candidate's demonstrated skills cover the required skills?
   20=all key skills demonstrated | 17=most covered, minor gaps | 12=core covered, 1–2 specialty gaps | 5=partial | 0=missing critical skills
   NOTE: only score below 12 if a required skill is genuinely absent with no transferable proxy.

4. impact_alignment — Do the candidate's proof points (pipeline, growth, engagement) match what this role values?
   20=metrics align directly | 17=similar KPI types and scale | 12=related outcomes, different framing | 5=soft evidence only | 0=no evidence

5. narrative_fit — How compellingly does the candidate's overall story, trajectory, and positioning match what this role is hiring for?
   20=the career arc leads directly here, story is obvious | 17=clear through-line with minor repositioning needed | 13=coherent case requires some framing work | 7=requires significant reframing | 0=no plausible narrative

Return exactly: {"role_alignment":<n>,"domain_coverage":<n>,"skill_match":<n>,"impact_alignment":<n>,"narrative_fit":<n>,"reasoning":"<one sentence on biggest strength and biggest gap>"}`
      }]
    });

    const text = response.content.find(c => c.type === 'text');
    if (!text || text.type !== 'text') throw new Error('No text');
    const parsed = JSON.parse(fixMalformedJSON(text.text.trim()));
    const total = (parsed.role_alignment || 0) + (parsed.domain_coverage || 0) +
      (parsed.skill_match || 0) + (parsed.impact_alignment || 0) + (parsed.narrative_fit || 0);
    // Apply remote/startup bonus before capping
    let adjusted = total;
    const jobLower = jobContent.toLowerCase();
    if (jobLower.includes('remote')) adjusted += 5;
    if (jobLower.includes('startup') && jobLower.includes('series')) adjusted += 5;
    const score = Math.max(15, Math.min(97, adjusted));
    console.error(`📊 Rubric: role=${parsed.role_alignment} domain=${parsed.domain_coverage} skill=${parsed.skill_match} impact=${parsed.impact_alignment} narrative=${parsed.narrative_fit} → ${score}% | ${parsed.reasoning}`);
    return score;
  } catch (err) {
    console.error('⚠️  Score failed:', err instanceof Error ? err.message : err);
    return Math.min(95, 40 + keywordMatches.critical.length * 3 + keywordMatches.recommended.length);
  }
}

async function analyzeJobDescription(jobContent: string): Promise<{ matchScore: number; resume: string; jobPhrases: string[]; matchSummary: string }> {
  console.error('\n🔥 === JOB ANALYSIS START ===');
  const start = Date.now();

  const keywordMatches = extractMatchingKeywords(jobContent, portfolioConfig.ATSKeywords);
  console.error(`   Keywords: ${keywordMatches.critical.length} critical, ${keywordMatches.recommended.length} recommended`);

  const matchScore = await calculateMatchScore(keywordMatches, jobContent);

  const portfolioForPrompt = {
    personal: portfolioConfig.personal,
    experience: (portfolioConfig as any).experience,
    unique_strengths: portfolioConfig.unique_strengths,
    projects: portfolioConfig.projects
  };

  const linkedIn = loadLinkedInProfile().slice(0, 3000);
  const truncatedJob = jobContent.slice(0, 2500);

  const resumePrompt = `Generate a tailored resume for Chris Heher for this job.

JOB DESCRIPTION:
${truncatedJob}

PORTFOLIO:
${JSON.stringify(portfolioForPrompt)}

LINKEDIN CONTEXT:
${linkedIn}

MATCHED KEYWORDS: ${keywordMatches.critical.slice(0, 20).join(', ')}

CALCULATED MATCH SCORE: ${matchScore}% — your MATCH: line must reference this exact number.

RULES:
1. Use the exact job title from the posting verbatim in the headline.
2. Weave 5–7 exact phrases from the job description into bullets word-for-word.
3. Include ATS keywords in the headline skills, bullets, and Skills section.
4. Skills: 15–25 hard skills only, comma-separated. No soft skills.
5. Every bullet ends with a metric (e.g. — $1.8M pipeline, 72% increase).

START your response with exactly these two lines, then a blank line:
PHRASES: [phrase 1] || [phrase 2] || [phrase 3] || [phrase 4] || [phrase 5] || [phrase 6] || [phrase 7] || [phrase 8]
MATCH: [Start with "${matchScore}% match." then 50–100 words explaining why — name the 2–3 strongest alignment points and any meaningful gaps, using specific evidence from the portfolio and specific requirements from the job. Be direct, not promotional.]

FORMAT:

PHRASES: [phrase 1] || [phrase 2] || ...
MATCH: [50–100 word match explanation]


[Exact Job Title]
[Skill 1] | [Skill 2] | [Skill 3] | [Skill 4]
chrisheher@gmail.com | Jersey City, NJ | portai.app

---

SUMMARY
I am what AI ain't. [Then 2–3 sentences making the logical case for why Chris is the right fit for this specific role — use exact phrases from the job description, ground every claim in a real project and metric, and speak directly to what the hiring manager actually needs. Do not hedge. Do not list skills. Make the argument.]

---

EXPERIENCE

Freelance Content Marketer | Independent | 01/2025–Present
• [bullet with exact phrase from job] — [metric]
• [bullet] — [metric]

Technical Content Strategist | Sentry | 2020–2022
• [bullet with exact phrase from job] — [metric]
• [bullet] — [metric]
• [bullet] — [metric]

Senior Content Strategist | DroneDeploy | 2022–2023
• [bullet with exact phrase from job] — [metric]
• [bullet] — [metric]

[Add 1–2 earlier roles if relevant: Ceros, Airbnb, HP, TBWA, Momentum, 360i, Razorfish]

---

SKILLS
[15–25 hard skills, comma-separated]

No other commentary.`;

  let apiResponse;
  try {
    apiResponse = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1800,
      messages: [{ role: 'user', content: resumePrompt }]
    });
    console.error('📝 Resume model: opus');
  } catch (err: any) {
    if (err?.status === 529 || err?.status === 503) {
      console.error('⚠️ Opus overloaded, falling back to sonnet...');
      apiResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1800,
        messages: [{ role: 'user', content: resumePrompt }]
      });
      console.error('📝 Resume model: sonnet (fallback)');
    } else {
      throw err;
    }
  }

  const textContent = apiResponse.content.find(c => c.type === 'text');
  const raw = textContent?.type === 'text' ? textContent.text.trim() : '';

  const phrasesMatch = raw.match(/^PHRASES:\s*(.+)$/m);
  const jobPhrases = phrasesMatch
    ? phrasesMatch[1].split('||').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const matchMatch = raw.match(/^MATCH:\s*(.+)$/m);
  const matchSummary = matchMatch ? matchMatch[1].trim() : '';

  const resume = raw
    .replace(/^PHRASES:.*$/m, '')
    .replace(/^MATCH:.*$/m, '')
    .replace(/^\n+/, '')
    .trim();

  console.error(`✅ COMPLETE: ${Date.now() - start}ms | score: ${matchScore} | phrases: ${jobPhrases.length}`);
  return { matchScore, resume, jobPhrases, matchSummary };
}

export const analyzeJob = tool({
  description: 'Analyze a job description and generate a tailored resume for Chris Heher',
  inputSchema: z.object({
    jobDescription: z.string().describe('The job description text'),
  }),
  execute: async ({ jobDescription }) => {
    try {
      if (!jobDescription?.trim()) throw new Error('Job description required');
      const jobContent = jobDescription.trim();

      if (isURL(jobContent)) {
        return { matchScore: 0, resume: "Can't access URLs — please paste the job description text.", jobPhrases: [], matchSummary: '' };
      }

      return await analyzeJobDescription(jobContent);
    } catch (error) {
      console.error('❌ Tool error:', error instanceof Error ? error.message : error);
      return { matchScore: 0, resume: 'Analysis failed — please try again.', jobPhrases: [], matchSummary: '' };
    }
  }
});
