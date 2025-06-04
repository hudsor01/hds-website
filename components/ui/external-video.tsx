'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type ExternalVideoConfig, videoUtils } from '@/lib/video/video-config'
import { Play } from 'lucide-react'

export interface ExternalVideoProps {
  config: ExternalVideoConfig
  width?: number | string
  height?: number | string
  className?: string
  title?: string
  allowFullScreen?: boolean
  lazy?: boolean
  privacy?: boolean
  customThumbnail?: string
  onLoad?: () => void
  onError?: (error: Error) => void
}

export function ExternalVideo({
  config,
  width = '100%',
  height = 315,
  className,
  title,
  allowFullScreen = true,
  lazy = true,
  privacy = true,
  customThumbnail,
  onLoad,
  onError,
}: ExternalVideoProps) {
  const [isLoaded, setIsLoaded] = useState(!lazy)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  const handleLoadVideo = () => {
    setIsLoading(true)
    setIsLoaded(true)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleIframeError = () => {
    const errorMsg = `Failed to load ${config.platform} video`
    setError(errorMsg)
    setIsLoading(false)
    onError?.(new Error(errorMsg))
  }

  // Generate embed URL based on platform
  const getEmbedUrl = () => {
    try {
      switch (config.platform) {
        case 'youtube':
          return videoUtils.generateYouTubeUrl(config.videoId, {
            ...config.parameters,
            privacyEnhanced: privacy,
          })
        case 'vimeo':
          return videoUtils.generateVimeoUrl(config.videoId, config.parameters)
        case 'custom':
          return config.embedUrl || ''
        default:
          throw new Error(`Unsupported platform: ${config.platform}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate embed URL')
      return ''
    }
  }

  const embedUrl = getEmbedUrl()

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className='flex items-center justify-center p-8'>
          <div className='text-center space-y-2'>
            <p className='text-destructive'>Error loading video</p>
            <p className='text-sm text-muted-foreground'>{error}</p>
            <Button 
              variant='outline' 
              size='sm' 
              onClick={() => {
                setError(null)
                setIsLoaded(false)
              }}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isLoaded) {
    return (
      <VideoPlaceholder
        platform={config.platform}
        videoId={config.videoId}
        width={width}
        height={height}
        className={className}
        title={title}
        customThumbnail={customThumbnail}
        onPlay={handleLoadVideo}
        isLoading={isLoading}
      />
    )
  }

  return (
    <div className={cn('relative w-full', className)}>
      {isLoading && (
        <div className='absolute inset-0 flex items-center justify-center bg-background/80 z-10'>
          <div className='flex items-center space-x-2'>
            <div className='w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin' />
            <span className='text-sm'>Loading video...</span>
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={embedUrl}
        width={width}
        height={height}
        title={title || `${config.platform} video ${config.videoId}`}
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        allowFullScreen={allowFullScreen}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        className='w-full h-full border-0 rounded-lg'
      />
      
      {/* Privacy notice for GDPR compliance */}
      {privacy && config.platform === 'youtube' && (
        <div className='absolute bottom-2 left-2'>
          <Badge variant='secondary' className='text-xs'>
            Privacy Enhanced
          </Badge>
        </div>
      )}
    </div>
  )
}

interface VideoPlaceholderProps {
  platform: string
  videoId: string
  width: number | string
  height: number | string
  className?: string
  title?: string
  customThumbnail?: string
  onPlay: () => void
  isLoading: boolean
}

function VideoPlaceholder({
  platform,
  videoId,
  width,
  height,
  className,
  title,
  customThumbnail,
  onPlay,
  isLoading,
}: VideoPlaceholderProps) {
  const [thumbnailError, setThumbnailError] = useState(false)
  
  // Generate thumbnail URLs for different platforms
  const getThumbnailUrl = () => {
    if (customThumbnail) return customThumbnail
    
    switch (platform) {
      case 'youtube':
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      case 'vimeo':
        // Note: Vimeo thumbnails require API call in real implementation
        return `/api/vimeo/${videoId}/thumbnail`
      default:
        return null
    }
  }

  const thumbnailUrl = getThumbnailUrl()

  return (
    <div 
      className={cn(
        'relative group cursor-pointer overflow-hidden rounded-lg bg-muted',
        className,
      )}
      style={{ width, height }}
      onClick={onPlay}
    >
      {/* Thumbnail */}
      {thumbnailUrl && !thumbnailError ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={thumbnailUrl}
          alt={title || `${platform} video thumbnail`}
          className='w-full h-full object-cover transition-transform group-hover:scale-105'
          onError={() => setThumbnailError(true)}
        />
      ) : (
        <div className='w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center'>
          <div className='text-center space-y-2'>
            <div className='w-16 h-16 bg-background/20 rounded-full flex items-center justify-center'>
              <Play className='w-8 h-8 text-background/80' />
            </div>
            <p className='text-sm text-background/80 font-medium'>
              {platform.charAt(0).toUpperCase() + platform.slice(1)} Video
            </p>
          </div>
        </div>
      )}

      {/* Overlay */}
      <div className='absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center'>
        <div className='flex items-center space-x-4'>
          {/* Play button */}
          <Button
            size='lg'
            className='rounded-full w-16 h-16 p-0'
            disabled={isLoading}
          >
            {isLoading ? (
              <div className='w-6 h-6 border-2 border-background border-t-transparent rounded-full animate-spin' />
            ) : (
              <Play className='w-8 h-8 ml-1' fill='currentColor' />
            )}
          </Button>
        </div>
      </div>

      {/* Platform badge */}
      <div className='absolute top-2 left-2'>
        <Badge variant='secondary' className='capitalize'>
          {platform}
        </Badge>
      </div>

      {/* Privacy notice */}
      <div className='absolute bottom-2 right-2'>
        <Badge variant='outline' className='text-xs bg-background/80'>
          Click to load
        </Badge>
      </div>

      {/* Video info overlay */}
      {title && (
        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4'>
          <h3 className='text-white font-medium text-sm line-clamp-2'>
            {title}
          </h3>
        </div>
      )}
    </div>
  )
}

// Specialized external video components

export interface YouTubeVideoProps extends Omit<ExternalVideoProps, 'config'> {
  videoId: string
  startTime?: number
  endTime?: number
  autoplay?: boolean
  modestBranding?: boolean
  showRelated?: boolean
  showInfo?: boolean
  controls?: boolean
  loop?: boolean
}

export function YouTubeVideo({
  videoId,
  startTime,
  endTime,
  autoplay = false,
  modestBranding = true,
  showRelated = false,
  showInfo = false,
  controls = true,
  loop = false,
  ...props
}: YouTubeVideoProps) {
  const config: ExternalVideoConfig = {
    platform: 'youtube',
    videoId,
    parameters: {
      start: startTime,
      end: endTime,
      autoplay: autoplay ? 1 : 0,
      modestbranding: modestBranding ? 1 : 0,
      rel: showRelated ? 1 : 0,
      showinfo: showInfo ? 1 : 0,
      controls: controls ? 1 : 0,
      loop: loop ? 1 : 0,
    },
  }

  return <ExternalVideo config={config} {...props} />
}

export interface VimeoVideoProps extends Omit<ExternalVideoProps, 'config'> {
  videoId: string
  autoplay?: boolean
  loop?: boolean
  showTitle?: boolean
  showByline?: boolean
  showPortrait?: boolean
  color?: string
}

export function VimeoVideo({
  videoId,
  autoplay = false,
  loop = false,
  showTitle = false,
  showByline = false,
  showPortrait = false,
  color,
  ...props
}: VimeoVideoProps) {
  const config: ExternalVideoConfig = {
    platform: 'vimeo',
    videoId,
    parameters: {
      autoplay: autoplay ? 1 : 0,
      loop: loop ? 1 : 0,
      title: showTitle ? 1 : 0,
      byline: showByline ? 1 : 0,
      portrait: showPortrait ? 1 : 0,
      color: color?.replace('#', ''),
    },
  }

  return <ExternalVideo config={config} {...props} />
}

export interface VideoGridProps {
  videos: Array<{
    id: string
    platform: 'youtube' | 'vimeo'
    title?: string
    thumbnail?: string
  }>
  columns?: number
  gap?: number
  aspectRatio?: string
  onVideoSelect?: (video: {
    id: string
    platform: 'youtube' | 'vimeo'
    title?: string
    thumbnail?: string
  }) => void
}

export function VideoGrid({
  videos,
  columns = 3,
  gap = 4,
  aspectRatio = '16/9',
  onVideoSelect,
}: VideoGridProps) {
  return (
    <div 
      className={cn(
        'grid gap-4',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      )}
      style={{ gap: `${gap * 0.25}rem` }}
    >
      {videos.map((video) => (
        <div
          key={video.id}
          className='cursor-pointer'
          onClick={() => onVideoSelect?.(video)}
          style={{ aspectRatio }}
        >
          <ExternalVideo
            config={{
              platform: video.platform,
              videoId: video.id,
            }}
            title={video.title}
            customThumbnail={video.thumbnail}
            className='w-full h-full'
            lazy
            privacy
          />
        </div>
      ))}
    </div>
  )
}