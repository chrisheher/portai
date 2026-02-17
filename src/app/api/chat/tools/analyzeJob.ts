// src/app/api/chat/tools/analyzeJob.ts - PRODUCTION VERSION (FIXED)
import { tool } from "ai";
import { z } from "zod";
import Anthropic from '@anthropic-ai/sdk';
import portfolioConfig from './portfolio-config-slim.json';
import { storeAnalysis } from '@/lib/db/shareableResults';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface JobAnalysisResult {
  matchScore: number;
  strengths: Array<{
    category: string;
    match: string;
    evidence: string;
    confidence: 'high' | 'medium' | 'low';
    priorityNumber?: 1 | 2 | 3;
  }>;
  gaps: Array<{
    requirement: string;
    severity: 'critical' | 'moderate' | 'minor';
    suggestion: string;
  }>;
  standoutQualities: string[];
  atsKeywords?: {
    critical: string[];
    recommended: string[];
    phrasingsToUse: string[];
    jobKeywords?: string[];
    missingKeywords?: string[];
    atsOptimizationTips?: string[];
  };
  recommendations: {
    coverLetterFocus: string[];
    skillsToHighlight: string[];
    projectsToFeature: Array<string | { name: string; links?: Array<{ name: string; url: string }> }>;
    narrativeStrategy?: string;
    links?: Array<{ name: string; url: string }>;
    applicationPriority?: 'high' | 'medium' | 'low';
  };
  summary: string;
  shareableLink?: string;
}

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
  const jobLower = jobText.toLowerCase();
  
  const matches: KeywordMatches = {
    critical: [],
    recommended: [],
    categories: {
      core: [],
      technical: [],
      marketing: [],
      soft: [],
      industry: [],
      tools: []
    },
    jobKeywords: [],
    synonymMatches: []
  };
   
  // Extract raw keywords FROM the job description
  const jobKeywordPatterns = [
    // Technical terms
    /\b(api|sdk|saas|b2b|ai|ml|devops|cloud|react|python|javascript|typescript|cms|automation)\b/gi,
    // Role terms
    /\b(content\s+(?:strategy|marketing|writer|engineer)|technical\s+writing|developer\s+relations|product\s+marketing|brand\s+voice|thought\s+leadership)\b/gi,
    // Soft skills
    /\b(leadership|collaboration|cross-functional|stakeholder|strategic|communication|storytelling)\b/gi,
    // Marketing terms
    /\b(pipeline|campaign|launch|demand\s+generation|lead\s+generation|conversion|inbound)\b/gi,
  ];

  jobKeywordPatterns.forEach(pattern => {
    const found = jobText.match(pattern) || [];
    found.forEach(kw => {
      const normalized = kw.toLowerCase().trim();
      if (!matches.jobKeywords.includes(normalized)) {
        matches.jobKeywords.push(normalized);
      }
    });
  });

  // Synonym mapping for better ATS matching
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

  // Match against portfolio keywords
  Object.entries(portfolioKeywords).forEach(([category, keywords]) => {
    if (!Array.isArray(keywords)) return;

    keywords.forEach((keyword: string) => {
      const keywordLower = keyword.toLowerCase();

      // Create regex pattern that handles word boundaries and special chars
      const escapedKeyword = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');

      // Direct match
      if (regex.test(jobText)) {
        const categoryKey = category as keyof typeof matches.categories;

        // Only push if the category array exists
        if (matches.categories[categoryKey]) {
          if (!matches.categories[categoryKey].includes(keyword)) {
            matches.categories[categoryKey].push(keyword);
          }
        }

        // Determine criticality based on category and tools
        if (category === 'core' || category === 'technical' || category === 'tools') {
          if (!matches.critical.includes(keyword)) {
            matches.critical.push(keyword);
          }
        } else {
          if (!matches.recommended.includes(keyword)) {
            matches.recommended.push(keyword);
          }
        }
      }

      // Check for synonym matches
      const synonyms = synonymMap[keywordLower] || [];
      synonyms.forEach(synonym => {
        const synonymRegex = new RegExp(`\\b${synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (synonymRegex.test(jobText)) {
          matches.synonymMatches.push({
            jobTerm: synonym,
            portfolioTerm: keyword
          });

          // Add to recommended if synonym matched
          if (!matches.recommended.includes(keyword)) {
            matches.recommended.push(keyword);
          }
        }
      });
    });
  });

  return matches;
}

function enrichProjectsWithLinks(
  projectNames: string[]
): Array<{ name: string; links?: Array<{ name: string; url: string }> }> {
  // Guard against undefined/null input
  if (!projectNames || !Array.isArray(projectNames)) {
    console.error('⚠️ enrichProjectsWithLinks received invalid input:', projectNames);
    return [];
  }

  // Use the new projects array from portfolio config
  const allProjects = (portfolioConfig as any).projects || [];

  if (!allProjects || allProjects.length === 0) {
    console.error('⚠️ No projects found in portfolio config');
    return projectNames.map(name => ({ name }));
  }

  return projectNames.map(projectName => {
    if (!projectName || typeof projectName !== 'string') {
      return { name: String(projectName || 'Unknown') };
    }

    const projectLower = projectName.toLowerCase();

    const matchedProject = allProjects.find((p: any) => {
      if (!p.title) return false;
      const title = p.title.toLowerCase();
      const company = (p.company || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      const tagline = (p.tagline || '').toLowerCase();

      // Match by title, company, category, or tagline
      return title.includes(projectLower) ||
             projectLower.includes(title) ||
             (company && projectLower.includes(company)) ||
             (category && projectLower.includes(category)) ||
             (tagline && projectLower.includes(tagline));
    });

    console.error(`🔍 "${projectName}" → matched:`, matchedProject?.title || 'NONE');

    return {
      name: projectName,
      links: matchedProject?.links || undefined
    };
  });
}

/**
 * Calculate qualitative adjustments based on role fit factors
 */
function calculateQualitativeScore(jobContent: string): number {
  const jobLower = jobContent.toLowerCase();
  let score = 0;
  
  // Role level mismatch penalties/bonuses
  if (jobLower.includes('junior') || jobLower.includes('entry')) {
    score -= 0; // Too junior/overqualified
  } else if (jobLower.includes('senior') || jobLower.includes('lead')) {
    score += 0; // Sweet spot
  }
  
  // Red flags
  if (jobLower.includes('must have') && jobLower.includes('phd')) score -= 0;
  if (jobLower.includes('relocation required') && !jobLower.includes('remote')) score -=0;
  if (jobLower.includes('on-site only') || jobLower.includes('no remote')) score -= 0;
  if (jobLower.includes('frequent travel') && jobLower.includes('50%')) score -= 0;

  console.error(`🎨 Qualitative adjustments: ${score > 0 ? '+' : ''}${score}`);
  
  return score;
}

/**
 * Calculate match score based on content/marketing role fit
 */
function calculateMatchScore(
  keywordMatches: KeywordMatches,
  jobContent: string
): number {
  const weights = {
    coreSkills: 0.5,
    marketingSkills: 0.2,
    industryFit: 0.1,
    technicalFluency: 0.15,
    softSkills: 0.05
  };

  const jobLower = jobContent.toLowerCase();
  
  // Pull from config instead of hardcoding
  const coreSkillsNeeded = (portfolioConfig.ATSKeywords.core || []).map((k: string) => k.toLowerCase());
  const marketingSkills = ((portfolioConfig.ATSKeywords as any).marketing || []).map((k: string) => k.toLowerCase());
  const techTerms = (portfolioConfig.ATSKeywords.technical || []).map((k: string) => k.toLowerCase());
  const softSkills = (portfolioConfig.ATSKeywords.soft || []).map((k: string) => k.toLowerCase());
  
  // 1. Core Skills Score (0-100)
  const coreMatches = coreSkillsNeeded.filter((skill: string) => jobLower.includes(skill)).length;
  const coreScore = Math.min((coreMatches / 3) * 100, 100);

  // 2. Marketing Skills Score (0-100)
  const marketingMatches = marketingSkills.filter((skill: string) => jobLower.includes(skill)).length;
  const marketingScore = Math.min((marketingMatches / 3) * 100, 100);

  // 3. Industry Fit (0-100)
  let industryScore = 50;
  if (jobLower.includes('saas')) industryScore += 7;
  if (jobLower.includes('developer')) industryScore += 7;
  if (jobLower.includes('enterprise')) industryScore += 7;  
  if (jobLower.includes('advertising')) industryScore += 7;
  if (jobLower.includes('b2b')) industryScore += 7;
  industryScore = Math.min(industryScore, 100);

  // 4. Technical Fluency (0-100)
  const techMatches = techTerms.filter((term: string) => jobLower.includes(term)).length;
  const techScore = Math.min((techMatches / 3) * 100, 100);

  // 5. Soft Skills Score (0-100)
  const softMatches = softSkills.filter((skill: string) => jobLower.includes(skill)).length;
  const softScore = Math.min((softMatches / 3) * 100, 100);

  // Calculate weighted score
  const baseScore = Math.round(
    coreScore * weights.coreSkills +
    marketingScore * weights.marketingSkills +
    industryScore * weights.industryFit +
    techScore * weights.technicalFluency +
    softScore * weights.softSkills
  );

  // Experience level adjustment
  let experienceModifier = 0;
  if (jobLower.includes('senior') || jobLower.includes('lead')) {
    experienceModifier = 10;
  } else if (jobLower.includes('junior') || jobLower.includes('entry')) {
    experienceModifier = -10;
  }

  const qualitativeAdjustment = calculateQualitativeScore(jobContent);
  const finalScore = baseScore + experienceModifier + qualitativeAdjustment;
  
  console.error(`📊 Score breakdown:
    Core Skills: ${Math.round(coreScore * weights.coreSkills)} (${coreMatches}/${coreSkillsNeeded.length} matches)
    Marketing: ${Math.round(marketingScore * weights.marketingSkills)} (${marketingMatches}/${marketingSkills.length} matches)
    Industry: ${Math.round(industryScore * weights.industryFit)}
    Technical: ${Math.round(techScore * weights.technicalFluency)} (${techMatches}/${techTerms.length} matches)
    Soft Skills: ${Math.round(softScore * weights.softSkills)} (${softMatches}/${softSkills.length} matches)
    Experience mod: ${experienceModifier}
    Qualitative: ${qualitativeAdjustment}
    TOTAL: ${finalScore}`);

  return Math.max(15, Math.min(95, finalScore));
}

/**
 * Apply score modifiers based on gaps and special factors
 */
function applyScoreModifiers(
  baseScore: number,
  jobContent: string,
  gaps: JobAnalysisResult['gaps']
): number {
  let score = baseScore;
  
  // Penalties for gaps
  const criticalGaps = gaps.filter(g => g.severity === 'critical').length;
  score -= criticalGaps * 12;
  
  const moderateGaps = gaps.filter(g => g.severity === 'moderate').length;
  score -= moderateGaps * 2;
  
  // Bonuses for desirable attributes
  const jobLower = jobContent.toLowerCase();
  if (jobLower.includes('remote')) score += 5;
  if (jobLower.includes('flexible')) score += 3;
  if (jobLower.includes('startup') && jobLower.includes('series')) score += 5;
  
  // Years of experience alignment (portfolio shows 8 years)
 
  console.error(`🎯 Score modifiers:
    Critical gaps penalty: -${criticalGaps * 12}
    Moderate gaps penalty: -${moderateGaps * 5}
    Final adjusted score: ${Math.max(15, Math.min(95, score))}`);
  
  return Math.max(15, Math.min(95, score));
}

/**
 * Attempts to fix common JSON issues before parsing
 */
function fixMalformedJSON(jsonText: string): string {
  let fixed = jsonText;
  
  // Remove markdown code blocks
  fixed = fixed.replace(/```json\n?/gi, '').replace(/```\n?/g, '');
  
  // Trim whitespace
  fixed = fixed.trim();
  
  // Extract JSON if wrapped in text
  if (!fixed.startsWith('{')) {
    const jsonMatch = fixed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      fixed = jsonMatch[0];
    }
  }
  
  // Try to fix truncated JSON by adding closing brackets
  if (fixed.endsWith(',')) {
    fixed = fixed.slice(0, -1) + ']}';
  }
  if (!fixed.endsWith('}')) {
    const openBraces = (fixed.match(/\{/g) || []).length;
    const closeBraces = (fixed.match(/\}/g) || []).length;
    fixed += '}'.repeat(Math.max(0, openBraces - closeBraces));
  }
  
  return fixed;
}

/**
 * Generate a shareable link with database storage
 */
async function generateShareableLink(analysis: JobAnalysisResult): Promise<string> {
  try {
    const { shareableLink, ...cleanAnalysis } = analysis;
    
    // Store in database and get short ID
    const shortId = await storeAnalysis(cleanAnalysis);
    
    const baseUrl = process.env.NEXT_PUBLIC_URL || '';
    const link = `${baseUrl}/results/${shortId}`;
    
    console.error(`🔗 Generated SHORT link: ${link} (ID: ${shortId})`);
    return link;
  } catch (error) {
    console.error('❌ Error generating shareable link:', error);
    // Fallback to base64 if storage fails
    const { shareableLink, ...cleanAnalysis } = analysis;
    const analysisId = Buffer.from(
      JSON.stringify(cleanAnalysis)
    ).toString('base64url');
    return `${process.env.NEXT_PUBLIC_URL || ''}/results/${analysisId}`;
  }
}

async function analyzeJobDescription(jobContent: string): Promise<JobAnalysisResult> {
  try {
    console.error('\n🔥 === JOB ANALYSIS START ===');
    const totalStart = Date.now();
    
    // Step 1: Extract keywords
    const extractStart = Date.now();
    const keywordMatches = extractMatchingKeywords(jobContent, portfolioConfig.ATSKeywords);

    console.error(`⏱️  Keyword extraction: ${Date.now() - extractStart}ms`);
    console.error(`   Found: ${keywordMatches.critical.length} critical, ${keywordMatches.recommended.length} recommended`);
    console.error(`   Job keywords extracted: ${keywordMatches.jobKeywords.join(', ') || 'none'}`);
    console.error(`   Synonym matches: ${keywordMatches.synonymMatches.length}`);

    // Log the actual keywords
    console.error(`   Critical keywords: ${keywordMatches.critical.join(', ') || 'none'}`);
    console.error(`   Recommended keywords: ${keywordMatches.recommended.join(', ') || 'none'}`);
    console.error(`   By category:`);
    console.error(`     - Core: ${keywordMatches.categories.core.join(', ') || 'none'}`);
    console.error(`     - Technical: ${keywordMatches.categories.technical.join(', ') || 'none'}`);
    console.error(`     - Marketing: ${keywordMatches.categories.marketing.join(', ') || 'none'}`);
    console.error(`     - Soft: ${keywordMatches.categories.soft.join(', ') || 'none'}`);
    console.error(`     - Industry: ${keywordMatches.categories.industry.join(', ') || 'none'}`);
    console.error(`     - Tools: ${keywordMatches.categories.tools.join(', ') || 'none'}`);

    if (keywordMatches.synonymMatches.length > 0) {
      console.error(`   Synonym mappings:`);
      keywordMatches.synonymMatches.forEach(({ jobTerm, portfolioTerm }) => {
        console.error(`     "${jobTerm}" → "${portfolioTerm}"`);
      });
    }

    // Step 2: Calculate base match score
    const scoreStart = Date.now();
    const baseScore = calculateMatchScore(keywordMatches, jobContent);
    console.error(`⏱️  Score calculation: ${Date.now() - scoreStart}ms`);
    
    // Step 3: Truncate job description
    const maxJobLength = 3000;
    const truncatedJob = jobContent.length > maxJobLength
      ? jobContent.slice(0, maxJobLength) + '\n\n[truncated]'
      : jobContent;
    
    console.error(`📄 Job length: ${jobContent.length} chars (${truncatedJob.length} sent)`);
    
    // Step 4: Call API with calculated score
    const apiStart = Date.now();
    console.error('📤 Calling Claude API...');
    
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 2600,
      temperature: .9,
      system: [
        {
          type: "text",
      text: `Analyze jobs against this portfolio. IMPORTANT: Address the hiring manager/recruiter -- not the candidate/Chris -- frame blurbs by answering this question: what business problem did I solve and what measurable outcome came from it?

Portfolio:
${JSON.stringify(portfolioConfig, null, 2)}

TOP PRIORITIES IDENTIFICATION:
Before analyzing, identify the top 3 priorities/requirements from the job description by looking for:
1. Responsibilities mentioned first or emphasized in the job posting
2. Required qualifications vs. preferred qualifications (prioritize required)
3. Repeated themes or requirements mentioned multiple times
4. Key phrases like "primary focus," "core responsibility," "must have"

The first sentence of the "summary" field MUST state these three priorities clearly.
Example: "This position prioritizes: (1) GTM content strategy for SaaS products, (2) technical writing for developer audiences, and (3) cross-functional collaboration with product teams."

PROJECT-FOCUSED ANALYSIS:
The portfolio contains ${(portfolioConfig as any).projects?.length || 0} projects spanning GTM launches, developer content, employer branding, and technical writing. When making recommendations:

1. ALWAYS reference specific projects by name (e.g., "Sentry Performance GTM campaign", "DroneDeploy Safety AI", "Airbnb Career website")
2. For "projectsToFeature", select 2-4 projects that most closely align with the job requirements
3. Match projects based on:
   - Category alignment (GTM Launch, Developer Relations, Brand Voice, etc.)
   - Company type (SaaS, B2B, fintech, employer brand)
   - Technical domain (AI/ML, DevOps, cloud, etc.)
   - Impact metrics similar to job KPIs

Available projects with impact metrics:
${(portfolioConfig as any).projects?.map((p: any) => {
  const impacts = Array.isArray(p.impact) ? p.impact.join('; ') : '';
  return `- ${p.title} (${p.company}) - ${p.category} | Impact: ${impacts}`;
}).join('\n') || 'None'}

STRENGTHS SECTION - PRIORITY MAPPING:
The "strengths" array MUST map to the top 3 priorities identified from the job description. For each strength:
1. The "priorityNumber" MUST be 1, 2, or 3 — matching the exact priority number from your summary sentence
2. The "category" should reflect which priority it addresses
3. The "match" should quote the specific job requirement
4. The "evidence" MUST include:
   - Specific project name from portfolio
   - Quantified impact/metric from that project
   - Direct connection to how this addresses the job priority

Example strength entry:
{
  "category": "GTM Launch",
  "match": "drive product launch content strategy",
  "evidence": "Led Sentry Performance GTM campaign ('See Slow Faster') generating $1.8M in attributed pipeline and 1.2k content-sourced leads, directly demonstrating ability to drive product launch content that impacts revenue.",
  "confidence": "high"
}

EVIDENCE QUALITY RULES:
✅ GOOD evidence is:
- Project-specific: Names the actual portfolio project
- Quantified: Includes metrics from portfolio (e.g., "$1.8M pipeline," "72% increase," "45k visits")
- Outcome-focused: Shows business impact, not just activity
- Connected: Explicitly links project outcome to job requirement

❌ BAD evidence is:
- Generic: "Has content strategy experience"
- Vague: "Worked on marketing campaigns"
- Skill-listing: "Knows React and TypeScript"
- Resume-speak: "Excellent communication skills"
- Missing metrics: No quantifiable outcomes`,
          cache_control: { type: "ephemeral" }
        }
      ],
      messages: [{
        role: 'user',
        content: `Matched keywords: ${keywordMatches.critical.join(', ') || 'none'}
Base calculated score: ${baseScore}

Job:
${truncatedJob}

AVAILABLE CATEGORIES (use ONLY these for "category" field - pick the one that best matches the job requirement):
- GTM Launch
- Technical Writing
- Developer Content
- Brand Voice
- Thought Leadership
- Fintech
- Employer Brand
- SaaS / B2B
- AI / ML
- Content Strategy

CRITICAL INSTRUCTIONS:
- FIRST, identify the top 3 priorities/requirements from this job description
- The "summary" field MUST start with: "This position prioritizes: (1) [priority 1], (2) [priority 2], and (3) [priority 3]."
- Each of the 3 "strengths" should directly address one of these priorities with:
  * Specific project name from the portfolio
  * Quantified metrics/impact from that project
  * Clear connection between the project outcome and the job priority
- For "match", extract a DIRECT QUOTE (10 words or fewer) directly from the job description
- For "projectsToFeature", use ACTUAL project titles from the portfolio (e.g., "Sentry Performance GTM campaign", "DroneDeploy Safety AI", "Airbnb Career website")
- Select 2-4 projects that best match the job requirements based on category, industry, and required skills

ATS OPTIMIZATION INSTRUCTIONS:
- Identify keywords from job description that are NOT in the portfolio - add to "missingKeywords"
- Provide 3-5 specific "atsOptimizationTips" for maximizing ATS score:
  * Suggest exact phrases from job description to mirror in resume/cover letter
  * Identify required vs. preferred qualifications
  * Recommend keyword density improvements
  * Suggest how to reframe existing experience using job's terminology
  * Highlight tools/platforms mentioned in job description
- For "phrasingsToUse", extract 3-5 key phrases directly from the job posting (exact quotes)

Return valid JSON (exactly 3 strengths mapping to top 3 priorities, max 3 gaps):
{
  "matchScore": <number between 15-95>,
  "strengths": [
    {
      "priorityNumber": 1,
      "category":"GTM Launch",
      "match":"lead product launch content strategy",
      "evidence":"Led Sentry Performance GTM campaign ('See Slow Faster') generating $1.8M in attributed pipeline, 1.2k content-sourced leads, and 3.5k visits (2.3x site average), demonstrating proven ability to drive product launch content that directly impacts revenue.",
      "confidence":"high"
    },
    {
      "priorityNumber": 2,
      "category":"Technical Writing",
      "match":"create technical content for developer audiences",
      "evidence":"Created Sentry Dogfooding Chronicles (25+ blog posts) generating 45k site visits (40% organic) and $100K-$150K annual SEO value, plus developer content portfolio with 480 SQL conversions (9.5% attributed to ARR growth from $45M to $90M).",
      "confidence":"high"
    },
    {
      "priorityNumber": 3,
      "category":"Content Strategy",
      "match":"cross-functional collaboration with product teams",
      "evidence":"Built content production systems at Sentry reducing production time 50% (3-4 weeks to 1-2 weeks) through GitHub-based editorial workflow with engineering SMEs, plus DroneDeploy sales enablement system showing $10M+ pipeline influence.",
      "confidence":"high"
    }
  ],
  "gaps": [{"requirement":"Python","severity":"moderate","suggestion":"Emphasize JS skills"}],
  "standoutQualities": ["Full-stack"],
  "atsKeywords": {
    "critical":${JSON.stringify(keywordMatches.critical)},
    "recommended":[],
    "phrasingsToUse":["drive go-to-market strategy","collaborate with cross-functional teams"],
    "missingKeywords":["Specific skills from job not in portfolio"],
    "atsOptimizationTips":["Mirror exact job title in resume header","Use phrase 'developer-focused content' from job description","Quantify impact using metrics format from job posting"]
  },
  "recommendations": {"coverLetterFocus":["React"],"skillsToHighlight":["TypeScript"],"projectsToFeature":["Sentry Performance GTM campaign", "DroneDeploy Safety AI"]},
  "summary": "This position prioritizes: (1) GTM content strategy for SaaS product launches, (2) technical writing for developer audiences, and (3) cross-functional collaboration with product and engineering teams. Chris demonstrates strong alignment across all three priorities with quantified proof points from Sentry, DroneDeploy, and Airbnb projects showing consistent ability to drive pipeline ($1.8M+), engage technical audiences (45k+ visits), and build scalable content systems (50% efficiency gains)."
}`
      }]
    });

    const apiTime = Date.now() - apiStart;
    console.error(`⏱️  API call: ${apiTime}ms`);
    console.error(`📊 Tokens: ${response.usage.input_tokens} in, ${response.usage.output_tokens} out`);
    
    if (response.usage && 'cache_read_input_tokens' in response.usage) {
      const cacheCreated = (response.usage as any).cache_creation_input_tokens || 0;
      const cacheRead = (response.usage as any).cache_read_input_tokens || 0;
      console.error(`💾 Cache: ${cacheCreated} created, ${cacheRead} read`);
    }

    // Step 5: Parse response with error recovery
    const parseStart = Date.now();
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    let responseText = textContent.text;
    
    // Try to fix malformed JSON
    responseText = fixMalformedJSON(responseText);
    
    let parsed: JobAnalysisResult;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('📄 Response preview:', responseText.substring(0, 500));
      
      // Fallback: return basic analysis from keywords and calculated score
      console.error('⚠️  Using fallback basic analysis');
      const fallbackAnalysis: JobAnalysisResult = {
        matchScore: baseScore,
        strengths: keywordMatches.critical.slice(0, 3).map(kw => ({
          category: 'Technical',
          match: kw,
          evidence: `Has ${kw} experience`,
          confidence: 'high' as const
        })),
        gaps: [{
          requirement: 'Unable to complete full analysis',
          severity: 'moderate' as const,
          suggestion: 'Try again with shorter job description'
        }],
        standoutQualities: keywordMatches.critical.slice(0, 2),
        atsKeywords: {
          critical: keywordMatches.critical,
          recommended: keywordMatches.recommended,
          phrasingsToUse: [],
          jobKeywords: keywordMatches.jobKeywords
        },
        recommendations: {
          coverLetterFocus: [`Highlight ${keywordMatches.critical[0] || 'skills'}`],
          skillsToHighlight: keywordMatches.critical.slice(0, 3),
          projectsToFeature: ['Top relevant project']
        },
        summary: `Keyword match: ${keywordMatches.critical.length} critical skills matched. Base score: ${baseScore}%.`
      };
      
      fallbackAnalysis.shareableLink = await generateShareableLink(fallbackAnalysis);
      
      console.error('\n🔗 ═══════════════════════════════════════════════════════════');
      console.error('🔗 SHAREABLE LINK (FALLBACK):');
      console.error('🔗 ═══════════════════════════════════════════════════════════');
      console.error(fallbackAnalysis.shareableLink);
      console.error('🔗 ═══════════════════════════════════════════════════════════\n');
      
      return fallbackAnalysis;
    }

    console.error(`⏱️  JSON parsing: ${Date.now() - parseStart}ms`);

    // Step 6: Merge keywords and add jobKeywords
    if (!parsed.atsKeywords) {
      parsed.atsKeywords = {
        critical: keywordMatches.critical,
        recommended: keywordMatches.recommended,
        phrasingsToUse: [],
        jobKeywords: keywordMatches.jobKeywords
      };
    } else {
      parsed.atsKeywords.critical = [...new Set([
        ...keywordMatches.critical,
        ...(parsed.atsKeywords.critical || [])
      ])];
      
      parsed.atsKeywords.recommended = [...new Set([
        ...keywordMatches.recommended,
        ...(parsed.atsKeywords.recommended || [])
      ])];
      
      // Add job keywords
      parsed.atsKeywords.jobKeywords = keywordMatches.jobKeywords;
    }

    // Step 7: Apply score modifiers based on gaps
    if (parsed.gaps && Array.isArray(parsed.gaps)) {
      parsed.matchScore = applyScoreModifiers(
     baseScore,
        jobContent,
        parsed.gaps
      );
    }

    // Validate
    if (typeof parsed.matchScore !== 'number') parsed.matchScore = baseScore;
    if (!Array.isArray(parsed.strengths)) parsed.strengths = [];
    if (!Array.isArray(parsed.gaps)) parsed.gaps = [];
    if (!parsed.summary) parsed.summary = 'Analysis complete';
    
    if (parsed.recommendations?.projectsToFeature && Array.isArray(parsed.recommendations.projectsToFeature)) {
      const projectNames = parsed.recommendations.projectsToFeature as unknown as string[];
      if (projectNames.length > 0) {
        parsed.recommendations.projectsToFeature = enrichProjectsWithLinks(projectNames);
      }
    }

    // Step 8: Generate shareable link
    parsed.shareableLink = await generateShareableLink(parsed);

    const totalTime = Date.now() - totalStart;
    console.error(`✅ COMPLETE: ${totalTime}ms`);
    console.error(`   Match: ${parsed.matchScore}%, Strengths: ${parsed.strengths.length}, Gaps: ${parsed.gaps.length}`);
    console.error(`   Job Keywords: ${keywordMatches.jobKeywords.length}`);
    if (parsed.atsKeywords?.atsOptimizationTips) {
      console.error(`   ATS Optimization Tips: ${parsed.atsKeywords.atsOptimizationTips.length}`);
    }
    if (parsed.atsKeywords?.missingKeywords && parsed.atsKeywords.missingKeywords.length > 0) {
      console.error(`   ⚠️  Missing Keywords: ${parsed.atsKeywords.missingKeywords.join(', ')}`);
    }
    
    console.error('\n🔗 ═══════════════════════════════════════════════════════════');
    console.error('🔗 SHAREABLE LINK (COPY THIS):');
    console.error('🔗 ═══════════════════════════════════════════════════════════');
    console.error(parsed.shareableLink);
    console.error('🔗 ═══════════════════════════════════════════════════════════\n');
    console.error('🔥 === END ===\n');

    return parsed;

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown');
    throw error;
  }
}

export const analyzeJob = tool({
  description: 'Analyze a job description to help the employer evaluate a candidate',
  inputSchema: z.object({
    jobDescription: z.string().describe('The job description text or URL'),
  }),
  execute: async ({ jobDescription }) => {
    console.error('\n🚀 === ANALYZE JOB TOOL ===');
    const toolStart = Date.now();
    
    try {
      if (!jobDescription?.trim()) {
        throw new Error('Job description required');
      }

      const jobContent = jobDescription.trim();
      
      if (isURL(jobContent)) {
        return {
          matchScore: 0,
          strengths: [],
          gaps: [],
          standoutQualities: [],
          recommendations: {
            coverLetterFocus: [],
            skillsToHighlight: [],
            projectsToFeature: []
          },
          summary: `Can't access URLs. Please paste the job description text.`
        };
      }

      const analysis = await analyzeJobDescription(jobContent);

      console.error(`✅ TOOL COMPLETE: ${Date.now() - toolStart}ms`);
      
      if (analysis.shareableLink) {
        console.error('\n📎 Final shareable link:');
        console.error(analysis.shareableLink);
      }
      console.error('');

      return analysis;

    } catch (error) {
      console.error('❌ Tool error:', error instanceof Error ? error.message : 'Unknown');
      
      return {
        matchScore: 0,
        strengths: [],
        gaps: [{
          requirement: 'Analysis Failed',
          severity: 'critical' as const,
          suggestion: 'Please try again with a shorter job description'
        }],
        standoutQualities: [],
        recommendations: {
          coverLetterFocus: [],
          skillsToHighlight: [],
          projectsToFeature: []
        },
        summary: 'Analysis failed. Try rephrasing or shortening the job description.'
      };
    }
  }
});