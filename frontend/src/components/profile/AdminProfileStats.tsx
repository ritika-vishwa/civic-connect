import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { useNavigate } from 'react-router-dom';

export const AdminProfileStats: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="col-span-1 lg:col-span-8 flex flex-col gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      
      {/* Top row: Admin Access Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-gutter">
        <GlassCard noHover className="p-4 sm:p-6 flex flex-col justify-between border-l-[3px] border-l-error">
          <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Privilege</span>
          <h4 className="text-xl sm:text-2xl font-black text-white font-display-lg mt-2">Level 4</h4>
          <span className="text-[8px] sm:text-[9px] font-mono text-error mt-1 uppercase">Root Access</span>
        </GlassCard>

        <GlassCard noHover className="p-4 sm:p-6 flex flex-col justify-between border-l-[3px] border-l-primary-container">
          <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Uptime</span>
          <h4 className="text-xl sm:text-2xl font-black text-white font-display-lg mt-2">99.9%</h4>
          <span className="text-[8px] sm:text-[9px] font-mono text-primary-container mt-1 uppercase">Platform</span>
        </GlassCard>

        <GlassCard noHover className="p-4 sm:p-6 flex flex-col justify-between border-l-[3px] border-l-green-400">
          <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Nodes</span>
          <h4 className="text-xl sm:text-2xl font-black text-white font-display-lg mt-2">Active</h4>
          <span className="text-[8px] sm:text-[9px] font-mono text-green-400 mt-1 uppercase">System Status</span>
        </GlassCard>

        <GlassCard noHover className="p-4 sm:p-6 flex flex-col justify-between border-l-[3px] border-l-purple-400">
          <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Backups</span>
          <h4 className="text-xl sm:text-2xl font-black text-white font-display-lg mt-2">Sync</h4>
          <span className="text-[8px] sm:text-[9px] font-mono text-purple-300 mt-1 uppercase">2 hrs ago</span>
        </GlassCard>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-error/20 pb-4">
          <h3 className="font-display-lg text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-2xl drop-shadow-[0_0_8px_#ffb4ab]">admin_panel_settings</span>
            System Diagnostics & Control
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard noHover className="p-6 border border-white/5 flex flex-col items-start gap-4">
            <div className="bg-error/10 p-3 rounded-xl border border-error/20">
              <span className="material-symbols-outlined text-error text-2xl">manage_accounts</span>
            </div>
            <div>
              <h4 className="font-bold text-white uppercase tracking-widest">User Management</h4>
              <p className="text-xs text-white/50 font-mono mt-1">Review registrations, manage official assignments, and moderate accounts.</p>
            </div>
            <button 
              onClick={() => navigate('/admin')}
              className="mt-2 w-full px-4 py-2 bg-error/20 hover:bg-error text-error hover:text-black transition-colors rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer border border-error/30"
            >
              Open Workspace
            </button>
          </GlassCard>

          <GlassCard noHover className="p-6 border border-white/5 flex flex-col items-start gap-4">
            <div className="bg-primary-container/10 p-3 rounded-xl border border-primary-container/20">
              <span className="material-symbols-outlined text-primary-container text-2xl">monitoring</span>
            </div>
            <div>
              <h4 className="font-bold text-white uppercase tracking-widest">Platform Telemetry</h4>
              <p className="text-xs text-white/50 font-mono mt-1">Inspect server loads, map latency, and global analytics.</p>
            </div>
            <button 
              onClick={() => navigate('/analytics')}
              className="mt-2 w-full px-4 py-2 bg-primary-container/20 hover:bg-primary-container text-primary-container hover:text-black transition-colors rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer border border-primary-container/30"
            >
              View Analytics
            </button>
          </GlassCard>
        </div>
      </div>
      
      {/* Mock Audit Log */}
      <GlassCard noHover className="p-6 border border-white/10 mt-4">
        <h4 className="font-display-lg text-base font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-white/70 text-xl">history_edu</span>
          Recent Administrator Actions
        </h4>
        <div className="flex flex-col gap-3 font-mono text-xs">
          <div className="flex gap-4 items-start p-3 bg-white/5 rounded border border-white/10">
            <span className="text-primary-container shrink-0">10:42 AM</span>
            <span className="text-white/70">Modified permissions for user ID #7849 (Granted 'Officer' status)</span>
          </div>
          <div className="flex gap-4 items-start p-3 bg-white/5 rounded border border-white/10">
            <span className="text-primary-container shrink-0">08:15 AM</span>
            <span className="text-white/70">System restart initiated on cluster [Alpha]</span>
          </div>
          <div className="flex gap-4 items-start p-3 bg-white/5 rounded border border-white/10">
            <span className="text-primary-container shrink-0">Yesterday</span>
            <span className="text-white/70">Resolved 3 flagged inappropriate content reports.</span>
          </div>
        </div>
      </GlassCard>

    </div>
  );
};
