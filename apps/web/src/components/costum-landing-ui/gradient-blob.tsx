// ============================================
// FILE: app/home/_components/ui/gradient-blob.tsx
// ============================================
'use client'

import { motion } from 'framer-motion'

interface GradientBlobProps {
  className?: string
  color?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  animate?: boolean
}

export function GradientBlob({ 
  className = '', 
  color = 'from-primary/20 to-primary/10',
  size = 'lg',
  position = 'top-left',
  animate = true
}: GradientBlobProps) {
  const sizeClasses = {
    sm: 'w-64 h-64',
    md: 'w-96 h-96',
    lg: 'w-[32rem] h-[32rem]',
    xl: 'w-[48rem] h-[48rem]'
  }

  const positionClasses = {
    'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
    'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
    'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
    'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  }

  return (
    <motion.div
      className={`absolute ${sizeClasses[size]} ${positionClasses[position]} bg-gradient-to-br ${color} rounded-full blur-3xl opacity-50 pointer-events-none ${className}`}
      animate={animate ? {
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0],
      } : undefined}
      transition={animate ? {
        duration: 20,
        repeat: Infinity,
        ease: 'linear'
      } : undefined}
    />
  )
}

// Multiple Blobs Background
export function GradientBlobsBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <GradientBlob 
        position="top-left" 
        color="from-blue-500/20 to-purple-500/20" 
        size="xl"
      />
      <GradientBlob 
        position="top-right" 
        color="from-pink-500/20 to-rose-500/20" 
        size="lg"
      />
      <GradientBlob 
        position="bottom-left" 
        color="from-amber-500/20 to-yellow-500/20" 
        size="lg"
      />
      <GradientBlob 
        position="bottom-right" 
        color="from-teal-500/20 to-cyan-500/20" 
        size="xl"
      />
    </div>
  )
}