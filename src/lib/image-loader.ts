// Custom image loader for optimized mobile performance
import type { ImageLoaderProps, ImageSizes, ImagePreset, LazyLoadConfig } from '@/types/utils';

export type { ImageLoaderProps };

// Image sizes for responsive loading
export const IMAGE_SIZES: Record<string, ImageSizes> = {
  mobile: {
    small: 320,
    medium: 640,
    large: 768,
  },
  tablet: {
    small: 768,
    medium: 1024,
    large: 1280,
  },
  desktop: {
    small: 1280,
    medium: 1920,
    large: 2560,
  },
};

// Generate srcset for responsive images
export function generateSrcSet(src: string, sizes: number[]): string {
  return sizes
    .map((size) => `${src}?w=${size} ${size}w`)
    .join(', ');
}

// Default image loader with optimization
export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
  // For external images, return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // For local images, add optimization parameters
  const params = new URLSearchParams();
  params.set('w', width.toString());
  if (quality) {
    params.set('q', quality.toString());
  }

  return `${src}?${params.toString()}`;
}

// Mobile-optimized image sizes
export const MOBILE_IMAGE_SIZES = [320, 640, 768];
export const TABLET_IMAGE_SIZES = [768, 1024, 1280];
export const DESKTOP_IMAGE_SIZES = [1280, 1920, 2560];

// Generate sizes attribute for responsive images
export function generateSizesAttribute(): string {
  return `
    (max-width: 640px) 100vw,
    (max-width: 1024px) 80vw,
    (max-width: 1280px) 60vw,
    50vw
  `.trim();
}

// Lazy loading configuration
export const LAZY_LOAD_CONFIG: LazyLoadConfig = {
  root: null,
  rootMargin: '50px',
  threshold: 0.01,
};

// Image optimization presets
export const IMAGE_PRESETS: Record<string, ImagePreset> = {
  thumbnail: {
    width: 150,
    height: 150,
    quality: 80,
  },
  mobile: {
    width: 640,
    height: 480,
    quality: 85,
  },
  desktop: {
    width: 1920,
    height: 1080,
    quality: 90,
  },
  hero: {
    width: 2560,
    height: 1440,
    quality: 95,
  },
};