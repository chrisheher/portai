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

interface ResumeEntry {
  competency: string;
  title: string;
  blurb: string;
  url?: string;
}

interface FitSection {
  jobTitle: string;
  company: string;
  competencies: string[];
  projects: ResumeEntry[];
}

interface ExperienceRole {
  title: string;
  company: string;
  duration: string;
  industryLabel?: string;
  industry?: string;
  outputs?: string[];
  projects: ResumeEntry[];
}

interface ProjectPick {
  competency: string;
  title: string;
}

interface RolePick extends ProjectPick {
  role: string;
}

interface ScoreResult {
  score: number;
  verdict: 'APPLY' | 'CONSIDER' | 'SKIP';
  keyStrength: string;
  dealBreaker: string;
  jobSkills: string[];
  topCompetencies: string[];
  jobTitle: string;
  jobCompany: string;
  projectPicks: ProjectPick[];
  rolePicks: RolePick[];
  unattributedPicks: ProjectPick[];
}

interface PortfolioProject {
  title: string;
  company: string;
  industry: string;
  slug?: string;
  competencies: string[];
  resumeBlurb?: string;
  campaignListDescription?: string;
  skill_tags?: string[];
  impact?: string[];
  links?: Array<{ name: string; url: string }>;
}

interface PortfolioRole {
  title: string;
  company: string;
  duration: string;
  industryLabel?: string;
  industry?: string;
  outputs?: string[];
  portfolioProjects?: string[];
}

const PROJECTS: PortfolioProject[] = (portfolioConfig as any).projects || [];
const COMPETENCIES: string[] = (portfolioConfig as any).competencies || [];
const ROLES: PortfolioRole[] = (portfolioConfig as any).experience || [];
// Projects not listed under any role's portfolioProjects.
const UNATTRIBUTED: PortfolioProject[] = PROJECTS.filter(
  p => !ROLES.some(r => r.portfolioProjects?.includes(p.title))
);

const canonical = (c: string) => COMPETENCIES.find(v => v.toLowerCase() === c.trim().toLowerCase());

// Projects without a resumeBlurb get a resume-length stand-in: the first two
// sentences of their description plus up to two impact lines.
function fallbackBlurb(p: PortfolioProject): string {
  const sentences = (p.campaignListDescription || '').replace(/<br\s*\/?>/gi, ' ').match(/[^.!?]+[.!?]+(\s|$)/g) || [];
  const lead = sentences.slice(0, 2).join('').trim() || p.title;
  const impact = (p.impact || []).slice(0, 2);
  return impact.length ? `${lead} Impact: ${impact.join('; ')}.` : lead;
}

function toEntry(p: PortfolioProject, competency: string): ResumeEntry {
  return {
    competency,
    title: p.title,
    blurb: p.resumeBlurb || fallbackBlurb(p),
    url: p.slug ? `https://onlychr.is/?show=${p.slug}` : undefined,
  };
}

function skillOverlap(p: PortfolioProject, jobLower: string): number {
  return (p.skill_tags || []).filter(t => jobLower.includes(t.toLowerCase())).length;
}

// Used when the model returns fewer than 3 usable competencies (or scoring failed):
// rank labels by how strongly the projects carrying them overlap the job's wording.
function fillCompetencies(fromModel: string[], jobLower: string): string[] {
  const chosen: string[] = [];
  for (const c of fromModel) {
    const v = canonical(c);
    if (v && !chosen.includes(v)) chosen.push(v);
  }
  if (chosen.length >= 3) return chosen.slice(0, 3);

  const weight = new Map<string, number>();
  for (const p of PROJECTS) {
    const n = skillOverlap(p, jobLower);
    for (const c of p.competencies || []) weight.set(c, (weight.get(c) ?? 0) + n);
  }
  const ranked = COMPETENCIES.filter(c => !chosen.includes(c)).sort((a, b) => (weight.get(b) ?? 0) - (weight.get(a) ?? 0));
  return [...chosen, ...ranked].slice(0, 3);
}

