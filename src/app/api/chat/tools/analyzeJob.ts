// src/app/api/chat/tools/analyzeJob.ts
import { tool } from "ai";
import { z } from "zod";
import Anthropic from '@anthropic-ai/sdk';
import portfolioConfig from '@/lib/portfolio-config.json';
import { FLUENCIES, FLUENCY_SYNONYMS, type Fluency } from '@/lib/resume-data';

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

function matchFluencies(jobText: string): { direct: Fluency[]; synonym: Fluency[] } {
  const direct: Fluency[] = [];
  const synonym: Fluency[] = [];

  for (const fluency of FLUENCIES) {
    const escaped = fluency.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(jobText)) {
      direct.push(fluency);
      continue;
    }
    const synonyms = FLUENCY_SYNONYMS[fluency] ?? [];
    const hitsSynonym = synonyms.some(s =>
      new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(jobText)
    );
    if (hitsSynonym) synonym.push(fluency);
  }

  return { direct, synonym };
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

interface PortfolioLink {
  name: string;
  url: string;
  category: string;
}

interface ScoreResult {
  score: number;
  verdict: 'APPLY' | 'CONSIDER' | 'SKIP';
  keyStrength: string;
  dealBreaker: string;
  jobSkills: string[];
}

function matchPortfolioLinks(jobContent: string): PortfolioLink[] {
  const jobLower = jobContent.toLowerCase();
  const seen = new Set<string>();
  const results: PortfolioLink[] = [];

  for (const [category, data] of Object.entries((portfolioConfig as any).categoryMappings || {})) {
    const { keywords, links } = data as { keywords: string[]; links: Array<{ name: string; url: string }> };
    const matched = keywords.some(kw => jobLower.includes(kw.toLowerCase()));
    if (!matched || !links?.length) continue;

    for (const link of links.slice(0, 2)) {
      if (!seen.has(link.url)) {
        seen.add(link.url);
        results.push({ ...link, category });
      }
    }
    if (results.length >= 10) break;
  }

  return results;
}

