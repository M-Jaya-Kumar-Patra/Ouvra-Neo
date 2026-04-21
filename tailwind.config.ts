import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";
const config: Config = {
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: '#09090b', // Deep black-zinc
  			foreground: '#fafafa',
  			card: {
  				DEFAULT: '#121214',
  				foreground: '#fafafa'
  			},
  			primary: {
  				DEFAULT: '#3b82f6', // Premium Blue
  				foreground: '#ffffff'
  			},
  			accent: {
  				DEFAULT: '#8b5cf6', // AI/Premium Violet
  				foreground: '#ffffff'
  			},
  			border: '#27272a', // Subtle borders
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	},
	
  },
  plugins: [tailwindAnimate],
};

export default config;