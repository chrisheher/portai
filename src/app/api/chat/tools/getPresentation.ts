// src/app/api/chat/tools/getPresentation.ts
import { portfolioConfig } from '@/lib/config-loader';

export const getPresentation = {
  execute: async () => {
    console.log('🔧 getPresentation called ');
    
    return {
  
      context: {
        bio: portfolioConfig.personal.bio,
        experience: portfolioConfig.experience.map(exp => ({
          company: exp.company,
          position: exp.position,
          description: exp.description,
          impact: exp.impact,
          duration: exp.duration
        })),
        keyProjects: portfolioConfig.projects
          .filter(p => p.featured)
          .map(p => ({
            title: p.title,
            description: p.description,
            category: p.category
          })),
        strengths: portfolioConfig.unique_strengths,
        categories: portfolioConfig.categoryMappings
      },
      steveNashAnalogy: {
        assists: "Like Nash's legendary playmaking, Chris drives team success - helping DroneDeploy achieve $10M+ pipeline and Sentry reach 3x ARR",
        vision: "Nash saw plays before they happened; Chris sees content opportunities that transform technical jargon into compelling narratives",
        teamFirst: "Both prioritize making their teammates better - Chris bridges engineering, product, and sales teams",
        underdog: "Nash was the underrated pick who changed the game; Chris's value prop: 'I am what AI ain't'",
        execution: "Nash's efficiency meets Chris's proven 8-11% pipeline influence across roles"
      }
    };
  }
};