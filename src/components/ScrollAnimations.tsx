"use client";

import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useRef, useEffect, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Parallax scroll effect
export function ParallaxElement({ 
  children, 
  speed = 0.5,
  className = "",
}: { 
  children: ReactNode; 
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);
  const springY = useSpring(y, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      ref={ref}
      style={{ y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scroll progress indicator
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 origin-left"
      style={{ scaleX }}
    />
  );
}

// Fade in on scroll with custom threshold
export function FadeInOnScroll({ 
  children, 
  threshold = 0.1,
  delay = 0,
  duration = 0.6,
  className = "",
}: { 
  children: ReactNode; 
  threshold?: number;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: true, 
    amount: threshold 
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ 
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale animation on scroll
export function ScaleOnScroll({ 
  children, 
  scale = 1.1,
  className = "",
}: { 
  children: ReactNode; 
  scale?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scaleValue = useTransform(scrollYProgress, [0, 0.5, 1], [1, scale, 1]);
  const springScale = useSpring(scaleValue, {
    stiffness: 100,
    damping: 30,
  });

  return (
    <motion.div
      ref={ref}
      style={{ scale: springScale }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Rotate animation based on scroll
export function RotateOnScroll({ 
  children, 
  rotation = 360,
  className = "",
}: { 
  children: ReactNode; 
  rotation?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [0, rotation]);
  const springRotate = useSpring(rotate, {
    stiffness: 100,
    damping: 30,
  });

  return (
    <motion.div
      ref={ref}
      style={{ rotate: springRotate }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Text reveal animation
export function TextReveal({ 
  text, 
  className = "",
  delay = 0,
}: { 
  text: string; 
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  
  const words = text.split(" ");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={cn("flex flex-wrap", className)}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={wordVariants}
          className="inline-block mr-2"
          style={{ perspective: "1000px" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

// Magnetic hover effect
export function MagneticHover({ 
  children, 
  strength = 0.3,
  className = "",
}: { 
  children: ReactNode; 
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 10 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Smooth scroll to section
export function ScrollToSection({ 
  targetId, 
  children, 
  offset = 80,
  className = "",
}: { 
  targetId: string; 
  children: ReactNode;
  offset?: number;
  className?: string;
}) {
  const handleClick = () => {
    const element = document.getElementById(targetId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </motion.div>
  );
}

// Typing animation effect
export function TypingAnimation({ 
  text, 
  speed = 50,
  className = "",
  onComplete,
}: { 
  text: string; 
  speed?: number;
  className?: string;
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block w-0.5 h-6 bg-cyan-400 ml-1"
      />
    </span>
  );
}

// Number counter animation
export function CountUp({ 
  end, 
  duration = 2,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: { 
  end: number; 
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = startValue + (end - startValue) * easeOutQuart;
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  );
}