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
 * Pre-analyze keywords by matching portfolio ATS keywords against job description
 * This provides fast, guaranteed accurate keyword detection
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

  // Check each category for matches
  Object.entries(portfolioKeywords).forEach(([category, keywords]) => {
    keywords.forEach((keyword: string) => {
      const keywordLower = keyword.toLowerCase();
      
      // Check for exact match or word boundary match
      const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      
      if (regex.test(jobLower)) {
        const categoryKey = category as keyof typeof matches.categories;
        matches.categories[categoryKey].push(keyword);
        
        // Prioritize based on category
        if (category === 'core' || category === 'technical') {
          if (!matches.critical.includes(keyword)) {
            matches.critical.push(keyword);
          }
        } else {
          if (!matches.recommended.includes(keyword)) {
            matches.recommended.push(keyword);
          }
        }
      }
    });
  });

  console.log('🔍 Keyword extraction results:', {
    critical: matches.critical.length,
    recommended: matches.recommended.length,
    byCategory: {
      core: matches.categories.core.length,
      technical: matches.categories.technical.length,
      tools: matches.categories.tools.length,
      soft: matches.categories.soft.length
    }
  });

  return matches;
}

async function analyzeJobDescription(jobContent: string): Promise<JobAnalysisResult> {
  try {
    console.log('⏱️ Starting job analysis...');
    const startTime = Date.now();
    
    // Step 1: Pre-extract keyword matches (fast, accurate)
    const extractStart = Date.now();
    const keywordMatches = extractMatchingKeywords(jobContent, portfolioConfig.ATSKeywords);
    console.log(`⏱️ Keyword extraction took ${Date.now() - extractStart}ms`);
    
    // Step 2: Send to Claude for intelligent analysis
    console.log('📤 Calling Claude API...');
    const apiStart = Date.now();
    
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      temperature: 1,
      messages: [
        {
          role: 'user',
          content: `Analyze this job for Chris Heher. Output ONLY valid JSON.
          

PRE-IDENTIFIED KEYWORD MATCHES (from portfolio):
Critical matches (core/technical skills): ${keywordMatches.critical.join(', ')}
Recommended matches (tools/soft skills): ${keywordMatches.recommended.join(', ')}

Breakdown by category:
- Core skills matched: ${keywordMatches.categories.core.join(', ') || 'none'}
- Technical skills matched: ${keywordMatches.categories.technical.join(', ') || 'none'}
- Tools matched: ${keywordMatches.categories.tools.join(', ') || 'none'}
- Soft skills matched: ${keywordMatches.categories.soft.join(', ') || 'none'}

CHRIS'S FULL PORTFOLIO:
${JSON.stringify(portfolioConfig, null, 2)}

JOB DESCRIPTION:
${jobContent}

ANALYSIS INSTRUCTIONS:
1. Use the pre-identified matches as your foundation - these are CONFIRMED keyword matches
2. In "atsKeywords.critical": Include the pre-identified critical matches + any additional exact matches you find
3. In "atsKeywords.recommended": Include the pre-identified recommended matches + any IMPLIED skills that match Chris's experience
4. In "atsKeywords.phrasingsToUse": Extract exact phrasings/terminology from the job description that Chris should mirror in his application
5. Build strengths based on these keyword matches and Chris's actual experience
6. Identify gaps where job requirements don't match Chris's portfolio keywords

Format:
{
  "matchScore": 75,
  "strengths": [{"category": "type", "match": "requirement", "evidence": "example", "confidence": "high"}],
  "gaps": [{"requirement": "skill", "severity": "moderate", "suggestion": "advice"}],
  "standoutQualities": ["strength"],
  "atsKeywords": {
    "critical": ["keywords that MUST appear in application"],
    "recommended": ["keywords that should appear for strong match"],
    "phrasingsToUse": ["exact phrases from job description to mirror"]
  },
  "recommendations": {"coverLetterFocus": ["point"], "skillsToHighlight": ["skill"], "projectsToFeature": ["project"], "narrativeStrategy": "story", "applicationPriority": "high"},
  "summary": "Write 2-3 sentences covering: biggest strength, competitive advantage in the client's industry. Keep response under 50 words. Do not mention the percentage match."


}`
        }
      ]
    });

    const apiTime = Date.now() - apiStart;
    console.log(`⏱️ API call completed in ${apiTime}ms`);
    console.log(`📊 Tokens: ${response.usage?.input_tokens || 'unknown'} in, ${response.usage?.output_tokens || 'unknown'} out`);

    // Step 3: Parse Claude's response
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    let responseText = textContent.text.trim();
    
    console.log('📝 Raw Claude response (first 300 chars):', responseText.substring(0, 300));
    
    const parseStart = Date.now();
    
    // Strip markdown code blocks aggressively
    responseText = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    
    // Extract JSON if still wrapped in text
    if (!responseText.startsWith('{')) {
      console.warn('⚠️ Response does not start with JSON, attempting extraction...');
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
        console.log('✅ Extracted JSON from response');
      } else {
        throw new Error(`Claude did not return valid JSON. Response preview: ${responseText.substring(0, 200)}`);
      }
    }
    
    // Parse JSON
    let parsed: JobAnalysisResult;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('📄 Failed JSON (first 500 chars):', responseText.substring(0, 500));
      throw new Error(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    const parseTime = Date.now() - parseStart;
    console.log(`⏱️ JSON parsing took ${parseTime}ms`);

    // Step 4: Merge pre-matched keywords with Claude's analysis
    console.log('🔗 Merging keyword matches...');
    if (!parsed.atsKeywords) {
      // If Claude didn't return keywords, use our pre-matched ones
      parsed.atsKeywords = {
        critical: keywordMatches.critical,
        recommended: keywordMatches.recommended,
        phrasingsToUse: []
      };
    } else {
      // Combine and deduplicate - ensure pre-matched keywords are included
      parsed.atsKeywords.critical = [...new Set([
        ...keywordMatches.critical,
        ...(parsed.atsKeywords.critical || [])
      ])];
      
      parsed.atsKeywords.recommended = [...new Set([
        ...keywordMatches.recommended,
        ...(parsed.atsKeywords.recommended || [])
      ])];
      
      // phrasingsToUse comes purely from Claude's analysis
      if (!parsed.atsKeywords.phrasingsToUse) {
        parsed.atsKeywords.phrasingsToUse = [];
      }
    }

    // Validate required fields
    if (typeof parsed.matchScore !== 'number') {
      throw new Error('Missing or invalid matchScore');
    }
    if (!Array.isArray(parsed.strengths)) {
      throw new Error('Missing or invalid strengths array');
    }
    if (!Array.isArray(parsed.gaps)) {
      throw new Error('Missing or invalid gaps array');
    }
    if (!parsed.summary) {
      throw new Error('Missing summary');
    }

    const totalTime = Date.now() - startTime;
    console.log('✅ Job analysis complete:', {
      totalTime: `${totalTime}ms`,
      matchScore: parsed.matchScore,
      strengths: parsed.strengths.length,
      gaps: parsed.gaps.length,
      atsKeywords: {
        critical: parsed.atsKeywords.critical.length,
        recommended: parsed.atsKeywords.recommended.length,
        phrasings: parsed.atsKeywords.phrasingsToUse.length
      }
    });

    return parsed;

  } catch (error) {
    console.error('❌ analyzeJobDescription error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
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
    const totalStart = Date.now();
    console.log('🚀 Job analysis started');
    
    try {
      if (!jobDescription || !jobDescription.trim()) {
        throw new Error('Job description is required');
      }

      let jobContent = jobDescription.trim();
      
      // If it's a URL, return a helpful message
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

      // Analyze the job description using hybrid approach
      const analysis = await analyzeJobDescription(jobContent);

      const totalTime = Date.now() - totalStart;
      console.log(`✅ Total execution time: ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);

      return analysis;

    } catch (error) {
      console.error('❌ analyzeJob tool error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Return a user-friendly error
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