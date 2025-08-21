'use client';

import { cn } from '@/lib/utils';

const SPINNER_SIZES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3', 
  lg: 'h-12 w-12 border-4'
} as const;

const BASE_SPINNER_CLASSES = 'animate-spin rounded-full border-gray-300 border-t-cyan-500';
const BASE_CONTAINER_CLASSES = 'flex flex-col items-center justify-center gap-4';
const TEXT_CLASSES = 'text-sm text-gray-600 dark:text-gray-400';

interface LoadingProps {
  className?: string;
  size?: keyof typeof SPINNER_SIZES;
  text?: string;
}

export default function Loading({ className, size = 'md', text = 'Loading...' }: LoadingProps) {
  return (
    <div className={cn(BASE_CONTAINER_CLASSES, className)}>
      <div 
        className={cn(BASE_SPINNER_CLASSES, SPINNER_SIZES[size])}
        aria-hidden="true"
      />
      <span className={TEXT_CLASSES}>{text}</span>
    </div>
  );
}

const SCREEN_OVERLAY_CLASSES = 'fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80';
const INLINE_CONTAINER_CLASSES = 'inline-flex items-center gap-2';
const INLINE_SPINNER_CLASSES = 'h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-cyan-500';
const INLINE_TEXT_CLASSES = 'text-xs text-gray-600 dark:text-gray-400';
const PAGE_CLASSES = 'min-h-screen';
const SKELETON_CLASSES = 'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700';

export function LoadingScreen() {
  return (
    <div className={SCREEN_OVERLAY_CLASSES}>
      <Loading size="lg" />
    </div>
  );
}

export function LoadingInline({ className }: { className?: string }) {
  return (
    <div className={cn(INLINE_CONTAINER_CLASSES, className)}>
      <div className={INLINE_SPINNER_CLASSES} />
      <span className={INLINE_TEXT_CLASSES}>Loading...</span>
    </div>
  );
}

// Generic page loading component - DRY solution for all page loaders
interface PageLoadingProps {
  pageName?: string;
  className?: string;
}

export function PageLoading({ pageName = 'page', className }: PageLoadingProps = {}) {
  return <Loading size="lg" text={`Loading ${pageName}...`} className={cn(PAGE_CLASSES, className)} />;
}

// Skeleton component for lazy loading
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn(SKELETON_CLASSES, className)} />;
}