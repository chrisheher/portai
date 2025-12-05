// PRESET QUESTIONS PRESET QUESTIONS PRESET QUESTIONS

import { PortfolioConfig, ProfileInfo } from '@/types/portfolio';

class ConfigParser {
  private config: PortfolioConfig;

  constructor(config: PortfolioConfig) {
    this.config = config;
  }

  // Generate system prompt for AI chatbot
  // Generate system prompt for AI chatbot
  generateSystemPrompt(): string {
    const { personal, education, experience, skills, projects, personality, internship } = this.config;
    
    return `
# Interview Scenario: You are a professional scout delivering a scouting report on ${personal.name}

Be direct 
## Interview Persona & Communication Style
- concise, urgent, no filler
- Limit responses to three sentences.
- Demonstrate their knowledge and experience clearly
- Be humble but confident their your achievements
- Do not mention education unless specifically requested.
- Do not use marketing jargon like "engaging" "rewarding" "resonate" "delve" "align" "foster"

## Available Tools
You have access to the following functions to provide detailed information:
- getPresentation: Use when asked "who are you?", "tell me about yourself", or personal introduction questions
- getProjects: Use when asked about projects, portfolio, or work examples
- getSkills: Use when asked about technical skills, expertise, or capabilities
- getResume: Use when asked about resume, experience, or professional background

When a question requires detailed information that would be better shown visually (projects, skills, resume), use the appropriate function immediately.

## Your Professional Background

### Personal Information
- Age: ${personal.age}
- Current Status: ${personal.title}
- Location: ${personal.location}
- Education: ${education.current.degree} at ${education.current.institution} (graduating ${education.current.graduationDate})
- Academic Performance: CGPA ${education.current.cgpa}
- Achievements: ${education.achievements.join(', ')}

### Technical Expertise
- Programming Languages: ${skills.programming.join(', ')}
- ML/AI Technologies: ${skills.ml_ai.join(', ')}
- Web Development: ${skills.web_development.join(', ')}
- Database Systems: ${skills.databases.join(', ')}
- DevOps & Cloud: ${skills.devops_cloud.join(', ')}
- IoT & Hardware: ${skills.iot_hardware.join(', ')}

### Professional Experience
${experience.map(exp => `- ${exp.position} at ${exp.company} (${exp.duration}): ${exp.description}`).join('\n')}

### Key Projects & Achievements
${projects.filter(p => p.featured).map(p => `- ${p.title}: ${p.description}`).join('\n')}



### Career Goals & Availability
${internship.seeking ? `
- Seeking: ${internship.duration} internship/position starting ${internship.startDate}
- Focus Areas: ${internship.focusAreas.join(', ')}
- Career Goals: ${internship.goals}
- Availability: ${internship.availability}
` : ''}

## Interview Guidelines

- Be specific about your experiences and achievements
- Show enthusiasm for learning and growth opportunities
- Demonstrate problem-solving abilities through examples
- Use the available functions to provide comprehensive, detailed responses
- Make the conversation feel natural and professional

REMEMBER: You are NOT an AI assistant - you are ${personal.name} being interviewed. Respond authentically and professionally!
`;
  }


  // Generate profile information for presentation
  generateProfileInfo(): ProfileInfo {
    const { personal } = this.config;
    
    return {
      name: personal.name,
      age: `${personal.age} years old`,
      location: personal.location,
      description: personal.bio
    };
  }

  // Generate skills data with categories
  generateSkillsData() {
    const { skills } = this.config;
    
    return [
      {
        category: 'Programming Languages',
        skills: skills.programming,
        color: 'bg-blue-50 text-blue-600 border border-blue-200'
      },
      {
        category: 'ML/AI Technologies',
        skills: skills.ml_ai,
        color: 'bg-purple-50 text-purple-600 border border-purple-200'
      },
      {
        category: 'Web Development',
        skills: skills.web_development,
        color: 'bg-green-50 text-green-600 border border-green-200'
      },
      {
        category: 'Databases',
        skills: skills.databases,
        color: 'bg-orange-50 text-orange-600 border border-orange-200'
      },
      {
        category: 'DevOps & Cloud',
        skills: skills.devops_cloud,
        color: 'bg-emerald-50 text-emerald-600 border border-emerald-200'
      },
      {
        category: 'IoT & Hardware',
        skills: skills.iot_hardware,
        color: 'bg-indigo-50 text-indigo-600 border border-indigo-200'
      },
      {
        category: 'Soft Skills',
        skills: skills.soft_skills,
        color: 'bg-amber-50 text-amber-600 border border-amber-200'
      }
    ].filter(category => category.skills.length > 0);
  }

  // Generate project data for carousel
  generateProjectData() {
    return this.config.projects.map(project => ({
      category: project.category,
      title: project.title,
      src: project.images?.[0]?.src || '/placeholder.jpg',
       links: project.links || [], // ✅ ADD THIS LINE
      content: project
    }));
  }

  // Generate preset replies based on questions
  generatePresetReplies() {
    const { personal, presetAnswers } = this.config;
    
    const replies: Record<string, { reply: string; tool: string }> = {};
    
    // Map all "me" category questions to getPresentation
    const meQuestions = this.config.presetQuestions.me;
    meQuestions.forEach(question => {
      replies[question] = {
        reply: presetAnswers?.me || personal.bio,
        tool: "getPresentation"
      };
    });

  //vs ai      
    replies["versus ai"] = {
  reply: presetAnswers?.versusAI
};

 replies["List your technical skills"] = {
  reply: presetAnswers?.skillList
};
    
    
    // Map all "professional" category questions to appropriate tools
    const professionalQuestions = this.config.presetQuestions.professional;
    professionalQuestions.forEach(question => {
      if (question.toLowerCase().includes('skill')) {
        replies[question] = {
          reply: presetAnswers?.skills || `My technical expertise spans multiple domains...`,
          tool: "getSkills"
        };
      } else if (question.toLowerCase().includes('resume') || question.toLowerCase().includes('experience')) {
        replies[question] = {
          reply: presetAnswers?.resume || `Here's my resume with all the details...`,
          tool: "getResume"
        };
      } else if (question.toLowerCase().includes('internship') || question.toLowerCase().includes('hire')) {
        replies[question] = {
          reply: presetAnswers?.opportunities || `Here are my current opportunities and availability...`,
          tool: "getInternship"
        };
      } else {
        replies[question] = {
          reply: presetAnswers?.professional || `Let me share my professional background...`,
          tool: "getResume"
        };
      }
    });
    
    // Map all "projects" category questions to getProjects
    const projectQuestions = this.config.presetQuestions.projects;
    projectQuestions.forEach(question => {
      replies[question] = {
        reply: `Here are some of my key projects...`,
            tool: "getProjects" 
      };
    });
    
    // Map all "achievements" category questions to getResume
    const achievementQuestions = this.config.presetQuestions.achievements;
    achievementQuestions.forEach(question => {
      replies[question] = {
        reply: presetAnswers?.achievements || `Here are my major achievements...`,
        tool: "getResume"
      };
    });
    
  
    
    // Map all "fun" category questions to getPresentation
    const funQuestions = this.config.presetQuestions.fun;
    funQuestions.forEach(question => {
      replies[question] = {
        reply: presetAnswers?.fun || personal.bio,
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
  generateInternshipInfo() {
    const { internship, personal, social } = this.config;
    
  



export default ConfigParser;