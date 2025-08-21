'use client';

import { cn } from '@/lib/utils';
import Loading from './loading';

interface LoadingStateProps {
  className?: string;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingState({ className, message = 'Loading...', size = 'md' }: LoadingStateProps) {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <Loading size={size} text={message} />
    </div>
  );
}

export function ImageLoadingState({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg', className)}>
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-cyan-500" />
      </div>
    </div>
  );
}

export function FormLoadingState() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded w-32"></div>
    </div>
  );
}