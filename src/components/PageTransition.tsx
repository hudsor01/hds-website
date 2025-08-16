"use client";

import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

// Smooth easing curves
const easing = [0.16, 1, 0.3, 1] as [number, number, number, number];

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: easing,
      staggerChildren: 0.1,
    },
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
    transition: {
      duration: 0.4,
      ease: easing,
    },
  },
};

// Content stagger animation
const contentVariants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easing,
    },
  },
};

// Loading overlay for page transitions
const loadingVariants = {
  initial: {
    scaleX: 0,
    originX: 0,
  },
  animate: {
    scaleX: 1,
    transition: {
      duration: 0.8,
      ease: easing,
    },
  },
  exit: {
    scaleX: 0,
    originX: 1,
    transition: {
      duration: 0.6,
      ease: easing,
    },
  },
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}

// Section animation wrapper
export function AnimatedSection({ 
  children, 
  delay = 0,
  className = "",
}: { 
  children: ReactNode; 
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="initial"
      whileInView="in"
      viewport={{ once: true, amount: 0.2 }}
      variants={contentVariants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Page loading overlay component
export function PageLoadingOverlay() {
  return (
    <motion.div
      variants={loadingVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed top-0 left-0 right-0 z-[60] h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
    />
  );
}

// Smooth reveal animation for elements
export function RevealOnScroll({ 
  children, 
  direction = "up",
  delay = 0,
  className = "",
}: { 
  children: ReactNode; 
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string;
}) {
  const directionVariants = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
  };

  const variants = {
    hidden: {
      opacity: 0,
      ...directionVariants[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easing,
        delay,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered list animation
export function StaggeredList({ 
  children, 
  staggerDelay = 0.1,
  className = "",
}: { 
  children: ReactNode; 
  staggerDelay?: number;
  className?: string;
}) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easing,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
      className={className}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div key={index} variants={itemVariants}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={itemVariants}>{children}</motion.div>
      )}
    </motion.div>
  );
}

export default PageTransition;