// Pick one project per competency from `pool`. The model's pick counts only if the
// project carries that label in portfolio-config.json; otherwise take the labeled
// project in the pool whose skill tags overlap the job most (requiring some overlap
// when `requireOverlap` is set).
function pickPerCompetency(
  pool: PortfolioProject[],
  competencies: string[],
  picks: ProjectPick[],
  jobLower: string,
  requireOverlap: boolean,
): ResumeEntry[] {
  const used = new Set<string>();
  const result: ResumeEntry[] = [];

  for (const competency of competencies) {
    const labeled = pool.filter(p => p.competencies?.includes(competency) && !used.has(p.title));
    const pick = picks.find(pk => canonical(pk.competency) === competency && labeled.some(p => p.title === pk.title));
    let project = pick && labeled.find(p => p.title === pick.title);

    if (!project) {
      const best = labeled.map(p => ({ p, n: skillOverlap(p, jobLower) })).sort((a, b) => b.n - a.n)[0];
      if (best && (!requireOverlap || best.n > 0)) project = best.p;
    }

    if (project) {
      used.add(project.title);
      result.push(toEntry(project, competency));
    }
  }
  return result;
}

// Fit section: the role's 3 core competencies, each proven by one project.
function buildFit(competencies: string[], picks: ProjectPick[], jobLower: string, jobTitle: string, company: string): FitSection {
  return {
    jobTitle,
    company,
    competencies,
    projects: pickPerCompetency(PROJECTS, competencies, picks, jobLower, true),
  };
}

// Experience section: every role from the resume, with up to 3 of its own projects.
// Every entry is headed by one of the 3 fit competencies (the chips beside the match
// score). One project per competency first; if that yields fewer than 2, a second
// project may share a competency. Roles with no project carrying any of the 3 labels
// show fewer entries rather than off-label ones.
function buildExperience(competencies: string[], picks: RolePick[], jobLower: string): ExperienceRole[] {
  return ROLES.map(role => {
    const pool = PROJECTS.filter(p => role.portfolioProjects?.includes(p.title));
    const rolePicks = picks.filter(pk => pk.role.trim().toLowerCase() === role.company.toLowerCase());
    const entries = pickPerCompetency(pool, competencies, rolePicks, jobLower, false);

    if (entries.length < 2) {
      const used = new Set(entries.map(e => e.title));
      const onLabel = (c: string | undefined) => !!c && competencies.includes(c);
      const modelExtras = rolePicks
        .map(pk => ({ p: pool.find(p => p.title === pk.title), competency: canonical(pk.competency) }))
        .filter(({ p, competency }) => p && !used.has(p.title) && onLabel(competency) && p.competencies.includes(competency!))
        .map(({ p, competency }) => ({ p: p!, competency: competency! }));
      const ranked = pool
        .filter(p => !used.has(p.title) && !modelExtras.some(x => x.p.title === p.title))
        .sort((a, b) => skillOverlap(b, jobLower) - skillOverlap(a, jobLower))
        .map(p => ({ p, competency: competencies.find(c => p.competencies.includes(c)) }));
      for (const { p, competency } of [...modelExtras, ...ranked]) {
        if (entries.length >= 2) break;
        if (!competency || used.has(p.title)) continue;
        used.add(p.title);
        entries.push(toEntry(p, competency));
      }
    }

    return {
      title: role.title,
      company: role.company,
      duration: role.duration,
      industryLabel: role.industryLabel,
      industry: role.industry,
      outputs: role.outputs,
      projects: entries.slice(0, 3),
    };
  });
}

// Unattributed projects that still prove one of the fit competencies. Uses the
// model's picks when scoring succeeded; otherwise any unattributed project labeled
// with a fit competency whose skill tags overlap the job. Skips projects already
// shown in the fit section.
function buildUnattributed(
  competencies: string[],
  picks: ProjectPick[],
  jobLower: string,
  shown: Set<string>,
  modelSucceeded: boolean,
): ResumeEntry[] {
  const result: ResumeEntry[] = [];
  const add = (p: PortfolioProject, competency: string) => {
    if (result.length >= 3 || shown.has(p.title) || result.some(e => e.title === p.title)) return;
    result.push(toEntry(p, competency));
  };

  if (modelSucceeded) {
    for (const pk of picks) {
      const p = UNATTRIBUTED.find(x => x.title === pk.title);
      const competency = canonical(pk.competency);
      if (p && competency && competencies.includes(competency) && p.competencies.includes(competency)) add(p, competency);
    }
    return result;
  }

  UNATTRIBUTED
    .map(p => ({ p, n: skillOverlap(p, jobLower), competency: competencies.find(c => p.competencies.includes(c)) }))
    .filter(x => x.competency && x.n > 0)
    .sort((a, b) => b.n - a.n)
    .forEach(x => add(x.p, x.competency!));
  return result;
}

