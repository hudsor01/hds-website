"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  badge?: string;
  variant?: "default" | "gradient" | "video" | "minimal";
  backgroundElements?: ReactNode;
  className?: string;
}

// Floating animation variants
const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

// Text animation variants
const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

// Stagger container variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

export function HeroSection({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  badge,
  variant = "default",
  backgroundElements,
  className,
}: HeroSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const getVariantClasses = () => {
    switch (variant) {
      case "gradient":
        return "bg-gradient-to-br from-gray-900 via-black to-blue-900/50";
      case "video":
        return "bg-black relative overflow-hidden";
      case "minimal":
        return "bg-white dark:bg-gray-900";
      default:
        return "bg-gradient-to-br from-gray-900 via-black to-gray-900";
    }
  };

  return (
    <motion.section
      ref={ref}
      style={{ y, opacity }}
      className={cn(
        "relative min-h-screen flex items-center justify-center overflow-hidden",
        getVariantClasses(),
        className
      )}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 2 }}
          className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        />
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 4 }}
          className="absolute top-1/2 left-1/6 w-32 h-32 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-full blur-2xl"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]" />
        </div>

        {/* Custom Background Elements */}
        {backgroundElements}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Badge */}
          {badge && (
            <motion.div variants={textVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 text-cyan-400 font-semibold text-sm backdrop-blur-sm">
                <SparklesIcon className="w-4 h-4" />
                {badge}
              </span>
            </motion.div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <motion.div variants={textVariants}>
              <p className="text-cyan-400 font-semibold text-lg tracking-wide uppercase">
                {subtitle}
              </p>
            </motion.div>
          )}

          {/* Title */}
          <motion.div variants={textVariants}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight">
              {title.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  className={cn(
                    "inline-block mr-4",
                    index % 2 === 1 && "bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"
                  )}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.1 + 0.5,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>
          </motion.div>

          {/* Description */}
          <motion.div variants={textVariants}>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {description}
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div variants={textVariants}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
              {primaryCTA && (
                <Link href={primaryCTA.href}>
                  <motion.button
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold text-lg rounded-lg overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Shimmer effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <span className="relative z-10">{primaryCTA.text}</span>
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
              )}

              {secondaryCTA && (
                <Link href={secondaryCTA.href}>
                  <motion.button
                    className="group inline-flex items-center gap-3 px-8 py-4 border-2 border-gray-700 text-white font-semibold text-lg rounded-lg hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {secondaryCTA.text}
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            variants={textVariants}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-3 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

// Specialized Hero variants
export function VideoHero({
  videoSrc,
  posterSrc,
  ...props
}: HeroSectionProps & {
  videoSrc: string;
  posterSrc?: string;
}) {
  return (
    <HeroSection
      {...props}
      variant="video"
      backgroundElements={
        <>
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={posterSrc}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50" />
        </>
      }
    />
  );
}

export function MinimalHero(props: HeroSectionProps) {
  return (
    <HeroSection
      {...props}
      variant="minimal"
      backgroundElements={
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800" />
      }
    />
  );
}

export function GradientHero(props: HeroSectionProps) {
  return (
    <HeroSection
      {...props}
      variant="gradient"
      backgroundElements={
        <>
          {/* Animated gradient mesh */}
          <motion.div
            animate={{
              background: [
                "radial-gradient(circle at 20% 80%, #00b4d8 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0077b6 0%, transparent 50%), radial-gradient(circle at 40% 40%, #023e8a 0%, transparent 50%)",
                "radial-gradient(circle at 80% 80%, #0077b6 0%, transparent 50%), radial-gradient(circle at 20% 20%, #00b4d8 0%, transparent 50%), radial-gradient(circle at 60% 60%, #023e8a 0%, transparent 50%)",
                "radial-gradient(circle at 20% 80%, #00b4d8 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0077b6 0%, transparent 50%), radial-gradient(circle at 40% 40%, #023e8a 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute inset-0 opacity-50"
          />
        </>
      }
    />
  );
}

export default HeroSection;