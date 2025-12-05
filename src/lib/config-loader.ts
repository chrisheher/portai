// lib/config-loader.ts
import ConfigParser from './config-parser';
import { PortfolioConfig } from '@/types/portfolio';

// Import the configuration file - using dynamic import for better compatibility
let portfolioConfig: PortfolioConfig;

try {
  // Import JSON configuration
  portfolioConfig = require('../../portfolio-config.json') as PortfolioConfig;
  console.log('✅ Portfolio config loaded successfully');
} catch (error) {
  console.error('❌ Failed to load portfolio configuration:', error);
  // Provide a fallback minimal config to prevent the app from crashing
  portfolioConfig = {
    personal: {
      name: 'Configuration Error',
      age: 0,
      location: 'Unknown',
      title: 'Error Loading Config',
      email: 'error@example.com',
      handle: '@error',
      bio: 'Error loading configuration',
          avatar: '',  // Add this
    fallbackAvatar: '' // Add this
    },
    education: {
      current: {
        degree: 'Error',
        institution: 'Error',
        duration: 'Error',
        cgpa: 'Error',
        graduationDate: 'Error'
      },
      achievements: []
    },
    experience: [],
    skills: {
      programming: [],
      ml_ai: [],
      web_development: [],
      databases: [],
      devops_cloud: [],
      iot_hardware: [],
      soft_skills: []
    },
    projects: [],
    social: {
      linkedin: '',
      github: '',
      twitter: '',
      kaggle: '',
      leetcode: ''
    },
    internship: {
      seeking: false,
      duration: '',
      startDate: '',
      preferredLocation: '',
      focusAreas: [],
      availability: '',
      workStyle: '',
      goals: ''
    },
    personality: {
      traits: [],
      interests: [],
      funFacts: [],
      workingStyle: '',
      motivation: ''
    },
    resume: {
      title: 'My Resume',
      description: 'Full resume PDF',
      lastUpdated: '2025-11-20',
      downloadUrl: '/resume.pdf'
    },
    chatbot: {
      name: 'Assistant',
      personality: 'Helpful',
      tone: 'Professional',
      language: 'English',
      responseStyle: 'Concise',
      useEmojis: false,
      topics: []
    },
    presetQuestions: {
      me: [],
      professional: [],
      projects: [],
      achievements: [],
      contact: [],
      fun: []
    },
    presetAnswers: {
      me: '',
      skills: '',
      projects: '',
      resume: '',
      achievements: '',
      opportunities: '',
      contact: '',
      fun: '',
      professional: ''
    },
    meta: {
      configVersion: '1.0.0',
      lastUpdated: new Date().toISOString(),
      generatedBy: 'Fallback Config',
      description: 'Emergency fallback configuration'
    }
  } as PortfolioConfig;
}

// Create a parser instance
let configParser: ConfigParser;
try {
  configParser = new ConfigParser(portfolioConfig);
  console.log('✅ ConfigParser created successfully');
} catch (error) {
  console.error('❌ Failed to create ConfigParser:', error);
  throw error;
}

// Export configuration and parsed data
export const getConfig = (): PortfolioConfig => portfolioConfig;
export const getConfigParser = (): ConfigParser => configParser;

// Export pre-parsed common data for easy access with safety checks
export const systemPrompt = (() => {
  try {
    return configParser.generateSystemPrompt();
  } catch (error) {
    console.error('❌ Error generating system prompt:', error);
    return 'You are a helpful assistant.';
  }
})();

export const contactInfo = (() => {
  try {
    return configParser.generateContactInfo();
  } catch (error) {
    console.error('❌ Error generating contact info:', error);
    return {};
  }
})();

export const profileInfo = (() => {
  try {
    return configParser.generateProfileInfo();
  } catch (error) {
    console.error('❌ Error generating profile info:', error);
    return {};
  }
})();

export const skillsData = (() => {
  try {
    return configParser.generateSkillsData();
  } catch (error) {
    console.error('❌ Error generating skills data:', error);
    return [];
  }
})();

export const projectData = (() => {
  try {
    const data = configParser.generateProjectData();
    console.log('📂 Project data loaded:', data?.length || 0, 'projects');
    return data;
  } catch (error) {
    console.error('❌ Error generating project data:', error);
    return [];
  }
})();

export const presetReplies = (() => {
  try {
    const replies = configParser.generatePresetReplies();
    console.log('📋 Preset replies loaded:', Object.keys(replies || {}).length, 'replies');
    return replies || {};
  } catch (error) {
    console.error('❌ Error generating preset replies:', error);
    return {};
  }
})();

export const resumeDetails = (() => {
  try {
    return configParser.generateResumeDetails();
  } catch (error) {
    console.error('❌ Error generating resume details:', error);
    return {};
  }
})();

export const internshipInfo = (() => {
  try {
    return configParser.generateInternshipInfo();
  } catch (error) {
    console.error('❌ Error generating internship info:', error);
    return {};
  }
})();

// Log configuration status
console.log('🔧 Config Loader Status:');
console.log('  - System Prompt:', systemPrompt ? '✅ Loaded' : '❌ Missing');
console.log('  - Contact Info:', Object.keys(contactInfo).length > 0 ? '✅ Loaded' : '❌ Missing');
console.log('  - Profile Info:', Object.keys(profileInfo).length > 0 ? '✅ Loaded' : '❌ Missing');
console.log('  - Skills Data:', skillsData.length > 0 ? `✅ ${skillsData.length} skills` : '❌ Missing');
console.log('  - Project Data:', projectData.length > 0 ? `✅ ${projectData.length} projects` : '❌ Missing');
console.log('  - Preset Replies:', Object.keys(presetReplies).length > 0 ? `✅ ${Object.keys(presetReplies).length} replies` : '❌ Missing');
console.log('  - Resume Details:', Object.keys(resumeDetails).length > 0 ? '✅ Loaded' : '❌ Missing');
console.log('  - Internship Info:', Object.keys(internshipInfo).length > 0 ? '✅ Loaded' : '❌ Missing');