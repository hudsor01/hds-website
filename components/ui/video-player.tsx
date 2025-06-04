'use client'

import { forwardRef, useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { VideoPlayerOptions, VideoFormat, VideoSubtitle } from '@/lib/video/video-config'
import { videoUtils } from '@/lib/video/video-config'

// Define video metadata type
interface VideoMetadata {
  duration: number
  width: number
  height: number
  aspectRatio: number
}

// Define video performance metrics type
interface VideoPerformanceMetrics {
  loadStart: number
  loadEnd: number
  firstFrame: number
  buffering: number
  stalls: number
  loadTime: number
  timeToFirstFrame: number
}

export interface VideoPlayerProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src' | 'children'> {
  sources: VideoFormat[]
  subtitles?: VideoSubtitle[]
  options?: VideoPlayerOptions
  poster?: string
  fallbackContent?: React.ReactNode
  onLoadMetadata?: (metadata: VideoMetadata) => void
  onPerformanceData?: (metrics: VideoPerformanceMetrics) => void
  generateThumbnail?: boolean
  thumbnailTime?: number
  responsive?: boolean
  aspectRatio?: number
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  (
    {
      sources,
      subtitles = [],
      options = {},
      poster,
      fallbackContent,
      onLoadMetadata,
      onPerformanceData,
      generateThumbnail = false,
      thumbnailTime = 0,
      responsive = true,
      aspectRatio,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLVideoElement>(null)
    const videoRef = (ref as React.RefObject<HTMLVideoElement>) || internalRef
    const [metadata, setMetadata] = useState<VideoMetadata | null>(null)
    const [thumbnailUrl, setThumbnailUrl] = useState<string>('')
    const [_performanceMonitor, setPerformanceMonitor] = useState<ReturnType<typeof videoUtils.monitorVideoPerformance> | null>(null)

    // Extract video metadata when loaded
    useEffect(() => {
      const video = videoRef.current
      if (!video) return

      const handleLoadedMetadata = async () => {
        try {
          const videoMetadata = await videoUtils.extractVideoMetadata(video)
          setMetadata(videoMetadata)
          onLoadMetadata?.(videoMetadata)

          // Generate thumbnail if requested
          if (generateThumbnail) {
            const thumbnail = await videoUtils.generateThumbnail(video, thumbnailTime)
            setThumbnailUrl(thumbnail)
          }
        } catch (error) {
          console.error('Failed to extract video metadata:', error)
        }
      }

      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }, [videoRef, onLoadMetadata, generateThumbnail, thumbnailTime])

    // Set up performance monitoring
    useEffect(() => {
      const video = videoRef.current
      if (!video || !onPerformanceData) return

      const monitor = videoUtils.monitorVideoPerformance(video)
      setPerformanceMonitor(monitor)

      const interval = setInterval(() => {
        const metrics = monitor.getMetrics()
        onPerformanceData(metrics)
      }, 5000)

      return () => {
        clearInterval(interval)
        monitor.reset()
      }
    }, [videoRef, onPerformanceData])

    // Generate responsive styles
    const videoStyles = responsive && aspectRatio 
      ? {
          aspectRatio: aspectRatio.toString(),
          width: '100%',
          height: 'auto',
          ...style,
        }
      : style

    const containerStyles = responsive
      ? {
          width: '100%',
          maxWidth: '100%',
        }
      : {}

    return (
      <div style={containerStyles} className={cn('relative', className)}>
        <video
          ref={videoRef}
          style={videoStyles}
          controls={options.controls ?? true}
          autoPlay={options.autoPlay ?? false}
          loop={options.loop ?? false}
          muted={options.muted ?? false}
          preload={options.preload ?? 'metadata'}
          playsInline={options.playsInline ?? true}
          poster={poster}
          crossOrigin={options.crossOrigin}
          controlsList={options.controlsList}
          disablePictureInPicture={options.disablePictureInPicture}
          disableRemotePlayback={options.disableRemotePlayback}
          className='w-full h-auto'
          {...props}
        >
          {sources.map((source, index) => (
            <source
              key={index}
              src={source.src}
              type={source.type}
            />
          ))}
          
          {subtitles.map((subtitle, index) => (
            <track
              key={index}
              src={subtitle.src}
              kind={subtitle.kind}
              srcLang={subtitle.srcLang}
              label={subtitle.label}
              default={subtitle.default}
            />
          ))}
          
          {fallbackContent || (
            <p className='text-muted-foreground p-4 text-center'>
              Your browser does not support the video tag. Please{' '}
              <a 
                href={sources[0]?.src} 
                className='text-primary hover:underline'
                download={true}
              >
                download the video
              </a>{' '}
              to watch it.
            </p>
          )}
        </video>
        
        {/* Debug information in development */}
        {process.env.NODE_ENV === 'development' && metadata && (
          <div className='absolute top-2 right-2 bg-black/80 text-white text-xs p-2 rounded'>
            <div>Duration: {Math.round(metadata.duration)}s</div>
            <div>Resolution: {metadata.width}x{metadata.height}</div>
            <div>Aspect Ratio: {metadata.aspectRatio.toFixed(2)}</div>
            {thumbnailUrl && (
              <div>
                <a href={thumbnailUrl} target='_blank' rel='noopener noreferrer'>
                  View Thumbnail
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    )
  },
)

VideoPlayer.displayName = 'VideoPlayer'

// Specialized video player components

export interface ResponsiveVideoProps extends Omit<VideoPlayerProps, 'responsive' | 'aspectRatio'> {
  aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9' | number
}

export function ResponsiveVideo({ 
  aspectRatio = '16:9', 
  className, 
  ...props 
}: ResponsiveVideoProps) {
  const numericAspectRatio = typeof aspectRatio === 'string' 
    ? aspectRatio === '16:9' ? 16/9 
      : aspectRatio === '4:3' ? 4/3
      : aspectRatio === '1:1' ? 1
      : aspectRatio === '21:9' ? 21/9
      : 16/9
    : aspectRatio

  return (
    <VideoPlayer
      responsive
      aspectRatio={numericAspectRatio}
      className={cn('rounded-lg overflow-hidden', className)}
      {...props}
    />
  )
}

export interface AutoPlayVideoProps extends VideoPlayerProps {
  intersectionThreshold?: number
  rootMargin?: string
}

export function AutoPlayVideo({ 
  intersectionThreshold = 0.5,
  rootMargin = '0px',
  ...props 
}: AutoPlayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsIntersecting(entry.isIntersecting)
        }
      },
      {
        threshold: intersectionThreshold,
        rootMargin,
      },
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [intersectionThreshold, rootMargin])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (isIntersecting) {
      video.play().catch(console.error)
    } else {
      video.pause()
    }
  }, [isIntersecting])

  return (
    <VideoPlayer
      ref={videoRef}
      options={{
        ...props.options,
        autoPlay: false, // We handle autoplay manually
        muted: true, // Required for autoplay to work
      }}
      {...props}
    />
  )
}

