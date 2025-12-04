import type { Config } from 'tailwindcss';

const config: Config = {
  plugins: ["@tailwindcss/postcss"],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
    fontFamily: {
    
        mono: ['JetBrains Mono', 'monospace'],
      },
      },
  },
  plugins: [],
};

export default config;
