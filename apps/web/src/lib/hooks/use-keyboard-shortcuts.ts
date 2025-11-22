// ============================================================================
// FILE: lib/hooks/use-keyboard-shortcuts.ts
// Global keyboard shortcuts management
// ============================================================================
import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  handler: (event: KeyboardEvent) => void;
  description?: string;
  enabled?: boolean;
}

/**
 * Hook for managing global keyboard shortcuts
 *
 * @example
 * useKeyboardShortcuts([
 *   { key: 'f', ctrlKey: true, handler: () => focusSearch(), description: 'Focus search' },
 *   { key: 'k', ctrlKey: true, handler: () => openCommandPalette(), description: 'Command palette' },
 * ]);
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      const isContentEditable = target.isContentEditable;

      // Allow Ctrl/Cmd shortcuts even in input fields (like Ctrl+F, Ctrl+K)
      const isModifierShortcut = event.ctrlKey || event.metaKey;

      if (isInputField && !isModifierShortcut) {
        return;
      }

      if (isContentEditable && !isModifierShortcut) {
        return;
      }

      // Check each shortcut
      for (const shortcut of shortcuts) {
        // Skip disabled shortcuts
        if (shortcut.enabled === false) {
          continue;
        }

        // Check if key matches (case-insensitive)
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        if (!keyMatches) {
          continue;
        }

        // Check modifiers
        const ctrlMatches = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
        const shiftMatches = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
        const altMatches = shortcut.altKey === undefined || event.altKey === shortcut.altKey;
        const metaMatches = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          event.preventDefault();
          shortcut.handler(event);
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * Hook for creating a single keyboard shortcut
 */
export function useKeyboardShortcut(
  key: string,
  handler: (event: KeyboardEvent) => void,
  modifiers?: {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
  }
) {
  useKeyboardShortcuts([
    {
      key,
      ...modifiers,
      handler,
    },
  ]);
}
