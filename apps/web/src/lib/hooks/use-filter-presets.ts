// ============================================================================
// FILE: lib/hooks/use-filter-presets.ts
// Save and manage filter combinations as presets
// ============================================================================
import { useState, useEffect, useCallback } from 'react';

export interface FilterPreset {
  id: string;
  name: string;
  filters: {
    search?: string;
    kategori?: string;
    uploaderFilter?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    folderId?: string | null;
  };
  createdAt: string;
}

const STORAGE_KEY = 'dokumen-filter-presets';

/**
 * Hook for managing filter presets
 * Allows users to save and quickly apply common filter combinations
 */
export function useFilterPresets() {
  const [presets, setPresets] = useState<FilterPreset[]>([]);

  // Load presets from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as FilterPreset[];
        setPresets(parsed);
      } catch (error) {
        console.error('Failed to parse filter presets:', error);
        setPresets([]);
      }
    }
  }, []);

  // Save presets to localStorage
  const saveToStorage = useCallback((updatedPresets: FilterPreset[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPresets));
    } catch (error) {
      console.error('Failed to save filter presets:', error);
    }
  }, []);

  // Add new preset
  const addPreset = useCallback((name: string, filters: FilterPreset['filters']) => {
    const newPreset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name,
      filters,
      createdAt: new Date().toISOString(),
    };

    setPresets(prev => {
      const updated = [...prev, newPreset];
      saveToStorage(updated);
      return updated;
    });

    return newPreset;
  }, [saveToStorage]);

  // Update existing preset
  const updatePreset = useCallback((id: string, updates: Partial<Omit<FilterPreset, 'id' | 'createdAt'>>) => {
    setPresets(prev => {
      const updated = prev.map(preset =>
        preset.id === id
          ? { ...preset, ...updates }
          : preset
      );
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Delete preset
  const deletePreset = useCallback((id: string) => {
    setPresets(prev => {
      const updated = prev.filter(preset => preset.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Clear all presets
  const clearPresets = useCallback(() => {
    setPresets([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    presets,
    addPreset,
    updatePreset,
    deletePreset,
    clearPresets,
  };
}
