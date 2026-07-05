import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

export interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  type: 'flood' | 'road_closure' | 'water_supply' | 'power_outage' | 'other';
  severity: 'info' | 'warning' | 'critical';
  affectedAreas: string;
  createdAt: string;
  createdBy: string;
  authorName: string;
  active: boolean;
}

export const EmergencyAlertsBanner: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const storageKey = `dismissed_civic_alerts_${user?.uid || 'guest'}`;

  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setDismissedIds(JSON.parse(saved));
      } else {
        setDismissedIds([]);
      }
    } catch {
      setDismissedIds([]);
    }
  }, [storageKey]);

  useEffect(() => {
    const q = query(
      collection(db, 'emergency_alerts'),
      where('active', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmergencyAlert[];
      
      // Sort locally to bypass Firebase composite index requirements
      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setAlerts(fetched);
    }, (err) => {
      console.error("Failed to fetch emergency alerts:", err);
    });

    return () => unsubscribe();
  }, []);

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const activeAlerts = alerts.filter(alert => !dismissedIds.includes(alert.id));

  // Hide the global banner at the top for officials and admins
  if (user && (user.role === 'official' || user.role === 'admin')) return null;

  if (activeAlerts.length === 0) return null;

  const getSeverityStyle = (severity: EmergencyAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-error/20 border-error/50 shadow-[0_0_15px_rgba(255,180,171,0.2)]',
          icon: 'error',
          iconColor: 'text-error',
          pulse: 'bg-error',
          badgeColor: 'bg-error/30 text-error'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]',
          icon: 'warning',
          iconColor: 'text-yellow-400',
          pulse: 'bg-yellow-400',
          badgeColor: 'bg-yellow-500/20 text-yellow-400'
        };
      default:
        return {
          bg: 'bg-primary-container/20 border-primary-container/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]',
          icon: 'info',
          iconColor: 'text-primary-container',
          pulse: 'bg-primary-container',
          badgeColor: 'bg-primary-container/20 text-primary-container'
        };
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-fade-in-up">
      {activeAlerts.map(alert => {
        const style = getSeverityStyle(alert.severity);
        return (
          <div
            key={alert.id}
            className={`w-full rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between items-start backdrop-blur-md transition-all relative overflow-hidden ${style.bg}`}
          >
            {/* Pulsing Status dot indicator */}
            <div className="absolute top-4 right-4 sm:static flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.pulse}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${style.pulse}`}></span>
              </span>
            </div>

            {/* Content Details */}
            <div className="flex-1 flex gap-3.5 items-start">
              <span className={`material-symbols-outlined text-2xl shrink-0 mt-0.5 ${style.iconColor}`}>
                {style.icon}
              </span>
              <div className="flex flex-col gap-1 pr-6 sm:pr-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[9px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded border border-white/10 ${style.badgeColor}`}>
                    {alert.type.replace('_', ' ')}
                  </span>
                  <span className="text-white/40 font-mono text-[9px]">
                    BY {alert.authorName.toUpperCase()}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white uppercase tracking-tight mt-1">
                  {alert.title}
                </h4>
                <p className="text-xs text-white/80 font-light leading-relaxed mt-0.5">
                  {alert.description}
                </p>
                {alert.affectedAreas && (
                  <p className="text-[10px] text-white/50 font-mono mt-1">
                    AFFECTED AREAS: {alert.affectedAreas.toUpperCase()}
                  </p>
                )}
              </div>
            </div>

            {/* Dismiss CTA Button */}
            <button
              onClick={() => handleDismiss(alert.id)}
              className="w-full sm:w-auto text-center font-mono text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white bg-white/5 sm:bg-transparent border border-white/10 sm:border-none py-2 rounded-lg sm:py-0 shrink-0 self-stretch sm:self-center transition-colors cursor-pointer hover:bg-white/10 sm:hover:bg-transparent sm:px-2"
              title="Acknowledge Alert"
            >
              Dismiss
            </button>
          </div>
        );
      })}
    </div>
  );
};
