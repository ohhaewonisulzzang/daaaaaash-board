import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode
        'primary-bg': '#f8f8f8',
        'primary-bg-secondary': '#ffffff',
        'primary-text': '#222222',
        'primary-text-secondary': 'rgba(0, 0, 0, 0.7)',
        'primary-text-muted': 'rgba(34, 34, 34, 0.3)',
        
        // Dark mode
        'dark-bg': '#0f0f23',
        'dark-bg-secondary': '#1a1a2e',
        'dark-text': '#ffffff',
        'dark-text-secondary': 'rgba(255, 255, 255, 0.7)',
        'dark-text-muted': 'rgba(255, 255, 255, 0.3)',
        
        // Accent colors
        'accent-yellow': '#fff083',
        'accent-orange': '#fa5d29',
        'accent-red': '#ff6b6b',
        'accent-blue': '#4facfe',
        'accent-purple': '#9f7aea',
        
        // Glassmorphism colors
        'glass-light': 'rgba(255, 255, 255, 0.25)',
        'glass-dark': 'rgba(255, 255, 255, 0.1)',
        'glass-border-light': 'rgba(255, 255, 255, 0.18)',
        'glass-border-dark': 'rgba(255, 255, 255, 0.3)',
        
        // Neutral colors
        'gray-100': '#f8f8f8',
        'gray-200': '#e9e9e9',
        'gray-300': '#ededed',
        'gray-400': 'rgba(0, 0, 0, 0.13)',
        'gray-500': 'rgba(0, 0, 0, 0.3)',
        'gray-600': 'rgba(34, 34, 34, 0.8)',
        'gray-700': '#808080',
        'gray-800': '#222222',
        'white-transparent': 'rgba(255, 255, 255, 0.9)',
        
        // Border colors
        'border-light': 'rgba(0, 0, 0, 0.1)',
        'border-medium': 'rgba(0, 0, 0, 0.13)',
        'border-dark': 'rgba(0, 0, 0, 0.3)',
        
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        'primary': ['"Pretendard Variable"', '"Pretendard"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        'secondary': ['"Pretendard Variable"', '"Pretendard"', 'sans-serif'],
        'sans': ['"Pretendard Variable"', '"Pretendard"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '14px',
        'lg': '16px',
        'xl': '18px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
      },
      maxWidth: {
        'container': '1200px',
      },
      borderRadius: {
        'none': '0px',
        'sm': '2px',
        'md': '4px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.1)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },
    },
  },
  plugins: [],
};

export default config;