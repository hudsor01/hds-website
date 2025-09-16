"use client";

import { cn } from "@/lib/utils";

export function BackgroundPattern({
  variant = 'default',
  className,
  showGrid = true,
  showGradients = true
}: {
  variant?: 'default' | 'hero' | 'minimal';
  className?: string;
  showGrid?: boolean;
  showGradients?: boolean;
}) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {/* Floating gradient orbs */}
      {showGradients && (
        <>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-primary-20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-gradient-decorative-purple rounded-full blur-3xl" />
          
          {/* Additional orbs for hero variant */}
          {variant === 'hero' && (
            <>
              <div className="absolute top-1/2 left-1/6 w-32 h-32 bg-gradient-secondary-20 rounded-full blur-2xl" />
              <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-gradient-decorative-orange rounded-full blur-3xl" />
            </>
          )}
          
          {/* Smaller accents for minimal variant */}
          {variant === 'minimal' && (
            <div className="absolute top-1/3 right-1/2 w-24 h-24 bg-gradient-primary-20 opacity-75 rounded-full blur-xl" />
          )}
        </>
      )}

      {/* Grid pattern overlay */}
      {showGrid && variant !== 'minimal' && (
        <div className="absolute inset-0 grid-pattern" />
      )}

      {/* Subtle grid for minimal */}
      {showGrid && variant === 'minimal' && (
        <div className="absolute inset-0 grid-pattern-minimal" />
      )}
    </div>
  );
}

export default BackgroundPattern;