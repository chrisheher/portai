// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { systemPrompt, presetReplies as importedPresetReplies } from '@/lib/config-loader';
import { getPresentation } from './tools/getPresentation';
import { getProjects } from './tools/getProjects';
import { getSkills } from './tools/getSkills';
import { analyzeJob } from './tools/analyzeJob';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const toolFunctions: Record<string, any> = {
  getPresentation,
  getProjects,
  getSkills,
  analyzeJob,
};

const presetReplies = importedPresetReplies || {};
console.log('📋 Preset replies loaded:', Object.keys(presetReplies).length);

// Helper function to track keywords (non-blocking)
async function trackJobKeywords(jobDescription: string, analysis: any) {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    console.log('📊 Tracking keywords for job analysis...');
    
    fetch(`${baseUrl}/api/keywords/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobDescription,
        analysis
      })
    }).catch(err => {
      console.warn('⚠️ Keyword tracking failed (non-critical):', err.message);
    });
    
    console.log('✅ Keyword tracking initiated');
  } catch (error: any) {
    console.warn('⚠️ Failed to initiate keyword tracking:', error.message);
  }
}

function extractKeyRequirements(jobDescription: string): string {
  const lines = jobDescription.split('\n');
  
  // Look for requirements section
  const reqStart = lines.findIndex(line => 
    /requirements?|qualifications?|skills?|must have/i.test(line)
  );
    if (reqStart === -1) {
    // No clear section, take first 500 chars
    return jobDescription.substring(0, 500);
  }
  
  // Take 10 lines after "Requirements"
  return lines.slice(reqStart, reqStart + 10).join('\n').substring(0, 500);
}

function extractKeyQualifications(resume: string): string {
  // For now, return first 600 chars of resume
  // TODO: Parse actual resume structure when available
  return resume.substring(0, 600);
}

export async function POST(req: NextRequest) {
  try {
    console.log('📨 API Chat called');
    
    const body = await req.json();
    let messages = body.messages;
    const customSystem = body.system;

    console.log('🔍 Request details:', {
      messagesCount: messages?.length,
      hasCustomSystem: !!customSystem,
      systemPreview: customSystem ? customSystem.substring(0, 100) + '...' : 'none'
    });

    if (!Array.isArray(messages)) {
      console.error('❌ Invalid messages array');
      return NextResponse.json(
        [{ role: 'assistant', content: 'Invalid messages array' }],
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ Missing ANTHROPIC_API_KEY');
      return NextResponse.json(
        [{ role: 'assistant', content: 'API key not configured' }],
        { status: 500 }
      );
    }

    console.log('✅ Messages received:', messages.length);

    messages = messages.map((msg: any) =>
      typeof msg === 'string' ? { role: 'user', content: msg } : msg
    );

    const lastUserMessage = messages[messages.length - 1]?.content;
    console.log('💬 Last user message:', lastUserMessage);

    if (lastUserMessage && presetReplies && presetReplies[lastUserMessage]) {
      console.log('🎯 Preset reply detected');
      const preset = presetReplies[lastUserMessage];
      const toolFunction = toolFunctions[preset.tool];

      if (toolFunction) {
        try {
          console.log('🔧 Executing preset tool:', preset.tool);
          const toolData = typeof toolFunction.execute === 'function'
            ? await toolFunction.execute()
            : typeof toolFunction === 'function'
            ? await toolFunction()
            : null;

          if (!toolData) {
            console.error('❌ Tool returned null');
            return NextResponse.json(
              [{ role: 'assistant', content: 'Tool execution failed.' }],
              { status: 500 }
            );
          }

          console.log('✅ Tool executed successfully');

          const narrationResponse = await anthropic.messages.create({
            model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: customSystem || systemPrompt,
            messages: [
              {
                role: 'user',
                content: `You are a professional scout delivering a scouting report to the user.
${JSON.stringify(toolData, null, 2)}`
              }
            ],
          });

          const spokenSummary = narrationResponse.content[0].type === 'text' 
            ? narrationResponse.content[0].text 
            : 'Here is the information from the requested tool.';

          return NextResponse.json([
            { 
              role: 'assistant', 
              content: spokenSummary, 
              tool: preset.tool, 
              result: toolData 
            },
          ]);
        } catch (toolError: any) {
          console.error('❌ Preset tool execution error:', toolError);
          return NextResponse.json(
            [{ role: 'assistant', content: `Tool error: ${toolError.message}` }],
            { status: 500 }
          );
        }
      }
    }

    console.log('🤖 Calling Claude API...');
    console.log('🎯 Using system prompt:', customSystem ? 'CUSTOM (Devin/Scout)' : 'DEFAULT');
    
    const effectiveSystemPrompt = customSystem || `${systemPrompt}

CRITICAL TOOL USAGE INSTRUCTIONS:

1. PROJECT FILTERING:
When the user asks about projects, you MUST analyze their query and extract filter parameters:
- If they mention a COMPANY NAME (DroneDeploy, Sentry, Airbnb, etc.) → use keyword parameter
- If they mention a TECHNOLOGY (React, Python, Ceros, Gemini, etc.) → use techStack parameter  
- If they mention a CATEGORY (SaaS, DevOps, Developer Relations, etc.) → use category parameter
- If they ask for "best", "featured", "top", or "favorite" projects → use featured: true

2. JOB ANALYSIS - CRITICAL:
When the user provides ANYTHING related to job descriptions or URLs to job postings, you MUST call the analyzeJob tool immediately.`;

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: effectiveSystemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      tools: [
        {
          name: "getProjects",
          description: "Get and display project portfolio with filters",
          input_schema: {
            type: "object",
            properties: {
              keyword: { type: "string", description: "Filter by keyword" },
              techStack: { type: "string", description: "Filter by technology" },
              category: { type: "string", description: "Filter by category" },
              featured: { type: "boolean", description: "Show featured only" }
            },
            required: []
          }
        },
        {
          name: "getSkills",
          description: "Get technical skills",
          input_schema: { type: "object", properties: {}, required: [] }
        },
       
        {
          name: "getPresentation",
          description: "Get presentation",
          input_schema: { type: "object", properties: {}, required: [] }
        },
        {
          name: "getInternship",
          description: "Get internship info",
          input_schema: { type: "object", properties: {}, required: [] }
        },
        {
          name: "analyzeJob",
          description: "Analyze job descriptions",
          input_schema: {
            type: "object",
            properties: {
              jobDescription: { type: "string", description: "Job URL or description" }
            },
            required: ["jobDescription"]
          }
        }
      ],
    });

    console.log('✅ Claude response received');

    const toolUseContent = response.content.find(c => c.type === 'tool_use');
    
    if (toolUseContent && toolUseContent.type === 'tool_use') {
      const toolName = toolUseContent.name;
      const toolInput = toolUseContent.input || {};
      
      console.log('🔧 Tool called:', toolName);
      console.log('📥 Tool input:', JSON.stringify(toolInput, null, 2));
      
      if (toolFunctions[toolName]) {
        const toolFunction = toolFunctions[toolName];
        const toolData = typeof toolFunction.execute === 'function'
          ? await toolFunction.execute(toolInput)
          : typeof toolFunction === 'function'
          ? await toolFunction(toolInput)
          : null;

        if (!toolData) {
          console.error('❌ Tool returned null');
          return NextResponse.json(
            [{ role: 'assistant', content: 'Tool execution failed.' }],
            { status: 500 }
          );
        }

        console.log('✅ Tool executed successfully');

     if (toolName === 'analyzeJob' && typeof toolInput === 'object' && toolInput !== null && 'jobDescription' in toolInput) {
  console.log('📊 Job analysis detected - initiating keyword tracking');
  trackJobKeywords((toolInput as { jobDescription: string }).jobDescription, toolData);
}

        if (toolName === 'analyzeJob') {
          return NextResponse.json([
            { 
              role: 'assistant', 
              content: toolData.summary || 'Job analysis complete.',
              tool: toolName, 
              result: toolData 
            },
          ]);
        }

        const narrationResponse = await anthropic.messages.create({
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: customSystem || systemPrompt,
          messages: [{
            role: 'user',
            content: `Summarize naturally: ${JSON.stringify(toolData, null, 2)}`
          }],
        });

        const spokenSummary = narrationResponse.content[0].type === 'text' 
          ? narrationResponse.content[0].text 
          : 'Here is the information.';

        return NextResponse.json([
          { role: 'assistant', content: spokenSummary, tool: toolName, result: toolData },
        ]);
      }
    }

    const textContent = response.content.find(c => c.type === 'text');
    
    if (!textContent || textContent.type !== 'text') {
      console.error('❌ No text content');
      return NextResponse.json(
        [{ role: 'assistant', content: 'No output generated' }],
        { status: 500 }
      );
    }

    console.log('✅ Returning text response:', {
      mode: customSystem ? 'CUSTOM' : 'DEFAULT',
      contentLength: textContent.text.length,
      preview: textContent.text.substring(0, 100)
    });
    
    return NextResponse.json([{ role: 'assistant', content: textContent.text }]);
    
  } catch (error: any) {
    console.error('❌❌❌ [CHAT-API] Fatal Error:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      [{ role: 'assistant', content: `Server error: ${error.message}` }],
      { status: 500 }
    );
  }
}