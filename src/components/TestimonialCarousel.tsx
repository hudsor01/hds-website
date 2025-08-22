"use client";

import { m } from '@/lib/motion';
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import type { Testimonial, TestimonialCarouselProps, AnimatePresenceProps } from "@/types/components";

// AnimatePresence stub for removed framer-motion dependency
const AnimatePresence = ({ children }: AnimatePresenceProps) => <>{children}</>;

// Animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.4 },
      scale: { duration: 0.4 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
    transition: {
      x: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.4 },
      scale: { duration: 0.4 },
    },
  }),
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export function TestimonialCarousel({
  testimonials,
  autoPlay = true,
  autoPlayInterval = 5000,
  variant = "default",
  showRating = true,
  showNavigation = true,
  showDots = true,
  className,
}: TestimonialCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const previous = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const goTo = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && testimonials.length > 1) {
      const interval = setInterval(next, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, next, testimonials.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") previous();
      if (e.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, previous]);

  // Touch/swipe handlers (simplified for stub implementation)
  const handleDragEnd = () => {
    // Simplified: just advance to next testimonial
    next();
  };

  if (variant === "cards") {
    return <TestimonialCards testimonials={testimonials} className={className} />;
  }

  if (variant === "minimal") {
    return (
      <TestimonialMinimal
        testimonials={testimonials}
        current={current}
        onNext={next}
        onPrevious={previous}
        className={className}
      />
    );
  }

  // Handle empty testimonials
  if (testimonials.length === 0) {
    return (
      <div className={cn("relative max-w-6xl mx-auto", className)}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-gray-800/50 p-8 md:p-12">
          <p className="text-center text-gray-400">No testimonials available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative max-w-6xl mx-auto", className)}>
      {/* Main Carousel */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-gray-800/50">
        <AnimatePresence initial={false} custom={direction}>
          <m.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="p-8 md:p-12 cursor-grab active:cursor-grabbing"
          >
            <TestimonialContent 
              testimonial={testimonials[current]} 
              showRating={showRating}
              variant={variant}
            />
          </m.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {showNavigation && testimonials.length > 1 && (
        <div className="flex items-center justify-between absolute top-1/2 left-4 right-4 transform -translate-y-1/2 pointer-events-none">
          <m.button
            onClick={previous}
            className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 pointer-events-auto"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Previous testimonial"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </m.button>

          <m.button
            onClick={next}
            className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 pointer-events-auto"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Next testimonial"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </m.button>
        </div>
      )}

      {/* Dots Navigation */}
      {showDots && testimonials.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <m.button
              key={index}
              onClick={() => goTo(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === current
                  ? "bg-cyan-400 w-8"
                  : "bg-gray-600 hover:bg-gray-500"
              )}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TestimonialContent({ 
  testimonial, 
  showRating,
  variant 
}: { 
  testimonial: Testimonial; 
  showRating: boolean;
  variant: string;
}) {
  if (variant === "centered") {
    return (
      <div className="text-center max-w-4xl mx-auto">
        {/* Rating */}
        {showRating && testimonial.rating && (
          <m.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-1 mb-6"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                className={cn(
                  "w-5 h-5",
                  i < testimonial.rating! ? "text-yellow-400" : "text-gray-600"
                )}
              />
            ))}
          </m.div>
        )}

        {/* Quote */}
        <m.blockquote
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl font-light text-white leading-relaxed mb-8"
        >
          &quot;{testimonial.content}&quot;
        </m.blockquote>

        {/* Author */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-4"
        >
          {testimonial.avatar && (
            <Image
              src={testimonial.avatar}
              alt={testimonial.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full border-2 border-cyan-400/50"
            />
          )}
          <div>
            <div className="font-semibold text-white">{testimonial.name}</div>
            <div className="text-gray-400 text-sm">
              {testimonial.role} at {testimonial.company}
            </div>
          </div>
        </m.div>
      </div>
    );
  }

  // Default layout
  return (
    <div className="grid md:grid-cols-3 gap-8 items-center">
      {/* Author Info */}
      <m.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center md:text-left"
      >
        {testimonial.avatar && (
          <m.img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-20 h-20 rounded-full mx-auto md:mx-0 mb-4 border-2 border-cyan-400/50"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        )}
        <h3 className="text-xl font-bold text-white mb-1">{testimonial.name}</h3>
        <p className="text-gray-400 text-sm mb-2">{testimonial.role}</p>
        <p className="text-cyan-400 text-sm font-medium">{testimonial.company}</p>

        {/* Rating */}
        {showRating && testimonial.rating && (
          <div className="flex items-center justify-center md:justify-start gap-1 mt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < testimonial.rating! ? "text-yellow-400" : "text-gray-600"
                )}
              />
            ))}
          </div>
        )}
      </m.div>

      {/* Quote */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="md:col-span-2"
      >
        <blockquote className="text-xl md:text-2xl text-white leading-relaxed">
          &quot;{testimonial.content}&quot;
        </blockquote>
      </m.div>
    </div>
  );
}

function TestimonialCards({ 
  testimonials, 
  className 
}: { 
  testimonials: Testimonial[]; 
  className?: string;
}) {
  return (
    <m.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={cn("grid md:grid-cols-2 lg:grid-cols-3 gap-8", className)}
    >
      {testimonials.map((testimonial) => (
        <m.div
          key={testimonial.id}
          variants={cardVariants}
          whileHover={{ y: -10, scale: 1.02 }}
          className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-cyan-400/50 transition-all duration-300"
        >
          <TestimonialCard testimonial={testimonial} />
        </m.div>
      ))}
    </m.div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <>
      {/* Rating */}
      {testimonial.rating && (
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              className={cn(
                "w-4 h-4",
                i < testimonial.rating! ? "text-yellow-400" : "text-gray-600"
              )}
            />
          ))}
        </div>
      )}

      {/* Quote */}
      <blockquote className="text-gray-300 leading-relaxed mb-6">
        &quot;{testimonial.content}&quot;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        {testimonial.avatar && (
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full border border-cyan-400/50"
          />
        )}
        <div>
          <div className="font-semibold text-white text-sm">{testimonial.name}</div>
          <div className="text-gray-400 text-xs">
            {testimonial.role} at {testimonial.company}
          </div>
        </div>
      </div>
    </>
  );
}

function TestimonialMinimal({
  testimonials,
  current,
  onNext,
  onPrevious,
  className,
}: {
  testimonials: Testimonial[];
  current: number;
  onNext: () => void;
  onPrevious: () => void;
  className?: string;
}) {
  return (
    <div className={cn("text-center max-w-4xl mx-auto", className)}>
      <AnimatePresence mode="wait">
        <m.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <blockquote className="text-2xl md:text-3xl font-light text-white leading-relaxed mb-8">
            &quot;{testimonials[current].content}&quot;
          </blockquote>
          
          <div className="text-gray-400">
            <span className="text-white font-semibold">
              {testimonials[current].name}
            </span>
            {" • "}
            {testimonials[current].role} at {testimonials[current].company}
          </div>
        </m.div>
      </AnimatePresence>

      {/* Simple Navigation */}
      {testimonials.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={onPrevious}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === current ? "bg-cyan-400" : "bg-gray-600"
                )}
              />
            ))}
          </div>

          <button
            onClick={onNext}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default TestimonialCarousel;