// src/app/api/chat/tools/getProjects.ts
import { tool } from "ai";
import { z } from "zod";
import { projectData } from "@/lib/config-loader";

export const getProjects = tool({
  description: `CRITICAL: Always analyze the user's query for filtering keywords before calling this tool.

This tool retrieves Chris Heher's portfolio projects. YOU MUST extract and pass filter parameters based on the user's question.

FILTER DECISION RULES (FOLLOW THESE EXACTLY):
1. Technology mentions → USE techStack parameter
2. Category/industry mentions → USE category parameter
3. Quality indicators → USE featured parameter
4. Specific keywords → USE keyword parameter
5. Generic requests → NO parameters

IMPORTANT: Extract these from natural language. Don't require exact phrasing.`,
  
  parameters: z.object({
    category: z.string().optional().describe("EXTRACT from queries mentioning: SaaS, DevOps, Developer Relations, GTM, content strategy, pharmaceuticals, etc."),
    techStack: z.string().optional().describe("EXTRACT from queries mentioning: React, Python, Ceros, Gemini, Next.js, TypeScript, etc."),
    featured: z.boolean().optional().describe("SET TO TRUE when user asks for: best, featured, top, favorite, proud projects"),
    keyword: z.string().optional().describe("EXTRACT company names (DroneDeploy, Sentry, Airbnb) or topics (AI, automation) from the query"),
  }),
  
  execute: async ({ category, techStack, featured, keyword }) => {
    console.log('🔧 getProjects called with params:', { category, techStack, featured, keyword });
    
    let projects = projectData || [];
    console.log('📊 Total projects before filtering:', projects.length);
    
    if (projects.length > 0) {
      console.log('🔍 Sample raw project data (first project):', JSON.stringify(projects[0], null, 2));
    }
    
    if (category) {
      console.log('🔍 Filtering by category:', category);
      projects = projects.filter((p: any) => {
        const projectCategory = Array.isArray(p.category) 
          ? p.category.join(' ') 
          : typeof p.category === 'string' 
          ? p.category 
          : String(p.category || '');
        
        const matches = projectCategory.toLowerCase().includes(category.toLowerCase());
        if (matches) console.log('  ✅ Match:', p.title);
        return matches;
      });
    }
    
    if (techStack) {
      console.log('🔍 Filtering by techStack:', techStack);
      projects = projects.filter((p: any) => {
        const matches = p.techStack?.some((tech: string) =>
          tech.toLowerCase().includes(techStack.toLowerCase())
        );
        if (matches) console.log('  ✅ Match:', p.title);
        return matches;
      });
      console.log('📊 After techStack filter:', projects.length);
    }
    
    if (featured !== undefined) {
      console.log('🔍 Filtering by featured:', featured);
      projects = projects.filter((p: any) => p.featured === featured);
      console.log('📊 After featured filter:', projects.length);
    }
    
    if (keyword) {
      console.log('🔍 Filtering by keyword:', keyword);
      const kw = keyword.toLowerCase();
      projects = projects.filter((p: any) => {
        const matches = p.title?.toLowerCase().includes(kw) ||
                       p.description?.toLowerCase().includes(kw);
        if (matches) console.log('  ✅ Match:', p.title);
        return matches;
      });
      console.log('📊 After keyword filter:', projects.length);
    }
    
    console.log('✅ Final filtered projects:', projects.length);
    
    const result = projects.map((project: any) => {
      console.log(`📦 Mapping project: ${project.title}`);
      console.log(`   - Has links property: ${!!project.links}`);
      console.log(`   - Links value:`, project.links);
      
      return {
        title: project.title,
        category: project.category,
        date: project.date,
        description: project.description,
        techStack: project.techStack || [],
        featured: project.featured || false,
        links: project.links || [],
        highlights: project.metrics || [],
      };
    });
    
    console.log('🎯 Final result with links:', JSON.stringify(result, null, 2));
    
    return {
      projects: result,
      summary: projects.length 
        ? `Found ${projects.length} project(s) matching your criteria.`
        : "No projects found matching those filters.",
    };
  },
});