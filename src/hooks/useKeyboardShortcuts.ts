'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.altKey ? event.altKey : !event.altKey;
        const metaMatches = shortcut.metaKey ? event.metaKey : !event.metaKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Global keyboard shortcuts
export const useGlobalShortcuts = () => {
  const router = useRouter();

  useKeyboardShortcuts([
    {
      key: 'h',
      description: 'Go to Home/Dashboard',
      action: () => router.push('/'),
    },
    {
      key: 'i',
      description: 'Go to Items',
      action: () => router.push('/items'),
    },
    {
      key: 'o',
      description: 'Go to Outfits',
      action: () => router.push('/outfits'),
    },
    {
      key: 'c',
      description: 'Go to Characters',
      action: () => router.push('/characters'),
    },
    {
      key: 't',
      description: 'Go to Timeline',
      action: () => router.push('/timeline'),
    },
    {
      key: 's',
      description: 'Go to Search',
      action: () => router.push('/search'),
    },
    {
      key: 'n',
      ctrlKey: true,
      description: 'Quick Add Item',
      action: () => {
        window.dispatchEvent(new CustomEvent('quickAdd'));
      },
    },
    {
      key: 'k',
      ctrlKey: true,
      description: 'Open Quick Search',
      action: () => {
        // Focus on search input in navigation
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
    },
    {
      key: '?',
      shiftKey: true,
      description: 'Show keyboard shortcuts',
      action: () => {
        // This will trigger the help modal if implemented
        window.dispatchEvent(new CustomEvent('show-shortcuts-help'));
      },
    },
  ]);
};

// Format shortcut display text
export const formatShortcut = (shortcut: ShortcutConfig): string => {
  const parts: string[] = [];
  
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.metaKey) parts.push('⌘');
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(' + ');
};
