"use client";

import Image, { ImageProps } from "next/image";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  showSkeleton?: boolean;
  aspectRatio?: "square" | "video" | "portrait" | "landscape" | number;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  lazy?: boolean;
  blurDataURL?: string;
  quality?: number;
  priority?: boolean;
  onLoadComplete?: () => void;
  onError?: () => void;
}

// Skeleton component for loading state
function ImageSkeleton({ 
  aspectRatio, 
  className 
}: { 
  aspectRatio?: string | number;
  className?: string;
}) {
  const getAspectRatioClass = () => {
    if (typeof aspectRatio === "number") {
      return { aspectRatio: aspectRatio.toString() };
    }
    
    switch (aspectRatio) {
      case "square": return "aspect-square";
      case "video": return "aspect-video";
      case "portrait": return "aspect-[3/4]";
      case "landscape": return "aspect-[4/3]";
      default: return "aspect-video";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "relative overflow-hidden rounded-lg bg-gray-300/20 dark:bg-gray-700/20",
        typeof aspectRatio === "string" ? getAspectRatioClass() : "",
        className
      )}
      style={typeof aspectRatio === "number" ? { aspectRatio } : undefined}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  showSkeleton = true,
  aspectRatio,
  objectFit = "cover",
  lazy = true,
  blurDataURL,
  quality = 75,
  priority = false,
  onLoadComplete,
  onError,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setCurrentSrc(src);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoadComplete?.();
  };

  const handleError = () => {
    setIsLoading(false);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
      onError?.();
    }
  };

  const getAspectRatioClasses = () => {
    if (typeof aspectRatio === "number") {
      return {};
    }
    
    switch (aspectRatio) {
      case "square": return "aspect-square";
      case "video": return "aspect-video";
      case "portrait": return "aspect-[3/4]";
      case "landscape": return "aspect-[4/3]";
      default: return "";
    }
  };

  // Error state
  if (hasError) {
    return (
      <div 
        className={cn(
          "relative flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg",
          getAspectRatioClasses(),
          className
        )}
        style={typeof aspectRatio === "number" ? { aspectRatio } : undefined}
      >
        <div className="text-center text-gray-400">
          <svg
            className="mx-auto h-12 w-12 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        getAspectRatioClasses(),
        className
      )}
      style={typeof aspectRatio === "number" ? { aspectRatio } : undefined}
    >
      {/* Loading skeleton */}
      {isLoading && showSkeleton && (
        <ImageSkeleton 
          aspectRatio={aspectRatio} 
          className="absolute inset-0" 
        />
      )}

      {/* Optimized Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-full"
      >
        <Image
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          fill
          className={cn("object-cover", `object-${objectFit}`)}
          style={{ objectFit }}
          quality={quality}
          priority={priority}
          loading={lazy && !priority ? "lazy" : "eager"}
          placeholder={blurDataURL ? "blur" : "empty"}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          {...props}
        />
      </motion.div>
    </div>
  );
}

// Gallery component with optimized images
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    title?: string;
    description?: string;
  }>;
  columns?: 2 | 3 | 4;
  aspectRatio?: "square" | "video" | "portrait" | "landscape";
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function ImageGallery({
  images,
  columns = 3,
  aspectRatio = "square",
  gap = "md",
  className,
}: ImageGalleryProps) {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const columnClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div 
      className={cn(
        "grid",
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {images.map((image, index) => (
        <motion.div
          key={image.src}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group cursor-pointer"
        >
          <div className="relative overflow-hidden rounded-lg">
            <OptimizedImage
              src={image.src}
              alt={image.alt}
              aspectRatio={aspectRatio}
              className="transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Overlay */}
            {(image.title || image.description) && (
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4"
              >
                <div className="text-white">
                  {image.title && (
                    <h3 className="font-semibold mb-1">{image.title}</h3>
                  )}
                  {image.description && (
                    <p className="text-sm text-gray-200">{image.description}</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Avatar component with optimized loading
interface AvatarProps {
  src?: string;
  alt: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  className,
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!src) {
    return (
      <div
        className={cn(
          "relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold",
          sizeClasses[size],
          className
        )}
      >
        {fallback || getInitials(alt)}
      </div>
    );
  }

  return (
    <div className={cn("relative inline-block", sizeClasses[size], className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        aspectRatio="square"
        className="rounded-full"
        showSkeleton={true}
        quality={85}
      />
    </div>
  );
}

// Hero image component with optimizations
interface HeroImageProps {
  src: string;
  alt: string;
  overlay?: boolean;
  overlayColor?: "black" | "blue" | "gradient";
  children?: React.ReactNode;
  className?: string;
}

export function HeroImage({
  src,
  alt,
  overlay = true,
  overlayColor = "gradient",
  children,
  className,
}: HeroImageProps) {
  const overlayClasses = {
    black: "bg-black/50",
    blue: "bg-blue-900/50",
    gradient: "bg-gradient-to-t from-black/60 via-black/20 to-transparent",
  };

  return (
    <div className={cn("relative w-full h-screen overflow-hidden", className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        priority={true}
        quality={85}
        className="absolute inset-0"
        objectFit="cover"
        showSkeleton={false}
      />
      
      {overlay && (
        <div className={cn("absolute inset-0", overlayClasses[overlayColor])} />
      )}
      
      {children && (
        <div className="relative z-10 h-full flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

export default OptimizedImage;