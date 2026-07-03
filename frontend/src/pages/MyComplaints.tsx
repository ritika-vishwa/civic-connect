import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { useAuth } from '../context/AuthContext';
import { IssueCard } from '../components/ui/IssueCard';
import { GlassCard } from '../components/ui/GlassCard';

export const MyComplaints: React.FC = () => {
  const { issues } = useIssues();
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'endorsed'>('newest');
  const [isListView, setIsListView] = useState(true);

  if (!user) return null;

  // Filter issues filed by this user (Jane Doe is our citizen, others can see all or their own)
  const myIssues = issues.filter(
    (issue) => issue.citizenName.toLowerCase() === user.name.toLowerCase() || user.role !== 'citizen'
  );

  // Search & Filter Heuristics
  const filtered = myIssues.filter((issue) => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(query.toLowerCase()) ||
      issue.id.toLowerCase().includes(query.toLowerCase()) ||
      issue.location.address.toLowerCase().includes(query.toLowerCase());

    const matchesCategory = filterCategory === 'All' || issue.category === filterCategory;
    const matchesSeverity = filterSeverity === 'All' || issue.severity === filterSeverity;
    const matchesStatus = filterStatus === 'All' || issue.status === filterStatus;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  // Sort Heuristics
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'endorsed') return b.supportCount - a.supportCount;
    return 0;
  });

  // Metrics
  const openCount = myIssues.filter(i => i.status !== 'Resolved').length;
  const resolvedCount = myIssues.filter(i => i.status === 'Resolved').length;
  const criticalCount = myIssues.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 animate-fade-in-up">
        <div>
          <h1 className="font-display-lg text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            My Complaints
          </h1>
          <p className="text-primary-container/80 font-mono text-sm mt-2 uppercase tracking-widest">
            Inspect, filter, and audit all tickets logged under your user node.
          </p>
        </div>
      </div>

      {/* KPI Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <GlassCard noHover className="p-5 flex items-center justify-between border-primary-container/20">
          <div>
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">Active Tickets</span>
            <h4 className="text-3xl font-black text-white font-display-lg mt-1">{openCount}</h4>
          </div>
          <span className="material-symbols-outlined text-primary-container text-2xl drop-shadow-[0_0_5px_#00f0ff]">pending_actions</span>
        </GlassCard>
        <GlassCard noHover className="p-5 flex items-center justify-between border-green-500/20">
          <div>
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">Resolved Tickets</span>
            <h4 className="text-3xl font-black text-white font-display-lg mt-1">{resolvedCount}</h4>
          </div>
          <span className="material-symbols-outlined text-green-400 text-2xl drop-shadow-[0_0_5px_#4ade80]">task_alt</span>
        </GlassCard>
        <GlassCard noHover className="p-5 flex items-center justify-between border-error/20">
          <div>
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">Critical Defects</span>
            <h4 className="text-3xl font-black text-error font-display-lg mt-1">{criticalCount}</h4>
          </div>
          <span className="material-symbols-outlined text-error text-2xl drop-shadow-[0_0_5px_#ffb4ab]">warning</span>
        </GlassCard>
      </div>

      {/* Filter and Control Bar */}
      <GlassCard noHover className="p-5 flex flex-col gap-4 border-white/10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets by title, ID, or location..."
            className="input-glass w-full rounded-xl py-3 pl-11 pr-4 text-xs font-mono uppercase tracking-widest placeholder-white/20"
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-[18px]">search</span>
        </div>

        {/* Multi filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-glass w-full rounded-lg px-3 py-2.5 text-xs font-mono"
            >
              <option value="All">All Categories</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Waste">Waste</option>
              <option value="Traffic">Traffic</option>
              <option value="Safety">Safety</option>
              <option value="Noise">Noise</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Severity</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="input-glass w-full rounded-lg px-3 py-2.5 text-xs font-mono"
            >
              <option value="All">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-glass w-full rounded-lg px-3 py-2.5 text-xs font-mono"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="AI Reviewing">AI Reviewing</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Sort Telemetry</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-glass w-full rounded-lg px-3 py-2.5 text-xs font-mono"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="endorsed">Most Endorsed</option>
            </select>
          </div>
        </div>

        {/* View toggle and count */}
        <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-1">
          <span className="text-[10px] font-mono text-primary-container font-bold uppercase tracking-wider">
            Displaying {sorted.length} tickets matching filters
          </span>

          <div className="flex items-center gap-2 bg-[#00060d] border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setIsListView(true)}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                isListView ? 'bg-primary-container/20 text-primary-container' : 'text-white/40 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
            </button>
            <button
              onClick={() => setIsListView(false)}
              className={`p-1.5 rounded transition-all cursor-pointer ${
                !isListView ? 'bg-primary-container/20 text-primary-container' : 'text-white/40 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Tickets Feed List/Grid Display */}
      {sorted.length > 0 ? (
        <div className={isListView ? 'flex flex-col gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
          {sorted.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      ) : (
        <GlassCard noHover className="p-16 text-center text-white/40 font-mono text-xs uppercase tracking-widest animate-fade-in-up">
          <span className="material-symbols-outlined text-5xl block mb-3">database_off</span>
          No matching telemetry logs found.
        </GlassCard>
      )}
    </div>
  );
};
export default MyComplaints;
