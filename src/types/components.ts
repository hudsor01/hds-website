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
  subtitle: string;
  ctaText: string;
  secondaryCtaText: string;
}

export interface ServiceCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features: string[];
}