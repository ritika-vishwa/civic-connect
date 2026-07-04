import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomSelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[] | CustomSelectOption[];
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
        className={`input-glass px-4 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer flex justify-between items-center transition-colors border ${isOpen ? 'bg-black/60 border-primary-container/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]' : 'bg-black/20 hover:bg-black/40 border-white/10'}`}
      >
        <span className={value ? 'text-white font-bold' : 'text-white/50 font-medium'}>
          {value ? (
            typeof options[0] === 'object'
              ? (options as CustomSelectOption[]).find(o => o.value === value)?.label || value
              : value
          ) : placeholder}
        </span>
        <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-container' : 'text-white/50'}`}>
          expand_more
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-[calc(100%+8px)] left-0 w-full z-[100] origin-top"
          >
            <div className="relative overflow-hidden rounded-xl border border-primary-container/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] bg-[#031427]/95 backdrop-blur-3xl flex flex-col p-1.5">
              <div className="relative z-10 flex flex-col gap-1 max-h-64 overflow-y-auto custom-scrollbar">
                {options.map(opt => {
                  const isObj = typeof opt === 'object';
                  const optValue = isObj ? opt.value : opt;
                  const optLabel = isObj ? opt.label : opt;
                  
                  return (
                    <button
                      key={optValue}
                      onClick={(e) => { e.preventDefault(); onChange(optValue); setIsOpen(false); }}
                      className={`py-2.5 px-4 text-xs uppercase tracking-widest text-left rounded-lg transition-all flex items-center gap-2 border ${
                        value === optValue 
                          ? 'bg-primary-container/20 border-primary-container/50 text-primary-container shadow-[0_0_15px_rgba(0,240,255,0.2)] font-bold' 
                          : 'border-transparent text-white/70 hover:bg-white/5 hover:border-white/10 hover:text-white font-medium'
                      }`}
                    >
                      {value === optValue && <span className="material-symbols-outlined text-[14px]">check</span>}
                      {optLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
