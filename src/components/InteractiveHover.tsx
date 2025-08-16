"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// 3D tilt effect on hover
export function TiltHover({ 
  children, 
  tiltStrength = 15,
  perspective = 1000,
  className = "",
}: { 
  children: ReactNode; 
  tiltStrength?: number;
  perspective?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [tiltStrength, -tiltStrength]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-tiltStrength, tiltStrength]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        rotateY: rotateY,
        rotateX: rotateX,
        transformStyle: "preserve-3d",
        perspective: perspective,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={className}
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Magnetic attraction effect
export function MagneticAttraction({ 
  children, 
  strength = 0.4,
  radius = 100,
  className = "",
}: { 
  children: ReactNode; 
  strength?: number;
  radius?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [, setIsInRange] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distance = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
    );
    
    if (distance < radius) {
      setIsInRange(true);
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;
      x.set(deltaX);
      y.set(deltaY);
    } else {
      setIsInRange(false);
      x.set(0);
      y.set(0);
    }
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      style={{ x, y }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Ripple effect on click
export function RippleEffect({ 
  children, 
  color = "rgba(34, 211, 238, 0.3)",
  duration = 600,
  className = "",
}: { 
  children: ReactNode; 
  color?: string;
  duration?: number;
  className?: string;
}) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, duration);
  };

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
    >
      {children}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: color,
          }}
          initial={{
            width: 0,
            height: 0,
            opacity: 1,
            x: "-50%",
            y: "-50%",
          }}
          animate={{
            width: 200,
            height: 200,
            opacity: 0,
          }}
          transition={{
            duration: duration / 1000,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// Morphing button effect
export function MorphingButton({ 
  children, 
  hoverChildren,
  className = "",
  ...props
}: { 
  children: ReactNode; 
  hoverChildren: ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      layout
      className={cn(
        "relative overflow-hidden px-6 py-3 rounded-lg font-semibold",
        "bg-gradient-to-r from-cyan-500 to-blue-500",
        "hover:from-cyan-600 hover:to-blue-600",
        "transition-all duration-300",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <motion.div
        initial={false}
        animate={{
          y: isHovered ? -30 : 0,
          opacity: isHovered ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
      
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={{
          y: isHovered ? 0 : 30,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {hoverChildren}
      </motion.div>
    </motion.button>
  );
}

// Glow effect on hover
export function GlowHover({ 
  children, 
  glowColor = "cyan",
  intensity = 0.5,
  className = "",
}: { 
  children: ReactNode; 
  glowColor?: "cyan" | "blue" | "purple" | "green" | "red";
  intensity?: number;
  className?: string;
}) {
  const glowColors = {
    cyan: `rgba(34, 211, 238, ${intensity})`,
    blue: `rgba(59, 130, 246, ${intensity})`,
    purple: `rgba(147, 51, 234, ${intensity})`,
    green: `rgba(34, 197, 94, ${intensity})`,
    red: `rgba(239, 68, 68, ${intensity})`,
  };

  return (
    <motion.div
      className={cn("relative", className)}
      whileHover={{
        boxShadow: `0 0 30px ${glowColors[glowColor]}`,
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Floating elements
export function FloatingElement({ 
  children, 
  intensity = 10,
  duration = 3,
  className = "",
}: { 
  children: ReactNode; 
  intensity?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      animate={{
        y: [-intensity, intensity, -intensity],
        x: [-intensity / 2, intensity / 2, -intensity / 2],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Elastic scale on hover
export function ElasticHover({ 
  children, 
  scale = 1.1,
  className = "",
}: { 
  children: ReactNode; 
  scale?: number;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ 
        scale: scale,
        transition: { 
          type: "spring", 
          stiffness: 400, 
          damping: 10 
        }
      }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Rotate on hover
export function RotateHover({ 
  children, 
  rotation = 5,
  className = "",
}: { 
  children: ReactNode; 
  rotation?: number;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ 
        rotate: rotation,
        transition: { duration: 0.3 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide reveal effect
export function SlideReveal({ 
  children, 
  direction = "left",
  className = "",
}: { 
  children: ReactNode; 
  direction?: "left" | "right" | "up" | "down";
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const slideVariants = {
    left: { x: isHovered ? 0 : -100 },
    right: { x: isHovered ? 0 : 100 },
    up: { y: isHovered ? 0 : -100 },
    down: { y: isHovered ? 0 : 100 },
  };

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn("relative overflow-hidden", className)}
    >
      <motion.div
        animate={slideVariants[direction]}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}