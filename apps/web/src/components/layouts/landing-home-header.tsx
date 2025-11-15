// ============================================
// FILE: app/home/_components/layout/home-header.tsx
// FIXED: Client-only, no server dependencies
// ============================================
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Scale, LogIn, UserPlus, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavbarScroll } from '@/lib/hooks/use-navbar-scroll'
import { ThemeToggle } from '@/components/costum-landing-ui/theme-toggle'
import { DesktopNav } from './landing-desktop-nav'
import { MobileNav } from './landing-mobile-nav'

export function HomeHeader() {
  const { isScrolled, isVisible } = useNavbarScroll(20)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 group">
            <motion.div
              className={cn(
                'p-2 rounded-lg transition-colors',
                isScrolled ? 'bg-primary/10' : 'bg-white/10'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Scale
                className={cn(
                  'w-6 h-6 transition-colors',
                  isScrolled ? 'text-primary' : 'text-white'
                )}
              />
            </motion.div>
            <span
              className={cn(
                'font-bold text-lg md:text-xl transition-colors',
                isScrolled ? 'text-slate-900 dark:text-white' : 'text-white'
              )}
            >
              FIRMA PERARI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <DesktopNav isScrolled={isScrolled} />

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                'transition-colors',
                isScrolled
                  ? 'text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/5'
                  : 'text-white hover:bg-white/10'
              )}
            >
              <Link href="/login">
                <LogIn className="w-4 h-4 mr-2" />
                Masuk
              </Link>
            </Button>
            <Button
              size="sm"
              asChild
              variant={isScrolled ? 'default' : 'secondary'}
            >
              <Link href="/register">
                <UserPlus className="w-4 h-4 mr-2" />
                Daftar
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'lg:hidden',
              isScrolled ? 'text-slate-900 dark:text-white' : 'text-white'
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        isScrolled={isScrolled}
      />
    </motion.header>
  )
}