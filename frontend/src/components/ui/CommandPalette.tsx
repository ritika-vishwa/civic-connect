import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useIssues } from '../../context/IssueContext';
import { useAuth, UserRole } from '../../context/AuthContext';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { issues } = useIssues();
  const { user } = useAuth();
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleOpen = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleOpen);
    };
  }, []);

  const handleAction = (callback: () => void) => {
    callback();
    setIsOpen(false);
    setQuery('');
  };

  const pages = [
    { title: 'Dashboard Portal', path: '/dashboard', icon: 'dashboard' },
    { title: 'Landing Page', path: '/', icon: 'home' },
    { title: 'About Us', path: '/about', icon: 'info' },
    { title: 'Map View', path: '/map', icon: 'map' },
    { title: 'Analytics Pulse', path: '/analytics', icon: 'analytics' },
    { title: 'Community Feed', path: '/community', icon: 'forum' },
    { title: 'Local Events', path: '/events', icon: 'event' },
    { title: 'Notifications Center', path: '/notifications', icon: 'notifications' },
    { title: 'My Reports & Complaints', path: '/my-complaints', icon: 'description' },
    { title: 'Report New Issue Wizard', path: '/report', icon: 'add_circle' },
    { title: 'Officer workspace portal', path: '/officer', icon: 'assignment_ind' },
    { title: 'Admin panel settings', path: '/admin', icon: 'admin_panel_settings' },
    { title: 'Platform Settings', path: '/settings', icon: 'settings' }
  ];

  // Filters
  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredIssues = issues.filter((issue) =>
    issue.title.toLowerCase().includes(query.toLowerCase()) ||
    issue.id.toLowerCase().includes(query.toLowerCase())
  );

  // Role switcher only available in development mode
  const roles: { name: string; value: UserRole; desc: string }[] = isDev ? [
    { name: 'Citizen Interface', value: 'citizen', desc: 'Default view for residents' },
    { name: 'Officer Interface', value: 'official', desc: 'View for field technicians & officers' },
    { name: 'Moderator Interface', value: 'moderator', desc: 'View for community moderators' },
    { name: 'Admin Control Room', value: 'admin', desc: 'Full administration matrix' }
  ] : [];

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {/* Discrete Keyboard shortcut icon */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[60] flex items-center justify-center w-10 h-10 rounded-full glass-card border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors group shadow-lg cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px]">insights</span>
        
        {/* Hover Tooltip */}
        <div className="absolute right-14 bg-[#00060d] border border-white/20 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-2 whitespace-nowrap shadow-xl">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/70">Search / Navigate</span>
          <div className="flex items-center gap-1">
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded border border-white/20 text-[9px] text-white font-mono">Ctrl</kbd>
            <span className="text-[9px] text-white/50">+</span>
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded border border-white/20 text-[9px] text-white font-mono">K</kbd>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl glass-card rounded-2xl border border-primary-container/60 shadow-[0_0_80px_rgba(0,240,255,0.3)] bg-[#031427] overflow-hidden flex flex-col mt-10"
            >
              {/* Input */}
              <div className="flex items-center px-4 border-b border-white/10 py-3">
                <span className="material-symbols-outlined text-primary-container text-[22px] drop-shadow-[0_0_5px_#00f0ff]">search</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent border-0 ring-0 outline-none focus:outline-none focus:ring-0 text-sm text-white placeholder-white/30 pl-3 font-mono uppercase tracking-widest"
                  placeholder="Type a page, issue ID, or keyword..."
                  autoFocus
                />
                <span className="text-[10px] font-mono text-white/30 border border-white/20 px-1.5 py-0.5 rounded shrink-0">ESC</span>
              </div>

              {/* Results List */}
              <div className="max-h-96 overflow-y-auto p-4 flex flex-col gap-4">
                
                {/* Navigation Pages */}
                {filteredPages.length > 0 && (
                  <div>
                    <h6 className="text-[9px] font-mono text-primary-container uppercase tracking-wider mb-2 font-bold opacity-80">Navigate Platform</h6>
                    <div className="flex flex-col gap-1">
                      {filteredPages.map((page) => (
                        <button
                          key={page.path}
                          onClick={() => handleAction(() => navigate(page.path))}
                          className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl hover:bg-primary-container/10 border border-transparent hover:border-primary-container/20 group transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px] text-white/40 group-hover:text-primary-container">{page.icon}</span>
                          <span className="text-xs uppercase font-mono tracking-widest text-white/80 group-hover:text-white font-semibold">{page.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Issues Detections */}
                {filteredIssues.length > 0 && (
                  <div>
                    <h6 className="text-[9px] font-mono text-secondary-container uppercase tracking-wider mb-2 font-bold opacity-80">Complaints & Tickets</h6>
                    <div className="flex flex-col gap-1">
                      {filteredIssues.map((issue) => (
                        <button
                          key={issue.id}
                          onClick={() => handleAction(() => navigate(`/issues/${issue.id}`))}
                          className="flex items-center justify-between w-full text-left px-3 py-2.5 rounded-xl hover:bg-secondary-container/10 border border-transparent hover:border-secondary-container/20 group transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[18px] text-white/40 group-hover:text-secondary-fixed">assignment</span>
                            <span className="text-xs text-white/80 group-hover:text-white line-clamp-1">{issue.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-secondary-fixed bg-secondary-container/20 px-2 py-0.5 rounded border border-secondary-container/30 shrink-0">{issue.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Role Switcher — DEV MODE ONLY */}
                {isDev && filteredRoles.length > 0 && (
                  <div>
                    <h6 className="text-[9px] font-mono text-yellow-400 uppercase tracking-wider mb-2 font-bold opacity-80">⚠ Dev Role Switcher (Disabled in Production)</h6>
                    <div className="flex flex-col gap-1">
                      {filteredRoles.map((role) => (
                        <button
                          key={role.value}
                          onClick={() => handleAction(() => {
                            window.location.href = '/login';
                          })}
                          className="flex items-center justify-between w-full text-left px-3 py-2.5 rounded-xl hover:bg-yellow-500/10 border border-transparent hover:border-yellow-500/20 group transition-all opacity-60 cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[18px] text-white/40 group-hover:text-yellow-300">lock</span>
                            <div>
                              <div className="text-xs uppercase font-mono tracking-widest text-white/80 group-hover:text-white font-semibold">{role.name}</div>
                              <div className="text-[9px] text-yellow-400/60 font-light mt-0.5">Log in with the correct account to access this role</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {filteredPages.length === 0 && filteredIssues.length === 0 && filteredRoles.length === 0 && (
                  <div className="py-8 text-center flex flex-col items-center justify-center gap-3 text-white/40">
                    <span className="material-symbols-outlined text-[36px]">search_off</span>
                    <span className="text-xs font-mono uppercase tracking-widest">No matching results found</span>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
export default CommandPalette;
