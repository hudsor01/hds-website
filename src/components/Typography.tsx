import type { ReactNode } from 'react';

interface TypographyProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'hero' | 'subtitle' | 'body';
}

/**
 * Typography component that provides consistent text styling across the application.
 * Uses the global .typography CSS class for base styles with optional variants.
 */
export const Typography = ({
  children,
  className = "",
  variant = 'default',
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLDivElement>) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'hero':
        return 'text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight text-balance';
      case 'subtitle':
        return 'text-xl md:text-2xl text-gray-300 leading-relaxed text-pretty';
      case 'body':
        return 'text-gray-300 leading-relaxed';
      default:
        return '';
    }
  };

  return (
    <div
      className={`typography ${getVariantClasses()} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Typography tokens for consistent text styling
 */
export const TYPOGRAPHY_CLASSES = {
  hero: "text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight text-balance",
  subtitle: "text-xl md:text-2xl text-gray-300 leading-relaxed text-pretty",
  body: "text-gray-300 leading-relaxed",
  description: "text-xl text-gray-400 max-w-3xl mx-auto",
  stat: "text-base lg:text-lg font-semibold text-gray-300",
} as const;

export default Typography;