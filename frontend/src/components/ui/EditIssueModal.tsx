import React, { useState } from 'react';
import { Issue } from '../../context/IssueContext';
import { GlassCard } from './GlassCard';
import { CustomSelect } from './CustomSelect';

interface EditIssueModalProps {
  isOpen: boolean;
  issue: Issue;
  onSave: (updates: Partial<Issue>) => Promise<void>;
  onCancel: () => void;
}

export const EditIssueModal: React.FC<EditIssueModalProps> = ({ isOpen, issue, onSave, onCancel }) => {
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description);
  const [category, setCategory] = useState(issue.category);
  const [severity, setSeverity] = useState(issue.severity);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({ title, description, category, severity });
      onCancel();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
      <GlassCard noHover overflowVisible className="w-full max-w-xl bg-[#031427] border-white/20 shadow-2xl p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">edit</span>
            Edit Report
          </h2>
          <button onClick={onCancel} className="text-white/50 hover:text-white transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-white/40 uppercase">Issue Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-glass w-full rounded-xl px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-white"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-white/40 uppercase">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-glass w-full rounded-xl px-4 py-3 text-xs leading-relaxed h-32 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-white/40 uppercase">Category</label>
              <CustomSelect
                value={category}
                onChange={(val) => setCategory(val)}
                options={['Potholes', 'Water Leaks', 'Broken Streetlights', 'Garbage Accumulation', 'Drainage Blockages', 'Road Damage', 'Sanitation Issues', 'Other']}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-white/40 uppercase">Severity</label>
              <CustomSelect
                value={severity}
                onChange={(val) => setSeverity(val as any)}
                options={['Low', 'Medium', 'High', 'Critical']}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-gradient-cyan px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Save Changes'}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
