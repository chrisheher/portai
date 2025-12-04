import { Tool } from 'ai'; // or whatever the SDK exports

export const careerInfo: Tool = {
  name: 'career-info',
  description: 'Provides ...',
  parameters: z.object({}),
  async execute() {
    const config = getConfig();
    return {
      availability: 'open',
      preferences: { /* ... */ },
      experience: { /* ... */ },
      professionalMessage: 'Ready for new opportunities.',
    };
  },
};