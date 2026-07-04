import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIssues } from '../../context/IssueContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../ui/StatusBadge';

export const ModeratorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { issues, loading } = useIssues();
  const { user } = useAuth();

  const flaggedIssues = issues.filter(i => i.severity === 'Critical' || i.status === 'Reported');
  const recentlyVerified = issues.filter(i => i.status !== 'Reported').slice(0, 3);
  
  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full">
        <div className="border-b border-white/10 pb-6">
          <div className="h-10 w-72 skeleton-shimmer rounded-xl mb-3"></div>
          <div className="h-3 w-80 skeleton-shimmer rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {[0, 1, 2].map(i => (
            <div key={i} className="col-span-1 md:col-span-4 h-36 rounded-2xl border border-white/5 skeleton-shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 animate-fade-in-up">
        <div>
          <h1 className="font-display-lg text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Moderator Dashboard
          </h1>
          <p className="text-primary-container/80 font-mono text-sm mt-2 uppercase tracking-widest">
            Welcome, Moderator {user?.name}. Monitor community health and verify reports.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/community')}
            className="px-6 py-2.5 rounded-lg bg-primary-container text-[#00060d] text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
          >
            Open Community Hub
          </button>
        </div>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="col-span-1 md:col-span-4 glass-card rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <span className="material-symbols-outlined text-[80px] text-primary-container">shield_person</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-primary-container/20 p-2 rounded-lg border border-primary-container/30">
              <span className="material-symbols-outlined text-primary-container text-sm drop-shadow-[0_0_8px_#00f0ff]">verified</span>
            </div>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary-container font-bold">Unverified Reports</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="font-display-lg text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{flaggedIssues.length}</h3>
          </div>
        </div>

        <div className="col-span-1 md:col-span-4 glass-card rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <span className="material-symbols-outlined text-[80px] text-error">flag</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-error/20 p-2 rounded-lg border border-error/30">
              <span className="material-symbols-outlined text-error text-sm drop-shadow-[0_0_8px_#ffb4ab]">gavel</span>
            </div>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-error font-bold">Flagged Content</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="font-display-lg text-5xl font-black text-error drop-shadow-[0_0_15px_rgba(255,180,171,0.4)]">2</h3>
          </div>
        </div>

        <div className="col-span-1 md:col-span-4 glass-card rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <span className="material-symbols-outlined text-[80px] text-green-400">health_and_safety</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-400/10 p-2 rounded-lg border border-green-400/20">
              <span className="material-symbols-outlined text-green-400 text-sm">monitor_heart</span>
            </div>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-green-400 font-bold">Community Health</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="font-display-lg text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">92%</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="col-span-1 lg:col-span-7 glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up flex flex-col min-h-[450px]" style={{ animationDelay: '0.4s' }}>
          <div className="flex justify-between items-center mb-6 border-b border-primary-container/20 pb-4">
            <h3 className="font-display-lg text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container text-2xl drop-shadow-[0_0_8px_#00f0ff]">list_alt</span>
              Recent Reports for Verification
            </h3>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {flaggedIssues.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-xl">
                <span className="material-symbols-outlined text-4xl text-white/20 mb-3">task_alt</span>
                <p className="text-white/50 text-sm font-mono">No reports pending verification.</p>
              </div>
            ) : (
              flaggedIssues.slice(0, 5).map(issue => (
                <div 
                  key={issue.id}
                  onClick={() => navigate(`/issues/${issue.id}`)}
                  className="bg-[#00060d]/50 p-4 rounded-xl border border-primary-container/30 hover:border-primary-container hover:bg-[#00060d] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-primary-container font-bold tracking-widest">{issue.id}</span>
                    <StatusBadge value={issue.status} type="status" />
                  </div>
                  <h4 className="font-bold text-white uppercase mb-1 line-clamp-1">{issue.title}</h4>
                  <div className="flex justify-between items-end mt-4">
                    <span className="text-xs text-white/50 font-mono">{issue.location.address}</span>
                    <button className="text-[10px] uppercase tracking-widest font-bold text-primary-container bg-primary-container/10 px-3 py-1 rounded border border-primary-container/20 group-hover:bg-primary-container group-hover:text-black transition-colors">
                      Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="col-span-1 lg:col-span-5 glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up flex flex-col" style={{ animationDelay: '0.6s' }}>
          <div className="flex justify-between items-center mb-6 border-b border-primary-container/20 pb-4">
            <h3 className="font-display-lg text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container text-2xl drop-shadow-[0_0_8px_#00f0ff]">admin_panel_settings</span>
              Moderator Tools
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <button onClick={() => navigate('/community')} className="w-full text-left bg-[#00060d]/50 hover:bg-[#00060d] border border-primary-container/30 hover:border-primary-container p-4 rounded-xl transition-all cursor-pointer group flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white uppercase tracking-widest text-sm group-hover:text-primary-container transition-colors">Review Community Posts</h4>
                <p className="text-xs text-white/50 font-mono mt-1">Check flagged discussions and comments.</p>
              </div>
              <span className="material-symbols-outlined text-primary-container">chevron_right</span>
            </button>
            <button onClick={() => navigate('/map')} className="w-full text-left bg-[#00060d]/50 hover:bg-[#00060d] border border-primary-container/30 hover:border-primary-container p-4 rounded-xl transition-all cursor-pointer group flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white uppercase tracking-widest text-sm group-hover:text-primary-container transition-colors">Incident Map</h4>
                <p className="text-xs text-white/50 font-mono mt-1">View the geospatial distribution of reports.</p>
              </div>
              <span className="material-symbols-outlined text-primary-container">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
