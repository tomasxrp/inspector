import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for transition
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message && !isVisible) return null;

  const bgColor = type === 'success'
    ? 'bg-green-900/90 border-green-500/50 text-green-100'
    : 'bg-red-900/90 border-red-500/50 text-red-100';
  const icon = type === 'success' ? '✓' : '✗';

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-4 z-[100] transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
    >
      <div className={`flex items-center gap-3 px-4 py-3 border rounded shadow-2xl backdrop-blur-md font-mono text-sm min-w-[280px] ${bgColor}`}>
        <span className="text-lg font-bold">{icon}</span>
        <p className="flex-1">{message}</p>
        <button
          onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
          className="hover:opacity-70 transition-opacity p-1"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
