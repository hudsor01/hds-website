import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Consolidated image constants - single source of truth
const ASPECT_RATIOS = {
  square: "aspect-square",
  video: "aspect-video", 
  portrait: "aspect-3/4",
  landscape: "aspect-4/3"
} as const;

const BASE_CONTAINER_CLASSES = 'relative overflow-hidden rounded-lg';
const ERROR_CONTAINER_CLASSES = 'flex items-center justify-center bg-gray-800/30 rounded-lg';
const ERROR_CONTENT_CLASSES = 'text-center text-gray-400';
const ERROR_ICON_CLASSES = 'w-12 h-12 mx-auto mb-2 opacity-50';
const ERROR_TEXT_CLASSES = 'text-sm';
const LOADING_OVERLAY_CLASSES = 'absolute inset-0 bg-gray-800/30 animate-pulse flex items-center justify-center';
const LOADING_TEXT_CLASSES = 'text-gray-400 text-sm';
const IMAGE_BASE_CLASSES = 'object-cover transition-opacity duration-300';

const ERROR_ICON_PATH = "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z";

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  aspectRatio?: keyof typeof ASPECT_RATIOS;
  showSkeleton?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  aspectRatio,
  showSkeleton = true,
  className,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  const aspectRatioClass = aspectRatio ? ASPECT_RATIOS[aspectRatio] : ASPECT_RATIOS.video;

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  if (hasError) {
    return (
      <div className={cn(ERROR_CONTAINER_CLASSES, aspectRatioClass, className)}>
        <div className={ERROR_CONTENT_CLASSES}>
          <div className={ERROR_ICON_CLASSES}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ERROR_ICON_PATH} />
            </svg>
          </div>
          <p className={ERROR_TEXT_CLASSES}>Image failed to load</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(BASE_CONTAINER_CLASSES, aspectRatioClass, className)}>
      {showSkeleton && isLoading && (
        <div className={LOADING_OVERLAY_CLASSES}>
          <div className={LOADING_TEXT_CLASSES}>Loading...</div>
        </div>
      )}
      <Image
        src={currentSrc}
        alt={alt}
        fill
        className={cn(IMAGE_BASE_CLASSES, isLoading ? "opacity-0" : "opacity-100")}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}

export default OptimizedImage;