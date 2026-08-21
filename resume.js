import { readFileSync } from 'fs';
const p = JSON.parse(readFileSync('./src/lib/portfolio-config.json', 'utf8'));
const { personal, experience, devrel_expertise, tools_and_platforms } = p;

const q = s => `"${s}"`;
const arr = (items, indent = '  ') => `[\n${items.map(i => `${indent}  ${q(i)},`).join('\n')}\n${indent}]`;
const inlineArr = (items, indent = '    ') => `[\n${items.map(i => `${indent}${q(i)},`).join('\n')}\n  ]`;

const roles = experience.map(role => {
  const clients = role.clients
    ? `\n    clients: [\n${role.clients.map(c => `      { name: ${q(c.name)}, deliverable: ${q(c.deliverable)} },`).join('\n')}\n    ],`
    : '';
  const highlights = role.highlights
    ? `\n    highlights: ${arr(role.highlights, '    ')},`
    : '';
  return `  {
    title: ${q(role.title)},
    company: ${q(role.company)},
    duration: ${q(role.duration)},
    description: ${q(role.description)},${clients}${highlights}
  }`;
}).join(',\n');

const initiatives = devrel_expertise.initiatives.map(i =>
  `  {
    name: ${q(i.name)},
    description: ${q(i.description)},
    impact: ${arr(i.impact, '    ')},
  }`
).join(',\n');

const out = `/**
 * ${personal.name.toUpperCase()}
 * ${personal.title}
 * ${personal.location}
 *
 * "${personal.bio}"
 */

// ─────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────

const mission = ${q(personal.mission)};

// ─────────────────────────────────────────────
// EXPERIENCE
// ─────────────────────────────────────────────

const experience = [
${roles}
];

// ─────────────────────────────────────────────
// DEVELOPER RELATIONS
// ─────────────────────────────────────────────

// ${devrel_expertise.overview}

const devrel = [
${initiatives}
];

// ─────────────────────────────────────────────
// TOOLS & PLATFORMS
// ─────────────────────────────────────────────

const tools = {
  contentAndDesign: ${inlineArr(tools_and_platforms.content_and_design)},
  seoAndAnalytics:  ${inlineArr(tools_and_platforms.seo_and_analytics)},
  ai:               ${inlineArr(tools_and_platforms.ai)},
  code:             ${inlineArr(tools_and_platforms.code)},
};

export default { mission, experience, devrel, tools };`;

console.log(out);
