// ============================================
// FILE: app/home/_components/layout/home-header.tsx
// FIXED: Client-only, no server dependencies
// UPDATED: Added auth detection + avatar + dashboard button (Railway-style)
// ============================================
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Scale, LogIn, UserPlus, Menu, X, LayoutDashboard, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavbarScroll } from '@/lib/hooks/use-navbar-scroll'
import { useAuth } from '@/lib/hooks/use-auth'
import { ThemeToggle } from '@/components/custom-landing-ui/theme-toggle'
import { DesktopNav } from './landing-desktop-nav'
import { MobileNav } from './landing-mobile-nav'

export function HomeHeader() {
  const { isScrolled, isVisible } = useNavbarScroll(20)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return 'U'
    if (user.nama_lengkap) {
      const names = user.nama_lengkap.split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return names[0][0].toUpperCase()
    }
    return user.email?.[0]?.toUpperCase() || 'U'
  }

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
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              className={cn(
                'p-2 rounded-lg transition-colors',
                isScrolled ? 'bg-primary/10' : 'bg-white/10 dark:bg-white/10'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Scale
                className={cn(
                  'w-6 h-6 transition-colors',
                  isScrolled ? 'text-primary' : 'text-slate-900 dark:text-white'
                )}
              />
            </motion.div>
            <span
              className={cn(
                'font-bold text-lg md:text-xl transition-colors',
                isScrolled ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'
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

            {isAuthenticated && user ? (
              // ✅ AUTHENTICATED: Show Dashboard button + Avatar dropdown (Railway-style)
              <>
                <Button
                  size="sm"
                  asChild
                  variant={isScrolled ? 'default' : 'secondary'}
                  className="gap-2"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url} alt={user.nama_lengkap || user.email} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.nama_lengkap || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/pengaturan" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // ❌ NOT AUTHENTICATED: Show Login + Register
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    'transition-colors',
                    isScrolled
                      ? 'text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/5'
                      : 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10'
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
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'lg:hidden',
              isScrolled ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'
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
