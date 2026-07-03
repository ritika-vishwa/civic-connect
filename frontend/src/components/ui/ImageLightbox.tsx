import React from 'react';

interface ImageLightboxProps {
  imageSrc: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageSrc, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in cursor-zoom-out"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20"
      >
        <span className="material-symbols-outlined text-2xl">close</span>
      </button>
      
      <img 
        src={imageSrc} 
        alt="Fullscreen View" 
        className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_50px_rgba(0,240,255,0.15)] animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};
