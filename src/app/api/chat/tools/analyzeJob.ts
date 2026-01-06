// src/app/api/chat/tools/analyzeJob.ts
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

/**
 * Pre-analyze keywords - OPTIMIZED with simple includes check first
 */
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
      
      // Fast path: simple includes check first
      if (!jobLower.includes(keywordLower)) return;
      
      // Only do regex if simple check passes
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

async function analyzeJobDescription(jobContent: string): Promise<JobAnalysisResult> {
  try {
    console.error('\n🔥 === JOB ANALYSIS START ===');
    const totalStart = Date.now();
    
    // Step 1: Extract keywords
    const extractStart = Date.now();
    const keywordMatches = extractMatchingKeywords(jobContent, portfolioConfig.ATSKeywords);
    console.error(`⏱️  Keyword extraction: ${Date.now() - extractStart}ms`);
    console.error(`   Found: ${keywordMatches.critical.length} critical, ${keywordMatches.recommended.length} recommended`);
    
    // Step 2: Truncate job description if too long
    const maxJobLength = 4000;
    const truncatedJob = jobContent.length > maxJobLength
      ? jobContent.slice(0, maxJobLength) + '\n\n[Job description truncated for analysis]'
      : jobContent;
    
    console.error(`📄 Job length: ${jobContent.length} chars (${truncatedJob.length} sent to API)`);
    
    // Step 3: Call Claude API with PROMPT CACHING
    const apiStart = Date.now();
    console.error('📤 Calling Claude API with prompt caching...');
    
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', // FASTER than Haiku for structured output
      max_tokens: 2000, // Reduced from 2500
      temperature: 0, // Changed from 1 for consistency
      system: [
        {
          type: "text",
          text: "You analyze job descriptions against a candidate's portfolio. Always respond with ONLY valid JSON, no markdown blocks. BE CONCISE - use short phrases in evidence/suggestions fields (max 10-15 words each).",
          cache_control: { type: "ephemeral" } // Cache this
        },
        {
          type: "text",
          text: `CANDIDATE PORTFOLIO:
${JSON.stringify(portfolioConfig, null, 2)}`,
          cache_control: { type: "ephemeral" } // Cache the portfolio!
        }
      ],
      messages: [{
        role: 'user',
        content: `Analyze this job description for the candidate.

PRE-MATCHED KEYWORDS (confirmed matches from portfolio):
Critical: ${keywordMatches.critical.join(', ')}
Recommended: ${keywordMatches.recommended.join(', ')}

JOB DESCRIPTION:
${truncatedJob}

Return this EXACT JSON structure with NO markdown:
{
  "matchScore": 75,
  "strengths": [
    {
      "category": "Technical Skills",
      "match": "React Development",
      "evidence": "3 years building React applications",
      "confidence": "high"
    }
  ],
  "gaps": [
    {
      "requirement": "Python",
      "severity": "moderate",
      "suggestion": "Consider highlighting transferable backend experience"
    }
  ],
  "standoutQualities": ["Full-stack expertise", "DevRel background"],
  "atsKeywords": {
    "critical": ["react", "typescript", "next.js"],
    "recommended": ["agile", "scrum"],
    "phrasingsToUse": ["user-centric design", "cross-functional collaboration"]
  },
  "recommendations": {
    "coverLetterFocus": ["Highlight React projects"],
    "skillsToHighlight": ["TypeScript", "Component architecture"],
    "projectsToFeature": ["DroneDeploy dashboard", "Airbnb clone"],
    "narrativeStrategy": "Position as technical leader with startup experience",
    "applicationPriority": "high"
  },
  "summary": "Strong match with 80% keyword coverage. Technical skills align perfectly with role requirements."
}`
      }]
    });

    const apiTime = Date.now() - apiStart;
    console.error(`⏱️  API call: ${apiTime}ms`);
    console.error(`📊 Tokens: ${response.usage.input_tokens} in, ${response.usage.output_tokens} out`);
    
    // Check if we got cache hits
    if (response.usage && 'cache_creation_input_tokens' in response.usage) {
      console.error(`💾 Cache: ${(response.usage as any).cache_creation_input_tokens || 0} created, ${(response.usage as any).cache_read_input_tokens || 0} read`);
    }

    // Step 4: Parse response
    const parseStart = Date.now();
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    let responseText = textContent.text.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    
    // Extract JSON if wrapped
    if (!responseText.startsWith('{')) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      } else {
        throw new Error('Claude did not return valid JSON');
      }
    }
    
    let parsed: JobAnalysisResult;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('📄 Failed JSON preview:', responseText.substring(0, 300));
      throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    console.error(`⏱️  JSON parsing: ${Date.now() - parseStart}ms`);

    // Step 5: Merge pre-matched keywords
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
      
      parsed.atsKeywords.phrasingsToUse = parsed.atsKeywords.phrasingsToUse || [];
    }

    // Validate required fields
    if (typeof parsed.matchScore !== 'number') throw new Error('Missing matchScore');
    if (!Array.isArray(parsed.strengths)) throw new Error('Missing strengths');
    if (!Array.isArray(parsed.gaps)) throw new Error('Missing gaps');
    if (!parsed.summary) throw new Error('Missing summary');

    const totalTime = Date.now() - totalStart;
    console.error(`✅ ANALYSIS COMPLETE: ${totalTime}ms`);
    console.error(`   Match: ${parsed.matchScore}%, Strengths: ${parsed.strengths.length}, Gaps: ${parsed.gaps.length}`);
    console.error('🔥 === JOB ANALYSIS END ===\n');

    return parsed;

  } catch (error) {
    console.error('❌ analyzeJobDescription error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

export const analyzeJob = tool({
  description: 'Analyze a job description against the candidate\'s portfolio to provide match score, strengths, gaps, and recommendations',
  inputSchema: z.object({
    jobDescription: z.string().describe('The job description text or URL to analyze'),
  }),
  execute: async ({ jobDescription }) => {
    console.error('\n🚀 === ANALYZE JOB TOOL CALLED ===');
    const toolStart = Date.now();
    
    try {
      if (!jobDescription || !jobDescription.trim()) {
        throw new Error('Job description is required');
      }

      let jobContent = jobDescription.trim();
      
      // If it's a URL, return helpful message
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
          summary: `I can see you've shared a job posting URL (${jobContent}), but I can't directly access external websites. Please copy the job description text from that page and paste it here, and I'll analyze how well you match the role!`
        };
      }

      const analysis = await analyzeJobDescription(jobContent);

      console.error(`✅ TOOL EXECUTION COMPLETE: ${Date.now() - toolStart}ms\n`);

      return analysis;

    } catch (error) {
      console.error('❌ analyzeJob tool error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        matchScore: 0,
        strengths: [],
        gaps: [{
          requirement: 'Analysis Error',
          severity: 'critical' as const,
          suggestion: `Failed to analyze job description: ${error instanceof Error ? error.message : 'Unknown error'}. Please try rephrasing or simplifying the job description.`
        }],
        standoutQualities: [],
        recommendations: {
          coverLetterFocus: [],
          skillsToHighlight: [],
          projectsToFeature: []
        },
        summary: 'Unable to complete analysis due to an error. Please try again or contact support if the issue persists.'
      };
    }
  }
});