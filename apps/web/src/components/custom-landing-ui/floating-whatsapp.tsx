// ============================================
// FILE: app/home/_components/ui/floating-whatsapp.tsx
// ============================================
'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatWhatsAppLink } from '@/lib/utils/format-helpers'
import { siteConfig } from '@/lib/data/site-config'

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false)

  const handleWhatsAppClick = () => {
    const message = 'Halo, saya tertarik untuk konsultasi hukum.'
    const link = formatWhatsAppLink(siteConfig.contact.whatsapp, message)
    window.open(link, '_blank')
  }

  return (
    <>
      {/* Main Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 right-6 z-50 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* Pulse Ring */}
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />

        {/* Glow Effect */}
        <span className="absolute inset-0 rounded-full bg-green-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

        {/* Button */}
        <div className="relative w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg flex items-center justify-center">
          <MessageCircle className="w-7 h-7 text-white" />
        </div>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 right-6 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 max-w-xs"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 dark:bg-slate-100 rounded-full flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white dark:text-slate-900" />
            </button>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Butuh bantuan? Chat dengan kami di WhatsApp!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}