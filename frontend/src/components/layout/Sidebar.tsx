import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex flex-col glass-panel fixed left-0 top-20 h-[calc(100vh-80px)] w-64 p-6 gap-4 z-40 ease-in-out duration-200 border-r border-outline-variant/30 rounded-tr-3xl">
      {/* Header Info */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-container/20 to-secondary-container/20 flex items-center justify-center border border-primary-container/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <span className="material-symbols-outlined text-primary-container text-2xl drop-shadow-[0_0_8px_#00f0ff]">apartment</span>
        </div>
        <div>
          <h2 className="text-white font-bold font-title-md text-sm leading-tight uppercase tracking-wider">Civic Workspace</h2>
          <p className="text-primary-container text-xs font-mono uppercase tracking-widest opacity-80 mt-1">City Hall</p>
        </div>
      </div>

      {/* CTA */}
      <button 
        onClick={() => navigate('/report')}
        className="primary-btn rounded-xl py-3 px-4 font-label-caps text-label-caps flex items-center justify-center gap-2 mb-6"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        New Report
      </button>

      {/* Main Tabs */}
      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            `px-4 py-3 flex items-center gap-3 font-label-caps text-label-caps uppercase tracking-widest rounded-xl border transition-all ${
              isActive 
                ? "bg-primary-container/10 text-primary-container border-primary-container/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] font-bold" 
                : "text-white/70 hover:text-white hover:bg-white/5 border-transparent"
            }`
          }
        >
          <span className="material-symbols-outlined">dashboard</span>
          Dashboard
        </NavLink>

        <NavLink 
          to="/map" 
          className={({ isActive }) => 
            `px-4 py-3 flex items-center gap-3 font-label-caps text-label-caps uppercase tracking-widest rounded-xl border transition-all ${
              isActive 
                ? "bg-primary-container/10 text-primary-container border-primary-container/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] font-bold" 
                : "text-white/70 hover:text-white hover:bg-white/5 border-transparent"
            }`
          }
        >
          <span className="material-symbols-outlined">map</span>
          Live Map
        </NavLink>

        <NavLink 
          to="/analytics" 
          className={({ isActive }) => 
            `px-4 py-3 flex items-center gap-3 font-label-caps text-label-caps uppercase tracking-widest rounded-xl border transition-all ${
              isActive 
                ? "bg-primary-container/10 text-primary-container border-primary-container/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] font-bold" 
                : "text-white/70 hover:text-white hover:bg-white/5 border-transparent"
            }`
          }
        >
          <span className="material-symbols-outlined">analytics</span>
          Analytics
        </NavLink>

        <NavLink 
          to="/my-complaints" 
          className={({ isActive }) => 
            `px-4 py-3 flex items-center gap-3 font-label-caps text-label-caps uppercase tracking-widest rounded-xl border transition-all ${
              isActive 
                ? "bg-primary-container/10 text-primary-container border-primary-container/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] font-bold" 
                : "text-white/70 hover:text-white hover:bg-white/5 border-transparent"
            }`
          }
        >
          <span className="material-symbols-outlined">description</span>
          My Reports
        </NavLink>

        <NavLink 
          to="/events" 
          className={({ isActive }) => 
            `px-4 py-3 flex items-center gap-3 font-label-caps text-label-caps uppercase tracking-widest rounded-xl border transition-all ${
              isActive 
                ? "bg-primary-container/10 text-primary-container border-primary-container/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] font-bold" 
                : "text-white/70 hover:text-white hover:bg-white/5 border-transparent"
            }`
          }
        >
          <span className="material-symbols-outlined">event</span>
          Events
        </NavLink>

        <div className="border-t border-primary-container/10 my-2 pt-2">
          <p className="text-[10px] text-primary-container/50 font-mono tracking-wider uppercase mb-1 px-4">Workspace portals</p>
        </div>

        <NavLink 
          to="/officer" 
          className={({ isActive }) => 
            `px-4 py-3 flex items-center gap-3 font-label-caps text-label-caps uppercase tracking-widest rounded-xl border transition-all ${
              isActive 
                ? "bg-primary-container/10 text-primary-container border-primary-container/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] font-bold" 
                : "text-white/70 hover:text-white hover:bg-white/5 border-transparent"
            }`
          }
        >
          <span className="material-symbols-outlined">assignment_ind</span>
          Officer
        </NavLink>

        <NavLink 
          to="/admin" 
          className={({ isActive }) => 
            `px-4 py-3 flex items-center gap-3 font-label-caps text-label-caps uppercase tracking-widest rounded-xl border transition-all ${
              isActive 
                ? "bg-primary-container/10 text-primary-container border-primary-container/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] font-bold" 
                : "text-white/70 hover:text-white hover:bg-white/5 border-transparent"
            }`
          }
        >
          <span className="material-symbols-outlined">admin_panel_settings</span>
          Admin
        </NavLink>
      </nav>

      {/* Footer Tabs */}
      <div className="mt-auto border-t border-primary-container/20 pt-4 flex flex-col gap-2">
        <NavLink 
          to="/settings" 
          className={({ isActive }) => 
            `px-4 py-3 flex items-center gap-3 font-label-caps text-label-caps uppercase tracking-widest rounded-xl border transition-all ${
              isActive 
                ? "bg-primary-container/10 text-primary-container border-primary-container/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] font-bold" 
                : "text-white/70 hover:text-white hover:bg-white/5 border-transparent"
            }`
          }
        >
          <span className="material-symbols-outlined">settings</span>
          Settings
        </NavLink>
        <a 
          href="#support" 
          onClick={(e) => { e.preventDefault(); alert("CivicConnect Support Portal. Reach us at support@civicconnect.gov"); }}
          className="text-white/70 hover:text-white hover:bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3 font-label-caps text-label-caps uppercase tracking-widest transition-all"
        >
          <span className="material-symbols-outlined">help</span>
          Support
        </a>
      </div>
    </aside>
  );
};
