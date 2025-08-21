/**
 * Hudson Digital Solutions Brand Guidelines
 * Consistent branding across all touchpoints
 */

export const brand = {
  // Company Information
  name: 'Hudson Digital Solutions',
  shortName: 'HDS',
  tagline: 'Ship 3x Faster, 60% Cheaper',
  mission: 'We eliminate technical bottlenecks so you can focus on growth',
  
  // Brand Personality
  voice: {
    tone: 'Professional yet approachable',
    style: 'Direct, results-focused, confident',
    keywords: ['efficiency', 'speed', 'reliability', 'expertise', 'partnership']
  },

  // Visual Identity
  colors: {
    // Primary Colors
    primary: {
      cyan: '#22d3ee',      // Primary accent
      blue: '#3b82f6',      // Secondary accent
      purple: '#a855f7',    // Tertiary accent
    },
    // Dark Theme Colors
    dark: {
      background: '#020718', // Main background
      surface: '#0f172a',   // Card/surface background
      border: '#1e293b',    // Borders
    },
    // Text Colors
    text: {
      primary: '#ffffff',   // Primary text
      secondary: '#cbd5e1', // Secondary text
      muted: '#64748b',     // Muted text
    },
    // Gradient Combinations
    gradients: {
      primary: 'from-cyan-400 via-blue-500 to-purple-600',
      glow: 'from-cyan-500/20 to-blue-500/20',
      text: 'from-cyan-400 to-blue-400',
    }
  },

  // Typography
  typography: {
    fonts: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)',
    },
    sizes: {
      hero: 'text-4xl md:text-6xl xl:text-7xl',
      title: 'text-3xl md:text-4xl xl:text-5xl',
      heading: 'text-2xl md:text-3xl',
      subheading: 'text-xl md:text-2xl',
      body: 'text-base md:text-lg',
      small: 'text-sm',
    }
  },

  // Value Propositions
  values: [
    {
      headline: 'Ship Features 3x Faster',
      description: 'Launch new features in days, not months',
      icon: 'RocketLaunchIcon'
    },
    {
      headline: '60% Cost Reduction',
      description: 'Senior expertise without the senior price tag',
      icon: 'CurrencyDollarIcon'
    },
    {
      headline: '250% Average ROI',
      description: 'Proven returns within 6 months',
      icon: 'ChartBarIcon'
    },
    {
      headline: 'Zero Onboarding Time',
      description: 'Hit the ground running from day one',
      icon: 'ClockIcon'
    }
  ],

  // Target Audience
  audience: {
    primary: 'B2B SaaS founders and CTOs',
    secondary: 'Growth-stage startups',
    painPoints: [
      'Technical debt slowing growth',
      'Can\'t hire fast enough',
      'Features taking too long to ship',
      'Infrastructure not scaling',
      'Losing revenue to bugs'
    ]
  },

  // Competitive Differentiators
  differentiators: [
    'Senior-only team (10+ years experience)',
    'Fixed-price engagements',
    'Money-back guarantee',
    '24/7 support availability',
    'White-glove onboarding'
  ],

  // Social Proof Elements
  socialProof: {
    metrics: {
      projectsDelivered: '50+',
      clientSatisfaction: '98%',
      avgROI: '250%',
      supportAvailability: '24/7'
    },
    industries: [
      'FinTech',
      'HealthTech', 
      'E-commerce',
      'EdTech',
      'MarketingTech'
    ]
  },

  // Contact Information
  contact: {
    email: 'hello@hudsondigitalsolutions.com',
    calendly: 'https://calendly.com/hudsondigital/strategy',
    response: 'Response within 2 hours'
  },

  // SEO & Meta
  seo: {
    title: 'Hudson Digital Solutions - Ship 3x Faster, 60% Cheaper',
    description: 'Senior engineering team that eliminates your technical bottlenecks. Launch features in days, not months. 250% average ROI. Get your free roadmap.',
    keywords: [
      'technical consulting',
      'software development',
      'B2B SaaS development',
      'React development',
      'Next.js experts',
      'technical bottlenecks',
      'scale engineering team',
      'fractional CTO'
    ]
  }
} as const;

// Helper function to get gradient classes
export const getGradient = (type: keyof typeof brand.colors.gradients) => {
  return `bg-gradient-to-r ${brand.colors.gradients[type]}`;
};

// Helper function to get consistent button styles
export const getButtonStyles = (variant: 'primary' | 'secondary' | 'ghost') => {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-300';
  
  switch (variant) {
    case 'primary':
      return `${base} px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/25`;
    case 'secondary':
      return `${base} px-6 py-3 border-2 border-gray-600 text-white hover:border-cyan-400 hover:bg-cyan-400/5`;
    case 'ghost':
      return `${base} px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5`;
  }
};