import { useEffect } from "react";

interface UseSearchShortcutsProps {
  onToggleSearch: () => void;
  onClearSearch?: () => void;
  onFocusSearch?: () => void;
}

export function useSearchShortcuts({ 
  onToggleSearch, 
  onClearSearch,
  onFocusSearch 
}: UseSearchShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onToggleSearch();
        return;
      }

      // Cmd/Ctrl + F to focus search
      if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
        event.preventDefault();
        onFocusSearch?.();
        return;
      }

      // Escape to clear search
      if (event.key === 'Escape' && onClearSearch) {
        onClearSearch();
        return;
      }

      // Forward slash to focus search (like GitHub)
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault();
        onFocusSearch?.();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onToggleSearch, onClearSearch, onFocusSearch]);
}