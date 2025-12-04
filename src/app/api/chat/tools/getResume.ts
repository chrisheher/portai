import { tool } from 'ai';
import { z } from 'zod';
import { getConfig } from '@/lib/config-loader';

export const getResume = tool({
  description:
    'This tool provides comprehensive resume information including professional experience, education, and achievements.',
  parameters: z.object({}),
  execute: async () => {
    const config = getConfig();
    
    return {
      personalInfo: {
        name: config.personal.name,
        email: config.personal.email,
        location: config.personal.location,
        title: config.personal.title,
        profiles: {
          github: config.social.github,
          linkedin: config.social.linkedin,
          twitter: config.social.twitter,
          kaggle: config.social.kaggle,
          leetcode: config.social.leetcode
        }
      },
      summary: config.personal.bio,
      education: {
        current: config.education.current,
        achievements: config.education.achievements
      },
      experience: config.experience.map(exp => ({
        company: exp.company,
        position: exp.position,
        duration: exp.duration,
        type: exp.type,
        description: exp.description,
        technologies: exp.technologies
      })),
      skills: config.skills,
      resume: {
        title: config.resume.title,
        description: config.resume.description,
        lastUpdated: config.resume.lastUpdated,
        downloadUrl: config.resume.downloadUrl
      },
      message: ""
    };
  },
});
