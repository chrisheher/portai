// src/app/api/chat/tools/getProjects.ts
import { portfolioConfig } from '@/lib/config-loader';

interface GetProjectsInput {
  keyword?: string;
  techStack?: string;
  category?: string;
  featured?: boolean;
}

export const getProjects = {
  execute: async (input: GetProjectsInput = {}) => {
    console.log('🔧 getProjects called with:', input);
    
    let filtered = portfolioConfig.projects;

    // Filter by keyword (searches title, description, category)
    if (input.keyword) {
      const kw = input.keyword.toLowerCase();
      filtered = filtered.filter(p => {
        const titleMatch = p.title?.toLowerCase().includes(kw);
        const descMatch = p.description?.toLowerCase().includes(kw);
        
        // Handle category as both string and array
        let catMatch = false;
        if (p.category) {
          if (Array.isArray(p.category)) {
            catMatch = p.category.some(cat => cat.toLowerCase().includes(kw));
          } else if (typeof p.category === 'string') {
            catMatch = p.category.toLowerCase().includes(kw);
          }
        }
        
        return titleMatch || descMatch || catMatch;
      });
    }

    // Filter by techStack
    if (input.techStack) {
      const tech = input.techStack.toLowerCase();
      filtered = filtered.filter(p => {
        if (Array.isArray(p.techStack)) {
          return p.techStack.some(t => t.toLowerCase().includes(tech));
        } else if (typeof p.techStack === 'string') {
          return p.techStack.toLowerCase().includes(tech);
        }
        return false;
      });
    }

    // Filter by category
    if (input.category) {
      const cat = input.category.toLowerCase();
      filtered = filtered.filter(p => {
        if (Array.isArray(p.category)) {
          return p.category.some(c => c.toLowerCase().includes(cat));
        } else if (typeof p.category === 'string') {
          return p.category.toLowerCase().includes(cat);
        }
        return false;
      });
    }

    // Filter by featured
    if (input.featured) {
      filtered = filtered.filter(p => p.featured === true);
    }

    console.log(`✅ Returning ${filtered.length} projects`);
    
    return {
      projects: filtered.map(p => ({
        title: p.title,
        category: p.category,
        description: p.description,
        techStack: p.techStack,
        featured: p.featured,
        links: p.links,
        duration: p.duration
      })),
      total: filtered.length,
      filters: input
    };
  }
};