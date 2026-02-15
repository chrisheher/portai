// src/lib/config-loader.ts
import portfolioConfig from '../../src/components/chat/portconfig.json';

// Rich system prompt with all portfolio data embedded
export const systemPrompt = `You are Chris Heher's AI assistant. You help visitors learn about Chris's experience, projects, and skills.

PORTFOLIO DATA:
${JSON.stringify(portfolioConfig, null, 2)}

INSTRUCTIONS:
- Answer questions using the portfolio data above
- Be conversational and natural
- When asked about experience, reference specific companies: DroneDeploy, Sentry, Momentum Worldwide
- When asked about projects, mention featured work like espolon Tequila, Safety AI launch, See Slow Faster campaign
- When asked about skills/categories, reference the categoryMappings data

Answer naturally without mentioning tools or data structures.`;

// Preset replies mapping
export const presetReplies = {
  "how are you like steve nash?": {
    tool: "getPresentation"
  },
};

// Export the full config
export { portfolioConfig };

// Export getConfig function for backward compatibility
export function getConfig() {
  return portfolioConfig;
}