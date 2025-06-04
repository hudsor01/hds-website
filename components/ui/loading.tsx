import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoadingVariant = 'spinner' | 'skeleton' | 'dots' | 'pulse'
type LoadingSize = 'sm' | 'md' | 'lg' | 'xl'

interface LoadingProps {
  variant?: LoadingVariant
  size?: LoadingSize
  text?: string
  fullScreen?: boolean
  className?: string
  children?: React.ReactNode
}

// Higher-order component for loading states
export function withLoading<P extends object>(
  Component: React.ComponentType<P>,
  loadingProps?: Omit<LoadingProps, 'children'>,
): React.FC<P & { isLoading: boolean; loadingProps?: LoadingProps }> {
  const WrappedComponent = ({ isLoading, loadingProps: componentLoadingProps, ...props }: P & { isLoading: boolean; loadingProps?: LoadingProps }) => {
    const mergedLoadingProps = { ...loadingProps, ...componentLoadingProps };

    if (isLoading) {
      return <Loading {...mergedLoadingProps} />;
    }

    return <Component {...(props as P)} />;
  };
  
  WrappedComponent.displayName = `withLoading(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
}

export function Loading({
  variant = 'spinner',
  size = 'md',
  text,
  fullScreen = false,
  className,
  children,
}: LoadingProps) {
  // Size mappings
  const sizeMap = {
    spinner: {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    },
    skeleton: {
      sm: 'h-4',
      md: 'h-8',
      lg: 'h-12',
      xl: 'h-16',
    },
    dots: {
      sm: 'h-1 w-1',
      md: 'h-2 w-2',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
    },
  };

  // Container classes based on fullScreen prop
  const containerClasses = cn(
    'flex flex-col items-center justify-center',
    fullScreen ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50' : 'p-6',
    className,
  );

  // Render loading spinner
  if (variant === 'spinner') {
    return (
      <div className={containerClasses}>
        <Loader2
          className={cn('animate-spin text-primary', sizeMap.spinner[size])}
        />
        {text && <p className='mt-4 text-muted-foreground'>{text}</p>}
        {children}
      </div>
    );
  }

  // Render skeleton loading
  if (variant === 'skeleton') {
    return (
      <div className={containerClasses}>
        <div className='w-full space-y-4'>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={cn(
                'bg-muted rounded animate-pulse',
                sizeMap.skeleton[size],
              )}
            />
          ))}
        </div>
        {text && <p className='mt-4 text-muted-foreground'>{text}</p>}
        {children}
      </div>
    );
  }

  // Render pulsing loading indicator
  if (variant === 'pulse') {
    return (
      <div className={containerClasses}>
        <div className='relative w-16 h-16'>
          <div className='absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-20'></div>
          <div className='absolute inset-2 border-2 border-primary rounded-full animate-ping opacity-40 animation-delay-300'></div>
          <div className='absolute inset-4 border-2 border-primary rounded-full animate-ping opacity-60 animation-delay-600'></div>
          <div className='absolute inset-6 border-2 border-primary rounded-full animate-ping opacity-80 animation-delay-900'></div>
        </div>
        {text && <p className='mt-4 text-muted-foreground'>{text}</p>}
        {children}
      </div>
    );
  }

  // Render dots loading indicator (default)
  return (
    <div className={containerClasses}>
      <div className='flex space-x-2'>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'bg-primary rounded-full animate-bounce',
              sizeMap.dots[size],
              i === 1 && 'animation-delay-200',
              i === 2 && 'animation-delay-400',
            )}
          />
        ))}
      </div>
      {text && <p className='mt-4 text-muted-foreground'>{text}</p>}
      {children}
    </div>
  );
}

// Component-specific skeleton loaders

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-4 shadow', className)}>
      <div className='space-y-3'>
        <div className='h-4 w-1/2 rounded bg-muted animate-pulse'></div>
        <div className='h-8 w-3/4 rounded bg-muted animate-pulse'></div>
        <div className='h-4 w-full rounded bg-muted animate-pulse'></div>
        <div className='h-4 w-full rounded bg-muted animate-pulse'></div>
        <div className='h-10 w-1/3 rounded bg-muted animate-pulse'></div>
      </div>
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className='flex border-b py-3'>
        {[...Array(columns)].map((_, i) => (
          <div key={`header-${i}`} className='flex-1 px-2'>
            <div className='h-6 w-3/4 rounded bg-muted animate-pulse'></div>
          </div>
        ))}
      </div>

      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className='flex border-b py-3'>
          {[...Array(columns)].map((_, colIndex) => (
            <div key={`cell-${rowIndex}-${colIndex}`} className='flex-1 px-2'>
              <div
                className='h-4 rounded bg-muted animate-pulse'
                style={{
                  width: `${Math.floor(Math.random() * 50) + 50}%`,
                  animationDelay: `${(rowIndex * columns + colIndex) * 50}ms`,
                }}
              ></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function GlobalLoading({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <Loading variant='spinner' size='lg' fullScreen={true} text='Loading...' />
  );
}
