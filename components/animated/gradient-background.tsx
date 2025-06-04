'use client';

import { m } from 'framer-motion';
import { useMousePosition } from '@/hooks/use-animations';
import { gradients } from '@/lib/design-system';
import { gradientAnimations } from '@/lib/animation-config';

interface GradientBackgroundProps {
  interactive?: boolean
  variant?: 'mesh' | 'simple' | 'subtle'
  primaryColor?: 'blue' | 'purple' | 'teal' | 'pink'
  secondaryColor?: 'blue' | 'purple' | 'teal' | 'pink'
  intensity?: 'low' | 'medium' | 'high'
}

/**
 * Animated gradient background with mouse interaction
 *
 * This component creates an animated gradient background effect with optional
 * mouse interaction. It uses layers of gradients with different animations.
 */
export function GradientBackground({
  interactive = true,
  variant = 'mesh',
  primaryColor = 'blue',
  secondaryColor = 'purple',
  intensity = 'medium',
}: GradientBackgroundProps) {
  const mousePosition = useMousePosition();

  // Configure gradient colors
  const colorMap = {
    blue: 'rgba(59, 130, 246, OPACITY)',
    purple: 'rgba(139, 92, 246, OPACITY)',
    teal: 'rgba(20, 184, 166, OPACITY)',
    pink: 'rgba(236, 72, 153, OPACITY)',
  };

  // Configure opacity based on intensity
  const intensityMap = {
    low: 0.2,
    medium: 0.3,
    high: 0.5,
  };

  const primaryGradient = colorMap[primaryColor].replace(
    'OPACITY',
    intensityMap[intensity].toString(),
  );
  const secondaryGradient = colorMap[secondaryColor].replace(
    'OPACITY',
    intensityMap[intensity].toString(),
  );

  // Background based on variant
  const backgroundStyle =
    variant === 'mesh'
      ? { background: gradients.mesh }
      : variant === 'simple'
        ? {
            background: `linear-gradient(135deg, ${primaryGradient} 0%, ${secondaryGradient} 100%)`,
          }
        : {
            background: `radial-gradient(circle at center, ${primaryGradient} 0%, transparent 70%)`,
          };

  return (
    <div className='fixed inset-0 -z-10 overflow-hidden'>
      {/* Base gradient */}
      <div className='absolute inset-0' style={backgroundStyle} />

      {/* Animated gradient orbs */}
      <m.div
        className='absolute w-96 h-96 rounded-full blur-3xl'
        style={{
          background: `radial-gradient(circle, ${primaryGradient} 0%, transparent 70%)`,
          opacity: intensityMap[intensity],
        }}
        animate={gradientAnimations.medium}
      />

      <m.div
        className='absolute w-96 h-96 rounded-full blur-3xl'
        style={{
          background: `radial-gradient(circle, ${secondaryGradient} 0%, transparent 70%)`,
          right: 0,
          bottom: 0,
          opacity: intensityMap[intensity],
        }}
        animate={gradientAnimations.subtle}
      />

      {/* Mouse-following gradient - only render if interactive */}
      {interactive && (
        <m.div
          className='absolute w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none'
          style={{
            background: `radial-gradient(circle, ${primaryGradient} 0%, transparent 70%)`,
          }}
          animate={{
            x: mousePosition.x - 128,
            y: mousePosition.y - 128,
          }}
          transition={{
            type: 'spring',
            damping: 30,
            stiffness: 200,
          }}
        />
      )}
    </div>
  );
}
