import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from './GlassCard';

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
}

export const CustomDatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
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

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handleDateSelect = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Adjust for timezone offset to avoid JS date shifting issues
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 10);
    onChange(localISOTime);
    setIsOpen(false);
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  return (
    <div className="relative w-full" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="input-glass px-4 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer flex justify-between items-center bg-black/20 hover:bg-black/40 transition-colors border border-white/10"
      >
        <span className={value ? 'text-white' : 'text-white/40 font-mono'}>
          {value ? new Date(value).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'DD-MMM-YYYY'}
        </span>
        <span className="material-symbols-outlined text-[16px] text-primary-container">calendar_today</span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 z-[100] animate-fade-in-up">
          <div className="relative overflow-hidden rounded-2xl border border-primary-container/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] bg-[#031427]">
            {/* Immersive Background Orbs */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary-container/10 blur-[50px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary-container/10 blur-[50px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 p-5">
              <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-3">
                <button onClick={(e) => { e.preventDefault(); prevMonth(); }} className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 transition-colors border border-transparent hover:border-white/10">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-primary-container drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={(e) => { e.preventDefault(); nextMonth(); }} className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 transition-colors border border-transparent hover:border-white/10">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{d}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {blanks.map(b => <div key={`blank-${b}`} className="p-2" />)}
                {days.map(d => {
                  const isSelected = value && new Date(value).getDate() === d && new Date(value).getMonth() === currentMonth.getMonth() && new Date(value).getFullYear() === currentMonth.getFullYear();
                  return (
                    <button
                      key={d}
                      onClick={(e) => { e.preventDefault(); handleDateSelect(d); }}
                      className={`aspect-square flex items-center justify-center text-[11px] font-mono rounded-xl transition-all border ${
                        isSelected 
                          ? 'bg-primary-container/20 border-primary-container/50 text-primary-container font-black shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                          : 'border-transparent text-white/80 hover:bg-white/5 hover:border-white/10 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TimePickerProps {
  value: string;
  onChange: (val: string) => void;
}

export const CustomTimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
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

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const currentHour = value ? value.split(':')[0] : '12';
  const currentMinute = value ? value.split(':')[1] : '00';

  const formatTime = (t: string) => {
    if (!t) return '--:--';
    const [h, m] = t.split(':');
    let hrs = parseInt(h);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12;
    hrs = hrs ? hrs : 12; 
    return `${hrs}:${m} ${ampm}`;
  };

  return (
    <div className="relative w-full" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="input-glass px-4 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer flex justify-between items-center bg-black/20 hover:bg-black/40 transition-colors border border-white/10"
      >
        <span className={value ? 'text-white' : 'text-white/40 font-mono'}>
          {value ? formatTime(value) : '--:--'}
        </span>
        <span className="material-symbols-outlined text-[16px] text-primary-container">schedule</span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] z-[100] animate-fade-in-up">
          <div className="relative overflow-hidden rounded-2xl border border-primary-container/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] bg-[#031427] flex flex-col">
            {/* Immersive Background Orbs */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-container/10 blur-[60px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-container/10 blur-[50px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex divide-x divide-white/10 h-64">
              {/* Hours Column */}
              <div className="flex-1 flex flex-col">
                <div className="text-[10px] text-center font-bold text-white/50 uppercase tracking-[0.2em] sticky top-0 bg-[#031427]/80 backdrop-blur-md z-10 py-3 border-b border-white/5">Hour</div>
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent py-2 px-2 flex flex-col gap-1.5 custom-scrollbar">
                  {hours.map(h => {
                    let displayHour = parseInt(h);
                    const ampm = displayHour >= 12 ? 'PM' : 'AM';
                    displayHour = displayHour % 12;
                    displayHour = displayHour ? displayHour : 12;

                    return (
                      <button
                        key={`h-${h}`}
                        onClick={(e) => { e.preventDefault(); onChange(`${h}:${currentMinute}`); }}
                        className={`py-3 px-2 text-xs font-mono rounded-xl transition-all border ${
                          currentHour === h 
                            ? 'bg-primary-container/20 border-primary-container/50 text-primary-container font-black shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                            : 'border-transparent text-white/70 hover:bg-white/5 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        {displayHour} <span className="text-[9px] opacity-70 ml-0.5">{ampm}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minutes Column */}
              <div className="flex-1 flex flex-col">
                <div className="text-[10px] text-center font-bold text-white/50 uppercase tracking-[0.2em] sticky top-0 bg-[#031427]/80 backdrop-blur-md z-10 py-3 border-b border-white/5">Min</div>
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent py-2 px-2 flex flex-col gap-1.5 custom-scrollbar">
                  {minutes.map(m => (
                    <button
                      key={`m-${m}`}
                      onClick={(e) => { e.preventDefault(); onChange(`${currentHour}:${m}`); }}
                      className={`py-3 px-2 text-xs font-mono rounded-xl transition-all border ${
                        currentMinute === m 
                          ? 'bg-primary-container/20 border-primary-container/50 text-primary-container font-black shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                          : 'border-transparent text-white/70 hover:bg-white/5 hover:border-white/10 hover:text-white'
                      }`}
                    >
                      :{m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="relative z-10 p-3 border-t border-white/10 bg-[#031427]/90 backdrop-blur-md flex justify-end">
               <button 
                  onClick={(e) => { e.preventDefault(); setIsOpen(false); }}
                  className="btn-gradient-cyan py-2 px-6 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,240,255,0.2)]"
               >
                 Done
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
