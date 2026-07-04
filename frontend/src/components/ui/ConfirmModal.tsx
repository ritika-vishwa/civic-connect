import React from 'react';
import { GlassCard } from './GlassCard';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
      <GlassCard noHover className="w-full max-w-md bg-[#031427] border-white/20 shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <span className={`material-symbols-outlined text-3xl ${isDestructive ? 'text-error drop-shadow-[0_0_8px_#ffb4ab]' : 'text-primary-container drop-shadow-[0_0_8px_#00f0ff]'}`}>
            {isDestructive ? 'warning' : 'info'}
          </span>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">{title}</h2>
        </div>
        <p className="text-white/80 font-mono text-sm leading-relaxed my-2">
          {message}
        </p>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors ${
              isDestructive 
                ? 'bg-error/20 border-error/50 text-error hover:bg-error hover:text-white shadow-[0_0_15px_rgba(255,180,171,0.2)]' 
                : 'bg-primary-container/20 border-primary-container/50 text-primary-container hover:bg-primary-container hover:text-black shadow-[0_0_15px_rgba(0,240,255,0.2)]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