async function calculateMatchScore(
  keywordMatches: KeywordMatches,
  jobContent: string
): Promise<ScoreResult> {
  const portfolioSummary = {
    roles: ROLES.map(r => ({ role: `${r.title} — ${r.company} (${r.duration})`, company: r.company, projects: r.portfolioProjects || [] })),
    unique_strengths: portfolioConfig.unique_strengths,
    tools_and_platforms: (portfolioConfig as any).tools_and_platforms,
    devrel_expertise: (portfolioConfig as any).devrel_expertise?.overview,
    freelance_clients: ((portfolioConfig as any).experience?.[0]?.clients || []).map((c: any) => `${c.name}: ${c.deliverable}`),
    unattributedProjects: UNATTRIBUTED.map(p => p.title),
    keyProjects: PROJECTS.map(p => ({
      title: p.title,
      company: p.company,
      industry: p.industry,
      competencies: p.competencies,
      skill_tags: Array.isArray(p.skill_tags) ? p.skill_tags.slice(0, 4) : [],
      topImpact: Array.isArray(p.impact) ? p.impact[0] : ''
    })),
    matchedKeywords: keywordMatches.critical.slice(0, 20)
  };

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1400,
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
- jobSkills: extract the top 8-10 terms from the JOB DESCRIPTION ONLY — these must come strictly from the JD text itself, never from the candidate's portfolio, fit, or what they bring. Use verbatim phrases from the requirements/qualifications section, not paraphrased. Include hard skills, tools, domain experience, and any explicitly required competencies. Omit soft skills like "communication" or "teamwork" unless they are unusually specific. Return exactly 8-10 items, ranked by importance to the role.
- topCompetencies: exactly 3 labels naming the role's core responsibilities that the candidate demonstrably covers, ranked by how central they are to the role. Choose ONLY from this list, copied verbatim: ${JSON.stringify(COMPETENCIES)}. Map the JD's wording onto the list (e.g. "technical storytelling" or "product narratives" → "Product Storytelling"; "launches" or "GTM" → "Go-to-Market Strategy").
- projectPicks: for each topCompetency, the single project from CANDIDATE.keyProjects that best proves it for THIS role. The project's "competencies" array must contain that label; prefer projects whose industry or skill_tags match the JD. Use the project title verbatim. Use a different project for each competency. If no labeled project genuinely demonstrates what the role asks for under that competency, omit that pick — do not pad.
- rolePicks: for EACH entry in CANDIDATE.roles, pick 2–3 projects from that role's own "projects" list (titles verbatim) that best show this job's topCompetencies, one per competency where the role has a project labeled with it. Every pick's competency MUST be one of the 3 topCompetencies; if fewer than 2 competencies have a match, a second project may share a competency. Never use a label outside topCompetencies. Set "role" to the role's "company" value verbatim. A role with an empty projects list gets no picks. Projects may repeat from projectPicks.
- unattributedPicks: from CANDIDATE.unattributedProjects ONLY (projects not tied to a role), up to 3 that genuinely demonstrate one of this job's topCompetencies. The project's "competencies" array must contain that label. Return [] if none are truly relevant — do not pad.
- jobTitle and jobCompany: the position title and hiring company as written in the JD ("" if not stated).

Return exactly: {"role_alignment":<n>,"domain_coverage":<n>,"skill_match":<n>,"impact_alignment":<n>,"narrative_fit":<n>,"verdict":"APPLY|CONSIDER|SKIP","keyStrength":"<specific>","dealBreaker":"<specific or None identified>","jobSkills":["<skill>","<skill>",...],"topCompetencies":["<label>","<label>","<label>"],"projectPicks":[{"competency":"<label>","title":"<project title>"},...],"rolePicks":[{"role":"<company>","competency":"<label>","title":"<project title>"},...],"unattributedPicks":[{"competency":"<label>","title":"<project title>"},...],"jobTitle":"<title>","jobCompany":"<company>"}`
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
    const jobSkills: string[] = Array.isArray(parsed.jobSkills) ? parsed.jobSkills.slice(0, 10) : [];
    const topCompetencies: string[] = Array.isArray(parsed.topCompetencies) ? parsed.topCompetencies.slice(0, 3) : [];
    const projectPicks: ProjectPick[] = Array.isArray(parsed.projectPicks)
      ? parsed.projectPicks.filter((p: any) => typeof p?.competency === 'string' && typeof p?.title === 'string')
      : [];
    const rolePicks: RolePick[] = Array.isArray(parsed.rolePicks)
      ? parsed.rolePicks.filter((p: any) => typeof p?.role === 'string' && typeof p?.competency === 'string' && typeof p?.title === 'string')
      : [];
    const unattributedPicks: ProjectPick[] = Array.isArray(parsed.unattributedPicks)
      ? parsed.unattributedPicks.filter((p: any) => typeof p?.competency === 'string' && typeof p?.title === 'string')
      : [];
    const jobTitle: string = typeof parsed.jobTitle === 'string' ? parsed.jobTitle : '';
    const jobCompany: string = typeof parsed.jobCompany === 'string' ? parsed.jobCompany : '';
    console.error(`📊 Rubric: role=${parsed.role_alignment} domain=${parsed.domain_coverage} skill=${parsed.skill_match} impact=${parsed.impact_alignment} narrative=${parsed.narrative_fit} → ${score}% [${verdict}]`);
    console.error(`   ✅ ${keyStrength}`);
    console.error(`   ⚠️  ${dealBreaker}`);
    console.error(`   🔑 Skills: ${jobSkills.join(', ')}`);
    console.error(`   🏅 Competencies: ${topCompetencies.join(', ')}`);
    return { score, verdict, keyStrength, dealBreaker, jobSkills, topCompetencies, jobTitle, jobCompany, projectPicks, rolePicks, unattributedPicks };
  } catch (err) {
    console.error('⚠️  Score failed:', err instanceof Error ? err.message : err);
    const score = Math.min(95, 40 + keywordMatches.critical.length * 3 + keywordMatches.recommended.length);
    return { score, verdict: 'CONSIDER', keyStrength: '', dealBreaker: '', jobSkills: [], topCompetencies: [], jobTitle: '', jobCompany: '', projectPicks: [], rolePicks: [], unattributedPicks: [] };
  }
}

async function analyzeJobDescription(jobContent: string): Promise<{ matchScore: number; verdict: string; keyStrength: string; dealBreaker: string; topCompetencies: string[]; jobSkills: string[]; fit: FitSection; experience: ExperienceRole[]; unattributed: ResumeEntry[] }> {
  console.error('\n🔥 === JOB ANALYSIS START ===');
  const start = Date.now();

  const keywordMatches = extractMatchingKeywords(jobContent, portfolioConfig.ATSKeywords);

  const { score: matchScore, verdict, keyStrength, dealBreaker, topCompetencies: modelCompetencies, jobSkills, jobTitle, jobCompany, projectPicks, rolePicks, unattributedPicks } =
    await calculateMatchScore(keywordMatches, jobContent);

  const jobLower = jobContent.toLowerCase();
  const topCompetencies = fillCompetencies(modelCompetencies, jobLower);
  const fit = buildFit(topCompetencies, projectPicks, jobLower, jobTitle, jobCompany);
  const experience = buildExperience(topCompetencies, rolePicks, jobLower);
  const fitTitles = new Set(fit.projects.map(p => p.title));
  const unattributed = buildUnattributed(topCompetencies, unattributedPicks, jobLower, fitTitles, modelCompetencies.length > 0);

  console.error(`✅ COMPLETE: ${Date.now() - start}ms | score: ${matchScore} [${verdict}] | fit: ${fit.projects.map(p => `${p.competency} → ${p.title}`).join(', ')}`);
  for (const r of experience) console.error(`   ${r.company}: ${r.projects.map(p => `${p.competency} → ${p.title}`).join(', ') || '(none)'}`);
  console.error(`   unattributed: ${unattributed.map(p => `${p.competency} → ${p.title}`).join(', ') || '(none)'}`);
  return { matchScore, verdict, keyStrength, dealBreaker, topCompetencies, jobSkills, fit, experience, unattributed };
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
        return { matchScore: 0, verdict: 'SKIP', keyStrength: '', dealBreaker: "Can't access URLs — please paste the job description text.", topProjects: [] };
      }

      return await analyzeJobDescription(jobContent);
    } catch (error) {
      console.error('❌ Tool error:', error instanceof Error ? error.message : error);
      return { matchScore: 0, verdict: 'SKIP', keyStrength: '', dealBreaker: 'Analysis failed — please try again.', topProjects: [] };
    }
  }
});
