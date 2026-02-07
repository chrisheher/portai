// src/app/api/chat/tools/getSkills.ts
import { portfolioConfig } from '@/lib/config-loader';

export const getSkills = {
  execute: async () => {
    console.log('🔧 getSkills called');
    
    // Extract unique technologies from all projects and experience
    const techFromProjects = portfolioConfig.projects
      .flatMap(p => p.techStack || [])
      .filter(Boolean);
    
    const techFromExperience = portfolioConfig.experience
      .flatMap(exp => exp.technologies || [])
      .filter(Boolean);
    
    const allTech = [...new Set([...techFromProjects, ...techFromExperience])];
    
    // Extract topics from experience
    const topics = portfolioConfig.experience
      .flatMap(exp => exp.topics || [])
      .filter(Boolean);
    
    return {
      technologies: allTech,
      topics: [...new Set(topics)],
      categories: Object.keys(portfolioConfig.categoryMappings || {}),
      strengths: portfolioConfig.unique_strengths,
      atsKeywords: portfolioConfig.ATSKeywords
    };
  }
};