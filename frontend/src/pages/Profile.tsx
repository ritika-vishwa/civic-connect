import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useIssues } from '../context/IssueContext';
import { GlassCard } from '../components/ui/GlassCard';
import { IssueCard } from '../components/ui/IssueCard';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { issues } = useIssues();

  if (!user) return null;

  // Filter issues filed by this user (Jane Doe is our citizen, others can be listed)
  const myIssues = issues.filter(
    (issue) => issue.citizenName.toLowerCase() === user.name.toLowerCase() || user.role !== 'citizen'
  );

  // Statistics
  const reportsCount = myIssues.length;
  const totalEndorsements = myIssues.reduce((acc, curr) => acc + curr.supportCount, 0);
  const resolvedCount = myIssues.filter((i) => i.status === 'Resolved').length;

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 animate-fade-in-up">
        <div>
          <h1 className="font-display-lg text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            My Profile
          </h1>
          <p className="text-primary-container/80 font-mono text-sm mt-2 uppercase tracking-widest">
            Manage your network node permissions and inspect engagement history.
          </p>
        </div>
      </div>

      {/* User Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* User Card */}
        <div className="col-span-1 lg:col-span-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <GlassCard noHover className="flex flex-col items-center text-center p-8 border border-white/10">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary-container shadow-[0_0_20px_rgba(0,240,255,0.3)] mb-4 bg-surface-container-lowest">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">{user.name}</h3>
            <p className="text-xs font-mono text-primary-container uppercase tracking-widest mt-1">
              Terminal: {user.role.toUpperCase()}
            </p>
            {user.department && (
              <p className="text-[10px] font-mono text-purple-300 uppercase mt-0.5">
                Dept: {user.department}
              </p>
            )}

            <div className="w-full border-t border-white/10 my-6 pt-6 flex flex-col gap-3 font-mono text-[10px] uppercase text-white/50 tracking-wider">
              <div className="flex justify-between">
                <span>Node ID</span>
                <span className="text-white font-bold">{user.uid}</span>
              </div>
              <div className="flex justify-between">
                <span>Email Address</span>
                <span className="text-white font-bold">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Access Status</span>
                <span className="text-green-400 font-bold">Verified (Active)</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Engagement Statistics */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-gutter animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
            
            {/* Stat 1 */}
            <GlassCard noHover className="p-6 flex flex-col justify-between">
              <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Reports Filed</span>
              <h4 className="text-3xl font-black text-white font-display-lg mt-2">{reportsCount}</h4>
              <span className="text-[9px] font-mono text-primary-container mt-1 uppercase">Civic Submissions</span>
            </GlassCard>

            {/* Stat 2 */}
            <GlassCard noHover className="p-6 flex flex-col justify-between">
              <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Endorsements</span>
              <h4 className="text-3xl font-black text-white font-display-lg mt-2">{totalEndorsements}</h4>
              <span className="text-[9px] font-mono text-purple-300 mt-1 uppercase">Support Votes</span>
            </GlassCard>

            {/* Stat 3 */}
            <GlassCard noHover className="p-6 flex flex-col justify-between">
              <span className="font-label-caps text-[9px] text-white/40 uppercase tracking-widest font-mono">Resolved tickets</span>
              <h4 className="text-3xl font-black text-white font-display-lg mt-2">{resolvedCount}</h4>
              <span className="text-[9px] font-mono text-green-400 mt-1 uppercase">Resolution rate</span>
            </GlassCard>

          </div>

          {/* Action List or Summary */}
          <GlassCard noHover className="p-6 md:p-8 flex-grow border border-white/10">
            <h4 className="font-display-lg text-base font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-xl drop-shadow-[0_0_5px_#00f0ff]">military_tech</span>
              Network Node Badges
            </h4>
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center gap-2 p-3 bg-primary-container/5 border border-primary-container/20 rounded-xl">
                <span className="material-symbols-outlined text-primary-container text-2xl">campaign</span>
                <div>
                  <div className="text-[10px] font-mono font-bold text-white uppercase">Vocal Resident</div>
                  <div className="text-[9px] text-white/40 font-light mt-0.5">Filed more than 3 tickets</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                <span className="material-symbols-outlined text-purple-300 text-2xl">handshake</span>
                <div>
                  <div className="text-[10px] font-mono font-bold text-white uppercase">Team Player</div>
                  <div className="text-[9px] text-white/40 font-light mt-0.5">Received 10+ support votes</div>
                </div>
              </div>
            </div>
          </GlassCard>

        </div>

      </div>

      {/* User's Reports Feed */}
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

    </div>
  );
};
export default Profile;
