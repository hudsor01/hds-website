'use client'

/**
 * Motion Wrapper Component
 * Provides easy-to-use motion components for the application
 */

import { m, type HTMLMotionProps } from 'framer-motion'
import { 
  fadeInVariants, 
  slideInVariants, 
  scaleVariants, 
  cardVariants,
  textVariants,
  buttonVariants,
  staggerVariants,
} from '@/lib/animation/motion-config'

// Motion Component Types
type MotionDivProps = HTMLMotionProps<'div'>
type MotionButtonProps = HTMLMotionProps<'button'>

// Pre-configured Motion Components
export const MotionDiv = m.div
export const MotionSection = m.section
export const MotionButton = m.button
export const MotionH1 = m.h1
export const MotionH2 = m.h2
export const MotionH3 = m.h3
export const MotionP = m.p
export const MotionSpan = m.span
export const MotionImg = m.img
export const MotionArticle = m.article
export const MotionNav = m.nav
export const MotionUl = m.ul
export const MotionLi = m.li

// Preset Animation Components

// Fade In Component
interface FadeInProps extends MotionDivProps {
  delay?: number
}

export function FadeIn({ children, delay = 0, ...props }: FadeInProps) {
  return (
    <MotionDiv
      variants={fadeInVariants}
      initial='initial'
      whileInView='animate'
      viewport={{ once: true, margin: '-100px' }}
      transition={{ delay }}
      {...props}
    >
      {children}
    </MotionDiv>
  )
}

// Slide In Component
interface SlideInProps extends MotionDivProps {
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
}

export function SlideIn({ 
  children, 
  direction = 'up', 
  delay = 0, 
  ...props 
}: SlideInProps) {
  return (
    <MotionDiv
      variants={slideInVariants[direction]}
      initial='initial'
      whileInView='animate'
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay }}
      {...props}
    >
      {children}
    </MotionDiv>
  )
}

// Scale In Component
interface ScaleInProps extends MotionDivProps {
  delay?: number
}

export function ScaleIn({ children, delay = 0, ...props }: ScaleInProps) {
  return (
    <MotionDiv
      variants={scaleVariants}
      initial='initial'
      whileInView='animate'
      whileHover='hover'
      whileTap='tap'
      viewport={{ once: true }}
      transition={{ delay }}
      {...props}
    >
      {children}
    </MotionDiv>
  )
}

// Animated Card Component
interface AnimatedCardProps extends MotionDivProps {
  delay?: number
  enableHover?: boolean
}

export function AnimatedCard({ 
  children, 
  delay = 0, 
  enableHover = true,
  ...props 
}: AnimatedCardProps) {
  return (
    <MotionDiv
      variants={cardVariants}
      initial='initial'
      whileInView='animate'
      whileHover={enableHover ? 'hover' : undefined}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ delay }}
      {...props}
    >
      {children}
    </MotionDiv>
  )
}

// Animated Text Component
interface AnimatedTextProps extends MotionDivProps {
  as?: 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
  delay?: number
}

export function AnimatedText({ 
  children, 
  as = 'div', 
  delay = 0, 
  ...props 
}: AnimatedTextProps) {
  const Component = as === 'div' ? MotionDiv : 
                    as === 'h1' ? MotionH1 :
                    as === 'h2' ? MotionH2 :
                    as === 'h3' ? MotionH3 :
                    as === 'p' ? MotionP :
                    as === 'span' ? MotionSpan :
                    MotionDiv

  return (
    <Component
      variants={textVariants}
      initial='initial'
      whileInView='animate'
      viewport={{ once: true }}
      transition={{ delay }}
      {...props}
    >
      {children}
    </Component>
  )
}

// Animated Button Component
interface AnimatedButtonProps extends MotionButtonProps {
  delay?: number
}

export function AnimatedButton({ 
  children, 
  delay = 0, 
  ...props 
}: AnimatedButtonProps) {
  return (
    <MotionButton
      variants={buttonVariants}
      initial='initial'
      whileInView='animate'
      whileHover='hover'
      whileTap='tap'
      viewport={{ once: true }}
      transition={{ delay }}
      {...props}
    >
      {children}
    </MotionButton>
  )
}

// Stagger Container Component
interface StaggerContainerProps extends MotionDivProps {
  staggerDelay?: number
}

export function StaggerContainer({ 
  children, 
  staggerDelay = 0.1, 
  ...props 
}: StaggerContainerProps) {
  return (
    <MotionDiv
      variants={staggerVariants}
      initial='initial'
      whileInView='animate'
      viewport={{ once: true, margin: '-100px' }}
      transition={{ staggerChildren: staggerDelay }}
      {...props}
    >
      {children}
    </MotionDiv>
  )
}

// Page Transition Component
interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </MotionDiv>
  )
}