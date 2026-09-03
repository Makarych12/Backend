import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Полноэкранное модальное окно, рендерящееся через портал в document.body.
 * Гарантирует position: fixed относительно viewport (не зависит от
 * transform/filter на родителях), блокирует скролл страницы, закрывается
 * по Escape и клику на затемнённый фон.
 */
export default function Modal({ onClose, children, panelClassName = '', panelStyle = {} }) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className={panelClassName} style={panelStyle} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
}
