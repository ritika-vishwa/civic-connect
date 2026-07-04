import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useIssues } from '../../context/IssueContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../ui/StatusBadge';
import { BroadcastAlertModal } from '../ui/BroadcastAlertModal';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNotification } from '../../context/NotificationContext';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { issues, loading } = useIssues();
  const { user } = useAuth();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const { showToast } = useNotification();

  useEffect(() => {
    const q = query(
      collection(db, 'emergency_alerts'),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActiveAlerts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.error("Failed to fetch active alerts:", err);
    });
    return () => unsubscribe();
  }, []);

  const handleDeactivateAlert = async (id: string) => {
    try {
      const alertRef = doc(db, 'emergency_alerts', id);
      await updateDoc(alertRef, { active: false });
      showToast('Emergency alert deactivated for everyone.', 'success');
    } catch (err) {
      console.error("Failed to deactivate alert:", err);
      showToast('Failed to deactivate alert. Please try again.', 'error');
    }
  };

  const totalReports = issues.length;
  const resolvedCount = issues.filter(i => i.status === 'Resolved').length;
  const criticalCount = issues.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;

  const categoryCounts = issues.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(categoryCounts).map(cat => ({
    name: cat.substring(0, 5),
    fullName: cat,
    Count: categoryCounts[cat]
  }));

  const allHistory = issues.flatMap(issue =>
    issue.history.map(h => ({
      ...h,
      issueId: issue.id,
      issueTitle: issue.title,
      category: issue.category
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const recentHistory = allHistory.slice(0, 4);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full">
        <div className="border-b border-white/10 pb-6">
          <div className="h-10 w-72 skeleton-shimmer rounded-xl mb-3"></div>
          <div className="h-3 w-80 skeleton-shimmer rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {[0, 1, 2].map(i => (
            <div key={i} className="col-span-1 md:col-span-4 h-36 rounded-2xl border border-white/5 skeleton-shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 animate-fade-in-up">
        <div>
          <h1 className="font-display-lg text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Platform Command
          </h1>
          <p className="text-primary-container/80 font-mono text-sm mt-2 uppercase tracking-widest">
            City-wide Civic Operations Overview.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#00060d]/80 backdrop-blur-md rounded-xl p-1.5 border border-primary-container/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
          <button className="px-5 py-2 rounded-lg bg-primary-container/20 text-primary-container text-xs font-bold uppercase tracking-widest border border-primary-container/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]">Live</button>
          <button className="px-5 py-2 rounded-lg text-white/70 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">7D</button>
          <button className="px-5 py-2 rounded-lg text-white/70 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">30D</button>
        </div>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Card 1: Total Reports */}
        <div className="col-span-1 md:col-span-4 glass-card rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <span className="material-symbols-outlined text-[80px] text-primary-container">domain</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-primary-container/20 p-2 rounded-lg border border-primary-container/30">
              <span className="material-symbols-outlined text-primary-container text-sm drop-shadow-[0_0_8px_#00f0ff]">trending_up</span>
            </div>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary-container font-bold">Total Platform Reports</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="font-display-lg text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{totalReports}</h3>
            <span className="text-primary-container text-sm font-bold bg-primary-container/10 px-2 py-1 rounded border border-primary-container/20">+12%</span>
          </div>
        </div>

        {/* Card 2: Resolved */}
        <div className="col-span-1 md:col-span-4 glass-card rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <span className="material-symbols-outlined text-[80px] text-white">check_circle</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg border border-white/20">
              <span className="material-symbols-outlined text-white text-sm">task_alt</span>
            </div>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-white font-bold">Platform Resolved</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="font-display-lg text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{resolvedCount}</h3>
            <span className="text-white text-sm font-bold bg-white/10 px-2 py-1 rounded border border-white/20">+8%</span>
          </div>
        </div>

        {/* Card 3: Critical Pending */}
        <div className="col-span-1 md:col-span-4 glass-card rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <span className="material-symbols-outlined text-[80px] text-error">warning</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-error/20 p-2 rounded-lg border border-error/30">
              <span className="material-symbols-outlined text-error text-sm drop-shadow-[0_0_8px_#ffb4ab]">pending_actions</span>
            </div>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-error font-bold">City-Wide Critical</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="font-display-lg text-5xl font-black text-error drop-shadow-[0_0_15px_rgba(255,180,171,0.4)]">{criticalCount}</h3>
            <span className="text-white/70 text-sm font-bold bg-white/5 px-2 py-1 rounded border border-white/10">-4%</span>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="col-span-1 lg:col-span-7 glass-card rounded-2xl p-6 md:p-8 flex flex-col min-h-[300px] md:min-h-[450px] animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display-lg text-xl font-black text-white uppercase tracking-tight">Issue Breakdown</h3>
            <button
              onClick={() => navigate('/analytics')}
              className="text-primary-container hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2 bg-primary-container/10 px-4 py-2 rounded-lg border border-primary-container/30 cursor-pointer"
            >
              Advanced Analytics <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontFamily="monospace" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontFamily="monospace" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#00060d] border border-primary-container/40 p-3 rounded-lg font-mono text-xs shadow-lg">
                        <p className="font-bold text-white uppercase">{data.fullName}</p>
                        <p className="text-primary-container mt-1">Tickets: {data.Count}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Bar dataKey="Count" fill="#00f0ff" radius={[4, 4, 0, 0]} maxBarSize={50} fillOpacity={0.6} stroke="#00f0ff" strokeWidth={1} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-5 glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up flex flex-col" style={{ animationDelay: '0.6s' }}>
          <div className="flex justify-between items-center mb-6 border-b border-primary-container/20 pb-4">
            <h3 className="font-display-lg text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container text-2xl drop-shadow-[0_0_8px_#00f0ff]">admin_panel_settings</span>
              System Management
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <button onClick={() => navigate('/admin')} className="w-full text-left bg-[#00060d]/50 hover:bg-[#00060d] border border-primary-container/30 hover:border-primary-container p-4 rounded-xl transition-all cursor-pointer group flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white uppercase tracking-widest text-sm group-hover:text-primary-container transition-colors">Admin Workspace</h4>
                <p className="text-xs text-white/50 font-mono mt-1">Manage users, officials, and platform settings.</p>
              </div>
              <span className="material-symbols-outlined text-primary-container">chevron_right</span>
            </button>
            <button onClick={() => navigate('/map')} className="w-full text-left bg-[#00060d]/50 hover:bg-[#00060d] border border-primary-container/30 hover:border-primary-container p-4 rounded-xl transition-all cursor-pointer group flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white uppercase tracking-widest text-sm group-hover:text-primary-container transition-colors">City-Wide Heatmap</h4>
                <p className="text-xs text-white/50 font-mono mt-1">View the macro-level map of all active reports.</p>
              </div>
              <span className="material-symbols-outlined text-primary-container">map</span>
            </button>
            <button onClick={() => setIsAlertModalOpen(true)} className="w-full text-left bg-error/10 hover:bg-error/25 border border-error/30 hover:border-error p-4 rounded-xl transition-all cursor-pointer group flex items-center justify-between">
              <div>
                <h4 className="font-bold text-error uppercase tracking-widest text-sm group-hover:text-white transition-colors">Broadcast Emergency Alert</h4>
                <p className="text-xs text-white/50 font-mono mt-1">Send a city-wide announcement regarding civic closures/emergencies.</p>
              </div>
              <span className="material-symbols-outlined text-error">campaign</span>
            </button>

            {/* Active Broadcasts Panel */}
            <div className="mt-4 p-4 border border-error/20 rounded-xl bg-error/5">
              <h4 className="font-bold text-white uppercase tracking-widest text-xs mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-error text-sm">campaign</span>
                Active Broadcasts
              </h4>
              <div className="flex flex-col gap-3">
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-4 text-white/40 font-mono text-[9px] border border-white/5 border-dashed rounded-lg">
                    No active emergency alerts.
                  </div>
                ) : (
                  activeAlerts.map(alert => (
                    <div key={alert.id} className="p-3 rounded-lg bg-black/30 border border-white/5 flex flex-col gap-1.5">
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-bold text-white text-[11px] uppercase tracking-wide line-clamp-1">{alert.title}</span>
                        <span className="text-[8px] font-mono uppercase text-error px-1 bg-error/10 border border-error/20 rounded shrink-0">{alert.severity}</span>
                      </div>
                      <p className="text-[10px] text-white/60 leading-normal line-clamp-2">{alert.description}</p>
                      <button
                        onClick={() => handleDeactivateAlert(alert.id)}
                        className="mt-1 w-full text-center py-1 rounded bg-error/20 hover:bg-error/30 border border-error/40 text-error text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-colors"
                      >
                        Deactivate Alert
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <BroadcastAlertModal 
        isOpen={isAlertModalOpen} 
        onClose={() => setIsAlertModalOpen(false)} 
      />
    </div>
  );
};
