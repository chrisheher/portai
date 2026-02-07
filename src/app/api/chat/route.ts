// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { systemPrompt, presetReplies } from '@/lib/config-loader';
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
  analyzeJob,
  getSkills,
};

console.log('📋 Preset replies loaded:', Object.keys(presetReplies || {}).length);

// ... (keep trackJobKeywords function as is)

export async function POST(req: NextRequest) {
  try {
    console.log('📨 API Chat called');
    
    const body = await req.json();
    let messages = body.messages;
    const customSystem = body.system;

    console.log('🔍 Request details:', {
      messagesCount: messages?.length,
      hasCustomSystem: !!customSystem,
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

    // Check for preset replies (optional - only if you want to keep them)
  

    console.log('🤖 Calling Claude API...');
    console.log('🎯 Using system prompt:', customSystem ? 'CUSTOM (Devin)' : 'DEFAULT');
    
    const effectiveSystemPrompt = customSystem || systemPrompt;

    // Call Claude WITHOUT tools - just direct conversation
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: effectiveSystemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      // Remove tools array - Claude will answer directly from system prompt
    });

    console.log('✅ Claude response received');

    const textContent = response.content.find(c => c.type === 'text');
    
    if (!textContent || textContent.type !== 'text') {
      console.error('❌ No text content');
      return NextResponse.json(
        [{ role: 'assistant', content: 'No output generated' }],
        { status: 500 }
      );
    }

    console.log('✅ Returning text response');
    
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