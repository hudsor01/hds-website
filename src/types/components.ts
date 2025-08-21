// Component type definitions

export interface NavigationItem {
  name: string;
  href: string;
}

export interface Service {
  title: string;
  description: string;
  features: string[];
  pricing: string;
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface Statistic {
  value: string;
  title: string;
}

export interface SocialLink {
  name: string;
  href: string;
  icon: () => React.ReactNode;
}

export interface QuickLink {
  name: string;
  href: string;
}

export interface ContactInfo {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  value: string;
  link: string;
}

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  className?: string;
  showBackground?: boolean;
}

export interface ServiceCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features: string[];
}

// Testimonial types
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  content: string;
  rating?: number;
  featured?: boolean;
}

export interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  variant?: "default" | "cards" | "minimal" | "centered";
  showRating?: boolean;
  showNavigation?: boolean;
  showDots?: boolean;
  className?: string;
}

// PanInfo for drag interactions (framer-motion stub)
export interface PanInfo { 
  offset: { x: number; y: number }; 
  velocity: { x: number; y: number }; 
}

// Bento Grid Components
export interface BentoGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export interface BentoCardProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  span?: {
    col?: number;
    row?: number;
  };
  className?: string;
  gradient?: boolean;
  hover?: boolean;
}

// Error Boundary Components
export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

// Loading State Components
export interface LoadingStateProps {
  title?: string;
  message?: string;
  variant?: 'spinner' | 'pulse' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Error Page Components
export interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  message?: string;
}

// AnimatePresence stub props
export interface AnimatePresenceProps {
  children: React.ReactNode;
  initial?: boolean;
  custom?: number;
  mode?: 'wait' | 'sync' | 'popLayout';
}