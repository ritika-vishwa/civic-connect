import React from 'react';
import { GlassCard } from './GlassCard';

interface AIResultCardProps {
  confidence: number;
  category: string;
  department: string;
  duplicateFound: boolean;
  suggestedTitle: string;
  suggestedDescription?: string;
  severity?: string;
  isEditing?: boolean;
  onEditChange?: (field: string, val: string) => void;
}

export const AIResultCard: React.FC<AIResultCardProps> = ({
  confidence,
  category,
  department,
  duplicateFound,
  suggestedTitle,
  suggestedDescription = '',
  severity = 'Medium',
  isEditing = false,
  onEditChange
}) => {
  const percentage = Math.round(confidence * 100);

  return (
    <GlassCard noHover className="border border-primary-container/40 p-6 md:p-8 bg-[#000f21]/30">
      <div className="flex flex-col md:flex-row items-center gap-8">
        
        {/* Left Side: Circular Confidence Gauge */}
        <div className="shrink-0 relative flex flex-col items-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="46"
                className="stroke-surface-container-highest fill-none"
                strokeWidth="8"
              />
              <circle
                cx="56"
                cy="56"
                r="46"
                className="stroke-primary-container fill-none transition-all duration-1000"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - confidence)}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 8px #00f0ff)' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-display-lg text-2xl font-black text-white">{percentage}%</span>
              <span className="font-label-caps text-[9px] uppercase tracking-wider text-primary-container font-semibold">Match</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest mt-2">AI Confidence</span>
        </div>

        {/* Right Side: AI Detections & Details */}
        <div className="flex-grow w-full flex flex-col gap-4">
          <div className="flex justify-between items-start gap-4">
            <div className="w-full">
              <span className="font-label-caps text-[10px] text-primary-container uppercase tracking-widest font-mono font-bold">Suggested Title</span>
              {isEditing && onEditChange ? (
                <input
                  type="text"
                  value={suggestedTitle}
                  onChange={(e) => onEditChange('title', e.target.value)}
                  className="input-glass mt-1 px-3 py-1.5 rounded-lg text-sm w-full font-bold focus:ring-1"
                />
              ) : (
                <h4 className="text-lg font-bold text-white uppercase tracking-tight mt-1">{suggestedTitle}</h4>
              )}
            </div>
          </div>

          <div className="flex justify-between items-start gap-4">
            <div className="w-full">
              <span className="font-label-caps text-[10px] text-primary-container uppercase tracking-widest font-mono font-bold">Suggested Description</span>
              {isEditing && onEditChange ? (
                <textarea
                  value={suggestedDescription}
                  onChange={(e) => onEditChange('description', e.target.value)}
                  className="input-glass mt-1 px-3 py-1.5 rounded-lg text-xs w-full min-h-[60px] focus:ring-1 resize-none"
                />
              ) : (
                <p className="text-xs text-white/80 mt-1">{suggestedDescription}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="font-label-caps text-[10px] text-white/40 uppercase tracking-widest font-mono">Category</span>
              {isEditing && onEditChange ? (
                <select
                  value={category}
                  onChange={(e) => onEditChange('category', e.target.value)}
                  className="input-glass mt-1 px-3 py-1.5 rounded-lg text-xs w-full focus:ring-1"
                >
                  <option value="Potholes">Potholes</option>
                  <option value="Water Leaks">Water Leaks</option>
                  <option value="Broken Streetlights">Broken Streetlights</option>
                  <option value="Garbage Accumulation">Garbage Accumulation</option>
                  <option value="Drainage Blockages">Drainage Blockages</option>
                  <option value="Road Damage">Road Damage</option>
                  <option value="Sanitation Issues">Sanitation Issues</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <div className="text-white text-sm font-semibold uppercase tracking-wider mt-1">{category}</div>
              )}
            </div>

            <div>
              <span className="font-label-caps text-[10px] text-white/40 uppercase tracking-widest font-mono">Severity</span>
              {isEditing && onEditChange ? (
                <select
                  value={severity}
                  onChange={(e) => onEditChange('severity', e.target.value)}
                  className="input-glass mt-1 px-3 py-1.5 rounded-lg text-xs w-full focus:ring-1"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              ) : (
                <div className="text-white text-sm font-semibold uppercase tracking-wider mt-1">{severity}</div>
              )}
            </div>

            <div>
              <span className="font-label-caps text-[10px] text-white/40 uppercase tracking-widest font-mono">Department</span>
              {isEditing && onEditChange ? (
                <input
                  type="text"
                  value={department}
                  onChange={(e) => onEditChange('department', e.target.value)}
                  className="input-glass mt-1 px-3 py-1.5 rounded-lg text-xs w-full focus:ring-1"
                />
              ) : (
                <div className="text-white text-sm font-semibold uppercase tracking-wider mt-1">{department}</div>
              )}
            </div>
          </div>

          {/* Duplicate Detection and Health Indicators */}
          <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-white/15">
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`material-symbols-outlined text-[18px] ${duplicateFound ? 'text-error' : 'text-green-400'}`}>
                {duplicateFound ? 'warning' : 'task_alt'}
              </span>
              <span className="text-white/70 font-mono text-[10px] uppercase tracking-wider">
                {duplicateFound ? 'Duplicate Detected (Within 100m)' : 'Unique Submission Verified'}
              </span>
            </div>
            {duplicateFound && (
              <span className="text-[10px] font-mono bg-error/10 border border-error/30 text-error px-2 py-0.5 rounded">
                Ticket #CC-3652 covers this zone
              </span>
            )}
          </div>

        </div>

      </div>
    </GlassCard>
  );
};
export default AIResultCard;