export interface HeroVideoProps extends VideoPlayerProps {
  overlay?: React.ReactNode
  overlayClassName?: string
}

export function HeroVideo({ 
  overlay, 
  overlayClassName,
  className,
  ...props 
}: HeroVideoProps) {
  return (
    <div className={cn('relative w-full h-screen overflow-hidden', className)}>
      <VideoPlayer
        options={{
          controls: false,
          autoPlay: true,
          loop: true,
          muted: true,
          playsInline: true,
          ...props.options,
        }}
        className='absolute inset-0 w-full h-full object-cover'
        {...props}
      />
      
      {overlay && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center',
          'bg-black/30 text-white',
          overlayClassName,
        )}>
          {overlay}
        </div>
      )}
    </div>
  )
}

export interface LazyVideoProps extends VideoPlayerProps {
  placeholder?: React.ReactNode
  threshold?: number
  rootMargin?: string
}

export function LazyVideo({
  placeholder,
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}: LazyVideoProps) {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin,
      },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return (
    <div ref={containerRef} className={props.className}>
      {isVisible ? (
        <VideoPlayer {...props} />
      ) : (
        placeholder || (
          <div className='w-full h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center'>
            <span className='text-muted-foreground'>Loading video...</span>
          </div>
        )
      )}
    </div>
  )
}