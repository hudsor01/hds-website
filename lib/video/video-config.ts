/**
 * Video Configuration for Next.js 15
 * 
 * Comprehensive video optimization and hosting configuration with support for:
 * - Self-hosted videos with performance optimization
 * - External video platforms (YouTube, Vimeo, etc.)
 * - Vercel Blob integration for scalable hosting
 * - Accessibility features (captions, subtitles)
 * - Responsive design and mobile optimization
 * - Loading strategies and performance monitoring
 */

export interface VideoFormat {
  src: string
  type: string
  quality?: 'low' | 'medium' | 'high' | '4k'
  size?: number
  bitrate?: number
}

export interface VideoSubtitle {
  src: string
  kind: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
  srcLang: string
  label: string
  default?: boolean
}

export interface VideoPlayerOptions {
  controls?: boolean
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  playsInline?: boolean
  poster?: string
  width?: number | string
  height?: number | string
  crossOrigin?: 'anonymous' | 'use-credentials'
  controlsList?: string
  disablePictureInPicture?: boolean
  disableRemotePlayback?: boolean
}

export interface ExternalVideoConfig {
  platform: 'youtube' | 'vimeo' | 'dailymotion' | 'wistia' | 'custom'
  videoId: string
  embedUrl?: string
  parameters?: Record<string, string | number | boolean>
  privacyEnhanced?: boolean
}

export interface VideoHostingConfig {
  provider: 'vercel-blob' | 'aws-s3' | 'cloudinary' | 'mux' | 'local'
  baseUrl?: string
  apiKey?: string
  bucket?: string
  region?: string
  cdnUrl?: string
}

export interface VideoPerformanceOptions {
  lazy?: boolean
  priority?: boolean
  preconnect?: string[]
  fetchPriority?: 'auto' | 'high' | 'low'
  loading?: 'eager' | 'lazy'
  decoding?: 'auto' | 'sync' | 'async'
}

export interface VideoAnalytics {
  trackViews?: boolean
  trackProgress?: boolean
  trackCompletion?: boolean
  trackErrors?: boolean
  analyticsProvider?: 'google' | 'custom'
  customTracker?: () => void
}

// Video hosting configurations
export const videoHostingConfig: Record<string, VideoHostingConfig> = {
  vercelBlob: {
    provider: 'vercel-blob',
    baseUrl: 'https://your-blob-store.vercel-storage.com',
  },
  cloudinary: {
    provider: 'cloudinary',
    baseUrl: 'https://res.cloudinary.com/your-cloud-name',
    cdnUrl: 'https://res.cloudinary.com/your-cloud-name/video/upload',
  },
  mux: {
    provider: 'mux',
    baseUrl: 'https://stream.mux.com',
  },
  local: {
    provider: 'local',
    baseUrl: '/videos',
  },
}

// External video platform configurations
export const externalVideoConfig = {
  youtube: {
    embedBaseUrl: 'https://www.youtube.com/embed',
    privacyEnhancedUrl: 'https://www.youtube-nocookie.com/embed',
    defaultParams: {
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      controls: 1,
      autoplay: 0,
      mute: 0,
      loop: 0,
      start: 0,
      end: 0,
    },
  },
  vimeo: {
    embedBaseUrl: 'https://player.vimeo.com/video',
    defaultParams: {
      title: 0,
      byline: 0,
      portrait: 0,
      autoplay: 0,
      muted: 0,
      loop: 0,
      controls: 1,
    },
  },
  dailymotion: {
    embedBaseUrl: 'https://www.dailymotion.com/embed/video',
    defaultParams: {
      autoplay: 0,
      mute: 0,
      controls: 1,
      'ui-logo': 0,
      'ui-start-screen-info': 0,
    },
  },
} as const

