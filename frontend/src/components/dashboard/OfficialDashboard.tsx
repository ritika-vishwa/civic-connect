import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIssues } from '../../context/IssueContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../ui/StatusBadge';
import { BroadcastAlertModal } from '../ui/BroadcastAlertModal';

export const OfficialDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { issues, loading } = useIssues();
  const { user } = useAuth();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);


  // Since officials should only see their department's issues (or all if not specified)
  const deptIssues = issues.filter(i => !user?.department || !i.department || i.department === user.department);

  const activeIssues = deptIssues.filter(i => i.status !== 'Resolved');
  const criticalCount = activeIssues.filter(i => i.severity === 'Critical').length;
  
  // High priority queue (Critical + Open)
  const highPriorityQueue = activeIssues
    .filter(i => i.severity === 'Critical')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(0, 5);

  const recentlyResolved = deptIssues
    .filter(i => i.status === 'Resolved')
    .sort((a, b) => {
      const aTime = a.history.length > 0 ? new Date(a.history[a.history.length - 1].createdAt).getTime() : new Date(a.createdAt).getTime();
      const bTime = b.history.length > 0 ? new Date(b.history[b.history.length - 1].createdAt).getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    })
    .slice(0, 3);

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
            Officer Dashboard
          </h1>
          <p className="text-primary-container/80 font-mono text-sm mt-2 uppercase tracking-widest">
            Welcome, Officer {user?.name}. Here is your active queue.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/officer')}
            className="px-6 py-2.5 rounded-lg bg-primary-container text-[#00060d] text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
          >
            Enter Workspace
          </button>
        </div>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Card 1: Active Tickets */}
        <div className="col-span-1 md:col-span-4 glass-card rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <span className="material-symbols-outlined text-[80px] text-primary-container">assignment</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-primary-container/20 p-2 rounded-lg border border-primary-container/30">
              <span className="material-symbols-outlined text-primary-container text-sm drop-shadow-[0_0_8px_#00f0ff]">pending_actions</span>
            </div>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary-container font-bold">Active Cases</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="font-display-lg text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{activeIssues.length}</h3>
          </div>
        </div>

        {/* Card 2: Critical Pending */}
        <div className="col-span-1 md:col-span-4 glass-card rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <span className="material-symbols-outlined text-[80px] text-error">warning</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-error/20 p-2 rounded-lg border border-error/30">
              <span className="material-symbols-outlined text-error text-sm drop-shadow-[0_0_8px_#ffb4ab]">priority_high</span>
            </div>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-error font-bold">Critical Open</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="font-display-lg text-5xl font-black text-error drop-shadow-[0_0_15px_rgba(255,180,171,0.4)]">{criticalCount}</h3>
          </div>
        </div>

        {/* Card 3: Resolved */}
        <div className="col-span-1 md:col-span-4 glass-card rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <span className="material-symbols-outlined text-[80px] text-white">check_circle</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg border border-white/20">
              <span className="material-symbols-outlined text-white text-sm">task_alt</span>
            </div>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-white font-bold">Recently Resolved</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="font-display-lg text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{recentlyResolved.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* High Priority Queue */}
        <div className="col-span-1 lg:col-span-7 glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up flex flex-col min-h-[450px]" style={{ animationDelay: '0.4s' }}>
          <div className="flex justify-between items-center mb-6 border-b border-error/20 pb-4">
            <h3 className="font-display-lg text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-error text-2xl drop-shadow-[0_0_8px_#ffb4ab]">warning</span>
              High Priority Dispatch Queue
            </h3>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {highPriorityQueue.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-xl">
                <span className="material-symbols-outlined text-4xl text-white/20 mb-3">task_alt</span>
                <p className="text-white/50 text-sm font-mono">No critical tickets pending in queue.</p>
              </div>
            ) : (
              highPriorityQueue.map(issue => (
                <div 
                  key={issue.id}
                  onClick={() => navigate(`/issues/${issue.id}`)}
                  className="bg-[#00060d]/50 p-4 rounded-xl border border-error/30 hover:border-error hover:bg-[#00060d] transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-error font-bold tracking-widest">{issue.id}</span>
                    <StatusBadge value={issue.status} type="status" />
                  </div>
                  <h4 className="font-bold text-white uppercase mb-1 line-clamp-1">{issue.title}</h4>
                  <div className="flex justify-between items-end mt-4">
                    <span className="text-xs text-white/50 font-mono">{issue.location.address}</span>
                    <button className="text-[10px] uppercase tracking-widest font-bold text-error bg-error/10 px-3 py-1 rounded border border-error/20 group-hover:bg-error group-hover:text-black transition-colors">
                      Dispatch
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Official Quick Actions */}
        <div className="col-span-1 lg:col-span-5 glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up flex flex-col" style={{ animationDelay: '0.6s' }}>
          <div className="flex justify-between items-center mb-6 border-b border-primary-container/20 pb-4">
            <h3 className="font-display-lg text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container text-2xl drop-shadow-[0_0_8px_#00f0ff]">local_police</span>
              Workspace
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <button onClick={() => navigate('/officer')} className="w-full text-left bg-[#00060d]/50 hover:bg-[#00060d] border border-primary-container/30 hover:border-primary-container p-4 rounded-xl transition-all cursor-pointer group flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white uppercase tracking-widest text-sm group-hover:text-primary-container transition-colors">Enter Official Workspace</h4>
                <p className="text-xs text-white/50 font-mono mt-1">Full view of all assigned tickets and maps.</p>
              </div>
              <span className="material-symbols-outlined text-primary-container">chevron_right</span>
            </button>

            <button onClick={() => setIsAlertModalOpen(true)} className="w-full text-left bg-error/10 hover:bg-error/20 border border-error/30 hover:border-error p-4 rounded-xl transition-all cursor-pointer group flex items-center justify-between">
              <div>
                <h4 className="font-bold text-error uppercase tracking-widest text-sm group-hover:text-white transition-colors">Broadcast Emergency Alert</h4>
                <p className="text-xs text-white/50 font-mono mt-1">Send a city-wide announcement regarding civic closures/emergencies.</p>
              </div>
              <span className="material-symbols-outlined text-error">campaign</span>
            </button>
            
            <div className="mt-4 p-4 border border-white/10 rounded-xl bg-white/5">
              <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-3">Recently Resolved</h4>
              <div className="flex flex-col gap-3">
                {recentlyResolved.map(issue => {
                  const resolvedDate = issue.history.length > 0 
                    ? new Date(issue.history[issue.history.length - 1].createdAt).toLocaleDateString()
                    : new Date(issue.createdAt).toLocaleDateString();
                  return (
                    <div key={issue.id} className="flex justify-between items-center text-xs font-mono">
                      <span className="text-white/70 line-clamp-1 flex-1">{issue.title}</span>
                      <span className="text-primary-container shrink-0 ml-2">{resolvedDate}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <BroadcastAlertModal 
        isOpen={isAlertModalOpen} 
        onClose={() => setIsAlertModalOpen(false)} 
      />
    </div>
  );
};
