import React, { useState, useRef, useEffect } from 'react';

interface CustomSelectProps {
  value: string;
  onChange: (val: any) => void;
  options: string[];
  placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="input-glass px-4 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer flex justify-between items-center bg-black/20 hover:bg-black/40 transition-colors border border-white/10"
      >
        <span className={value ? 'text-white font-bold' : 'text-white/40'}>
          {value || placeholder}
        </span>
        <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-container' : 'text-white/50'}`}>
          expand_more
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full z-[100] animate-fade-in-up">
          <div className="relative overflow-hidden rounded-xl border border-primary-container/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] bg-[#031427] flex flex-col p-1.5">
            {/* Immersive Background Orbs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 blur-[40px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar">
              {options.map(opt => (
                <button
                  key={opt}
                  onClick={(e) => { e.preventDefault(); onChange(opt); setIsOpen(false); }}
                  className={`py-3 px-4 text-xs font-bold uppercase tracking-widest text-left rounded-lg transition-all border ${
                    value === opt 
                      ? 'bg-primary-container/20 border-primary-container/50 text-primary-container shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                      : 'border-transparent text-white/70 hover:bg-white/5 hover:border-white/10 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
