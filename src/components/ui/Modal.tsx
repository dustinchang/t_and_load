import { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  center?: boolean;
  showHandle?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  center = false,
  showHandle = true,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`modal-backdrop${center ? ' modal-backdrop--center' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className={`modal-sheet${center ? ' modal-sheet--center' : ''}`}>
        {showHandle && !center && <div className="modal-handle" />}

        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button className="modal-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
