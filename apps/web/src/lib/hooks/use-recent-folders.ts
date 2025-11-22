// ============================================================================
// FILE: lib/hooks/use-recent-folders.ts
// Track and manage recently accessed folders
// ============================================================================
import { useState, useEffect, useCallback } from 'react';
import type { Folder } from '@/lib/api/folder.api';

interface RecentFolder {
  id: string;
  nama_folder: string;
  warna?: string | null;
  perkara_id: string;
  lastAccessed: string;
}

const STORAGE_KEY = 'recent-folders';
const MAX_RECENT = 5;

/**
 * Hook for managing recently accessed folders
 * Stores folder info in localStorage and provides quick access
 */
export function useRecentFolders(perkaraId?: string) {
  const [recentFolders, setRecentFolders] = useState<RecentFolder[]>([]);

  // Load recent folders from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RecentFolder[];
        // Filter by perkara if specified
        const filtered = perkaraId
          ? parsed.filter(f => f.perkara_id === perkaraId)
          : parsed;
        setRecentFolders(filtered);
      } catch (error) {
        console.error('Failed to parse recent folders:', error);
        setRecentFolders([]);
      }
    }
  }, [perkaraId]);

  // Add folder to recent list
  const addRecentFolder = useCallback((folder: Pick<Folder, 'id' | 'nama_folder' | 'warna' | 'perkara_id'>) => {
    const newRecent: RecentFolder = {
      id: folder.id,
      nama_folder: folder.nama_folder,
      warna: folder.warna,
      perkara_id: folder.perkara_id,
      lastAccessed: new Date().toISOString(),
    };

    setRecentFolders(prev => {
      // Remove if already exists
      const filtered = prev.filter(f => f.id !== folder.id);

      // Add to beginning
      const updated = [newRecent, ...filtered];

      // Limit to MAX_RECENT
      const limited = updated.slice(0, MAX_RECENT);

      // Save to localStorage
      try {
        // Get all recent folders (not filtered by perkara)
        const stored = localStorage.getItem(STORAGE_KEY);
        const allRecent = stored ? JSON.parse(stored) : [];

        // Merge with other perkara's folders
        const otherPerkara = allRecent.filter((f: RecentFolder) => f.perkara_id !== folder.perkara_id);
        const merged = [...limited, ...otherPerkara].slice(0, MAX_RECENT * 3); // Keep more in storage

        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (error) {
        console.error('Failed to save recent folders:', error);
      }

      return limited;
    });
  }, []);

  // Clear all recent folders
  const clearRecentFolders = useCallback(() => {
    setRecentFolders([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Clear recent folders for specific perkara
  const clearPerkaraRecent = useCallback((targetPerkaraId: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allRecent = JSON.parse(stored) as RecentFolder[];
        const filtered = allRecent.filter(f => f.perkara_id !== targetPerkaraId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

        if (perkaraId === targetPerkaraId) {
          setRecentFolders([]);
        }
      }
    } catch (error) {
      console.error('Failed to clear perkara recent folders:', error);
    }
  }, [perkaraId]);

  return {
    recentFolders,
    addRecentFolder,
    clearRecentFolders,
    clearPerkaraRecent,
  };
}
