import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — full width en móvil, modal centrado en desktop */}
      <div className="relative bg-zinc-900 border-t md:border border-zinc-700 w-full md:max-w-lg shadow-2xl md:rounded-none rounded-t-2xl max-h-[90vh] overflow-y-auto">
        {/* Drag handle en móvil */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-zinc-700 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-700">
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-amber-400">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors text-2xl leading-none w-9 h-9 flex items-center justify-center"
          >
            &times;
          </button>
        </div>
        <div className="p-5 pb-safe">{children}</div>
      </div>
    </div>
  );
}