import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { useNavigate } from 'react-router-dom';

interface ModeratorProfileStatsProps {
  issues: any[];
}

export const ModeratorProfileStats: React.FC<ModeratorProfileStatsProps> = ({ issues }) => {
  const navigate = useNavigate();
  
  // Dummy data for moderator stats since we don't have moderation logs in context
  const flaggedPostsCount = 12;
  const verifiedIssuesCount = issues.filter(i => i.status !== 'Reported').length; // heuristic
  const communityHealthScore = 92;
  const activeDiscussions = 5;

  return (
    <div className="col-span-1 lg:col-span-8 flex flex-col gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      
      {/* Top row: 4 stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-gutter">
        <GlassCard noHover className="p-4 sm:p-6 flex flex-col justify-between border-l-[3px] border-l-purple-400">
          <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Verified</span>
          <h4 className="text-2xl sm:text-3xl font-black text-white font-display-lg mt-2">{verifiedIssuesCount}</h4>
          <span className="text-[8px] sm:text-[9px] font-mono text-purple-300 mt-1 uppercase">Reports Checked</span>
        </GlassCard>

        <GlassCard noHover className="p-4 sm:p-6 flex flex-col justify-between border-l-[3px] border-l-error">
          <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Flagged</span>
          <h4 className="text-2xl sm:text-3xl font-black text-white font-display-lg mt-2">{flaggedPostsCount}</h4>
          <span className="text-[8px] sm:text-[9px] font-mono text-error mt-1 uppercase">Content Removed</span>
        </GlassCard>

        <GlassCard noHover className="p-4 sm:p-6 flex flex-col justify-between border-l-[3px] border-l-green-400">
          <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Health</span>
          <h4 className="text-2xl sm:text-3xl font-black text-white font-display-lg mt-2">{communityHealthScore}%</h4>
          <span className="text-[8px] sm:text-[9px] font-mono text-green-400 mt-1 uppercase">Community Score</span>
        </GlassCard>

        <GlassCard noHover className="p-4 sm:p-6 flex flex-col justify-between border-l-[3px] border-l-primary-container">
          <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Active</span>
          <h4 className="text-2xl sm:text-3xl font-black text-white font-display-lg mt-2">{activeDiscussions}</h4>
          <span className="text-[8px] sm:text-[9px] font-mono text-primary-container mt-1 uppercase">Discussions</span>
        </GlassCard>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-purple-500/20 pb-4">
          <h3 className="font-display-lg text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-purple-400 text-2xl drop-shadow-[0_0_8px_#c084fc]">shield_person</span>
            Moderation Activity Log
          </h3>
          <button 
            onClick={() => navigate('/community')}
            className="text-purple-300 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/30 cursor-pointer"
          >
            Go to Community
          </button>
        </div>
        
        <GlassCard noHover className="p-6 border border-white/10">
          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="flex gap-4 items-start p-3 bg-white/5 rounded border border-white/10">
              <span className="text-purple-300 shrink-0">Today, 2:15 PM</span>
              <span className="text-white/70">Verified 3 infrastructure reports in Downtown District.</span>
            </div>
            <div className="flex gap-4 items-start p-3 bg-white/5 rounded border border-white/10">
              <span className="text-purple-300 shrink-0">Yesterday</span>
              <span className="text-white/70">Removed a community post for violating terms of service.</span>
            </div>
            <div className="flex gap-4 items-start p-3 bg-white/5 rounded border border-white/10">
              <span className="text-purple-300 shrink-0">Mon, 10:00 AM</span>
              <span className="text-white/70">Approved a new community event "River Cleanup Drive".</span>
            </div>
          </div>
        </GlassCard>
      </div>

    </div>
  );
};
