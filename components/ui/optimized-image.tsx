import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string
  alt: string
  aspectRatio?: string
  fallbackSrc?: string
  showBlurPlaceholder?: boolean
  className?: string
}

export function OptimizedImage({
  src,
  alt,
  aspectRatio,
  fallbackSrc = '/images/placeholder.svg',
  showBlurPlaceholder = true,
  className,
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
    }
  }

  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        aspectRatio && `aspect-[${aspectRatio}]`,
        className,
      )}
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill={!props.width && !props.height}
        sizes={props.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        placeholder={showBlurPlaceholder ? 'blur' : 'empty'}
        blurDataURL='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoading && 'opacity-0',
          !isLoading && 'opacity-100',
        )}
        {...props}
      />
      {isLoading && (
        <div className='absolute inset-0 bg-gray-200 animate-pulse' />
      )}
      {hasError && imageSrc === fallbackSrc && (
        <div className='absolute inset-0 flex items-center justify-center bg-gray-100'>
          <span className='text-gray-400 text-sm'>Image unavailable</span>
        </div>
      )}
    </div>
  )
}

// Avatar Image Component
interface AvatarImageProps extends Omit<OptimizedImageProps, 'aspectRatio'> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function AvatarImage({ 
  size = 'md', 
  className,
  ...props 
}: AvatarImageProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }

  return (
    <OptimizedImage
      className={cn(
        'rounded-full',
        sizeClasses[size],
        className,
      )}
      aspectRatio='1'
      fallbackSrc='/images/default-avatar.jpg'
      {...props}
    />
  )
}

// Hero Image Component
interface HeroImageProps extends OptimizedImageProps {
  priority?: boolean
}

export function HeroImage({ 
  priority = true,
  className,
  ...props 
}: HeroImageProps) {
  return (
    <OptimizedImage
      priority={priority}
      sizes='100vw'
      className={cn(
        'w-full h-[60vh] lg:h-[80vh]',
        className,
      )}
      {...props}
    />
  )
}

// Gallery Image Component
interface GalleryImageProps extends OptimizedImageProps {
  caption?: string
  onClick?: () => void
}

export function GalleryImage({ 
  caption,
  onClick,
  className,
  ...props 
}: GalleryImageProps) {
  return (
    <figure className='group cursor-pointer' onClick={onClick}>
      <OptimizedImage
        className={cn(
          'transition-transform duration-300 group-hover:scale-105',
          className,
        )}
        aspectRatio='4/3'
        showBlurPlaceholder={false}
        {...props}
      />
      {caption && (
        <figcaption className='mt-2 text-sm text-gray-600 text-center'>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

// Logo Image Component
interface LogoImageProps extends Omit<OptimizedImageProps, 'alt'> {
  companyName: string
  variant?: 'light' | 'dark' | 'color'
}

export function LogoImage({ 
  companyName,
  variant = 'color',
  className,
  ...props 
}: LogoImageProps) {
  return (
    <OptimizedImage
      alt={`${companyName} logo`}
      className={cn(
        'object-contain',
        variant === 'light' && 'brightness-0 invert',
        variant === 'dark' && 'brightness-0',
        className,
      )}
      {...props}
    />
  )
}

// Portfolio/Project Image Component
interface ProjectImageProps extends OptimizedImageProps {
  title: string
  category?: string
  overlay?: boolean
}

export function ProjectImage({ 
  title,
  category,
  overlay = true,
  className,
  ...props 
}: ProjectImageProps) {
  return (
    <div className='relative group overflow-hidden rounded-lg'>
      <OptimizedImage
        className={cn(
          'transition-transform duration-300 group-hover:scale-110',
          className,
        )}
        aspectRatio='16/9'
        {...props}
      />
      {overlay && (
        <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
          <div className='absolute bottom-4 left-4 text-white'>
            <h3 className='font-semibold text-lg'>{title}</h3>
            {category && (
              <p className='text-sm text-gray-200'>{category}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
