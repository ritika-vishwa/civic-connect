import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from './GlassCard';
import { StatusBadge } from './StatusBadge';
import { Issue } from '../../context/IssueContext';

interface IssueCardProps {
  issue: Issue;
  className?: string;
  layout?: 'row' | 'col';
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, className = '', layout = 'row' }) => {
  const navigate = useNavigate();

  // Map status to progress bar percentage
  const getProgressPercentage = (status: Issue['status']) => {
    switch (status) {
      case 'Reported': return 15;
      case 'Under Review': return 30;
      case 'Assigned': return 50;
      case 'In Progress': return 75;
      case 'Resolved': return 100;
      case 'Closed': return 100;
      default: return 0;
    }
  };

  const pct = getProgressPercentage(issue.status);

  // Material symbols based on category
  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'potholes':
      case 'road damage': return 'add_road';
      case 'water leaks': 
      case 'drainage blockages': return 'water_drop';
      case 'broken streetlights': return 'lightbulb';
      case 'garbage accumulation': 
      case 'sanitation issues': return 'delete';
      case 'other': return 'report';
      default: return 'report';
    }
  };

  return (
    <GlassCard 
      onClick={() => navigate(`/issues/${issue.id}`)}
      className={`flex ${layout === 'row' ? 'flex-col md:flex-row' : 'flex-col'} gap-6 p-5 border border-transparent hover:border-primary-container/30 ${className}`}
    >
      {/* Image Thumbnail */}
      <div className={`w-full ${layout === 'row' ? 'md:w-44' : ''} h-32 rounded-xl overflow-hidden bg-surface-container-lowest border border-white/10 shrink-0 relative`}>
        <img 
          src={issue.image} 
          alt={issue.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2">
          <StatusBadge value={issue.severity} type="severity" />
        </div>
      </div>

      {/* Info Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-4">
            <h4 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-primary-container transition-colors line-clamp-1">
              {issue.title}
            </h4>
            <span className="text-xs font-mono text-primary-container whitespace-nowrap bg-primary-container/10 px-2 py-0.5 rounded border border-primary-container/20">
              {issue.id}
            </span>
          </div>

          <p className="text-xs text-white/50 font-mono mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">location_on</span>
            {issue.location.address}
          </p>

          <p className="text-sm text-white/70 mt-2 font-light line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Status bar and indicators */}
        <div className="mt-4 pt-2 flex flex-col gap-2">
          {/* Progress Bar */}
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/40">
            <span>Status: {issue.status}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                issue.status === 'Resolved' 
                  ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' 
                  : 'bg-gradient-to-r from-primary-container to-[#0088ff] shadow-[0_0_8px_rgba(0,240,255,0.5)]'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Badges & Date */}
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-[#00060d] px-2 py-1 rounded border border-primary-container/20 text-primary-container text-[10px] uppercase font-mono font-bold">
                <span className="material-symbols-outlined text-xs">{getCategoryIcon(issue.category)}</span>
                {issue.category}
              </div>
              <StatusBadge value={issue.status} type="status" />
            </div>

            <span className="text-[10px] font-mono text-white/40">
              {new Date(issue.createdAt).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
export default IssueCard;
