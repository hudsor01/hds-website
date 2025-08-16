"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Base skeleton component
export function Skeleton({ 
  className = "",
  animate = true,
  ...props 
}: { 
  className?: string; 
  animate?: boolean;
  [key: string]: unknown;
}) {
  const baseClasses = "bg-gray-300/20 dark:bg-gray-700/20 rounded-md";
  
  if (!animate) {
    return <div className={cn(baseClasses, className)} {...props} />;
  }

  return (
    <motion.div
      className={cn(baseClasses, className)}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      {...props}
    />
  );
}

// Shimmer effect skeleton
export function ShimmerSkeleton({ 
  className = "",
  ...props 
}: { 
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-gray-300/20 dark:bg-gray-700/20 rounded-md", className)} {...props}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

// Card skeleton
export function CardSkeleton({ 
  showImage = true,
  showButton = true,
  lines = 3,
  className = "",
}: { 
  showImage?: boolean;
  showButton?: boolean;
  lines?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "p-6 rounded-xl border border-gray-200/10 dark:border-gray-800/50",
        "bg-white/5 dark:bg-black/20 backdrop-blur-sm",
        className
      )}
    >
      {showImage && (
        <ShimmerSkeleton className="w-full h-48 mb-4" />
      )}
      
      <div className="space-y-3">
        <ShimmerSkeleton className="h-6 w-3/4" />
        
        {Array.from({ length: lines }).map((_, i) => (
          <ShimmerSkeleton 
            key={i} 
            className={cn(
              "h-4",
              i === lines - 1 ? "w-1/2" : "w-full"
            )}
          />
        ))}
      </div>
      
      {showButton && (
        <div className="mt-6">
          <ShimmerSkeleton className="h-10 w-32" />
        </div>
      )}
    </motion.div>
  );
}

// Navigation skeleton
export function NavSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo skeleton */}
          <ShimmerSkeleton className="h-8 w-32" />
          
          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <ShimmerSkeleton key={i} className="h-8 w-16 mx-2" />
            ))}
          </div>
          
          {/* CTA button */}
          <ShimmerSkeleton className="h-10 w-24 hidden sm:block" />
          
          {/* Mobile menu button */}
          <ShimmerSkeleton className="h-8 w-8 md:hidden" />
        </div>
      </div>
    </motion.div>
  );
}

// Footer skeleton
export function FooterSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-black/80 backdrop-blur-md mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand section */}
          <div>
            <ShimmerSkeleton className="h-8 w-40 mb-4" />
            <ShimmerSkeleton className="h-4 w-full mb-2" />
            <ShimmerSkeleton className="h-4 w-3/4 mb-6" />
            
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <ShimmerSkeleton key={i} className="h-4 w-48" />
              ))}
            </div>
          </div>
          
          {/* Link columns */}
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i}>
              <ShimmerSkeleton className="h-5 w-20 mb-4" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <ShimmerSkeleton key={j} className="h-4 w-16" />
                ))}
              </div>
            </div>
          ))}
          
          {/* Newsletter section */}
          <div>
            <ShimmerSkeleton className="h-5 w-24 mb-4" />
            <ShimmerSkeleton className="h-4 w-full mb-4" />
            <div className="space-y-3">
              <ShimmerSkeleton className="h-10 w-full" />
              <ShimmerSkeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="border-t border-gray-800/50 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <ShimmerSkeleton className="h-4 w-64" />
            
            <div className="flex items-center gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <ShimmerSkeleton key={i} className="h-10 w-10 rounded-lg" />
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <ShimmerSkeleton className="h-4 w-20" />
              <ShimmerSkeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Hero section skeleton
export function HeroSkeleton() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative py-32 overflow-hidden"
    >
      <div className="relative max-w-6xl mx-auto text-center px-6 sm:px-8 lg:px-12">
        <ShimmerSkeleton className="h-6 w-32 mx-auto mb-8 rounded-full" />
        
        <div className="space-y-4 mb-8">
          <ShimmerSkeleton className="h-16 w-full max-w-4xl mx-auto" />
          <ShimmerSkeleton className="h-16 w-3/4 mx-auto" />
        </div>
        
        <div className="space-y-2 mb-12">
          <ShimmerSkeleton className="h-6 w-full max-w-2xl mx-auto" />
          <ShimmerSkeleton className="h-6 w-2/3 mx-auto" />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <ShimmerSkeleton className="h-12 w-36" />
          <ShimmerSkeleton className="h-12 w-32" />
        </div>
      </div>
    </motion.section>
  );
}

// Content skeleton
export function ContentSkeleton({ 
  lines = 6,
  showTitle = true,
  className = "",
}: { 
  lines?: number;
  showTitle?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("space-y-4", className)}
    >
      {showTitle && (
        <ShimmerSkeleton className="h-8 w-1/2 mb-6" />
      )}
      
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerSkeleton 
          key={i} 
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </motion.div>
  );
}

// Grid skeleton
export function GridSkeleton({ 
  columns = 3,
  rows = 2,
  cardType = "default",
  className = "",
}: { 
  columns?: number;
  rows?: number;
  cardType?: "default" | "image" | "simple";
  className?: string;
}) {
  const totalCards = columns * rows;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "grid gap-6",
        {
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-3": columns === 3,
          "grid-cols-1 md:grid-cols-2": columns === 2,
          "grid-cols-1 md:grid-cols-4": columns === 4,
        },
        className
      )}
    >
      {Array.from({ length: totalCards }).map((_, i) => {
        if (cardType === "image") {
          return (
            <CardSkeleton
              key={i}
              showImage={true}
              showButton={true}
              lines={2}
            />
          );
        }
        
        if (cardType === "simple") {
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-4 rounded-lg border border-gray-200/10 dark:border-gray-800/50 bg-white/5 dark:bg-black/20"
            >
              <ShimmerSkeleton className="h-5 w-3/4 mb-3" />
              <ShimmerSkeleton className="h-4 w-full mb-2" />
              <ShimmerSkeleton className="h-4 w-1/2" />
            </motion.div>
          );
        }
        
        return (
          <CardSkeleton
            key={i}
            showImage={false}
            showButton={false}
            lines={3}
          />
        );
      })}
    </motion.div>
  );
}

// Page skeleton wrapper
export function PageSkeleton({ 
  showNav = true,
  showHero = true,
  showFooter = true,
  children,
}: { 
  showNav?: boolean;
  showHero?: boolean;
  showFooter?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {showNav && <NavSkeleton />}
      
      <main className={cn(showNav && "pt-16")}>
        {showHero && <HeroSkeleton />}
        {children}
      </main>
      
      {showFooter && <FooterSkeleton />}
    </div>
  );
}

// Staggered loading animation
export function StaggeredSkeleton({ 
  items,
  staggerDelay = 0.1,
  className = "",
}: { 
  items: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * staggerDelay,
          }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
}