// Video format configurations for different use cases
export const videoFormats = {
  web: {
    mp4: {
      codec: 'h264',
      container: 'mp4',
      mimeType: 'video/mp4',
      extension: '.mp4',
      description: 'Widely supported, good for compatibility',
      quality: {
        low: { bitrate: '500k', resolution: '480p' },
        medium: { bitrate: '1000k', resolution: '720p' },
        high: { bitrate: '2500k', resolution: '1080p' },
        '4k': { bitrate: '8000k', resolution: '2160p' },
      },
    },
    webm: {
      codec: 'vp9',
      container: 'webm',
      mimeType: 'video/webm',
      extension: '.webm',
      description: 'Better compression, good for web',
      quality: {
        low: { bitrate: '400k', resolution: '480p' },
        medium: { bitrate: '800k', resolution: '720p' },
        high: { bitrate: '2000k', resolution: '1080p' },
        '4k': { bitrate: '6000k', resolution: '2160p' },
      },
    },
    av1: {
      codec: 'av1',
      container: 'mp4',
      mimeType: 'video/mp4; codecs=av01',
      extension: '.mp4',
      description: 'Latest compression, excellent quality',
      quality: {
        low: { bitrate: '300k', resolution: '480p' },
        medium: { bitrate: '600k', resolution: '720p' },
        high: { bitrate: '1500k', resolution: '1080p' },
        '4k': { bitrate: '4000k', resolution: '2160p' },
      },
    },
  },
  mobile: {
    optimized: {
      maxWidth: 720,
      maxHeight: 480,
      bitrate: '800k',
      codec: 'h264',
      profile: 'baseline',
    },
  },
} as const

// Performance optimization configuration
export const performanceConfig = {
  loading: {
    lazy: {
      threshold: '100px',
      rootMargin: '50px',
      strategy: 'intersection-observer',
    },
    preload: {
      priority: ['hero', 'above-fold'],
      preconnect: [
        'https://www.youtube.com',
        'https://www.youtube-nocookie.com',
        'https://player.vimeo.com',
      ],
    },
  },
  compression: {
    targets: {
      mobile: { quality: 0.7, maxWidth: 720 },
      tablet: { quality: 0.8, maxWidth: 1024 },
      desktop: { quality: 0.85, maxWidth: 1920 },
    },
    formats: ['av1', 'webm', 'mp4'], // Order of preference
  },
  caching: {
    maxAge: 31536000, // 1 year
    immutable: true,
    staleWhileRevalidate: 86400, // 1 day
  },
} as const

// Accessibility configuration
export const accessibilityConfig = {
  captions: {
    formats: ['vtt', 'srt', 'ttml'],
    languages: ['en', 'es', 'fr', 'de', 'ja', 'zh'],
    autoGenerate: false,
  },
  controls: {
    keyboard: true,
    screenReader: true,
    highContrast: true,
    reducedMotion: true,
  },
  descriptions: {
    audioDescriptions: true,
    textAlternatives: true,
  },
} as const

