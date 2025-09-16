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
        return 'text-clamp-2xl font-black text-white leading-none tracking-tight text-balance';
      case 'subtitle':
        return 'text-responsive-md text-gray-300 leading-relaxed text-pretty';
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
  hero: "text-clamp-2xl font-black text-white leading-none tracking-tight text-balance",
  subtitle: "text-responsive-md text-gray-300 leading-relaxed text-pretty",
  body: "text-gray-300 leading-relaxed",
  description: "text-xl text-gray-400 container-narrow",
  stat: "text-responsive-sm font-semibold text-gray-300",
} as const;

export default Typography;