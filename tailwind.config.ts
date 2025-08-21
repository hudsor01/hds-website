import type { Config } from "tailwindcss";
import type { TailwindPluginAPI } from "@/types/test";

/**
 * Tailwind CSS Configuration
 * Enhanced with design system tokens and gradient patterns
 * Following official Tailwind v4 configuration patterns
 */

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      /**
       * Brand Gradient System
       * Consolidates 60+ hardcoded gradients across the codebase
       */
      backgroundImage: {
        // Primary brand gradients
        'brand-primary': 'linear-gradient(to right, rgb(6 182 212), rgb(59 130 246))', // cyan-500 to blue-500
        'brand-primary-hover': 'linear-gradient(to right, rgb(8 145 178), rgb(37 99 235))', // hover variant
        'brand-secondary': 'linear-gradient(to right, rgb(168 85 247), rgb(236 72 153))', // purple-500 to pink-500
        'brand-secondary-hover': 'linear-gradient(to right, rgb(147 51 234), rgb(219 39 119))', // hover variant
        'brand-accent': 'linear-gradient(to right, rgb(34 197 94), rgb(6 182 212))', // green-500 to cyan-500
        'brand-warning': 'linear-gradient(to right, rgb(245 158 11), rgb(249 115 22))', // amber-500 to orange-500
        'brand-danger': 'linear-gradient(to right, rgb(239 68 68), rgb(236 72 153))', // red-500 to pink-500
        'brand-success': 'linear-gradient(to right, rgb(34 197 94), rgb(21 128 61))', // green-500 to green-700
        
        // Surface gradients
        'surface-dark': 'linear-gradient(to bottom right, rgb(15 23 42), rgb(0 0 0), rgb(15 23 42))', // slate-900 to black
        'surface-glass': 'linear-gradient(to bottom right, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        'surface-card': 'linear-gradient(to bottom right, rgb(31 41 55 / 0.9), rgb(0 0 0 / 0.9), rgb(31 41 55 / 0.9))', // gray-800 variations
        
        // Special effect gradients
        'glow-cyan': 'linear-gradient(to right, rgb(6 182 212 / 0.2), rgb(59 130 246 / 0.2))',
        'glow-purple': 'linear-gradient(to right, rgb(168 85 247 / 0.2), rgb(236 72 153 / 0.2))',
        'glow-green': 'linear-gradient(to right, rgb(34 197 94 / 0.2), rgb(6 182 212 / 0.2))',
        'glow-orange': 'linear-gradient(to right, rgb(245 158 11 / 0.2), rgb(249 115 22 / 0.2))',
        'glow-red': 'linear-gradient(to right, rgb(239 68 68 / 0.2), rgb(236 72 153 / 0.2))',
        
        // Text gradients (for bg-clip-text)
        'text-primary': 'linear-gradient(to right, rgb(34 211 238), rgb(59 130 246))', // cyan-400 to blue-500
        'text-secondary': 'linear-gradient(to right, rgb(196 181 253), rgb(244 114 182))', // purple-300 to pink-400
        'text-accent': 'linear-gradient(to right, rgb(74 222 128), rgb(34 211 238))', // green-400 to cyan-400
        'text-rainbow': 'linear-gradient(to right, rgb(34 211 238), rgb(168 85 247), rgb(236 72 153))', // cyan to purple to pink
        
        // Background patterns
        'hero-dark': 'linear-gradient(to bottom right, rgb(2 6 23), rgb(15 23 42), rgb(2 6 23))', // Very dark blue gradient
        'section-dark': 'linear-gradient(to bottom, rgb(15 23 42), rgb(31 41 55), rgb(15 23 42))', // Dark section gradient
        'overlay-dark': 'linear-gradient(to top, rgb(0 0 0 / 0.6), transparent)', // Dark overlay for images
        
        // Shimmer effects for loading
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        'skeleton': 'linear-gradient(90deg, rgb(31 41 55), rgb(55 65 81), rgb(31 41 55))', // gray-800 to gray-700
      },
      
      /**
       * Animation System
       */
      animation: {
        // Enhanced loading animations
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        
        // Entrance animations
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-left': 'slideLeft 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.3s ease-in',
        
        // Gradient animations
        'gradient-x': 'gradientX 3s ease infinite',
        'gradient-y': 'gradientY 3s ease infinite',
        'gradient-xy': 'gradientXY 3s ease infinite',
        
        // Glow effects
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'glow-rotate': 'glowRotate 4s linear infinite',
      },
      
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        gradientX: {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        gradientY: {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'center top' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'center bottom' },
        },
        gradientXY: {
          '0%, 100%': { 'background-size': '400% 400%', 'background-position': 'left center' },
          '50%': { 'background-size': '400% 400%', 'background-position': 'right center' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '1', filter: 'brightness(100%)' },
          '50%': { opacity: '0.8', filter: 'brightness(120%)' },
        },
        glowRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      
      /**
       * Typography Scale
       */
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      /**
       * Spacing Scale
       */
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '92': '23rem',
        '100': '25rem',
        '104': '26rem',
        '108': '27rem',
        '112': '28rem',
        '116': '29rem',
        '120': '30rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      /**
       * Border Radius Scale
       */
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      
      /**
       * Box Shadow System
       */
      boxShadow: {
        'glow-sm': '0 0 10px rgba(6, 182, 212, 0.3)',
        'glow': '0 0 20px rgba(6, 182, 212, 0.4)',
        'glow-lg': '0 0 30px rgba(6, 182, 212, 0.5)',
        'glow-cyan': '0 0 30px rgba(6, 182, 212, 0.4)',
        'glow-blue': '0 0 30px rgba(59, 130, 246, 0.4)',
        'glow-purple': '0 0 30px rgba(168, 85, 247, 0.4)',
        'glow-green': '0 0 30px rgba(34, 197, 94, 0.4)',
        'glow-orange': '0 0 30px rgba(249, 115, 22, 0.4)',
        'glow-red': '0 0 30px rgba(239, 68, 68, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(6, 182, 212, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'glass-lg': '0 16px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      },
      
      /**
       * Z-Index Scale
       */
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Custom utilities for hover effects
    function({ addUtilities }: TailwindPluginAPI) {
      const newUtilities = {
        '.hover-lift': {
          'transition': 'all 0.3s ease',
          '&:hover': {
            'transform': 'translateY(-4px)',
            'box-shadow': '0 10px 25px rgba(0, 0, 0, 0.2)',
          },
        },
        '.hover-scale': {
          'transition': 'transform 0.3s ease',
          '&:hover': {
            'transform': 'scale(1.05)',
          },
        },
        '.hover-glow': {
          'transition': 'all 0.3s ease',
          '&:hover': {
            'box-shadow': '0 0 20px rgba(6, 182, 212, 0.4)',
          },
        },
        '.glass-effect': {
          'background': 'rgba(255, 255, 255, 0.05)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.text-glow': {
          'text-shadow': '0 0 10px currentColor',
        },
        '.animate-gradient': {
          'background-size': '200% 200%',
          'animation': 'gradientX 3s ease infinite',
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
} satisfies Config;

export default config;