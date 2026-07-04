import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../ui/GlassCard';
import { IssueCard } from '../ui/IssueCard';

interface CitizenProfileStatsProps {
  reportsCount: number;
  totalEndorsements: number;
  resolvedCount: number;
  participationScore: number;
  myIssues: any[];
  myEvents: any[];
}

export const CitizenProfileStats: React.FC<CitizenProfileStatsProps> = ({
  reportsCount,
  totalEndorsements,
  resolvedCount,
  participationScore,
  myIssues,
  myEvents
}) => {
  return (
    <div className="col-span-1 lg:col-span-8 flex flex-col gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      
      {/* Top row: 4 stats + Badges */}
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-gutter">
          <GlassCard noHover className="p-4 sm:p-6 flex flex-col justify-between">
            <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Reports</span>
            <h4 className="text-2xl sm:text-3xl font-black text-white font-display-lg mt-2">{reportsCount}</h4>
            <span className="text-[8px] sm:text-[9px] font-mono text-primary-container mt-1 uppercase">Filed</span>
          </GlassCard>

          <GlassCard noHover className="p-4 sm:p-6 flex flex-col justify-between">
            <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Endorsed</span>
            <h4 className="text-2xl sm:text-3xl font-black text-white font-display-lg mt-2">{totalEndorsements}</h4>
            <span className="text-[8px] sm:text-[9px] font-mono text-purple-300 mt-1 uppercase">Support Votes</span>
          </GlassCard>

          <GlassCard noHover className="p-4 sm:p-6 flex flex-col justify-between">
            <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Resolved</span>
            <h4 className="text-2xl sm:text-3xl font-black text-white font-display-lg mt-2">{resolvedCount}</h4>
            <span className="text-[8px] sm:text-[9px] font-mono text-green-400 mt-1 uppercase">Tickets</span>
          </GlassCard>

          <GlassCard noHover className="p-4 sm:p-6 flex flex-col justify-between">
            <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Impact</span>
            <h4 className="text-2xl sm:text-3xl font-black text-white font-display-lg mt-2">{participationScore}</h4>
            <span className="text-[8px] sm:text-[9px] font-mono text-yellow-400 mt-1 uppercase">Community Pts</span>
          </GlassCard>
        </div>

        <GlassCard noHover className="p-6 md:p-8 flex-grow border border-white/10">
          <h4 className="font-display-lg text-base font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-xl drop-shadow-[0_0_5px_#00f0ff]">military_tech</span>
            Network Node Badges
          </h4>
          <div className="flex flex-wrap gap-4 mt-2">
            {reportsCount >= 3 && (
              <div className="flex items-center gap-2 p-3 bg-primary-container/5 border border-primary-container/20 rounded-xl">
                <span className="material-symbols-outlined text-primary-container text-2xl">campaign</span>
                <div>
                  <div className="text-[10px] font-mono font-bold text-white uppercase">Vocal Resident</div>
                  <div className="text-[9px] text-white/40 font-light mt-0.5">Filed 3+ tickets</div>
                </div>
              </div>
            )}
            {totalEndorsements >= 10 && (
              <div className="flex items-center gap-2 p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                <span className="material-symbols-outlined text-purple-300 text-2xl">handshake</span>
                <div>
                  <div className="text-[10px] font-mono font-bold text-white uppercase">Team Player</div>
                  <div className="text-[9px] text-white/40 font-light mt-0.5">Received 10+ support votes</div>
                </div>
              </div>
            )}
            {resolvedCount >= 1 && (
              <div className="flex items-center gap-2 p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
                <span className="material-symbols-outlined text-green-400 text-2xl">task_alt</span>
                <div>
                  <div className="text-[10px] font-mono font-bold text-white uppercase">Problem Solver</div>
                  <div className="text-[9px] text-white/40 font-light mt-0.5">Resolved 1+ tickets</div>
                </div>
              </div>
            )}
            {participationScore >= 200 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                <span className="material-symbols-outlined text-yellow-400 text-2xl drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]">workspace_premium</span>
                <div className="relative z-10">
                  <div className="text-[10px] font-mono font-bold text-yellow-400 uppercase">Civic Hero</div>
                  <div className="text-[9px] text-white/50 font-light mt-0.5">200+ Community Pts</div>
                </div>
              </div>
            )}
            {reportsCount < 3 && totalEndorsements < 10 && resolvedCount < 1 && participationScore < 200 && (
              <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest p-4">
                No badges earned yet. Participate in the community to unlock them!
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="flex flex-col gap-6">
        <h3 className="font-display-lg text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-container text-2xl drop-shadow-[0_0_8px_#00f0ff]">assignment_late</span>
          Active Node Tickets
        </h3>
        
        {myIssues.length > 0 ? (
          <div className="flex flex-col gap-4">
            {myIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        ) : (
          <GlassCard noHover className="p-8 text-center text-white/40 font-mono text-xs uppercase tracking-widest">
            <span className="material-symbols-outlined text-4xl block mb-2">assignment_turned_in</span>
            No active tickets filed under this profile.
          </GlassCard>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <h3 className="font-display-lg text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <span className="material-symbols-outlined text-purple-400 text-2xl drop-shadow-[0_0_8px_#c084fc]">event_available</span>
          Event Registrations
        </h3>
        
        {myEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myEvents.map((evt) => {
              const eventDate = new Date(evt.date);
              const day = eventDate.getDate();
              const month = eventDate.toLocaleString(undefined, { month: 'short' }).toUpperCase();
              return (
                <GlassCard key={evt.id} noHover className="flex gap-4 p-4 border border-white/10 overflow-hidden relative">
                  <div className="w-20 h-24 rounded-lg overflow-hidden shrink-0 border border-white/10 relative">
                    <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#031427]/80 flex flex-col items-center justify-center">
                      <span className="font-display-lg text-xl font-black text-white leading-none">{day}</span>
                      <span className="font-mono text-[9px] text-primary-container font-bold tracking-wider">{month}</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center flex-grow">
                    <span className="text-[9px] font-bold tracking-widest text-purple-300 uppercase mb-1">{evt.category}</span>
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight leading-tight">{evt.title}</h4>
                    <p className="text-[10px] font-mono text-white/50 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">schedule</span> {evt.time}
                    </p>
                    <p className="text-[10px] font-mono text-white/50 mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">location_on</span> {evt.location}
                    </p>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <GlassCard noHover className="p-8 text-center text-white/40 font-mono text-xs uppercase tracking-widest">
            <span className="material-symbols-outlined text-4xl block mb-2">event_busy</span>
            No active event registrations found.
          </GlassCard>
        )}
      </div>

    </div>
  );
};
