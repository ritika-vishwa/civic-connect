import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canReportIssue } from '../../context/permissions';
import { motion, AnimatePresence } from 'framer-motion';
import {
  canAccessOfficerWorkspace,
  canAccessAdmin,
  canViewAnalytics,
} from '../../context/permissions';

export const TopNav: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const showOfficerPortal = canAccessOfficerWorkspace(user);
  const showAdminPortal = canAccessAdmin(user);
  const showAnalytics = canViewAnalytics(user);

  const activeLinkClass = 'text-white border-b-2 border-primary-container pb-1 transition-all drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]';
  const inactiveLinkClass = 'hover:text-primary-container transition-colors';

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="glass-panel fixed top-0 w-full z-50 border-b border-outline-variant/30 transition-all duration-300">
      <div className="flex justify-between items-center px-4 sm:px-margin-mobile md:px-margin-desktop h-16 md:h-20 max-w-container-max mx-auto">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 sm:gap-4" onClick={closeMobile}>
          <span className="font-display-lg text-base sm:text-headline-lg-mobile md:text-title-md tracking-widest uppercase text-white font-black drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
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
        <div className="flex items-center gap-2 sm:gap-3">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
          ) : user ? (
            <>
              {/* Report CTA for authorized users — hidden on mobile (use bottom tab instead) */}
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
                className="text-white hover:text-primary-container transition-colors p-2 rounded-full hover:bg-primary-container/10 relative min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border border-[#031427] animate-pulse"></span>
              </button>

              {/* Avatar — hidden on mobile (use bottom tab bar profile) */}
              <button
                onClick={() => navigate('/profile')}
                className="hidden sm:flex w-9 h-9 rounded-full overflow-hidden border-2 border-primary-container/40 hover:border-primary-container transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)] shrink-0 min-w-[44px] min-h-[44px] items-center justify-center"
                title={user.name}
              >
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="font-label-caps text-xs tracking-widest uppercase text-white bg-primary-container/10 hover:bg-primary-container/20 border border-primary-container/30 px-4 py-2.5 rounded-xl transition-all shadow-[0_0_10px_rgba(0,240,255,0.1)] min-h-[44px]"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle — only shown on mobile */}
          <button
            className="md:hidden p-2 text-white hover:text-primary-container transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Full-screen Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden overflow-y-auto border-t border-white/10"
            style={{
              background: 'rgba(3, 20, 39, 0.99)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              maxHeight: 'calc(100dvh - 64px)',
            }}
          >
            <nav className="flex flex-col gap-1 p-4 pb-8">
              {/* User info strip */}
              {user && (
                <div className="flex items-center gap-3 p-4 mb-2 bg-white/5 rounded-xl border border-white/10">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-primary-container/40" />
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-wider">{user.name}</p>
                    <p className="text-xs font-mono text-primary-container">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              {[
                user && { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
                { to: '/map', icon: 'map', label: 'Live Map' },
                showAnalytics && { to: '/analytics', icon: 'analytics', label: 'Analytics' },
                user && ['citizen', 'moderator', 'admin'].includes(user?.role ?? '') && { to: '/my-complaints', icon: 'description', label: 'My Reports' },
                { to: '/community', icon: 'groups', label: 'Community' },
                { to: '/events', icon: 'event', label: 'Events' },
                showOfficerPortal && { to: '/officer', icon: 'assignment_ind', label: 'Officer Workspace' },
                showAdminPortal && { to: '/admin', icon: 'admin_panel_settings', label: 'Admin Panel' },
                user && { to: '/notifications', icon: 'notifications', label: 'Notifications' },
                user && { to: '/settings', icon: 'settings', label: 'Settings' },
                user && { to: '/profile', icon: 'account_circle', label: 'My Profile' },
              ].filter(Boolean).map((item: any) => (
                <button
                  key={item.to}
                  onClick={() => { navigate(item.to); closeMobile(); }}
                  className="w-full text-left px-4 py-3.5 text-sm font-bold uppercase tracking-widest text-white/80 hover:text-primary-container hover:bg-white/5 rounded-xl transition-all flex items-center gap-3 min-h-[52px]"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary-container/70">{item.icon}</span>
                  {item.label}
                </button>
              ))}

              {/* Divider */}
              <div className="border-t border-white/10 my-2" />

              {/* CTA */}
              {user && canReportIssue(user) && (
                <button
                  onClick={() => { navigate('/report'); closeMobile(); }}
                  className="w-full text-center px-4 py-4 text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-primary-container to-[#0088ff] text-black rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)] min-h-[52px]"
                >
                  + New Report
                </button>
              )}
              {!user && (
                <button
                  onClick={() => { navigate('/login'); closeMobile(); }}
                  className="w-full text-center px-4 py-4 text-sm font-bold uppercase tracking-widest border border-primary-container/40 text-primary-container rounded-xl min-h-[52px]"
                >
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
