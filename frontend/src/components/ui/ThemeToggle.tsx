import React, { useState, useEffect } from 'react';

export const ThemeToggle: React.FC = () => {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains('light'));
  }, []);

  const toggleTheme = () => {
    if (isLight) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
      setIsLight(false);
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
      setIsLight(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-[72px] right-6 z-[60] flex items-center justify-center w-10 h-10 rounded-full glass-card border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors group shadow-lg cursor-pointer bg-[#00060d]/80 backdrop-blur-md"
      aria-label="Toggle Theme"
    >
      <span className="material-symbols-outlined text-[20px]">
        {isLight ? 'dark_mode' : 'light_mode'}
      </span>
      
      {/* Hover Tooltip */}
      <div className="absolute right-14 bg-[#00060d] border border-white/20 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-2 whitespace-nowrap shadow-xl">
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/70">
          Switch to {isLight ? 'Dark' : 'Light'} Mode
        </span>
      </div>
    </button>
  );
};
