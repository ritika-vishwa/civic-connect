import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canReportIssue } from '../../context/permissions';
import { motion, AnimatePresence } from 'framer-motion';

export const TopNav: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeLinkClass = 'text-white border-b-2 border-primary-container pb-1 transition-all drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]';
  const inactiveLinkClass = 'hover:text-primary-container transition-colors';

  return (
    <header className="glass-panel fixed top-0 w-full z-50 border-b border-outline-variant/30 transition-all duration-300">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 max-w-container-max mx-auto">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-4">
          <span className="font-display-lg text-headline-lg-mobile md:text-title-md tracking-widest uppercase text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            CivicConnect
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-10 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {user && (
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass} end>
              Dashboard
            </NavLink>
          )}
          <NavLink to="/map" className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass}>
            Map
          </NavLink>
          <NavLink to="/community" className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass}>
            Community
          </NavLink>
          {user && (
            <NavLink to="/profile" className={({ isActive }) => isActive ? activeLinkClass : inactiveLinkClass}>
              Profile
            </NavLink>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse"></div>
          ) : user ? (
            <>
              {/* Report CTA for authorized users */}
              {canReportIssue(user) && (
                <button
                  onClick={() => navigate('/report')}
                  className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black bg-primary-container hover:brightness-110 transition-all px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Report
                </button>
              )}

              {/* Notifications */}
              <button
                onClick={() => navigate('/notifications')}
                className="text-white hover:text-primary-container transition-colors p-2 rounded-full hover:bg-primary-container/10 relative"
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border border-[#031427] animate-pulse"></span>
              </button>

              {/* Avatar */}
              <button
                onClick={() => navigate('/profile')}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-container/40 hover:border-primary-container transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)] shrink-0"
                title={user.name}
              >
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="font-label-caps text-xs tracking-widest uppercase text-white bg-primary-container/10 hover:bg-primary-container/20 border border-primary-container/30 px-4 py-2 rounded-xl transition-all shadow-[0_0_10px_rgba(0,240,255,0.1)]"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-white hover:text-primary-container transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden overflow-hidden border-t border-white/10 bg-[#031427]/95 backdrop-blur-xl"
          >
            <nav className="flex flex-col gap-1 p-4">
              {user && (
                <button onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}
                  className="text-left px-4 py-3 text-sm font-bold uppercase tracking-widest text-white/80 hover:text-primary-container hover:bg-white/5 rounded-xl transition-all">
                  Dashboard
                </button>
              )}
              <button onClick={() => { navigate('/map'); setMobileOpen(false); }}
                className="text-left px-4 py-3 text-sm font-bold uppercase tracking-widest text-white/80 hover:text-primary-container hover:bg-white/5 rounded-xl transition-all">
                Live Map
              </button>
              <button onClick={() => { navigate('/community'); setMobileOpen(false); }}
                className="text-left px-4 py-3 text-sm font-bold uppercase tracking-widest text-white/80 hover:text-primary-container hover:bg-white/5 rounded-xl transition-all">
                Community
              </button>
              {user && canReportIssue(user) && (
                <button onClick={() => { navigate('/report'); setMobileOpen(false); }}
                  className="mt-2 text-center px-4 py-3 text-sm font-bold uppercase tracking-widest bg-primary-container text-black rounded-xl">
                  + New Report
                </button>
              )}
              {!user && (
                <button onClick={() => { navigate('/login'); setMobileOpen(false); }}
                  className="mt-2 text-center px-4 py-3 text-sm font-bold uppercase tracking-widest border border-primary-container/40 text-primary-container rounded-xl">
                  Sign In
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