async function calculateMatchScore(
  keywordMatches: KeywordMatches,
  jobContent: string
): Promise<ScoreResult> {
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
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Score this candidate-job match on 5 dimensions (0–20 each). Return ONLY valid JSON, no commentary.

CANDIDATE: ${JSON.stringify(portfolioSummary)}
JOB: ${jobContent.slice(0, 2500)}

CALIBRATION: This is a senior candidate (15+ years) with a strong B2B tech content and DevRel track record. A well-matched senior candidate applying to a role they have essentially done before should score 85–92. Your baseline for each dimension is 17 — only deduct if you can name a specific, concrete gap. Vague uncertainty is not a reason to deduct. Do not compare against a hypothetical perfect candidate. Adjacent experience and transferable work count as full coverage.

Score each dimension 0–20. Start at 17 and deduct only for named, specific deficiencies:

1. role_alignment — Does the candidate's title history, seniority, and scope match this role?
   20=identical scope and seniority | 17=same function, equivalent seniority (DEFAULT for senior candidates matching their core function) | 13=adjacent function or one level off | 7=meaningful stretch requiring significant repositioning | 0=clear mismatch

2. domain_coverage — Does the candidate's industry/domain background overlap with this role's domain?
   20=same industry | 17=B2B tech or adjacent (DEFAULT — most B2B tech roles qualify) | 13=partial overlap | 7=tangential | 0=unrelated

3. skill_match — How completely do the candidate's demonstrated skills cover the required skills?
   20=all key skills demonstrated | 17=core skills demonstrated, minor or no gaps (DEFAULT unless a required skill is genuinely absent) | 13=1–2 real gaps in required skills | 7=multiple genuine gaps | 0=missing critical required skills
   RULE: Only score below 15 if a required skill is specifically named in the JD AND absent from the portfolio with no transferable proxy.

4. impact_alignment — Do the candidate's proof points match what this role values?
   20=metrics align directly (pipeline, ARR, growth) | 17=same KPI type and scale (DEFAULT for candidates with quantified B2B outcomes) | 13=related outcomes in different framing | 7=soft evidence only | 0=no evidence

5. narrative_fit — How compellingly does the career arc lead here?
   20=arc leads directly here, story is obvious | 17=clear through-line, minor repositioning (DEFAULT for candidates whose last 2 roles map to this one) | 13=coherent case with framing work needed | 7=significant reframing required | 0=no plausible narrative

Then assign a verdict:
- "APPLY" if: total ≥ 80 OR (total ≥ 72 AND no hard requirement is genuinely missing)
- "CONSIDER" if: total 62–79 with workable gaps
- "SKIP" if: total < 62 OR a hard non-negotiable requirement is absent

Identify:
- keyStrength: the single most compelling alignment point (specific, not generic — name the project or metric)
- dealBreaker: the single most important gap or risk — if none exists, say "None identified"
- jobSkills: extract the exact skill requirements from the JD as a flat array — use the verbatim phrases from the requirements/qualifications section, not paraphrased. Include hard skills, tools, domain experience, and any explicitly required competencies. Omit soft skills like "communication" or "teamwork" unless they are unusually specific.

Return exactly: {"role_alignment":<n>,"domain_coverage":<n>,"skill_match":<n>,"impact_alignment":<n>,"narrative_fit":<n>,"verdict":"APPLY|CONSIDER|SKIP","keyStrength":"<specific>","dealBreaker":"<specific or None identified>","jobSkills":["<skill>","<skill>",...]}`
      }]
    });

    const text = response.content.find(c => c.type === 'text');
    if (!text || text.type !== 'text') throw new Error('No text');
    const parsed = JSON.parse(fixMalformedJSON(text.text.trim()));
    const total = (parsed.role_alignment || 0) + (parsed.domain_coverage || 0) +
      (parsed.skill_match || 0) + (parsed.impact_alignment || 0) + (parsed.narrative_fit || 0);
    let adjusted = total;
    const jobLower = jobContent.toLowerCase();
    if (jobLower.includes('remote')) adjusted += 5;
    if (jobLower.includes('startup') && jobLower.includes('series')) adjusted += 5;
    const score = Math.max(15, Math.min(97, adjusted));
    const verdict: 'APPLY' | 'CONSIDER' | 'SKIP' = parsed.verdict || (score >= 82 ? 'APPLY' : score >= 62 ? 'CONSIDER' : 'SKIP');
    const keyStrength: string = parsed.keyStrength || '';
    const dealBreaker: string = parsed.dealBreaker || '';
    const jobSkills: string[] = Array.isArray(parsed.jobSkills) ? parsed.jobSkills : [];
    console.error(`📊 Rubric: role=${parsed.role_alignment} domain=${parsed.domain_coverage} skill=${parsed.skill_match} impact=${parsed.impact_alignment} narrative=${parsed.narrative_fit} → ${score}% [${verdict}]`);
    console.error(`   ✅ ${keyStrength}`);
    console.error(`   ⚠️  ${dealBreaker}`);
    console.error(`   🔑 Skills: ${jobSkills.join(', ')}`);
    return { score, verdict, keyStrength, dealBreaker, jobSkills };
  } catch (err) {
    console.error('⚠️  Score failed:', err instanceof Error ? err.message : err);
    const score = Math.min(95, 40 + keywordMatches.critical.length * 3 + keywordMatches.recommended.length);
    return { score, verdict: 'CONSIDER', keyStrength: '', dealBreaker: '', jobSkills: [] };
  }
}

async function analyzeJobDescription(jobContent: string): Promise<{ matchScore: number; verdict: string; keyStrength: string; dealBreaker: string; jobSkills: string[]; portfolioLinks: PortfolioLink[] }> {
  console.error('\n🔥 === JOB ANALYSIS START ===');
  const start = Date.now();

  const keywordMatches = extractMatchingKeywords(jobContent, portfolioConfig.ATSKeywords);
  console.error(`   Keywords: ${keywordMatches.critical.length} critical, ${keywordMatches.recommended.length} recommended`);

  const [{ score: matchScore, verdict, keyStrength, dealBreaker, jobSkills }, portfolioLinks] = await Promise.all([
    calculateMatchScore(keywordMatches, jobContent),
    Promise.resolve(matchPortfolioLinks(jobContent)),
  ]);

  console.error(`✅ COMPLETE: ${Date.now() - start}ms | score: ${matchScore} [${verdict}] | skills: ${jobSkills.length} | links: ${portfolioLinks.length}`);
  return { matchScore, verdict, keyStrength, dealBreaker, jobSkills, portfolioLinks };
}

export const analyzeJob = tool({
  description: 'Analyze a job description — returns match score, verdict, and exact skills required',
  inputSchema: z.object({
    jobDescription: z.string().describe('The job description text'),
  }),
  execute: async ({ jobDescription }) => {
    try {
      if (!jobDescription?.trim()) throw new Error('Job description required');
      const jobContent = jobDescription.trim();

      if (isURL(jobContent)) {
        return { matchScore: 0, verdict: 'SKIP', keyStrength: '', dealBreaker: "Can't access URLs — please paste the job description text.", jobSkills: [], portfolioLinks: [] };
      }

      return await analyzeJobDescription(jobContent);
    } catch (error) {
      console.error('❌ Tool error:', error instanceof Error ? error.message : error);
      return { matchScore: 0, verdict: 'SKIP', keyStrength: '', dealBreaker: 'Analysis failed — please try again.', jobSkills: [], portfolioLinks: [] };
    }
  }
});
