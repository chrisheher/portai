// src/app/api/chat/tools/analyzeJob.ts - PRODUCTION VERSION
import { tool } from "ai";
import { z } from "zod";
import Anthropic from '@anthropic-ai/sdk';
import portfolioConfig from './portfolio-config-slim.json';

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
  };
  recommendations: {
    coverLetterFocus: string[];
    skillsToHighlight: string[];
    projectsToFeature: string[];
    narrativeStrategy?: string;
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
    tools: string[];
    soft: string[];
  };
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
      tools: [],
      soft: []
    }
  };

  Object.entries(portfolioKeywords).forEach(([category, keywords]) => {
    keywords.forEach((keyword: string) => {
      const keywordLower = keyword.toLowerCase();
      if (!jobLower.includes(keywordLower)) return;
      
      const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      
      if (regex.test(jobText)) {
        const categoryKey = category as keyof typeof matches.categories;
        matches.categories[categoryKey].push(keyword);
        
        if (category === 'core' || category === 'technical') {
          matches.critical.push(keyword);
        } else {
          matches.recommended.push(keyword);
        }
      }
    });
  });

  return matches;
}

/**
 * Calculate qualitative adjustments based on role fit factors
 */
function calculateQualitativeScore(jobContent: string): number {
  const jobLower = jobContent.toLowerCase();
  let score = 0;
  
  // Role level mismatch penalties/bonuses
   if (jobLower.includes('junior') || jobLower.includes('associate') || jobLower.includes('entry')) {
    score -= 15; // Too junior/overqualified
  } else if (jobLower.includes('senior') || jobLower.includes('lead')) {
    score += 10; // Sweet spot
  }
  
  
  // Red flags
  if (jobLower.includes('must have') && jobLower.includes('phd')) score -= 25;
  if (jobLower.includes('relocation required') && !jobLower.includes('remote')) score -= 10;
  if (jobLower.includes('on-site only') || jobLower.includes('no remote')) score -= 12;
  if (jobLower.includes('frequent travel') && jobLower.includes('50%')) score -= 8;
  
  // Green flags
  if (jobLower.includes('remote') || jobLower.includes('work from home')) score += 8;
  if (jobLower.includes('devtools') || jobLower.includes('developer tools')) score += 12;
  if (jobLower.includes('content-led growth') || jobLower.includes('developer marketing')) score += 15;
  if (jobLower.includes('technical writing') && jobLower.includes('developer')) score += 10;
  if (jobLower.includes('flexible hours') || jobLower.includes('flexible schedule')) score += 5;
  
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
    coreSkills: 0.6,          // Content strategy, technical writing, etc.
    marketingSkills: 0.15,     // Pipeline gen, demand gen, etc.
    industryFit: 0.1,         // SaaS, DevTools, B2B
    technicalFluency: 0.15,    // Understanding of tech concepts
    softSkills: 0.05           // Communication, leadership
  };

  const jobLower = jobContent.toLowerCase();
  
  // 1. Core Skills Score (0-100)
  const coreSkillsNeeded = [
    'content strategy', 'technical writing', 'copywriting', 
    'content marketing', 'product marketing', 'developer relations',
    'gtm', 'go-to-market', 'messaging', 'positioning'
  ];
  const coreMatches = coreSkillsNeeded.filter(skill => 
    jobLower.includes(skill)
  ).length;
  const coreScore = Math.min((coreMatches / 5) * 100, 100);

  // 2. Marketing Skills Score (0-100)
  const marketingSkills = [
    'pipeline', 'demand generation', 'sales enablement', 
    'campaign', 'launch', 'brand', 'social media', 'seo',
    'lead generation', 'conversion'
  ];
  const marketingMatches = marketingSkills.filter(skill =>
    jobLower.includes(skill)
  ).length;
  const marketingScore = Math.min((marketingMatches / 4) * 100, 100);

  // 3. Industry Fit (0-100)
  let industryScore = 50; // baseline
  if (jobLower.includes('saas') || jobLower.includes('b2b')) industryScore += 20;
  if (jobLower.includes('developer') || jobLower.includes('devtools')) industryScore += 20;
  if (jobLower.includes('enterprise')) industryScore += 10;  
  if (jobLower.includes('advertising')) industryScore += 10;

  industryScore = Math.min(industryScore, 100);

  // 4. Technical Fluency (0-100)
  const techTerms = [
    'api', 'sdk', 'developer', 'technical', 'ai', 'ml', 'CMS',
    'cloud', 'devops', 'engineering', 'code', 'software'
  ];
  const techMatches = techTerms.filter(term =>
    jobLower.includes(term)
  ).length;
  const techScore = Math.min((techMatches / 4) * 100, 100);

  // 5. Soft Skills Score (0-100)
  const softSkills = [
    'communication', 'leadership', 'collaboration', 
    'stakeholder', 'cross-functional', 'strategic'
  ];
  const softMatches = softSkills.filter(skill =>
    jobLower.includes(skill)
  ).length;
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
    experienceModifier = 10; // Good fit for senior roles
  } else if (jobLower.includes('junior') || jobLower.includes('entry')) {
    experienceModifier = -10; // Overqualified
  }

  // Add qualitative adjustments
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

  // WIDER range: 15-95 instead of 25-95
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
  
  // INCREASED penalties for gaps
  const criticalGaps = gaps.filter(g => g.severity === 'critical').length;
  score -= criticalGaps * 18; // was 12
  
  const moderateGaps = gaps.filter(g => g.severity === 'moderate').length;
  score -= moderateGaps * 3; // was 6
  
  // Bonuses for desirable attributes
  const jobLower = jobContent.toLowerCase();
  if (jobLower.includes('remote')) score += 5;
  if (jobLower.includes('flexible')) score += 3;
  if (jobLower.includes('startup') && jobLower.includes('series')) score += 5;
  
  // Years of experience alignment (portfolio shows 8 years)
  const yearsMatch = jobContent.match(/(\d+)\+?\s*years?/i);
  if (yearsMatch) {
    const requiredYears = parseInt(yearsMatch[1]);
    if (requiredYears >= 5 && requiredYears <= 15) score += 5; // Sweet spot
  }
  
  console.error(`🎯 Score modifiers:
    Critical gaps penalty: -${criticalGaps * 10}
    Moderate gaps penalty: -${moderateGaps * 3}
    Final adjusted score: ${Math.max(15, Math.min(95, score))}`);
  
  // WIDER final range: 15-95 instead of 20-95
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
 * Generate a shareable link for the analysis results
 */
