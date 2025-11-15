// ============================================
// FILE: app/home/_constants/hero-content.ts
// PHASE 1: Updated with Cloudinary Optimization
// ============================================
import { getOptimizedImageUrl, getCloudinaryBlurUrl } from '@/lib/cloudinary'

// Cloudinary public ID untuk Lady Justice image
const HERO_IMAGE_PUBLIC_ID = 'Lady_Justice_o2noc0'

export const heroContent = {
  badge: '⚖️ Firma Hukum Terpercaya #1 di Indonesia',
  
  headline: {
    line1: 'FIRMA HUKUM',
    line2: 'PERARI',
    gradient: true,
  },
  
  subheadline: 'Solusi hukum profesional, cepat, dan terpercaya untuk semua kebutuhan legal Anda',
  
  cta: {
    primary: {
      text: 'Konsultasi Gratis',
      href: '#kontak',
    },
    secondary: {
      text: 'Lihat Layanan',
      href: '#layanan',
    }
  },
  
  trustIndicators: [
    { icon: 'CheckCircle2', text: 'Terdaftar & Berizin' },
    { icon: 'CheckCircle2', text: 'ISO Certified' },
    { icon: 'CheckCircle2', text: 'Award Winner' },
  ],
  
  // ===================================
  // ✅ OPTIMIZED IMAGE URLs
  // ===================================
  backgroundImage: getOptimizedImageUrl(HERO_IMAGE_PUBLIC_ID, {
    width: 1920,
    quality: 85,
    format: 'auto', // Auto-select WebP/AVIF
    crop: 'fill',
  }),
  
  // Mobile-optimized version (smaller)
  backgroundImageMobile: getOptimizedImageUrl(HERO_IMAGE_PUBLIC_ID, {
    width: 768,
    quality: 80,
    format: 'auto',
    crop: 'fill',
  }),
  
  // Tablet-optimized version
  backgroundImageTablet: getOptimizedImageUrl(HERO_IMAGE_PUBLIC_ID, {
    width: 1280,
    quality: 85,
    format: 'auto',
    crop: 'fill',
  }),
  
  // ✅ BLUR PLACEHOLDER (prevents layout shift)
  blurDataURL: getCloudinaryBlurUrl(HERO_IMAGE_PUBLIC_ID),
}

// ===================================
// RESPONSIVE SIZES for Next.js Image
// ===================================
export const heroImageSizes = '100vw'

// ===================================
// PRELOAD CONFIG (untuk LCP optimization)
// ===================================
export const shouldPreloadHeroImage = true