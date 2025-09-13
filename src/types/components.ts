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


// PanInfo for drag interactions (framer-motion stub)
export interface PanInfo {
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
}




export interface CustomSelectOption {
  value: string;
  label: string;
}






// Touch Interaction State
export interface TouchState {
  isTouching: boolean;
  touchStart: { x: number; y: number } | null;
  touchEnd: { x: number; y: number } | null;
  swipeDirection: "left" | "right" | "up" | "down" | null;
}

// Utility Types
export type FeatureFlagKey = string;