// src/components/Common/KeyboardShortcutsHelp.tsx
// Componente de ayuda de atajos de teclado - Heurística #7 y #10
import React, { useState, useEffect } from 'react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import './KeyboardShortcutsHelp.css';

interface KeyboardShortcutsHelpProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen: controlledIsOpen,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(controlledIsOpen ?? false);
  const { getShortcutsList } = useKeyboardShortcuts();
  const shortcuts = getShortcutsList();

  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="keyboard-help-overlay" 
        onClick={handleClose}
        role="presentation"
      />

      {/* Modal */}
      <dialog className="keyboard-help-modal" open>
        <div className="keyboard-help-content">
          {/* Header */}
          <div className="keyboard-help-header">
            <h2>
              <i className="fas fa-keyboard"></i> Atajos de Teclado
            </h2>
            <button 
              className="keyboard-help-close"
              onClick={handleClose}
              aria-label="Cerrar"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Info */}
          <div className="keyboard-help-info">
            <p>
              <i className="fas fa-lightbulb"></i>
              Usa estos atajos para navegar más rápido
            </p>
          </div>

          {/* Shortcuts Grid */}
          <div className="keyboard-help-grid">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="keyboard-help-item">
                <div className="keyboard-help-keys">
                  {shortcut.ctrl && (
                    <>
                      <kbd className="key-modifier">
                        {/Mac|iPhone|iPad|iPod/.test(navigator.platform) ? '⌘' : 'Ctrl'}
                      </kbd>
                      <span className="key-plus">+</span>
                    </>
                  )}
                  {shortcut.shift && (
                    <>
                      <kbd className="key-modifier">⇧</kbd>
                      <span className="key-plus">+</span>
                    </>
                  )}
                  {shortcut.alt && (
                    <>
                      <kbd className="key-modifier">Alt</kbd>
                      <span className="key-plus">+</span>
                    </>
                  )}
                  <kbd className="key-main">{shortcut.key}</kbd>
                </div>
                <div className="keyboard-help-description">
                  {shortcut.description}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="keyboard-help-footer">
            <p>
              <i className="fas fa-info-circle"></i>
              Presiona <kbd>Esc</kbd> para cerrar esta ventana
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default KeyboardShortcutsHelp;
