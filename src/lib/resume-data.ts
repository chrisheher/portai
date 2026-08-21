export const FLUENCIES = [
  "gtm content",
  "product storytelling",
  "brand strategy",
  "developer relations",
  "demand gen content",
  "UX writing",
  "agentic marketing",
  "content operations",
  "video scripts + production",
  "social media",
  "AI/ML technical content",
  "customer stories",
  "thought leadership",
  "performance marketing",
] as const;

export type Fluency = typeof FLUENCIES[number];

export const FLUENCY_SYNONYMS: Record<Fluency, string[]> = {
  "gtm content":               ["go-to-market", "product launch", "launch content", "launch strategy"],
  "product storytelling":      ["product narrative", "product messaging", "product marketing"],
  "brand strategy":            ["brand positioning", "brand development", "brand identity"],
  "developer relations":       ["devrel", "developer advocacy", "developer marketing", "developer community"],
  "demand gen content":        ["demand generation", "lead generation", "pipeline content", "inbound content"],
  "UX writing":                ["microcopy", "ux copy", "product copy", "interface writing", "in-product copy"],
  "agentic marketing":         ["ai-native marketing", "autonomous marketing", "ai marketing", "agentic workflows"],
  "content operations":        ["content ops", "editorial operations", "content workflow", "editorial process"],
  "video scripts + production":["video scripting", "video content", "script writing", "video production", "video strategy"],
  "social media":              ["social content", "social strategy", "social channels", "social calendar"],
  "AI/ML technical content":   ["ai content", "machine learning content", "technical ai", "ml content"],
  "customer stories":          ["case studies", "customer success", "customer evidence", "testimonials"],
  "thought leadership":        ["executive content", "industry insights", "byline", "opinion content"],
  "performance marketing":     ["paid media", "conversion content", "performance content", "paid social"],
};