function generateShareableLink(analysis: JobAnalysisResult): string {
  try {
    // Create a clean copy without the shareableLink itself to avoid recursion
    const { shareableLink, ...cleanAnalysis } = analysis;
    
    // Encode to base64url (URL-safe base64)
    const analysisId = Buffer.from(
      JSON.stringify(cleanAnalysis)
    ).toString('base64url');
    
    // Use environment variable or fallback to relative path
    const baseUrl = process.env.NEXT_PUBLIC_URL || '';
    return `${baseUrl}/results/${analysisId}`;
  } catch (error) {
    console.error('Error generating shareable link:', error);
    return '';
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
    
    // Step 2: Calculate base match score
    const scoreStart = Date.now();
    const baseScore = calculateMatchScore(keywordMatches, jobContent);
    console.error(`⏱️  Score calculation: ${Date.now() - scoreStart}ms`);
    
    // Step 3: Truncate job description
    const maxJobLength = 3000; // Shorter to reduce output
    const truncatedJob = jobContent.length > maxJobLength
      ? jobContent.slice(0, maxJobLength) + '\n\n[truncated]'
      : jobContent;
    
    console.error(`📄 Job length: ${jobContent.length} chars (${truncatedJob.length} sent)`);
    
    // Step 4: Call API with calculated score
    const apiStart = Date.now();
    console.error('📤 Calling Claude API...');
    
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', // FASTEST model
      max_tokens: 2000, // Shorter response = faster + less truncation
      temperature: 1,
      system: [
        {
          type: "text",
          text: `Analyze jobs against this portfolio. Return ONLY valid JSON. 

Portfolio:
${JSON.stringify(portfolioConfig, null, 2)}`,
          cache_control: { type: "ephemeral" }
        }
      ],
      messages: [{
        role: 'user',
        content: `Matched keywords: ${keywordMatches.critical.join(', ') || 'none'}
Base calculated score: ${baseScore}

Job:
${truncatedJob}

IMPORTANT: Start with the base score of ${baseScore} and adjust it (±25 points) based on:
- Qualitative fit beyond keywords
- Culture/soft skills alignment
- Career trajectory match
- Role level appropriateness
- Company stage/size fit
- Missing critical vs nice-to-have skills

Scoring guidelines:
- 95-99: Perfect match (dream role, exceeds requirements)
- 80-94: Strong match (highly qualified, clear fit)
- 65-79: Good match (solid fit, minor gaps)
- 51-64: Moderate match (some key gaps)
- 30-50: Weak match (significant misalignment)
- 15-29: Poor match (wrong role/level)

Return valid JSON (5-8 words per field, max 5 strengths, max 3 gaps):
{
  "matchScore": <number between 15-95>, // Use ${baseScore} as reference but adjust freely based on overall fit
  "strengths": [{"category":"Tech","match":"React","evidence":"5yr React dev","confidence":"high"}],
  "gaps": [{"requirement":"Python","severity":"moderate","suggestion":"Emphasize JS skills"}],
  "standoutQualities": ["Full-stack"],
  "atsKeywords": {"critical":${JSON.stringify(keywordMatches.critical)},"recommended":[],"phrasingsToUse":[]},
  "recommendations": {"coverLetterFocus":["React"],"skillsToHighlight":["TypeScript"],"projectsToFeature":["Top project"]},
  "summary": "Strong technical match."
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
          phrasingsToUse: []
        },
        recommendations: {
          coverLetterFocus: [`Highlight ${keywordMatches.critical[0] || 'skills'}`],
          skillsToHighlight: keywordMatches.critical.slice(0, 3),
          projectsToFeature: ['Top relevant project']
        },
        summary: `Keyword match: ${keywordMatches.critical.length} critical skills matched. Base score: ${baseScore}%.`
      };
      
      // Add shareable link
      fallbackAnalysis.shareableLink = generateShareableLink(fallbackAnalysis);
      
      // Log the shareable link prominently
      console.error('\n🔗 ═══════════════════════════════════════════════════════════');
      console.error('🔗 SHAREABLE LINK (FALLBACK):');
      console.error('🔗 ═══════════════════════════════════════════════════════════');
      console.error(fallbackAnalysis.shareableLink);
      console.error('🔗 ═══════════════════════════════════════════════════════════\n');
      
      return fallbackAnalysis;
    }

    console.error(`⏱️  JSON parsing: ${Date.now() - parseStart}ms`);

    // Step 6: Merge keywords
    if (!parsed.atsKeywords) {
      parsed.atsKeywords = {
        critical: keywordMatches.critical,
        recommended: keywordMatches.recommended,
        phrasingsToUse: []
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
    }

    // Step 7: Apply score modifiers based on gaps
    if (parsed.gaps && Array.isArray(parsed.gaps)) {
      parsed.matchScore = applyScoreModifiers(
        parsed.matchScore,
        jobContent,
        parsed.gaps
      );
    }

    // Validate
    if (typeof parsed.matchScore !== 'number') parsed.matchScore = baseScore;
    if (!Array.isArray(parsed.strengths)) parsed.strengths = [];
    if (!Array.isArray(parsed.gaps)) parsed.gaps = [];
    if (!parsed.summary) parsed.summary = 'Analysis complete';

    // Step 8: Generate shareable link
    parsed.shareableLink = generateShareableLink(parsed);

    const totalTime = Date.now() - totalStart;
    console.error(`✅ COMPLETE: ${totalTime}ms`);
    console.error(`   Match: ${parsed.matchScore}%, Strengths: ${parsed.strengths.length}, Gaps: ${parsed.gaps.length}`);
    
    // Enhanced shareable link logging
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
      
      // Log the link one more time at the tool level for visibility
      if (analysis.shareableLink) {
        console.error('\n📎 Final shareable link:');
        console.error(analysis.shareableLink);
      }
      console.error('');

      return analysis;

    } catch (error) {
      console.error('❌ Tool error:', error instanceof Error ? error.message : 'Unknown');
      
      // Return graceful error
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