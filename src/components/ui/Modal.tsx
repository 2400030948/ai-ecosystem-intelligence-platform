import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  id?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-lg',
  id
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div id={id} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        <div
          className={`w-full ${maxWidth} transform overflow-hidden rounded-xl bg-slate-900 border border-slate-800 p-6 text-left align-middle shadow-2xl transition-all relative z-10`}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
              {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-2 text-sm text-slate-300">{children}</div>

          {footer && <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">{footer}</div>}
        </div>
      </div>
    </div>
  );
};
