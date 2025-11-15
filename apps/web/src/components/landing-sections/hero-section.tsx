// ============================================
// FILE: app/home/_components/sections/hero-section.tsx
// FIXED: No middleware dependency, pure client component
// ============================================
'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Scale, ArrowRight, CheckCircle2 } from 'lucide-react'
import { heroContent, heroImageSizes } from '@/app/home/_constants/hero-content'
import { scrollToSection } from '@/app/home/_utils/scroll-utils'
import { OptimizedImage } from '@/app/home/_components/costum-landing-ui/optimized-image'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Lazy load heavy components
const ParticleBackground = dynamic(
  () => import('@/app/home/_components/costum-landing-ui/particle-background').then(mod => ({ 
    default: mod.ParticleBackground 
  })),
  { 
    ssr: false,
    loading: () => null
  }
)

const StaggeredText = dynamic(
  () => import('@/app/home/_components/costum-landing-ui/animated-text').then(mod => ({ 
    default: mod.StaggeredText 
  })),
  { 
    ssr: false,
    loading: () => (
      <p className="text-xl md:text-2xl lg:text-3xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
        {heroContent.subheadline}
      </p>
    )
  }
)

export function HeroSection() {
  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <OptimizedImage
          src={heroContent.backgroundImage}
          alt="Lady Justice - Firma Hukum PERARI"
          fill
          priority
          quality={85}
          className="object-cover opacity-30"
          blurDataURL={heroContent.blurDataURL}
          sizes={heroImageSizes}
          showLoadingSkeleton={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950/90" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Particles */}
      <Suspense fallback={null}>
        <ParticleBackground />
      </Suspense>

      {/* Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            delay: 1,
            ease: 'easeInOut'
          }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge 
              variant="secondary" 
              className="text-sm px-4 py-1.5 bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
            >
              {heroContent.badge}
            </Badge>
          </motion.div>

          {/* Icon */}
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-2xl animate-pulse" />
              <div className="relative p-5 bg-primary/20 backdrop-blur-sm rounded-2xl border border-primary/30">
                <Scale className="w-16 h-16 text-primary" />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-tight">
              <span className="block mb-2">
                {heroContent.headline.line1}
              </span>
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                {heroContent.headline.line2}
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Suspense fallback={
              <p className="text-xl md:text-2xl lg:text-3xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                {heroContent.subheadline}
              </p>
            }>
              <StaggeredText
                text={heroContent.subheadline}
                className="text-xl md:text-2xl lg:text-3xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
                delay={1}
              />
            </Suspense>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 group shadow-2xl shadow-primary/20"
              onClick={() => scrollToSection(heroContent.cta.primary.href)}
            >
              {heroContent.cta.primary.text}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 bg-white/5 backdrop-blur-sm text-white border-white/20 hover:bg-white hover:text-slate-900"
              onClick={() => scrollToSection(heroContent.cta.secondary.href)}
            >
              {heroContent.cta.secondary.text}
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-8 pt-12 text-slate-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            {heroContent.trustIndicators.map((indicator, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>{indicator.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-2">
          <motion.div 
            className="w-1 h-3 bg-white/50 rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </div>
      </motion.div>
    </section>
  )
}