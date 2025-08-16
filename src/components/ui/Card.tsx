"use client";

import { forwardRef, HTMLAttributes } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "relative rounded-xl transition-all duration-300",
  {
    variants: {
      variant: {
        glass: [
          "bg-white/10 dark:bg-black/10",
          "backdrop-blur-md",
          "border border-white/20 dark:border-white/10",
          "shadow-xl shadow-black/5",
        ],
        solid: [
          "bg-white dark:bg-gray-900",
          "border border-gray-200 dark:border-gray-800",
          "shadow-lg shadow-black/5",
        ],
        gradient: [
          "bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90",
          "backdrop-blur-sm",
          "border border-gray-800/50",
          "shadow-xl shadow-black/10",
        ],
        outline: [
          "bg-transparent",
          "border-2 border-gray-800 dark:border-gray-700",
          "hover:border-cyan-400/50",
        ],
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-2 hover:shadow-2xl",
        glow: "hover:shadow-cyan-500/25 hover:border-cyan-400/50",
        scale: "hover:scale-[1.02]",
        tilt: "",
      },
    },
    defaultVariants: {
      variant: "glass",
      size: "md",
      hover: "lift",
    },
  }
);

// Animation variants
const cardAnimationVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    }
  },
  hover: {
    transition: {
      duration: 0.3,
      ease: "easeInOut" as const,
    }
  },
};

// Tilt animation on hover
const tiltVariants = {
  initial: { rotateX: 0, rotateY: 0 },
  hover: {
    rotateX: -5,
    rotateY: 5,
    transition: {
      duration: 0.3,
      ease: "easeInOut" as const,
    }
  }
};

export interface CardProps 
  extends Omit<HTMLMotionProps<"div">, "onDrag" | "onDragStart" | "onDragEnd">,
    VariantProps<typeof cardVariants> {
  animated?: boolean;
  glowColor?: "cyan" | "blue" | "purple" | "green";
  withHoverEffect?: boolean;
  withTilt?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    size, 
    hover,
    animated = true,
    glowColor = "cyan",
    withHoverEffect = true,
    withTilt = false,
    children,
    ...props 
  }, ref) => {
    const glowColors = {
      cyan: "hover:shadow-cyan-500/25",
      blue: "hover:shadow-blue-500/25",
      purple: "hover:shadow-purple-500/25",
      green: "hover:shadow-green-500/25",
    };

    const isMotionEnabled = animated || withTilt || hover === "tilt";
    const Component = isMotionEnabled ? motion.div : "div";

    const baseProps = {
      ref,
      className: cn(
        cardVariants({ variant, size, hover }),
        hover === "glow" && glowColors[glowColor],
        className
      ),
    };

    if (!isMotionEnabled) {
      // For regular div, only use basic HTML props
      const { className } = baseProps;
      return <div className={className} ref={ref}>{children as React.ReactNode}</div>;
    }

    if (isMotionEnabled) {
      const MotionComponent = Component as typeof motion.div;
      return (
        <MotionComponent
          {...baseProps}
          {...(props as Omit<typeof props, "style">)}
          initial={animated ? "hidden" : undefined}
          animate={animated ? "visible" : undefined}
          whileHover={withHoverEffect || withTilt || hover === "tilt" ? "hover" : undefined}
          variants={
            withTilt || hover === "tilt" 
              ? { ...cardAnimationVariants, ...tiltVariants }
              : cardAnimationVariants
          }
          style={{
            ...(withTilt || hover === "tilt" ? { perspective: 1000, transformStyle: "preserve-3d" } : {}),
            ...(props.style || {}),
          }}
        >
          {/* Gradient overlay for glass variant */}
          {variant === "glass" && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          )}
          
          {/* Animated border gradient */}
          {(variant === "gradient" || variant === "glass") && withHoverEffect && (
            <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-[-1px] rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-75 blur-sm" />
            </div>
          )}
          
          <div className="relative z-10">
            {children as React.ReactNode}
          </div>
        </MotionComponent>
      );
    }

    // Fallback (should never reach here since non-motion case is handled above)
    return null;
  }
);
Card.displayName = "Card";

// Card Header Component
export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mb-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardHeader.displayName = "CardHeader";

// Card Title Component
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  gradient?: boolean;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, gradient = false, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "text-2xl font-bold",
          gradient 
            ? "bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
            : "text-white",
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);
CardTitle.displayName = "CardTitle";

// Card Description Component
export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-gray-400 mt-2", className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
CardDescription.displayName = "CardDescription";

// Card Content Component
export type CardContentProps = HTMLAttributes<HTMLDivElement>;

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardContent.displayName = "CardContent";

// Card Footer Component
export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mt-6 pt-6 border-t border-white/10", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardFooter.displayName = "CardFooter";

// Feature Card Component with icon
interface FeatureCardProps extends CardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  features?: string[];
  action?: React.ReactNode;
}

export const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon, title, description, features, action, ...props }, ref) => {
    return (
      <Card ref={ref} {...props}>
        {icon && (
          <motion.div 
            className="mb-4 inline-flex p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>
        )}
        
        <CardHeader>
          <CardTitle gradient>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        
        {features && features.length > 0 && (
          <CardContent>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <motion.li 
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-300"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="w-1 h-1 bg-cyan-400 rounded-full" />
                  {feature}
                </motion.li>
              ))}
            </ul>
          </CardContent>
        )}
        
        {action && (
          <CardFooter>
            {action}
          </CardFooter>
        )}
      </Card>
    );
  }
);
FeatureCard.displayName = "FeatureCard";

// Stats Card Component
interface StatsCardProps extends CardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  ({ label, value, trend, icon, ...props }, ref) => {
    return (
      <Card ref={ref} variant="glass" hover="glow" {...props}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-2">{label}</p>
            <motion.div 
              className="text-3xl font-bold text-white"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15 
              }}
            >
              {value}
            </motion.div>
            
            {trend && (
              <motion.div 
                className={cn(
                  "mt-2 text-sm font-medium",
                  trend.isPositive ? "text-green-400" : "text-red-400"
                )}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </motion.div>
            )}
          </div>
          
          {icon && (
            <motion.div 
              className="p-2 rounded-lg bg-white/5"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.div>
          )}
        </div>
      </Card>
    );
  }
);
StatsCard.displayName = "StatsCard";

export default Card;