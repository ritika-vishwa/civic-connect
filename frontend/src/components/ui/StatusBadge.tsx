import React from 'react';

interface StatusBadgeProps {
  value: string;
  type?: 'status' | 'severity';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ value, type = 'status' }) => {
  let colorClasses = 'bg-white/10 text-white border-white/20';

  if (type === 'status') {
    switch (value) {
      case 'Reported':
        colorClasses = 'bg-primary-container/10 text-primary-container border-primary-container/20';
        break;
      case 'Under Review':
        colorClasses = 'bg-secondary-container/20 text-secondary-fixed border-secondary-container/30';
        break;
      case 'Assigned':
        colorClasses = 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20';
        break;
      case 'In Progress':
        colorClasses = 'bg-blue-500/10 text-blue-300 border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.15)]';
        break;
      case 'Resolved':
        colorClasses = 'bg-green-500/15 text-green-400 border-green-500/30';
        break;
      case 'Closed':
        colorClasses = 'bg-surface-container-highest/50 text-on-surface-variant border-outline-variant/50';
        break;
    }
  } else {
    // Severity badge
    switch (value) {
      case 'Low':
        colorClasses = 'bg-green-500/10 text-green-300 border-green-500/20';
        break;
      case 'Medium':
        colorClasses = 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20';
        break;
      case 'High':
        colorClasses = 'bg-orange-500/15 text-orange-300 border-orange-500/30 shadow-[0_0_8px_rgba(249,115,22,0.15)]';
        break;
      case 'Critical':
        colorClasses = 'bg-error/20 text-error border-error/30 shadow-[0_0_8px_rgba(255,180,171,0.2)]';
        break;
    }
  }

  return (
    <span className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest border ${colorClasses}`}>
      {value}
    </span>
  );
};
export default StatusBadge;
