"use client";
import React from 'react';

// Skeleton loading component
export function Skeleton({ 
  className = "", 
  rows = 1,
  animated = true 
}: { 
  className?: string;
  rows?: number;
  animated?: boolean;
}) {
  const baseClasses = `bg-gray-300 dark:bg-gray-700 rounded ${animated ? 'animate-pulse' : ''}`;
  
  if (rows === 1) {
    return <div className={`${baseClasses} ${className}`} />;
  }
  
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className={`${baseClasses} ${className}`}
          style={{ 
            width: i === rows - 1 ? '75%' : '100%' // Last row is shorter
          }}
        />
      ))}
    </div>
  );
}

// Card skeleton for blog posts, portfolio items, etc.
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-light rounded-xl p-6 animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-16 h-6" />
            <Skeleton className="w-12 h-4" />
          </div>
          <Skeleton className="w-full h-6 mb-3" />
          <Skeleton rows={3} className="h-4" />
          <div className="flex items-center justify-between mt-4">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-20 h-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Page loading spinner
export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-600 border-t-cyan-400 rounded-full animate-spin mx-auto mb-6"></div>
          <div className="absolute inset-0 w-20 h-20 border-2 border-cyan-400/20 rounded-full animate-ping mx-auto"></div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{message}</h2>
        <p className="text-gray-400">Please wait while we load the content</p>
      </div>
    </div>
  );
}

// Inline spinner for buttons and small elements
export function Spinner({ 
  size = "md", 
  color = "cyan" 
}: { 
  size?: "sm" | "md" | "lg";
  color?: "cyan" | "white" | "gray";
}) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3"
  };
  
  const colorClasses = {
    cyan: "border-gray-600 border-t-cyan-400",
    white: "border-gray-400 border-t-white",
    gray: "border-gray-300 border-t-gray-600"
  };
  
  return (
    <div 
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Form loading state
export function FormLoader({ message = "Submitting..." }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
      <div className="bg-white/10 rounded-lg p-6 text-center">
        <Spinner size="lg" color="cyan" />
        <p className="text-white font-medium mt-3">{message}</p>
      </div>
    </div>
  );
}

// Content placeholder with icon
export function ContentPlaceholder({ 
  icon: Icon,
  title,
  description,
  action
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-16">
      <Icon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  );
}

// Progress bar
export function ProgressBar({ 
  progress, 
  className = "",
  showPercentage = true 
}: { 
  progress: number;
  className?: string;
  showPercentage?: boolean;
}) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">Progress</span>
        {showPercentage && (
          <span className="text-sm text-cyan-400 font-medium">
            {Math.round(clampedProgress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

// Pulsing dots loader
export function DotsLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// Loading overlay for pages
export function LoadingOverlay({ 
  isVisible,
  message = "Loading...",
  transparent = false 
}: {
  isVisible: boolean;
  message?: string;
  transparent?: boolean;
}) {
  if (!isVisible) return null;
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        transparent ? 'bg-black/30' : 'bg-gradient-hero'
      } backdrop-blur-sm`}
    >
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-2 border-cyan-400/20 rounded-full animate-ping"></div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{message}</h2>
        <DotsLoader className="justify-center" />
      </div>
    </div>
  );
}