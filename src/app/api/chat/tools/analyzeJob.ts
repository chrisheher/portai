// src/app/api/chat/tools/analyzeJob.ts
import { tool } from "ai";
import { z } from "zod";
import Anthropic from '@anthropic-ai/sdk';
import portfolioConfig from '../../../../../portfolio-config.json';

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
    transferable?: string;  // Added optional field
  }>;
  standoutQualities: string[];
  culturalFit?: {  // Added optional field
    signals: string[];
    alignment: string[];
    concerns: string[];
  };
  implicitRequirements?: Array<{  // Added optional field
    signal: string;
    interpretation: string;
    candidateAlignment: string;
  }>;
  atsKeywords?: {  // Added optional field
    critical: string[];
    recommended: string[];
    phrasingsToUse: string[];
  };
  recommendations: {
    coverLetterFocus: string[];
    skillsToHighlight: string[];
    projectsToFeature: string[];
    narrativeStrategy?: string;  // Added optional field
    applicationPriority?: 'high' | 'medium' | 'low';  // Added optional field
  };
  redFlags?: string[];  // Added optional field
  summary: string;
  fetchedContent?: string;
}

function isURL(text: string): boolean {
  try {
    const url = new URL(text.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function analyzeJobDescription(jobContent: string): Promise<JobAnalysisResult> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `You are an expert career strategist analyzing a job opportunity for Chris Heher.

CANDIDATE PORTFOLIO:
${JSON.stringify(portfolioConfig, null, 2)}

JOB DESCRIPTION:
${jobContent}

ANALYSIS FRAMEWORK:
1. REQUIREMENTS MAPPING: Extract explicit requirements, implicit needs, must-haves vs nice-to-haves, and transferable skills
2. CULTURAL FIT: Identify company values, work style indicators, and potential concerns from the posting
3. COMPETITIVE POSITIONING: Find unique differentiators and strategic narrative
4. ATS OPTIMIZATION: Extract critical keywords and exact terminology to mirror

CRITICAL OUTPUT REQUIREMENTS:
- Output ONLY valid JSON, no other text
- No markdown code blocks or backticks
- No conversational text
- Start immediately with { and end with }
- All string fields must use double quotes
- Arrays cannot be empty - use ["No specific items identified"] if needed

JSON STRUCTURE (copy this exact structure):
{
  "matchScore": 75,
  "strengths": [
    {
      "category": "technical",
      "match": "specific requirement from job",
      "evidence": "specific example from portfolio",
      "confidence": "high"
    }
  ],
  "gaps": [
    {
      "requirement": "missing skill",
      "severity": "moderate",
      "suggestion": "actionable advice",
      "transferable": "related skills that could bridge gap"
    }
  ],
  "standoutQualities": [
    "unique strength that exceeds requirements"
  ],
  "culturalFit": {
    "signals": ["indicators from posting"],
    "alignment": ["how Chris aligns"],
    "concerns": ["potential mismatches"]
  },
  "implicitRequirements": [
    {
      "signal": "vague phrase from posting",
      "interpretation": "what they really mean",
      "candidateAlignment": "how Chris fits"
    }
  ],
  "atsKeywords": {
    "critical": ["must-include keywords"],
    "recommended": ["helpful keywords"],
    "phrasingsToUse": ["exact phrases to mirror"]
  },
  "recommendations": {
    "coverLetterFocus": ["key points to emphasize"],
    "skillsToHighlight": ["top skills to mention"],
    "projectsToFeature": ["relevant portfolio pieces"],
    "narrativeStrategy": "overarching story to tell",
    "applicationPriority": "high"
  },
  "redFlags": ["concerning signals if any"],
  "summary": "3-4 sentence assessment"
}

Be specific and actionable. Match portfolio items to job requirements with concrete examples.`
        }
      ]
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    let responseText = textContent.text.trim();
    
    console.log('📝 Raw Claude response (first 300 chars):', responseText.substring(0, 300));
    
    // Strip markdown code blocks
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Extract JSON if wrapped in text
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

    console.log('✅ Successfully parsed job analysis:', {
      matchScore: parsed.matchScore,
      strengthsCount: parsed.strengths.length,
      gapsCount: parsed.gaps.length,
      hasCulturalFit: !!parsed.culturalFit,
      hasAtsKeywords: !!parsed.atsKeywords
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

      // Analyze the job description
      const analysis = await analyzeJobDescription(jobContent);

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