// Utility functions for video operations
export const videoUtils = {
  /**
   * Generate video sources with multiple formats for browser compatibility
   */
  generateVideoSources: (basePath: string, formats: string[] = ['mp4', 'webm']): VideoFormat[] => formats.map(format => ({
      src: `${basePath}.${format}`,
      type: videoFormats.web[format as keyof typeof videoFormats.web]?.mimeType || `video/${format}`,
    })),

  /**
   * Create responsive video sizes based on breakpoints
   */
  generateResponsiveSizes: (breakpoints: Record<string, number>) => {
    const sizes = Object.entries(breakpoints)
      .sort(([, a], [, b]) => b - a)
      .map(([width]) => `(max-width: ${width}px) ${width}px`)
      .join(', ')
    
    return `${sizes}, 100vw`
  },

  /**
   * Generate YouTube embed URL with privacy and performance options
   */
  generateYouTubeUrl: (videoId: string, options: Partial<ExternalVideoConfig['parameters']> = {}) => {
    const config = externalVideoConfig.youtube
    const baseUrl = options.privacyEnhanced ? config.privacyEnhancedUrl : config.embedBaseUrl
    const params = { ...config.defaultParams, ...options }
    
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    
    return `${baseUrl}/${videoId}?${searchParams.toString()}`
  },

  /**
   * Generate Vimeo embed URL with custom parameters
   */
  generateVimeoUrl: (videoId: string, options: Partial<ExternalVideoConfig['parameters']> = {}) => {
    const config = externalVideoConfig.vimeo
    const params = { ...config.defaultParams, ...options }
    
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    
    return `${config.embedBaseUrl}/${videoId}?${searchParams.toString()}`
  },

  /**
   * Validate video file format and size
   */
  validateVideo: (file: File): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    const maxSize = 100 * 1024 * 1024 // 100MB
    const supportedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
    
    if (file.size > maxSize) {
      errors.push(`File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum of ${maxSize / 1024 / 1024}MB`)
    }
    
    if (!supportedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not supported. Supported types: ${supportedTypes.join(', ')}`)
    }
    
    return {
      valid: errors.length === 0,
      errors,
    }
  },

  /**
   * Extract video metadata using Web API
   */
  extractVideoMetadata: (videoElement: HTMLVideoElement): Promise<{
    duration: number
    width: number
    height: number
    aspectRatio: number
  }> => new Promise((resolve, reject) => {
      if (videoElement.readyState >= 1) {
        resolve({
          duration: videoElement.duration,
          width: videoElement.videoWidth,
          height: videoElement.videoHeight,
          aspectRatio: videoElement.videoWidth / videoElement.videoHeight,
        })
      } else {
        videoElement.addEventListener('loadedmetadata', () => {
          resolve({
            duration: videoElement.duration,
            width: videoElement.videoWidth,
            height: videoElement.videoHeight,
            aspectRatio: videoElement.videoWidth / videoElement.videoHeight,
          })
        }, { once: true })
        
        videoElement.addEventListener('error', (event) => {
          reject(new Error(`Video metadata loading failed: ${event.type}`))
        }, { once: true })
      }
    }),

  /**
   * Generate video thumbnail from video element
   */
  generateThumbnail: (videoElement: HTMLVideoElement, time = 0): Promise<string> => new Promise((resolve, reject) => {
      videoElement.currentTime = time
      
      videoElement.addEventListener('seeked', () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight
        
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob))
          } else {
            reject(new Error('Could not generate thumbnail'))
          }
        }, 'image/jpeg', 0.8)
      }, { once: true })
      
      videoElement.addEventListener('error', (event) => {
        reject(new Error(`Video thumbnail generation failed: ${event.type}`))
      }, { once: true })
    }),

  /**
   * Monitor video performance metrics
   */
  monitorVideoPerformance: (videoElement: HTMLVideoElement) => {
    const metrics = {
      loadStart: 0,
      loadEnd: 0,
      firstFrame: 0,
      buffering: 0,
      stalls: 0,
    }
    
    videoElement.addEventListener('loadstart', () => {
      metrics.loadStart = performance.now()
    })
    
    videoElement.addEventListener('canplay', () => {
      metrics.loadEnd = performance.now()
    })
    
    videoElement.addEventListener('playing', () => {
      if (metrics.firstFrame === 0) {
        metrics.firstFrame = performance.now()
      }
    })
    
    videoElement.addEventListener('waiting', () => {
      metrics.buffering = performance.now()
    })
    
    videoElement.addEventListener('stalled', () => {
      metrics.stalls++
    })
    
    return {
      getMetrics: () => ({
        ...metrics,
        loadTime: metrics.loadEnd - metrics.loadStart,
        timeToFirstFrame: metrics.firstFrame - metrics.loadStart,
      }),
      reset: () => {
        Object.keys(metrics).forEach(key => {
          metrics[key as keyof typeof metrics] = 0
        })
      },
    }
  },
}

// Export default configuration
export const defaultVideoConfig = {
  hosting: videoHostingConfig.local,
  player: {
    controls: true,
    preload: 'metadata',
    playsInline: true,
  } as VideoPlayerOptions,
  performance: performanceConfig,
  accessibility: accessibilityConfig,
  analytics: {
    trackViews: true,
    trackProgress: true,
    trackCompletion: true,
    trackErrors: true,
  } as VideoAnalytics,
} as const

export type VideoConfig = typeof defaultVideoConfig