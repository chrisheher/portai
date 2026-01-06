import { tool } from 'ai';
import { z } from 'zod';
import { getConfig } from '@/lib/config-loader';

export const getSkills = tool({
  description:
    'This tool provides a comprehensive overview of technical skills, expertise, and professional qualifications.',
  inputSchema: z.object({}),  // Changed from 'parameters' to 'inputSchema'
  execute: async () => {  // Changed from '({})' to '()' since there are no parameters
    const config = getConfig();
    
    return {
      technicalSkills: {
        programming: config.skills.programming,
        machineLearning: config.skills.ml_ai,
        webDevelopment: config.skills.web_development,
        databases: config.skills.databases,
        devOpsCloud: config.skills.devops_cloud,
        iotHardware: config.skills.iot_hardware
      },
      education: {
        degree: config.education.current.degree,
        institution: config.education.current.institution,
        cgpa: config.education.current.cgpa,
        duration: config.education.current.duration
      },
      achievements: config.education.achievements || [],
      message: ""
    };
  },
});