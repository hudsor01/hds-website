"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

interface BentoCardProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  span?: {
    col?: number;
    row?: number;
  };
  className?: string;
  gradient?: boolean;
  hover?: boolean;
  delay?: number;
}

// Animation variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "grid auto-rows-min",
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function BentoCard({ 
  children, 
  size = "md",
  span,
  className,
  gradient = false,
  hover = true,
  delay = 0,
}: BentoCardProps) {
  const sizeClasses = {
    sm: "p-4 min-h-[120px]",
    md: "p-6 min-h-[200px]",
    lg: "p-8 min-h-[300px]",
    xl: "p-10 min-h-[400px]",
  };

  const spanClasses = span ? {
    ...(span.col && { [`col-span-${span.col}`]: true }),
    ...(span.row && { [`row-span-${span.row}`]: true }),
  } : {};

  return (
    <motion.div
      variants={cardVariants}
      transition={{ delay }}
      whileHover={hover ? { 
        scale: 1.02, 
        y: -5,
        transition: { duration: 0.3 }
      } : undefined}
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
    </motion.div>
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
            <motion.div 
              className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              {icon}
            </motion.div>
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
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="text-center"
                >
                  <div className="text-xl font-bold text-cyan-400">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </motion.div>
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
            <motion.div 
              className="text-3xl font-bold text-white"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2 
              }}
            >
              {value}
            </motion.div>
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
          <motion.div 
            className={cn(
              "mt-4 text-sm font-medium",
              trend.isPositive ? "text-green-400" : "text-red-400"
            )}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
          </motion.div>
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
        <motion.img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
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
      <motion.div
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="h-full"
      >
        {children}
      </motion.div>
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
        <motion.video
          autoPlay
          muted
          loop
          playsInline
          poster={posterSrc}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        >
          <source src={videoSrc} type="video/mp4" />
        </motion.video>
        
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