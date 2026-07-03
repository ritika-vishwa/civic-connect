import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useNotification } from '../context/NotificationContext';
import { collection, onSnapshot, query, doc, updateDoc, writeBatch, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

interface NotificationLog {
  id: string;
  type: 'critical' | 'resolve' | 'alert' | 'system';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
}

export const Notifications: React.FC = () => {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const { showToast } = useNotification();

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('time', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NotificationLog[];
      setLogs(fetched);
    }, (error) => {
      console.error("Error fetching notifications:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const batch = writeBatch(db);
      logs.filter(log => !log.isRead).forEach(log => {
        const ref = doc(db, 'notifications', log.id);
        batch.update(ref, { isRead: true });
      });
      await batch.commit();
      showToast('All notifications marked as read', 'success');
    } catch (error) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const handleToggleRead = async (id: string) => {
    try {
      const ref = doc(db, 'notifications', id);
      await updateDoc(ref, { isRead: true });
    } catch (error) {
      console.error("Failed to mark read:", error);
    }
  };

  const getLogColor = (type: NotificationLog['type']) => {
    switch (type) {
      case 'critical': return 'text-error border-error-container/30 bg-error/10';
      case 'resolve': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'alert': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'system': return 'text-primary-container border-primary-container/30 bg-primary-container/10';
      default: return 'text-white border-white/30 bg-white/10';
    }
  };

  const getLogIcon = (type: NotificationLog['type']) => {
    switch (type) {
      case 'critical': return 'warning';
      case 'resolve': return 'check_circle';
      case 'alert': return 'notifications_active';
      case 'system': return 'terminal';
      default: return 'info';
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 animate-fade-in-up">
        <div>
          <h1 className="font-display-lg text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Notification Log
          </h1>
          <p className="text-primary-container/80 font-mono text-sm mt-2 uppercase tracking-widest">
            Real-time feed of alerts, resolutions, and system events.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="text-white/70 hover:text-primary-container transition-colors text-xs font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:border-primary-container/50 cursor-pointer"
        >
          Mark All Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-4">
        {logs.length === 0 && (
          <div className="text-center text-white/50 font-mono text-sm mt-10">No notifications found.</div>
        )}
        {logs.map((log, idx) => (
          <div 
            key={log.id} 
            className="animate-fade-in-up" 
            style={{ animationDelay: `${(idx + 1) * 0.1}s` }}
            onClick={() => handleToggleRead(log.id)}
          >
            <GlassCard 
              noHover 
              className={`p-5 flex items-start gap-5 border transition-all cursor-pointer ${
                log.isRead 
                  ? 'border-white/5 bg-black/10 opacity-70' 
                  : 'border-primary-container/30 bg-[#000f21]/20 shadow-[0_0_15px_rgba(0,240,255,0.05)]'
              }`}
            >
              {/* Type Icon */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${getLogColor(log.type)}`}>
                <span className="material-symbols-outlined text-[20px]">{getLogIcon(log.type)}</span>
              </div>

              {/* Text info */}
              <div className="flex-grow">
                <div className="flex justify-between items-start gap-4">
                  <h4 className={`text-base font-bold uppercase tracking-tight ${log.isRead ? 'text-white/70' : 'text-white'}`}>
                    {log.title}
                  </h4>
                  <span className="text-[9px] font-mono text-white/40 whitespace-nowrap">{formatTime(log.time)}</span>
                </div>
                <p className="text-xs text-white/70 mt-1 font-light leading-relaxed">
                  {log.description}
                </p>
              </div>

              {/* Unread circle */}
              {!log.isRead && (
                <span className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_#00f0ff] self-center shrink-0"></span>
              )}

            </GlassCard>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Notifications;
