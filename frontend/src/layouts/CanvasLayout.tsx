import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { BackgroundShader } from '../components/layout/BackgroundShader';
import { useAuth } from '../context/AuthContext';

export const CanvasLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBackClick = () => {
    navigate(user ? '/dashboard' : '/');
  };

  return (
    <div className="flex flex-col min-h-screen relative antialiased items-center">
      {/* Background Shader */}
      <BackgroundShader />

      {/* Top Nav (Transactional) */}
      <nav className="w-full relative z-10 px-margin-mobile md:px-margin-desktop py-6 flex items-center justify-between max-w-container-max">
        <button 
          onClick={handleBackClick}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none cursor-pointer"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
          <span className="font-body-lg text-body-lg hidden sm:inline">
            {user ? 'Back to Dashboard' : 'Back to Home'}
          </span>
          <span className="font-body-lg text-body-lg sm:hidden">
            Back
          </span>
        </button>
        <span className="font-display-lg text-title-md-mobile sm:text-title-md tracking-widest uppercase text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
          CivicConnect
        </span>
      </nav>

      {/* Centered Content Area */}
      <main className="relative z-10 w-full max-w-[800px] px-margin-mobile md:px-margin-desktop pb-24 flex-grow flex flex-col justify-center">
        <Outlet />
      </main>
    </div>
  );
};
export default CanvasLayout;
