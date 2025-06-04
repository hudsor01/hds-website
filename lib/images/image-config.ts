/**
 * Next.js 15 Image Optimization Configuration
 * Production-ready image handling with performance and UX best practices
 */

// Image domains and remote patterns for next.config.mjs
export const imageConfig = {
  domains: [
    'images.unsplash.com',
    'images.pexels.com',
    'cdn.pixabay.com',
    'via.placeholder.com',
    'picsum.photos',
  ],
  remotePatterns: [
    {
      protocol: 'https' as const,
      hostname: '*.amazonaws.com',
      port: '',
      pathname: '/**',
    },
    {
      protocol: 'https' as const,
      hostname: '*.supabase.co',
      port: '',
      pathname: '/storage/**',
    },
    {
      protocol: 'https' as const,
      hostname: 'images.unsplash.com',
      port: '',
      pathname: '/**',
    },
  ],
  formats: ['image/webp', 'image/avif'] as const,
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  dangerouslyAllowSVG: true,
  contentDispositionType: 'attachment' as const,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
}

// Standard image sizes for responsive design
export const imageSizes = {
  // Avatar sizes
  avatar: {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 96, height: 96 },
  },
  
  // Hero image sizes
  hero: {
    mobile: { width: 768, height: 512 },
    tablet: { width: 1024, height: 576 },
    desktop: { width: 1920, height: 1080 },
  },
  
  // Gallery/portfolio sizes
  gallery: {
    thumbnail: { width: 300, height: 225 }, // 4:3
    medium: { width: 600, height: 450 },    // 4:3
    large: { width: 1200, height: 900 },     // 4:3
  },
  
  // Logo sizes
  logo: {
    small: { width: 80, height: 32 },
    medium: { width: 120, height: 48 },
    large: { width: 200, height: 80 },
  },
  
  // Blog/content images
  content: {
    inline: { width: 400, height: 300 },
    featured: { width: 800, height: 450 }, // 16:9
    banner: { width: 1200, height: 400 },   // 3:1
  },
} as const

// Responsive image sizes strings for different components
export const responsiveSizes = {
  hero: '100vw',
  gallery: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  avatar: '(max-width: 768px) 40px, 48px',
  logo: '(max-width: 768px) 80px, 120px',
  content: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px',
  thumbnail: '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 300px',
} as const

// Image quality settings
export const imageQuality = {
  thumbnail: 75,
  standard: 85,
  hero: 90,
  print: 95,
} as const

// Blur placeholder utilities
export const blurDataURL = {
  // Generic low-quality placeholder
  generic: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
  
  // Colored placeholders for branding
  primary: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
  
  // Gradient placeholder
  gradient: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
} as const

// Image optimization utilities
export const imageUtils = {
  /**
   * Generate appropriate sizes attribute for responsive images
   */
  generateSizes: (breakpoints: { [key: string]: string }) => Object.entries(breakpoints)
      .map(([condition, size]) => `${condition} ${size}`)
      .join(', '),

  /**
   * Get optimized image dimensions based on device and usage
   */
  getOptimizedDimensions: (
    type: keyof typeof imageSizes,
    size: string,
    devicePixelRatio = 1,
  ) => {
    const dimensions = imageSizes[type]?.[size as keyof typeof imageSizes[typeof type]]
    if (!dimensions) return null

    return {
      width: dimensions.width * devicePixelRatio,
      height: dimensions.height * devicePixelRatio,
    }
  },

  /**
   * Generate srcSet for responsive images
   */
  generateSrcSet: (src: string, widths: number[]) => widths
      .map(width => `${src}?w=${width} ${width}w`)
      .join(', '),
}

// Image preload utilities for critical images
export const imagePreload = {
  /**
   * Preload critical images for better performance
   */
  preloadCriticalImages: (images: { src: string; as?: string; type?: string }[]) => {
    if (typeof window === 'undefined') return

    images.forEach(({ src, as = 'image', type }) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = as
      link.href = src
      if (type) link.type = type
      document.head.appendChild(link)
    })
  },

  /**
   * Get priority images for above-the-fold content
   */
  getPriorityImages: () => [
    '/images/logo.svg',
    '/images/hero-background.jpg',
    '/images/placeholder.svg',
  ],
}

// Error handling and fallback configuration
export const imageFallbacks = {
  avatar: '/images/default-avatar.jpg',
  hero: '/images/placeholder-hero.jpg',
  gallery: '/images/placeholder.svg',
  logo: '/logo.svg',
  content: '/images/placeholder.svg',
} as const

// Performance monitoring
export const imagePerformance = {
  /**
   * Track image loading performance
   */
  trackImageLoad: (src: string, startTime: number) => {
    const loadTime = performance.now() - startTime
    
    // In production, you might want to send this to your analytics
    if (process.env.NODE_ENV === 'development') {
      console.log(`Image loaded: ${src} in ${loadTime.toFixed(2)}ms`)
    }
  },

  /**
   * Monitor largest contentful paint for images
   */
  observeLCP: () => {
    if (typeof window === 'undefined') return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry)
        }
      }
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
  },
}