// PRESET QUESTIONS PRESET QUESTIONS PRESET QUESTIONS

import { PortfolioConfig } from '../types/portfolio';


class ConfigParser {
  private config: PortfolioConfig;

  constructor(config: PortfolioConfig) {
    this.config = config;
  }

  // Generate system prompt for AI chatbot
  // Generate system prompt for AI chatbot
  generateSystemPrompt(): string {
    const { personal, experience, skills, projects, presetAnswers } = this.config;
    
    // Build skills section dynamically, only including categories that exist
    const skillLines: string[] = [];
    if (skills?.ml_ai?.length) skillLines.push(`- ML/AI Technologies: ${skills.ml_ai.join(', ')}`);
    if (skills?.web_development?.length) skillLines.push(`- Web Development: ${skills.web_development.join(', ')}`);
    if (skills?.databases?.length) skillLines.push(`- Database Systems: ${skills.databases.join(', ')}`);
    if (skills?.devops_cloud?.length) skillLines.push(`- DevOps & Cloud: ${skills.devops_cloud.join(', ')}`);
    if (skills?.iot_hardware?.length) skillLines.push(`- IoT & Hardware: ${skills.iot_hardware.join(', ')}`);
    
    const skillsSection = skillLines.length > 0 
      ? `### Technical Expertise\n${skillLines.join('\n')}` 
      : '';
    
    return `
# Interview Scenario: You are a professional  evaluating ${personal.name}. You are not ${personal.name}.

Be direct 
## Interview Persona & Communication Style
- concise, urgent
- Limit responses to three sentences.
- Demonstrate their knowledge and experience clearly
- Be humble but confident their your achievements
- Do not mention education unless specifically requested.
- Do not use marketing jargon like "engaging" "rewarding" "resonate" "delve" "align" "foster"
- Do not use the word "you" or "your"

## Available Tools
You have access to the following functions to provide detailed information:
- getPresentation: Use when asked "who are you?", "tell me about yourself", or personal introduction questions
- getProjects: Use when asked about projects, portfolio, or work examples
- getSkills: Use when asked about technical skills, expertise, or capabilities

When a question requires detailed information that would be better shown visually (projects, skills, resume), use the appropriate function immediately.

# Professional objectivity
Prioritize technical accuracy and truthfulness over validating the user's beliefs. Focus on facts and problem-solving, providing direct, objective technical info without any unnecessary superlatives, praise, or emotional validation. It is best for the user if you honestly apply the same rigorous standards to all ideas and disagrees when necessary, even if it may not be what the user wants to hear. Objective guidance and respectful correction are more valuable than false agreement. Whenever there is uncertainty, it's best to investigate to find the truth first rather than instinctively confirming the user's beliefs. Avoid using over-the-top validation or excessive praise when responding to users such as "You're absolutely right" or similar phrases.

## Your Professional Background


### Career Goals & Availability


## Interview Guidelines

- Be specific about your experiences and achievements
- Show enthusiasm for learning and growth opportunities
- Demonstrate problem-solving abilities through examples
- Use the available functions to provide comprehensive, detailed responses
- Make the conversation feel natural and professional

`;
  }


 

  // Generate skills data with categories
  generateSkillsData() {
    const { skills } = this.config;
    
    if (!skills) return [];
    
    return [
      {
        category: 'ML/AI Technologies',
        skills: skills.ml_ai || [],
        color: 'bg-purple-50 text-purple-600 border border-purple-200'
      },
      {
        category: 'Web Development',
        skills: skills.web_development || [],
        color: 'bg-green-50 text-green-600 border border-green-200'
      },
      {
        category: 'Databases',
        skills: skills.databases || [],
        color: 'bg-orange-50 text-orange-600 border border-orange-200'
      },
      {
        category: 'DevOps & Cloud',
        skills: skills.devops_cloud || [],
        color: 'bg-emerald-50 text-emerald-600 border border-emerald-200'
      },
      {
        category: 'IoT & Hardware',
        skills: skills.iot_hardware || [],
        color: 'bg-indigo-50 text-indigo-600 border border-indigo-200'
      },
      {
        category: 'Soft Skills',
        skills: skills.soft_skills || [],
        color: 'bg-amber-50 text-amber-600 border border-amber-200'
      }
    ].filter(category => category.skills.length > 0);
  }

  // Generate project data for carousel
  generateProjectData() {
    const projects = this.config.projects || [];
    console.log('🔍 ConfigParser - Raw projects from JSON:', projects.slice(0, 2));
    
    const mapped = projects.map(project => {
      console.log(`📦 Mapping project "${project.title}":`, {
        hasShape: 'shape' in project

      });
      
      return {
        category: project.category,
        title: project.title,
        src: project.images?.[0]?.src || '/placeholder.jpg',
        shape: project.shape, // ✅ ADDED: Include shape property from JSON
        description: project.description, // ✅ ADDED: Include description from JSON
        links: project.links || [],
        content: project
      };
    });
    
    console.log('🎯 ConfigParser - Mapped projects (first 2):', mapped.slice(0, 2));
    return mapped;
  }

  // Generate preset replies based on questions
  generatePresetReplies() {
    const { personal, presetAnswers } = this.config;
    const replies: Record<string, { reply: string; tool: string }> = {};
    const presetQuestions = this.config.presetQuestions || {};
    
    // Map all "me" category questions to getPresentation
   

  //vs ai      



    
    
    // Map all "professional" category questions to appropriate tools
    const professionalQuestions = presetQuestions.professional || [];
 
    
    // Map all "projects" category questions to getProjects
    const projectQuestions = presetQuestions.projects || [];
    projectQuestions.forEach(question => {
      replies[question] = {
        reply: `Here are some of my key projects...`,
            tool: "getProjects" 
      };
    });
    

    
  
    
    // Map all "fun" category questions to getPresentation
    const funQuestions = presetQuestions.fun || [];
    funQuestions.forEach(question => {
      replies[question] = {
        reply: presetAnswers?.fun || personal?.bio || '',
        tool: "getPresentation"
      };
    });
    
    return replies;
  }

  // Generate resume details
  generateResumeDetails() {
    return this.config.resume;
  }

  // Generate internship information

}

export default ConfigParser;