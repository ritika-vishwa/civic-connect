import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { IssueCard } from '../ui/IssueCard';
import { useNavigate } from 'react-router-dom';

interface OfficialProfileStatsProps {
  issues: any[];
  user: any;
}

export const OfficialProfileStats: React.FC<OfficialProfileStatsProps> = ({ issues, user }) => {
  const navigate = useNavigate();
  
  // Official metrics calculation (filtered by department)
  const deptIssues = issues.filter(i => !user?.department || !i.department || i.department === user.department);
  
  const assignedIssues = deptIssues.filter(i => i.status !== 'Resolved');
  const resolvedByDept = deptIssues.filter(i => i.status === 'Resolved');
  
  const criticalCount = assignedIssues.filter(i => i.severity === 'Critical').length;
  const resolutionRate = deptIssues.length > 0 ? Math.round((resolvedByDept.length / deptIssues.length) * 100) : 100;

  return (
    <div className="col-span-1 lg:col-span-8 flex flex-col gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      
      {/* Top row: 4 stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-gutter">
        <GlassCard noHover className="p-4 sm:p-6 flex flex-col justify-between border-l-[3px] border-l-primary-container">
          <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Assigned</span>
          <h4 className="text-2xl sm:text-3xl font-black text-white font-display-lg mt-2">{assignedIssues.length}</h4>
          <span className="text-[8px] sm:text-[9px] font-mono text-primary-container mt-1 uppercase">Active Cases</span>
        </GlassCard>

        <GlassCard noHover className="p-4 sm:p-6 flex flex-col justify-between border-l-[3px] border-l-error">
          <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Critical</span>
          <h4 className="text-2xl sm:text-3xl font-black text-white font-display-lg mt-2">{criticalCount}</h4>
          <span className="text-[8px] sm:text-[9px] font-mono text-error mt-1 uppercase">High Priority</span>
        </GlassCard>

        <GlassCard noHover className="p-4 sm:p-6 flex flex-col justify-between border-l-[3px] border-l-green-400">
          <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Resolved</span>
          <h4 className="text-2xl sm:text-3xl font-black text-white font-display-lg mt-2">{resolvedByDept.length}</h4>
          <span className="text-[8px] sm:text-[9px] font-mono text-green-400 mt-1 uppercase">Dept Total</span>
        </GlassCard>

        <GlassCard noHover className="p-4 sm:p-6 flex flex-col justify-between border-l-[3px] border-l-purple-400">
          <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Rating</span>
          <h4 className="text-2xl sm:text-3xl font-black text-white font-display-lg mt-2">{resolutionRate}%</h4>
          <span className="text-[8px] sm:text-[9px] font-mono text-purple-300 mt-1 uppercase">Clear Rate</span>
        </GlassCard>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-primary-container/20 pb-4">
          <h3 className="font-display-lg text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-container text-2xl drop-shadow-[0_0_8px_#00f0ff]">local_police</span>
            Department Assignment Queue
          </h3>
          <button 
            onClick={() => navigate('/officer')}
            className="text-primary-container hover:text-white transition-colors text-xs font-bold uppercase tracking-widest bg-primary-container/10 px-4 py-2 rounded-lg border border-primary-container/30 cursor-pointer"
          >
            Open Dispatch
          </button>
        </div>
        
        {assignedIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedIssues.slice(0, 4).map((issue) => (
              <div key={issue.id} className="w-full">
                <IssueCard issue={issue} layout="col" />
              </div>
            ))}
          </div>
        ) : (
          <GlassCard noHover className="p-8 text-center text-white/40 font-mono text-xs uppercase tracking-widest">
            <span className="material-symbols-outlined text-4xl block mb-2">done_all</span>
            No active cases pending for your department.
          </GlassCard>
        )}
      </div>

    </div>
  );
};
