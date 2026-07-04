import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const SupportModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { showToast } = useNotification();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-support-modal', handleOpen);
    return () => window.removeEventListener('open-support-modal', handleOpen);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'support_tickets'), {
        name: user?.name || 'Anonymous User',
        email: user?.email || 'No email provided',
        subject,
        message,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      
      showToast('Support ticket sent! The admins will review it shortly.', 'success');
      setIsOpen(false);
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Support error:', error);
      showToast('Failed to send support ticket. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#000f21]/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass-card rounded-2xl border border-primary-container/40 shadow-[0_0_40px_rgba(0,240,255,0.15)] bg-[#031427] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-primary-container/10 to-transparent">
              <h2 className="text-xl font-display-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">support_agent</span>
                Contact Support
              </h2>
              <p className="text-xs text-white/50 font-mono mt-1">Reach out to the website administrators.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Issue Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="E.g. Bug report, Feature request..."
                  required
                  className="input-glass w-full rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Description</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  required
                  className="input-glass w-full rounded-xl px-4 py-3 text-sm h-32 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="primary-btn px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  )}
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
