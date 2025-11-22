// ============================================================================
// FILE: components/dokumen/CommandPalette.tsx
// Quick action command palette (Ctrl+K)
// ============================================================================
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  FolderPlus,
  Upload,
  Search,
  Keyboard,
  FileText,
  Scale,
  Users,
  Calendar,
  CheckSquare,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Command {
  id: string;
  label: string;
  icon: React.ElementType;
  keywords: string[];
  action: () => void;
  category?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFolder?: () => void;
}

export function CommandPalette({ open, onOpenChange, onCreateFolder }: CommandPaletteProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const commands: Command[] = useMemo(
    () => [
      // Document Actions
      {
        id: 'upload-document',
        label: 'Upload Dokumen',
        icon: Upload,
        keywords: ['upload', 'dokumen', 'file', 'tambah'],
        action: () => {
          router.push('/dashboard/dokumen/upload');
          onOpenChange(false);
        },
        category: 'Dokumen',
      },
      {
        id: 'create-folder',
        label: 'Buat Folder Baru',
        icon: FolderPlus,
        keywords: ['folder', 'buat', 'new', 'create'],
        action: () => {
          onCreateFolder?.();
          onOpenChange(false);
        },
        category: 'Dokumen',
      },
      {
        id: 'view-documents',
        label: 'Lihat Semua Dokumen',
        icon: FileText,
        keywords: ['dokumen', 'list', 'semua', 'all'],
        action: () => {
          router.push('/dashboard/dokumen');
          onOpenChange(false);
        },
        category: 'Dokumen',
      },

      // Navigation
      {
        id: 'go-dashboard',
        label: 'Ke Dashboard',
        icon: Home,
        keywords: ['dashboard', 'home', 'beranda'],
        action: () => {
          router.push('/dashboard');
          onOpenChange(false);
        },
        category: 'Navigasi',
      },
      {
        id: 'go-perkara',
        label: 'Ke Perkara',
        icon: Scale,
        keywords: ['perkara', 'case', 'kasus'],
        action: () => {
          router.push('/dashboard/perkara');
          onOpenChange(false);
        },
        category: 'Navigasi',
      },
      {
        id: 'go-klien',
        label: 'Ke Klien',
        icon: Users,
        keywords: ['klien', 'client', 'customer'],
        action: () => {
          router.push('/dashboard/klien');
          onOpenChange(false);
        },
        category: 'Navigasi',
      },
      {
        id: 'go-sidang',
        label: 'Ke Jadwal Sidang',
        icon: Calendar,
        keywords: ['sidang', 'jadwal', 'schedule', 'court'],
        action: () => {
          router.push('/dashboard/sidang');
          onOpenChange(false);
        },
        category: 'Navigasi',
      },
      {
        id: 'go-tugas',
        label: 'Ke Tugas',
        icon: CheckSquare,
        keywords: ['tugas', 'task', 'todo'],
        action: () => {
          router.push('/dashboard/tugas');
          onOpenChange(false);
        },
        category: 'Navigasi',
      },
    ],
    [router, onOpenChange, onCreateFolder]
  );

  // Filter commands based on search query
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) {
      return commands;
    }

    const query = searchQuery.toLowerCase().trim();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query) ||
        cmd.keywords.some((keyword) => keyword.toLowerCase().includes(query)) ||
        cmd.category?.toLowerCase().includes(query)
    );
  }, [commands, searchQuery]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach((cmd) => {
      const category = cmd.category || 'Lainnya';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  const handleCommandClick = (command: Command) => {
    command.action();
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">Command Palette</DialogTitle>
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-slate-400" />
            <Input
              placeholder="Ketik untuk mencari aksi cepat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              ESC
            </kbd>
          </div>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto border-t">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Tidak ada aksi yang cocok dengan pencarian
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="p-2">
                <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {category}
                </div>
                <div className="space-y-1">
                  {cmds.map((cmd) => {
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => handleCommandClick(cmd)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition',
                          'hover:bg-slate-100 dark:hover:bg-slate-800',
                          'focus:bg-slate-100 dark:focus:bg-slate-800 focus:outline-none'
                        )}
                      >
                        <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <span className="flex-1 text-sm">{cmd.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t p-3 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border rounded">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border rounded">Enter</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white dark:bg-slate-800 border rounded">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
