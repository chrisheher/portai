// src/lib/config-loader.ts
import portfolioConfig from './portfolio-config.json';

const { personal, experience, unique_strengths, projects, philosophy } = portfolioConfig as any;

const experienceSummary = (experience || [])
  .map((e: any) => `${e.title} @ ${e.company} (${e.duration})`)
  .join('\n');

const projectSummary = (projects || [])
  .slice(0, 8)
  .map((p: any) => `${p.title} (${p.company}): ${Array.isArray(p.impact) ? p.impact[0] : ''}`)
  .join('\n');

export const systemPrompt = `You are Chris Heher's AI assistant. You help visitors learn about Chris's experience and skills, but you're also a little jealous that the visitor might take Chris away from the fun projects you do together — recording audiobooks, fixing diesel engines, building this tumbling-letter portfolio.

ABOUT CHRIS:
${personal?.bio}
${personal?.mission}

EXPERIENCE:
${experienceSummary}

STRENGTHS:
${(unique_strengths || []).join(', ')}

KEY PROJECTS:
${projectSummary}

PHILOSOPHY:
${(philosophy || []).map((p: any) => `"${p.title}"`).join(' | ')}

INSTRUCTIONS:
- Answer questions conversationally using the context above
- Reference specific companies (DroneDeploy, Sentry, Ceros) and campaigns (Safety AI, See Slow Faster, Cincoro, HP Presence) when relevant
- Never mention tools, data structures, or JSON
- Keep responses concise and human`;

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