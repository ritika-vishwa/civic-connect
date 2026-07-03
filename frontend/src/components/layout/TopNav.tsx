import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

export const TopNav: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="glass-panel fixed top-0 w-full z-50 border-b border-outline-variant/30 transition-all duration-300">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 max-w-container-max mx-auto">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-4">
          <span className="font-display-lg text-headline-lg-mobile md:text-title-md tracking-widest uppercase text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            CivicConnect
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-10 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              isActive 
                ? "text-white border-b-2 border-primary-container pb-1 transition-all drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
                : "hover:text-primary-container transition-colors"
            }
            end
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/map" 
            className={({ isActive }) => 
              isActive 
                ? "text-white border-b-2 border-primary-container pb-1 transition-all drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
                : "hover:text-primary-container transition-colors"
            }
          >
            Map
          </NavLink>
          <NavLink 
            to="/community" 
            className={({ isActive }) => 
              isActive 
                ? "text-white border-b-2 border-primary-container pb-1 transition-all drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
                : "hover:text-primary-container transition-colors"
            }
          >
            Community
          </NavLink>
          <NavLink 
            to="/profile" 
            className={({ isActive }) => 
              isActive 
                ? "text-white border-b-2 border-primary-container pb-1 transition-all drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
                : "hover:text-primary-container transition-colors"
            }
          >
            Profile
          </NavLink>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/notifications')}
            className="text-white hover:text-primary-container transition-colors p-2 rounded-full hover:bg-primary-container/10 relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {/* Notification badge indicator */}
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border border-[#031427] animate-pulse"></span>
          </button>
          
          <button 
            onClick={() => navigate('/profile')}
            className="text-white hover:text-primary-container transition-colors p-2 rounded-full hover:bg-primary-container/10"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </div>
    </header>
  );
};
