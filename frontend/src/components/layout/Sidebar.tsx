import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  canReportIssue,
  canAccessOfficerWorkspace,
  canAccessAdmin,
  canViewAnalytics,
  canModerateContent,
  ROLE_ICON,
  ROLE_COLOR,
  ROLE_LABELS,
} from '../../context/permissions';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-3 flex items-center gap-3 font-label-caps text-label-caps uppercase tracking-widest rounded-xl border transition-all ${
    isActive
      ? 'bg-primary-container/10 text-primary-container border-primary-container/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] font-bold'
      : 'text-white/70 hover:text-white hover:bg-white/5 border-transparent'
  }`;

// Mobile bottom tab item type
interface MobileTab {
  to: string;
  icon: string;
  label: string;
  exact?: boolean;
}

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const showOfficerPortal = canAccessOfficerWorkspace(user);
  const showAdminPortal = canAccessAdmin(user);
  const showModeratorTools = canModerateContent(user);
  const showAnalytics = canViewAnalytics(user);
  const showWorkspaceSection = showOfficerPortal || showAdminPortal || showModeratorTools;

  // Determine mobile bottom tabs based on role
  const mobileTabs: MobileTab[] = [
    { to: '/dashboard', icon: 'dashboard', label: 'Home', exact: true },
    { to: '/map', icon: 'map', label: 'Map' },
    ...(canReportIssue(user) ? [{ to: '/report', icon: 'add_circle', label: 'Report' }] : []),
    ...(showOfficerPortal ? [{ to: '/officer', icon: 'assignment_ind', label: 'Officer' }] : []),
    ...(showAdminPortal ? [{ to: '/admin', icon: 'admin_panel_settings', label: 'Admin' }] : []),
    { to: '/community', icon: 'groups', label: 'Community' },
    { to: '/profile', icon: 'account_circle', label: 'Profile' },
  ];

  // Limit to 5 tabs for mobile display
  const displayTabs = mobileTabs.slice(0, 5);

  const isMobileTabActive = (tab: MobileTab) => {
    if (tab.exact) return location.pathname === tab.to;
    return location.pathname.startsWith(tab.to);
  };

  return (
    <>
      {/* ── Desktop Sidebar (unchanged) ── */}
      <aside className="hidden md:flex flex-col glass-panel fixed left-0 top-20 h-[calc(100vh-80px)] w-64 p-6 gap-4 z-40 ease-in-out duration-200 border-r border-outline-variant/30 rounded-tr-3xl">
        {/* Header Info */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-container/20 to-secondary-container/20 flex items-center justify-center border border-primary-container/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <span className="material-symbols-outlined text-primary-container text-2xl drop-shadow-[0_0_8px_#00f0ff]">apartment</span>
          </div>
          <div>
            <h2 className="text-white font-bold font-title-md text-sm leading-tight uppercase tracking-wider">Civic Workspace</h2>
            {user && (
              <span className={`inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border mt-1 ${ROLE_COLOR[user.role]}`}>
                <span className="material-symbols-outlined text-[11px]">{ROLE_ICON[user.role]}</span>
                {ROLE_LABELS[user.role]}
              </span>
            )}
          </div>
        </div>

        {/* CTA - Only for users who can report */}
        {canReportIssue(user) && (
          <button
            onClick={() => navigate('/report')}
            className="primary-btn rounded-xl py-3 px-4 font-label-caps text-label-caps flex items-center justify-center gap-2 mb-6"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Report
          </button>
        )}

        {/* Main Tabs */}
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1">
          <NavLink to="/dashboard" className={navLinkClass}>
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </NavLink>

          <NavLink to="/map" className={navLinkClass}>
            <span className="material-symbols-outlined">map</span>
            Live Map
          </NavLink>

          {showAnalytics && (
            <NavLink to="/analytics" className={navLinkClass}>
              <span className="material-symbols-outlined">analytics</span>
              Analytics
            </NavLink>
          )}

          {/* Citizens & moderators see My Reports */}
          {user && ['citizen', 'moderator', 'admin'].includes(user.role) && (
            <NavLink to="/my-complaints" className={navLinkClass}>
              <span className="material-symbols-outlined">description</span>
              My Reports
            </NavLink>
          )}

          <NavLink to="/community" className={navLinkClass}>
            <span className="material-symbols-outlined">groups</span>
            Community
          </NavLink>

          <NavLink to="/events" className={navLinkClass}>
            <span className="material-symbols-outlined">event</span>
            Events
          </NavLink>

          {/* Workspace Portals Section */}
          {showWorkspaceSection && (
            <>
              <div className="border-t border-primary-container/10 my-2 pt-2">
                <p className="text-[10px] text-primary-container/50 font-mono tracking-wider uppercase mb-1 px-4">Workspace portals</p>
              </div>

              {showOfficerPortal && (
                <NavLink to="/officer" className={navLinkClass}>
                  <span className="material-symbols-outlined">assignment_ind</span>
                  Officer
                </NavLink>
              )}

              {showModeratorTools && !showOfficerPortal && (
                <NavLink to="/community" className={navLinkClass}>
                  <span className="material-symbols-outlined">shield_person</span>
                  Moderation
                </NavLink>
              )}

              {showAdminPortal && (
                <NavLink to="/admin" className={navLinkClass}>
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                  Admin
                </NavLink>
              )}
            </>
          )}
        </nav>

        {/* Footer Tabs */}
        <div className="mt-auto border-t border-primary-container/20 pt-4 flex flex-col gap-2">
          <NavLink to="/settings" className={navLinkClass}>
            <span className="material-symbols-outlined">settings</span>
            Settings
          </NavLink>
          <a
            href="#support"
            onClick={(e) => { 
              e.preventDefault(); 
              window.dispatchEvent(new Event('open-support-modal'));
            }}
            className="text-white/70 hover:text-white hover:bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3 font-label-caps text-label-caps uppercase tracking-widest transition-all"
          >
            <span className="material-symbols-outlined">help</span>
            Support
          </a>
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
        style={{
          background: 'rgba(3, 20, 39, 0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0, 240, 255, 0.15)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {displayTabs.map((tab) => {
          const active = isMobileTabActive(tab);
          const isReport = tab.icon === 'add_circle';
          return (
            <button
              key={tab.to}
              onClick={() => navigate(tab.to)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all min-h-[60px] relative ${
                active ? 'text-primary-container' : 'text-white/50'
              }`}
              aria-label={tab.label}
            >
              {isReport ? (
                // Special "Report" button — elevated center FAB style
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-container to-[#0088ff] flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.5)] -mt-5 mb-0.5">
                  <span
                    className="material-symbols-outlined text-[#00060d] text-[26px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    add
                  </span>
                </div>
              ) : (
                <span
                  className={`material-symbols-outlined text-[24px] transition-all ${active ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]' : ''}`}
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {tab.icon}
                </span>
              )}
              <span className={`text-[9px] font-bold uppercase tracking-wider leading-none ${isReport ? 'text-primary-container' : ''}`}>
                {tab.label}
              </span>
              {active && !isReport && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-container rounded-full shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
