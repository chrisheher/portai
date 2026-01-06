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

async function analyzeJobDescription(jobContent: string): Promise<JobAnalysisResult> {
  try {
    console.error('\n🔥 === JOB ANALYSIS START ===');
    const totalStart = Date.now();
    
    // Step 1: Extract keywords
    const extractStart = Date.now();
    const keywordMatches = extractMatchingKeywords(jobContent, portfolioConfig.ATSKeywords);
    console.error(`⏱️  Keyword extraction: ${Date.now() - extractStart}ms`);
    console.error(`   Found: ${keywordMatches.critical.length} critical, ${keywordMatches.recommended.length} recommended`);
    
    // Step 2: Truncate job description
    const maxJobLength = 3000; // Shorter to reduce output
    const truncatedJob = jobContent.length > maxJobLength
      ? jobContent.slice(0, maxJobLength) + '\n\n[truncated]'
      : jobContent;
    
    console.error(`📄 Job length: ${jobContent.length} chars (${truncatedJob.length} sent)`);
    
    // Step 3: Call API with aggressive conciseness
    const apiStart = Date.now();
    console.error('📤 Calling Claude API...');
    
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', // FASTEST model
      max_tokens: 800, // Shorter response = faster + less truncation
      temperature: 0,
      system: [
        {
          type: "text",
          text: `Analyze jobs against this portfolio. Return ONLY valid JSON. Be concise - use 3-7 word phrases.

Portfolio:
${JSON.stringify(portfolioConfig, null, 2)}`,
          cache_control: { type: "ephemeral" }
        }
      ],
      messages: [{
        role: 'user',
        content: `Matched keywords: ${keywordMatches.critical.join(', ') || 'none'}

Job:
${truncatedJob}

Return valid JSON (3-7 words per field, max 4 strengths, max 3 gaps):
{
  "matchScore": 75,
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

    // Step 4: Parse response with error recovery
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
      
      // Fallback: return basic analysis from keywords
      console.error('⚠️  Using fallback basic analysis');
      return {
        matchScore: Math.round((keywordMatches.critical.length / 10) * 100),
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
        summary: `Keyword match: ${keywordMatches.critical.length} critical skills matched.`
      };
    }

    console.error(`⏱️  JSON parsing: ${Date.now() - parseStart}ms`);

    // Step 5: Merge keywords
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

    // Validate
    if (typeof parsed.matchScore !== 'number') parsed.matchScore = 50;
    if (!Array.isArray(parsed.strengths)) parsed.strengths = [];
    if (!Array.isArray(parsed.gaps)) parsed.gaps = [];
    if (!parsed.summary) parsed.summary = 'Analysis complete';

    const totalTime = Date.now() - totalStart;
    console.error(`✅ COMPLETE: ${totalTime}ms`);
    console.error(`   Match: ${parsed.matchScore}%, Strengths: ${parsed.strengths.length}, Gaps: ${parsed.gaps.length}`);
    console.error('🔥 === END ===\n');

    return parsed;

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown');
    throw error;
  }
}

export const analyzeJob = tool({
  description: 'Analyze a job description against the candidate\'s portfolio',
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

      console.error(`✅ TOOL COMPLETE: ${Date.now() - toolStart}ms\n`);

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