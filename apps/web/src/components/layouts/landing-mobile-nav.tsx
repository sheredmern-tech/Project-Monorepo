// ============================================
// FILE: app/home/_components/layout/mobile-nav.tsx
// ============================================
'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Scale, LogIn, UserPlus, Home, Info, Target, Briefcase, Users, Mail } from 'lucide-react'
import { scrollToSection } from '@/app/home/_utils/scroll-utils'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isScrolled: boolean
}

const navItems = [
  { icon: Home, label: 'Beranda', href: '#hero' },
  { icon: Info, label: 'Tentang', href: '#tentang' },
  { icon: Target, label: 'Visi & Misi', href: '#visi-misi' },
  { icon: Briefcase, label: 'Layanan', href: '#layanan' },
  { icon: Users, label: 'Tim', href: '#tim' },
  { icon: Mail, label: 'Kontak', href: '#kontak' },
]

export function MobileNav({ isOpen, setIsOpen, isScrolled }: MobileNavProps) {
  const handleNavClick = (href: string) => {
    scrollToSection(href)
    setIsOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-0 right-0 bottom-0 w-[300px] bg-white dark:bg-slate-900 shadow-2xl z-50 lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col h-full p-6">
              {/* Logo */}
              <div className="flex items-center gap-2 mb-8">
                <Scale className="w-8 h-8 text-primary" />
                <span className="font-bold text-xl">FIRMA PERARI</span>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 space-y-2">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleNavClick(item.href)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/5 transition-colors text-left group"
                  >
                    <item.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                ))}
              </nav>

              <Separator className="my-6" />

              {/* Auth Buttons */}
              <div className="space-y-3">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Masuk
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/register">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Daftar
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
