// ============================================
// FILE: app/home/_components/ui/animated-text.tsx
// ============================================
'use client'

import { motion, Variants } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedTextProps {
  children: ReactNode
  className?: string
  variant?: 'fadeIn' | 'slideUp' | 'typing'
  delay?: number
}

export function AnimatedText({ 
  children, 
  className = '', 
  variant = 'fadeIn',
  delay = 0 
}: AnimatedTextProps) {
  const fadeInVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, delay }
    }
  }

  const slideUpVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, delay }
    }
  }

  const typingVariants: Variants = {
    hidden: { width: 0 },
    visible: { 
      width: '100%',
      transition: { duration: 1, delay }
    }
  }

  const variantsMap = {
    fadeIn: fadeInVariants,
    slideUp: slideUpVariants,
    typing: typingVariants
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variantsMap[variant]}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Staggered Text Animation (word by word)
interface StaggeredTextProps {
  text: string
  className?: string
  delay?: number
}

export function StaggeredText({ text, className = '', delay = 0 }: StaggeredTextProps) {
  const words = text.split(' ')

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay }
    }
  }

  const child: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: 'spring',
        damping: 12, 
        stiffness: 100 
      }
    }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  )
}