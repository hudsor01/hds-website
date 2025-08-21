"use client";

// Motion import removed for build stability
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { BentoGridProps, BentoCardProps } from "@/types/components";

// Animation variants removed for build stability

export function BentoGrid({ 
  children, 
  columns = 3, 
  gap = "md",
  className 
}: BentoGridProps) {
  const gapClasses = {
    sm: "gap-3",
    md: "gap-6",
    lg: "gap-8",
  };

  const columnClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-3 lg:grid-cols-6",
  };

  return (
    <div
      className={cn(
        "grid auto-rows-min",
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoCard({ 
  children, 
  size = "md",
  span,
  className,
  gradient = false,
  hover = true,
}: BentoCardProps) {
  const sizeClasses = {
    sm: "p-4 min-h-[120px]",
    md: "p-6 min-h-[200px]",
    lg: "p-8 min-h-[300px]",
    xl: "p-10 min-h-[400px]",
  };

  const spanClasses = span ? 
    `${span.col ? `col-span-${span.col}` : ''} ${span.row ? `row-span-${span.row}` : ''}`.trim() 
    : '';

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-white/5 dark:bg-black/20",
        "backdrop-blur-sm",
        "border border-white/10 dark:border-gray-800/50",
        "transition-all duration-300",
        hover && "hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10",
        sizeClasses[size],
        spanClasses,
        className
      )}
    >
      {/* Gradient overlay */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />
      )}
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}

// Feature Card for Bento Grid
export function BentoFeatureCard({
  icon,
  title,
  description,
  stats,
  action,
  ...props
}: BentoCardProps & {
  icon?: ReactNode;
  title: string;
  description: string;
  stats?: { label: string; value: string }[];
  action?: ReactNode;
}) {
  return (
    <BentoCard {...props}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          {icon && (
            <div 
              className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
            >
              {icon}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">{description}</p>
          
          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center"
                >
                  <div className="text-xl font-bold text-cyan-400">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action */}
        {action && (
          <div className="mt-auto pt-4">
            {action}
          </div>
        )}
      </div>
    </BentoCard>
  );
}

// Stats Card for Bento Grid
export function BentoStatsCard({
  value,
  label,
  trend,
  icon,
  color = "cyan",
  ...props
}: BentoCardProps & {
  value: string | number;
  label: string;
  trend?: { value: number; isPositive: boolean };
  icon?: ReactNode;
  color?: "cyan" | "blue" | "purple" | "green" | "red";
}) {
  const colorClasses = {
    cyan: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400",
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400",
    green: "from-green-500/20 to-green-600/20 border-green-500/30 text-green-400",
    red: "from-red-500/20 to-red-600/20 border-red-500/30 text-red-400",
  };

  return (
    <BentoCard {...props} size="sm" gradient>
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-2">{label}</p>
            <div 
              className="text-3xl font-bold text-white"
            >
              {value}
            </div>
          </div>
          
          {icon && (
            <div className={cn(
              "p-2 rounded-lg bg-gradient-to-br border",
              colorClasses[color]
            )}>
              {icon}
            </div>
          )}
        </div>
        
        {trend && (
          <div 
            className={cn(
              "mt-4 text-sm font-medium",
              trend.isPositive ? "text-green-400" : "text-red-400"
            )}
          >
            {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </BentoCard>
  );
}

// Image Card for Bento Grid
export function BentoImageCard({
  src,
  alt,
  title,
  description,
  overlay = true,
  ...props
}: BentoCardProps & {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  overlay?: boolean;
}) {
  return (
    <BentoCard {...props} className="p-0 overflow-hidden">
      <div className="relative h-full">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        )}
        
        {(title || description) && (
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {title && (
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
            )}
            {description && (
              <p className="text-gray-300 text-sm">{description}</p>
            )}
          </div>
        )}
      </div>
    </BentoCard>
  );
}

// Interactive Card for Bento Grid
export function BentoInteractiveCard({
  children,
  onClick,
  ...props
}: BentoCardProps & {
  onClick?: () => void;
}) {
  return (
    <BentoCard
      {...props}
      className={cn(
        props.className,
        onClick && "cursor-pointer"
      )}
    >
      <div
        onClick={onClick}
        className="h-full"
      >
        {children}
      </div>
    </BentoCard>
  );
}

// Video Card for Bento Grid
export function BentoVideoCard({
  videoSrc,
  posterSrc,
  title,
  description,
  ...props
}: BentoCardProps & {
  videoSrc: string;
  posterSrc?: string;
  title?: string;
  description?: string;
}) {
  return (
    <BentoCard {...props} className="p-0 overflow-hidden">
      <div className="relative h-full">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={posterSrc}
          className="w-full h-full object-cover"
                            >
          <source src={videoSrc} type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {(title || description) && (
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {title && (
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
            )}
            {description && (
              <p className="text-gray-300 text-sm">{description}</p>
            )}
          </div>
        )}
      </div>
    </BentoCard>
  );
}

export default BentoGrid;