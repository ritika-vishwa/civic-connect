import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GlassCard } from '../components/ui/GlassCard';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(
    document.documentElement.classList.contains('light') || localStorage.getItem('theme') === 'light' ? 'light' : 'dark'
  );
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [shareGPS, setShareGPS] = useState(true);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    showToast('Profile settings saved successfully!', 'success');
  };

  const handleThemeChange = (mode: 'dark' | 'light') => {
    setThemeMode(mode);
    const html = document.documentElement;
    if (mode === 'light') {
      html.classList.remove('dark');
      html.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    showToast(`Theme mode switched to ${mode.toUpperCase()}`, 'success');
  };

  const handleWipeCache = () => {
    setShowWipeConfirm(true);
  };

  const confirmWipeCache = () => {
    localStorage.clear();
    showToast('Cache purged. Reloading network...', 'warning');
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <ConfirmModal
        isOpen={showWipeConfirm}
        title="Wipe Local Cache"
        message="Are you sure you want to wipe all local issues, logins, and settings? This resets the platform."
        confirmText="Wipe Data"
        onConfirm={confirmWipeCache}
        onCancel={() => setShowWipeConfirm(false)}
        isDestructive={true}
      />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 animate-fade-in-up">
        <div>
          <h1 className="font-display-lg text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            System Settings
          </h1>
          <p className="text-primary-container/80 font-mono text-sm mt-2 uppercase tracking-widest">
            Configure node parameters, credentials, and notification settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        
        {/* Left Side: General Profile Form */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-gutter">
          
          {/* Profile Card */}
          <GlassCard noHover className="p-6 md:p-8">
            <h3 className="font-display-lg text-lg font-bold text-white uppercase tracking-tight mb-4 border-b border-white/5 pb-2">
              Profile Configuration
            </h3>
            
            <form onSubmit={handleProfileSave} className="flex flex-col gap-5 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-white/40 uppercase">Full Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-glass w-full rounded-xl px-4 py-2.5 text-xs font-mono uppercase tracking-wider"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-white/40 uppercase">Role Access Clearance</label>
                  <div className="bg-white/5 border border-white/10 text-white/60 text-xs px-4 py-2.5 rounded-xl font-mono uppercase">
                    {user?.role}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-gradient-cyan self-end px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                Save Profile
              </button>
            </form>
          </GlassCard>

          {/* Notifications Toggles */}
          <GlassCard noHover className="p-6 md:p-8">
            <h3 className="font-display-lg text-lg font-bold text-white uppercase tracking-tight mb-6 border-b border-white/5 pb-2">
              Notification Routing
            </h3>

            <div className="flex flex-col gap-4">
              {/* Toggle 1 */}
              <div className="flex justify-between items-center bg-black/10 border border-white/5 p-4 rounded-xl">
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">Email Dispatch</h5>
                  <p className="text-[9px] text-white/40 font-mono mt-0.5">Receive weekly reports and ticket updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={() => setEmailAlerts(!emailAlerts)}
                  className="rounded bg-black/40 border-outline text-primary-container focus:ring-primary-container w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Toggle 2 */}
              <div className="flex justify-between items-center bg-black/10 border border-white/5 p-4 rounded-xl">
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">SMS Alerts (Critical)</h5>
                  <p className="text-[9px] text-white/40 font-mono mt-0.5">Instant alerts for nearby high-priority hazards</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={() => setSmsAlerts(!smsAlerts)}
                  className="rounded bg-black/40 border-outline text-primary-container focus:ring-primary-container w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </GlassCard>

        </div>

        {/* Right Side: Theme, GPS, Danger Zone */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-gutter">
          
          {/* Appearance setting */}
          <GlassCard noHover className="p-5">
            <h4 className="font-mono text-[10px] uppercase text-primary-container font-bold border-b border-white/5 pb-2 mb-3">
              Theme Appearance
            </h4>
            <div className="grid grid-cols-2 gap-2 segmented-control">
              <button
                onClick={() => handleThemeChange('dark')}
                className={`py-2 px-1 rounded-xl text-[10px] font-mono font-bold uppercase border transition-all ${
                  themeMode === 'dark'
                    ? 'bg-primary-container/20 border-primary-container text-primary-container shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'btn-glass text-white'
                }`}
              >
                Dark Mode
              </button>
              <button
                onClick={() => handleThemeChange('light')}
                className={`py-2 px-1 rounded-xl text-[10px] font-mono font-bold uppercase border transition-all ${
                  themeMode === 'light'
                    ? 'bg-primary-container/20 border-primary-container text-primary-container shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'btn-glass text-white'
                }`}
              >
                Light Mode
              </button>
            </div>
          </GlassCard>

          {/* Privacy GPS */}
          <GlassCard noHover className="p-5">
            <h4 className="font-mono text-[10px] uppercase text-white/40 font-bold border-b border-white/5 pb-2 mb-3">
              GPS Telemetry Privacy
            </h4>
            <div className="flex justify-between items-center bg-black/10 p-3 rounded-lg border border-white/5">
              <span className="text-[10px] font-mono text-white/60 uppercase">Share GPS Telemetry</span>
              <input
                type="checkbox"
                checked={shareGPS}
                onChange={() => setShareGPS(!shareGPS)}
                className="rounded bg-black/40 border-outline text-primary-container focus:ring-primary-container w-4 h-4 cursor-pointer"
              />
            </div>
          </GlassCard>

          {/* Danger Zone */}
          <GlassCard noHover className="p-5 border-error/30 shadow-[0_0_15px_rgba(255,180,171,0.05)] bg-error/5">
            <h4 className="font-mono text-[10px] uppercase text-error font-bold border-b border-error/20 pb-2 mb-4">
              Danger Zone
            </h4>
            <button
              onClick={handleWipeCache}
              className="w-full bg-error/20 hover:bg-error/30 border border-error/40 text-error rounded-xl py-3 text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Wipe Ledger Cache
            </button>
          </GlassCard>

        </div>

      </div>
    </div>
  );
};
export default Settings;
