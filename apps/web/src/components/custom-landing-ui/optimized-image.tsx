// ============================================
// FILE: app/home/_components/ui/optimized-image.tsx
// PHASE 1: Optimized Image Component
// ============================================
'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'onLoad' | 'onError'> {
  src: string
  alt: string
  aspectRatio?: number
  blurDataURL?: string
  priority?: boolean
  className?: string
  containerClassName?: string
  showLoadingSkeleton?: boolean
  showErrorFallback?: boolean
  onLoadComplete?: () => void
  onErrorOccurred?: (error: Error) => void
}

/**
 * Optimized Image Component with:
 * - Automatic blur placeholder
 * - Loading skeleton state
 * - Error handling with fallback
 * - Aspect ratio preservation
 * - Smooth fade-in animation
 * - Responsive sizing
 * 
 * @example
 * <OptimizedImage
 *   src="https://example.com/image.jpg"
 *   alt="Description"
 *   aspectRatio={16/9}
 *   blurDataURL="data:image/..."
 *   priority
 * />
 */
export function OptimizedImage({
  src,
  alt,
  aspectRatio,
  blurDataURL,
  priority = false,
  className,
  containerClassName,
  showLoadingSkeleton = true,
  showErrorFallback = true,
  onLoadComplete,
  onErrorOccurred,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoadComplete?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onErrorOccurred?.(new Error(`Failed to load image: ${src}`))
  }

  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        'bg-slate-100 dark:bg-slate-800',
        containerClassName
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          fill={!props.width && !props.height}
          priority={priority}
          quality={85}
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL}
          sizes={props.sizes || '100vw'}
          className={cn(
            'object-cover',
            'transition-opacity duration-500 ease-in-out',
            isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      ) : showErrorFallback ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <div className="text-center text-sm text-muted-foreground px-4">
            <div className="mb-2 text-2xl">⚠️</div>
            <p className="font-medium">Failed to load image</p>
            <p className="text-xs mt-1 opacity-75">Please try refreshing</p>
          </div>
        </div>
      ) : null}
      
      {/* Loading Skeleton */}
      {isLoading && !hasError && showLoadingSkeleton && (
        <div className="absolute inset-0">
          <div className="h-full w-full animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700" />
          {/* Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Shimmer animation for loading skeleton
 * Add to globals.css:
 * 
 * @keyframes shimmer {
 *   100% {
 *     transform: translateX(100%);
 *   }
 * }
 */