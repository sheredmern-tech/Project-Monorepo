// ============================================
// FILE: app/home/_components/ui/glassmorphism-card.tsx
// ============================================

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassmorphismCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function GlassmorphismCard({ 
  children, 
  className = '',
  hover = true 
}: GlassmorphismCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-white/10 dark:bg-slate-900/10',
        'backdrop-blur-md',
        'border border-white/20 dark:border-slate-800/20',
        'shadow-xl',
        hover && 'transition-all duration-300 hover:shadow-2xl hover:-translate-y-1',
        className
      )}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
