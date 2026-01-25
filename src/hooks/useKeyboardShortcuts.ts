// src/hooks/useKeyboardShortcuts.ts
// Hook para atajos de teclado - Heurística #7: Flexibilidad y Eficiencia
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

/**
 * Hook para registrar atajos de teclado globales
 * Soporta:
 * - Ctrl/Cmd + K: Búsqueda
 * - Ctrl/Cmd + B: Carrito
 * - Ctrl/Cmd + H: Inicio
 * - Ctrl/Cmd + /: Ayuda (muestra lista de atajos)
 * - Tab: Navegación mejorada con teclado
 * - Esc: Cerrar modales
 */
export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { items } = useCarrito();

  // Acciones disponibles
  const actions = useCallback(() => ({
    goHome: () => navigate('/'),
    goCart: () => navigate('/carrito'),
    goFavorites: () => navigate('/favoritos'),
    goCatalog: () => navigate('/catalogo'),
    focusSearch: () => {
      const searchInput = document.querySelector<HTMLInputElement>('[data-shortcut="search"]');
      searchInput?.focus();
    },
    showHelp: () => {
      // Disparar evento personalizado para que App.tsx abra el modal
      window.dispatchEvent(new Event('show-keyboard-help'));
    },
    goCheckout: () => {
      if (items.length > 0) {
        navigate('/checkout');
      }
    },
    toggleFavorites: () => {
      const favBtn = document.querySelector('[data-shortcut="favorites"]') as HTMLElement;
      favBtn?.click();
    }
  }), [navigate, items.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const act = actions();
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const isModifier = isMac ? e.metaKey : e.ctrlKey;

      // Ignorar si está escribiendo en un input
      const target = e.target as HTMLElement;
      const isInputActive = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.contentEditable === 'true';

      // Ctrl/Cmd + K: Abrir búsqueda
      if (isModifier && e.key.toLowerCase() === 'k' && !isInputActive) {
        e.preventDefault();
        act.focusSearch();
        return;
      }

      // Ctrl/Cmd + B: Abrir carrito
      if (isModifier && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        act.goCart();
        return;
      }

      // Ctrl/Cmd + H: Ir a inicio
      if (isModifier && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        act.goHome();
        return;
      }

      // Ctrl/Cmd + /: Mostrar ayuda
      if (isModifier && e.key === '/') {
        e.preventDefault();
        act.showHelp();
        return;
      }

      // Ctrl/Cmd + Enter: Proceder al checkout
      if (isModifier && e.key === 'Enter' && items.length > 0) {
        e.preventDefault();
        act.goCheckout();
        return;
      }

      // Tab: Mejorar navegación por teclado
      if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
          'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
          const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as HTMLElement);
          const nextIndex = e.shiftKey 
            ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
            : (currentIndex + 1) % focusableElements.length;
          
          (focusableElements[nextIndex] as HTMLElement).focus();
          e.preventDefault();
        }
        return;
      }

      // Esc: Cerrar modales
      if (e.key === 'Escape') {
        const modal = document.querySelector('[role="dialog"][open], [role="alertdialog"][open]');
        if (modal && 'close' in modal) {
          (modal as any).close();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  // Retornar lista de atajos para mostrar en ayuda
  const getShortcutsList = (): KeyboardShortcut[] => {
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    const modifierKey = isMac ? 'Cmd' : 'Ctrl';

    return [
      {
        key: 'K',
        ctrl: true,
        action: () => {},
        description: `${modifierKey} + K: Abrir búsqueda`
      },
      {
        key: 'B',
        ctrl: true,
        action: () => {},
        description: `${modifierKey} + B: Abrir carrito`
      },
      {
        key: 'H',
        ctrl: true,
        action: () => {},
        description: `${modifierKey} + H: Ir al inicio`
      },
      {
        key: 'Enter',
        ctrl: true,
        action: () => {},
        description: `${modifierKey} + Enter: Ir al checkout`
      },
      {
        key: '/',
        ctrl: true,
        action: () => {},
        description: `${modifierKey} + /: Mostrar esta ayuda`
      },
      {
        key: 'Tab',
        action: () => {},
        description: 'Tab: Navegar por elementos con teclado'
      },
      {
        key: 'Escape',
        action: () => {},
        description: 'Esc: Cerrar diálogos'
      }
    ];
  };

  return { getShortcutsList };
};

export default useKeyboardShortcuts;
