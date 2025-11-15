// ============================================
// FILE: lib/image-blur.ts
// ============================================

import { getPlaiceholder } from 'plaiceholder'

/**
 * Generate blur data URL for placeholder
 * Uses plaiceholder for high-quality blur effect
 * Prevents Cumulative Layout Shift (CLS)
 * 
 * @param imageUrl - Full URL of the image
 * @returns Base64 blur data URL
 * 
 * @example
 * const blurUrl = await getBlurDataURL('https://example.com/image.jpg')
 */
export async function getBlurDataURL(imageUrl: string): Promise<string> {
  try {
    // Fetch the image
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }
    
    // Convert to buffer
    const buffer = await response.arrayBuffer()
    
    // Generate blur placeholder
    const { base64 } = await getPlaiceholder(Buffer.from(buffer), { 
      size: 10 // 10x10 pixel blur
    })
    
    return base64
  } catch (error) {
    console.error('Error generating blur placeholder:', error)
    
    // Fallback: Simple gray blur (1x1 pixel gray image)
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
  }
}

/**
 * Batch generate blur URLs for multiple images
 * Useful for generating placeholders at build time (ISR/SSG)
 * 
 * @param imageUrls - Array of image URLs
 * @returns Map of URL to blur data URL
 * 
 * @example
 * const blurMap = await getBatchBlurDataURLs([
 *   'https://example.com/image1.jpg',
 *   'https://example.com/image2.jpg'
 * ])
 * const blur1 = blurMap.get('https://example.com/image1.jpg')
 */
export async function getBatchBlurDataURLs(
  imageUrls: string[]
): Promise<Map<string, string>> {
  const blurMap = new Map<string, string>()
  
  // Process all images in parallel
  await Promise.all(
    imageUrls.map(async (url) => {
      try {
        const blurUrl = await getBlurDataURL(url)
        blurMap.set(url, blurUrl)
      } catch (error) {
        console.error(`Failed to generate blur for ${url}:`, error)
        // Set fallback
        blurMap.set(
          url, 
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
        )
      }
    })
  )
  
  return blurMap
}

/**
 * Generate blur from local file (for build-time optimization)
 * Use this in getStaticProps or generateStaticParams
 * 
 * @param filePath - Local file path (relative to project root)
 * @returns Base64 blur data URL
 * 
 * @example
 * // In getStaticProps
 * const blur = await getBlurFromLocalFile('./public/images/hero.jpg')
 */
export async function getBlurFromLocalFile(filePath: string): Promise<string> {
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const fullPath = path.join(process.cwd(), filePath)
    const buffer = await fs.readFile(fullPath)
    
    const { base64 } = await getPlaiceholder(buffer, { size: 10 })
    return base64
  } catch (error) {
    console.error('Error generating blur from local file:', error)
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
  }
}

/**
 * Check if an image URL is valid and accessible
 * 
 * @param imageUrl - URL to validate
 * @returns true if valid, false otherwise
 */
export async function validateImageUrl(imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}