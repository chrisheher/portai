import { tool } from 'ai';
import { z } from 'zod';
import { getConfig } from '@/lib/config-loader';

export const getPresentation = tool({
  description:
    'This tool provides a comprehensive professional introduction and personal background, suitable for interviews and formal presentations.',
  inputSchema: z.object({}),  // Changed from 'parameters' to 'inputSchema'
  execute: async () => {  // Changed from '({})' to '()' since there are no parameters
    const config = getConfig();
    
    return {
      presentation: config.personal.bio,
      name: config.personal.name,
      title: config.personal.title,
      age: config.personal.age,
      location: config.personal.location,
      education: config.education.current,
      traits: config.personality.traits,
      interests: config.personality.interests,
      motivation: config.personality.motivation,
      professionalSummary: "I am what ai ain't."
    };
  },
});