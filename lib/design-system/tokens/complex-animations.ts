/**
 * Complex Animation Tokens
 *
 * More specialized animation configurations for complex components
 * like floating elements, cards, and gradient backgrounds.
 */

// Variants for floating elements
export const floatingAnimations = {
  slow: {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
  medium: {
    y: [0, -15, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
  fast: {
    y: [0, -8, 0],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
  subtle: {
    y: [0, -5, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
}

// Card animations
export const cardAnimations = {
  hover: {
    scale: 1.03,
    y: -5,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 20,
    },
  },
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
}

// Gradient background animations
export const gradientAnimations = {
  subtle: {
    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  medium: {
    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  mouseBased: (mouseX: number, mouseY: number) => ({
    backgroundPosition: `${mouseX}% ${mouseY}%`,
    transition: {
      type: 'spring',
      stiffness: 50,
      damping: 30,
    },
  }),
}
