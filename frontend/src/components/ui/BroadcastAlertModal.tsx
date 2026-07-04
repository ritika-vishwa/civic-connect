import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { CustomSelect } from './CustomSelect';

interface BroadcastAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BroadcastAlertModal: React.FC<BroadcastAlertModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'flood' | 'road_closure' | 'water_supply' | 'power_outage' | 'other'>('other');
  const [severity, setSeverity] = useState<'info' | 'warning' | 'critical'>('warning');
  const [affectedAreas, setAffectedAreas] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please fill out the Title and Description fields.', 'warning');
      return;
    }

    if (!user) {
      showToast('You must be logged in to broadcast an alert.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'emergency_alerts'), {
        title: title.trim(),
        description: description.trim(),
        type,
        severity,
        affectedAreas: affectedAreas.trim(),
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
        authorName: user.name || 'Municipal Authority',
        active: true
      });

      showToast('Emergency alert broadcasted successfully!', 'success');
      
      // Reset form fields
      setTitle('');
      setDescription('');
      setType('other');
      setSeverity('warning');
      setAffectedAreas('');
      
      onClose();
    } catch (err: any) {
      console.error("Failed to broadcast civic alert:", err);
      showToast('Failed to broadcast alert. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#00060d]/80 backdrop-blur-sm cursor-pointer" 
        onClick={onClose}
      />
      
      {/* Modal Pane */}
      <div className="relative w-full max-w-lg bg-[#031427]/90 border border-primary-container/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.15)] flex flex-col gap-6 animate-scale-in overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h3 className="font-display-lg text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">campaign</span>
            Broadcast Emergency Alert
          </h3>
          <button 
            onClick={onClose} 
            className="text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] font-bold text-primary-container uppercase tracking-wider">Alert Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Water Supply Outage - Sector 3"
              className="w-full bg-[#00060d]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:border-primary-container focus:outline-none transition-colors"
            />
          </div>

          {/* Type & Severity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-bold text-primary-container uppercase tracking-wider">Alert Type</label>
              <CustomSelect
                value={type}
                onChange={(val) => setType(val as any)}
                options={[
                  { label: 'Flooding', value: 'flood' },
                  { label: 'Road Closure', value: 'road_closure' },
                  { label: 'Water Interruption', value: 'water_supply' },
                  { label: 'Power Outage', value: 'power_outage' },
                  { label: 'Urgent Announcement', value: 'other' }
                ]}
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-bold text-primary-container uppercase tracking-wider">Severity Level</label>
              <CustomSelect
                value={severity}
                onChange={(val) => setSeverity(val as any)}
                options={[
                  { label: 'Information', value: 'info' },
                  { label: 'Warning', value: 'warning' },
                  { label: 'Critical / Emergency', value: 'critical' }
                ]}
              />
            </div>
          </div>

          {/* Affected Areas */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] font-bold text-primary-container uppercase tracking-wider">Affected Areas</label>
            <input
              type="text"
              value={affectedAreas}
              onChange={(e) => setAffectedAreas(e.target.value)}
              placeholder="e.g., Sector 3, Central Heights"
              className="w-full bg-[#00060d]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:border-primary-container focus:outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] font-bold text-primary-container uppercase tracking-wider">Alert Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a description of the emergency, current status, and instructions for citizens..."
              className="w-full bg-[#00060d]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:border-primary-container focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-white/10 text-white/80 hover:text-white text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-error text-black text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors shadow-[0_0_15px_rgba(255,180,171,0.2)] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Broadcasting...' : 'Broadcast Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
