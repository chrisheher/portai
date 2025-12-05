import { tool } from "ai";
import { z } from "zod";
import { getConfig } from "@/lib/config-loader";

export const getContact = tool({
  description: 'Provides contact information and career opportunities',
  parameters: z.object({}),
  execute: async ({}) => {  // ✅ Change: Add empty destructured object
    const config = getConfig();
    return {
      email: config.personal?.email || '',
      linkedin: config.social?.linkedin || '',
      github: config.social?.github || '',
      location: config.personal?.location || '',
      availability: config.internship?.availability || '',
      seekingOpportunities: config.internship?.seeking || false,
    };
  },
});