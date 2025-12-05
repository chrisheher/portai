// src/app/api/chat/tools/analyzeJob.ts
import { tool } from "ai";
import { z } from "zod";
import Anthropic from '@anthropic-ai/sdk';
// Import from root folder using relative path
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
  }>;
  standoutQualities: string[];
  recommendations: {
    coverLetterFocus: string[];
    skillsToHighlight: string[];
    projectsToFeature: string[];
  };
  summary: string;
  fetchedContent?: string;
}

// Helper function to check if input is a URL
function isURL(text: string): boolean {
  try {
    const url = new URL(text.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Main analysis function
async function analyzeJobDescription(jobContent: string): Promise<JobAnalysisResult> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `You are a recruiter analyzing a job candidate's portfolio. 

CANDIDATE PORTFOLIO:
${JSON.stringify(portfolioConfig, null, 2)}

JOB DESCRIPTION:
${jobContent}

CRITICAL INSTRUCTIONS:
1. Your response MUST be ONLY a valid JSON object
2. Do NOT include any text before or after the JSON
3. Do NOT include markdown code blocks or backticks
4. Do NOT include any conversational text like "Here's the analysis" or "I notice that"
5. Start your response immediately with { and end with }

Respond with ONLY this exact JSON structure:

{
  "matchScore": <number 0-100>,
  "strengths": [
    {
      "category": "<string>",
      "match": "<specific requirement from job>",
      "evidence": "<specific example from portfolio>",
      "confidence": "high" or "medium" or "low"
    }
  ],
  "gaps": [
    {
      "requirement": "<missing skill or experience>",
      "severity": "critical" or "moderate" or "minor",
      "suggestion": "<actionable advice>"
    }
  ],
  "standoutQualities": [
    "<unique strengths that exceed job requirements>"
  ],
  "recommendations": {
    "coverLetterFocus": ["<key points to emphasize>"],
    "skillsToHighlight": ["<top skills to mention>"],
    "projectsToFeature": ["<relevant portfolio pieces>"]
  },
  "summary": "<2-3 sentence overall assessment>"
}

Be specific, honest, and actionable. Match actual portfolio items to job requirements.

REMEMBER: Output ONLY the JSON object. No other text.`
      }
    ]
  });

  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('Failed to analyze job description');
  }

  let responseText = textContent.text;
  
  // Log the raw response for debugging
  console.log('Raw Claude response:', responseText.substring(0, 200));
  
  // Strip markdown code blocks if present
  responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  // If response starts with conversational text, try to extract JSON
  if (!responseText.startsWith('{')) {
    console.error('Response does not start with JSON. Full response:', responseText);
    
    // Try to find JSON in the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('Found JSON in response, extracting...');
      responseText = jsonMatch[0];
    } else {
      throw new Error('Claude did not return valid JSON. Response: ' + responseText.substring(0, 100));
    }
  }
  
  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Failed to parse JSON:', responseText.substring(0, 500));
    throw new Error('Failed to parse JSON response from Claude');
  }
}

export const analyzeJob = tool({
  description: 'Analyze a job description against the candidate\'s portfolio to provide match score, strengths, gaps, and recommendations',
  parameters: z.object({
    jobDescription: z.string().describe('The job description text or URL to analyze'),
  }),
execute: async ({ jobDescription }) => {
    if (!jobDescription || !jobDescription.trim()) {
      throw new Error('Job description is required');
    }

    let jobContent = jobDescription.trim();
    

    // If it's a URL, return a helpful message instead of trying to fetch
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
  }
});