// ============================================
// FILE: app/home/_components/layout/home-toc.tsx
// ============================================
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronUp, List, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { navigationItems } from '@/lib/data/navigation-items'
import { useScrollSpy } from '@/lib/hooks/use-scroll-spy'
import { scrollToSection, scrollToTop } from '@/lib/utils/scroll-utils'

export function HomeTOC() {
  const [isOpen, setIsOpen] = useState(false)
  const sectionIds = navigationItems.map(item => item.id)
  const activeSection = useScrollSpy(sectionIds)

  return (
    <>
      {/* Desktop TOC - Right Sidebar */}
      <aside className="hidden xl:block fixed right-8 top-32 w-[240px] z-30">
        <motion.div
          className="sticky top-32"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
              On this page
            </h3>
          </div>

          <nav className="space-y-1">
            {navigationItems.map((section) => {
              const isActive = activeSection === section.id
              const Icon = section.icon

              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.href)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm transition-all duration-200 rounded-lg',
                    'flex items-center gap-2',
                    'border-l-2 hover:border-primary/60',
                    isActive
                      ? 'border-primary text-primary font-medium bg-primary/5'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className={cn(
                    'w-4 h-4 flex-shrink-0',
                    isActive ? 'text-primary' : 'text-slate-400'
                  )} />
                  <span className="truncate">{section.title}</span>
                </button>
              )
            })}
          </nav>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className="mt-6 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors duration-200 px-3 py-2 w-full rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ChevronUp className="h-4 w-4" />
            <span>Back to the top</span>
          </button>
        </motion.div>
      </aside>

      {/* Mobile TOC Button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            size="icon"
            variant="outline"
            className="fixed bottom-24 right-6 h-12 w-12 rounded-full shadow-lg xl:hidden z-40 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-2"
            onClick={() => setIsOpen(true)}
          >
            <List className="h-5 w-5" />
          </Button>
        </motion.div>
      )}

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 xl:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile TOC Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 xl:hidden',
              'bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl z-50',
              'max-h-[70vh] overflow-hidden'
            )}
          >
            <div className="flex flex-col h-full">
              {/* Handle Bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 py-4 border-b dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  On this page
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* TOC List */}
              <ScrollArea className="flex-1 px-6 py-4">
                <nav className="space-y-1">
                  {navigationItems.map((section) => {
                    const Icon = section.icon
                    const isActive = activeSection === section.id

                    return (
                      <button
                        key={section.id}
                        onClick={() => {
                          scrollToSection(section.href)
                          setIsOpen(false)
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
                          'text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5 flex-shrink-0',
                            isActive ? 'text-primary' : 'text-slate-400'
                          )}
                        />
                        <span className="truncate text-left">{section.title}</span>
                      </button>
                    )
                  })}
                </nav>

                {/* Back to Top - Mobile */}
                <button
                  onClick={() => {
                    scrollToTop()
                    setIsOpen(false)
                  }}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors duration-200 border-t dark:border-slate-800"
                >
                  <ChevronUp className="h-4 w-4" />
                  <span>Back to the top</span>
                </button>
              </ScrollArea>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}