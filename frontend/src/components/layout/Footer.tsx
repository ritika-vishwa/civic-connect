import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-10 mt-auto bg-[#00060d]/90 backdrop-blur-xl border-t border-primary-container/20">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop gap-6 max-w-container-max mx-auto w-full">
        <div className="font-display-lg text-xl text-white font-black uppercase tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
          CivicConnect
        </div>
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 font-label-caps text-xs uppercase tracking-widest text-white/70">
          <a className="hover:text-primary-container transition-colors drop-shadow-[0_0_5px_rgba(0,240,255,0)] hover:drop-shadow-[0_0_8px_#00f0ff]" href="#privacy">Privacy Policy</a>
          <a className="hover:text-primary-container transition-colors drop-shadow-[0_0_5px_rgba(0,240,255,0)] hover:drop-shadow-[0_0_8px_#00f0ff]" href="#terms">Terms of Service</a>
          <a className="hover:text-primary-container transition-colors drop-shadow-[0_0_5px_rgba(0,240,255,0)] hover:drop-shadow-[0_0_8px_#00f0ff]" href="#accessibility">Accessibility</a>
          <a className="hover:text-primary-container transition-colors drop-shadow-[0_0_5px_rgba(0,240,255,0)] hover:drop-shadow-[0_0_8px_#00f0ff]" href="#contact">Contact</a>
        </div>
        <div className="font-mono text-white/40 text-center md:text-right text-[10px] uppercase tracking-widest">
          © 2024 CivicConnect. An authorized GovTech partner.
        </div>
      </div>
    </footer>
  );
};
