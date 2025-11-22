// ============================================================================
// FILE: components/dokumen/KeyboardShortcutsHelp.tsx
// Keyboard shortcuts help modal
// ============================================================================
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  const shortcuts: Shortcut[] = [
    // General
    { keys: ['Ctrl', 'K'], description: 'Buka command palette', category: 'Umum' },
    { keys: ['Ctrl', 'F'], description: 'Fokus ke pencarian', category: 'Umum' },
    { keys: ['?'], description: 'Tampilkan bantuan shortcut', category: 'Umum' },
    { keys: ['Esc'], description: 'Tutup modal/dialog', category: 'Umum' },

    // Document Management
    { keys: ['N'], description: 'Buat folder baru', category: 'Dokumen' },
    { keys: ['U'], description: 'Upload dokumen', category: 'Dokumen' },
    { keys: ['S'], description: 'Toggle mode seleksi', category: 'Dokumen' },

    // Navigation
    { keys: ['G', 'D'], description: 'Ke Dashboard', category: 'Navigasi' },
    { keys: ['G', 'P'], description: 'Ke Perkara', category: 'Navigasi' },
    { keys: ['G', 'K'], description: 'Ke Klien', category: 'Navigasi' },
    { keys: ['G', 'J'], description: 'Ke Jadwal Sidang', category: 'Navigasi' },
    { keys: ['G', 'T'], description: 'Ke Tugas', category: 'Navigasi' },
  ];

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Keyboard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Keyboard Shortcuts</DialogTitle>
              <DialogDescription>
                Gunakan shortcut keyboard untuk navigasi lebih cepat
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <div key={keyIndex} className="flex items-center gap-1">
                          <kbd className="px-2 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded shadow-sm">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-slate-400 text-xs">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Tips:</strong> Tekan <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded">?</kbd> kapan saja untuk membuka bantuan shortcut ini.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
