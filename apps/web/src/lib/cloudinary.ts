// ============================================
// FILE: lib/cloudinary.ts
// ============================================

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dl93kdoox'

export interface CloudinaryOptions {
  width?: number
  height?: number
  quality?: number | 'auto'
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb'
  gravity?: 'auto' | 'center' | 'face' | 'faces'
  fetchFormat?: boolean
}

/**
 * Generate optimized Cloudinary URL with transformations
 * Supports responsive images, modern formats, and auto-optimization
 * 
 * @example
 * getOptimizedImageUrl('my-image', { width: 1920, quality: 85 })
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: CloudinaryOptions = {}
): string {
  const {
    width = 1920,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
    fetchFormat = true,
  } = options

  // Build transformation string
  const transformations = [
    `w_${width}`,
    height ? `h_${height}` : null,
    `q_${quality}`,
    `f_${format}`,
    `c_${crop}`,
    gravity !== 'auto' ? `g_${gravity}` : null,
    'dpr_auto', // Automatic device pixel ratio
    'fl_progressive', // Progressive JPEG loading
    'fl_lossy', // Lossy compression for smaller file size
    fetchFormat ? 'f_auto' : null, // Auto-format selection (WebP/AVIF)
  ].filter(Boolean).join(',')

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/${transformations}/${publicId}`
}

/**
 * Generate blur placeholder (10px width, heavy blur)
 * Used for preventing layout shift during image loading
 * 
 * @example
 * getCloudinaryBlurUrl('my-image')
 */
export function getCloudinaryBlurUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/w_10,q_10,e_blur:1000,f_auto/${publicId}`
}

/**
 * Generate responsive srcset for Next.js Image component
 * Creates multiple image sizes for different screen resolutions
 * 
 * @example
 * const srcSet = getCloudinaryImageSrcSet('my-image', { quality: 85 })
 */
export function getCloudinaryImageSrcSet(
  publicId: string,
  options: CloudinaryOptions = {}
) {
  const sizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
  
  return sizes.map(size => ({
    src: getOptimizedImageUrl(publicId, { ...options, width: size }),
    width: size,
  }))
}

/**
 * Preload critical images for better LCP (Largest Contentful Paint)
 * Call this for above-the-fold hero images
 * 
 * @example
 * preloadCloudinaryImage('hero-image', { width: 1920 })
 */
export function preloadCloudinaryImage(
  publicId: string, 
  options: CloudinaryOptions = {}
) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = getOptimizedImageUrl(publicId, options)
  
  const srcSet = getCloudinaryImageSrcSet(publicId, options)
  link.imageSrcset = srcSet
    .map(({ src, width }) => `${src} ${width}w`)
    .join(', ')
  
  document.head.appendChild(link)
}

/**
 * Get Cloudinary video URL with optimization
 * Useful for background videos
 * 
 * @example
 * getCloudinaryVideoUrl('my-video', { width: 1920, quality: 'auto' })
 */
export function getCloudinaryVideoUrl(
  publicId: string,
  options: {
    width?: number
    quality?: 'auto' | number
    format?: 'mp4' | 'webm'
  } = {}
): string {
  const {
    width = 1920,
    quality = 'auto',
    format = 'mp4',
  } = options

  const transformations = [
    `w_${width}`,
    `q_${quality}`,
    `f_${format}`,
    'vc_auto', // Auto video codec
  ].join(',')

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/${transformations}/${publicId}`
}