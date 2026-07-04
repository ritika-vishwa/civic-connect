import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useIssues } from '../context/IssueContext';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { canViewAnalytics } from '../context/permissions';

// Fixed leaflet icon issue in production/bundlers
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { issues, loading } = useIssues();
  const { user } = useAuth();

  // For citizens: compute MY issues (by UID or email). For officials/admins: city-wide.
  const isCitizen = user?.role === 'citizen' || user?.role === 'moderator';
  const myIssues = isCitizen
    ? issues.filter((issue) => {
        if (issue.authorId && issue.authorId === user?.uid) return true;
        if (issue.authorEmail && issue.authorEmail === user?.email) return true;
        return false;
      })
    : issues;

  // Calculate metrics
  const totalReports = isCitizen ? myIssues.length : issues.length;
  const resolvedCount = isCitizen
    ? myIssues.filter(i => i.status === 'Resolved').length
    : issues.filter(i => i.status === 'Resolved').length;
  const criticalCount = isCitizen
    ? myIssues.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length
    : issues.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;

  // Chart data calculation
  const categoryCounts = issues.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(categoryCounts).map(cat => ({
    name: cat.substring(0, 5),
    fullName: cat,
    Count: categoryCounts[cat]
  }));

  // Activity events (compiled from issue history)
  const allHistory = issues.flatMap(issue =>
    issue.history.map(h => ({
      ...h,
      issueId: issue.id,
      issueTitle: issue.title,
      category: issue.category
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const recentHistory = allHistory.slice(0, 4);

  const showAnalytics = canViewAnalytics(user);

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="col-span-1 lg:col-span-7 h-96 rounded-2xl border border-white/5 skeleton-shimmer"></div>
          <div className="col-span-1 lg:col-span-5 h-96 rounded-2xl border border-white/5 skeleton-shimmer"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 animate-fade-in-up">
        <div>
          <h1 className="font-display-lg text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Network Overview
          </h1>
          <p className="text-primary-container/80 font-mono text-sm mt-2 uppercase tracking-widest">
            Real-time pulse of urban activity and civic reports.
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
            <span className="material-symbols-outlined text-[80px] text-primary-container">report</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-primary-container/20 p-2 rounded-lg border border-primary-container/30">
              <span className="material-symbols-outlined text-primary-container text-sm drop-shadow-[0_0_8px_#00f0ff]">trending_up</span>
            </div>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary-container font-bold">{isCitizen ? 'My Reports' : 'Total Reports'}</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="font-display-lg text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{totalReports}</h3>
            <span className="text-primary-container text-sm font-bold bg-primary-container/10 px-2 py-1 rounded border border-primary-container/20">+12%</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-auto">
            <div className="h-full bg-gradient-to-r from-primary-container to-[#0088ff] w-[75%] shadow-[0_0_10px_#00f0ff]"></div>
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
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-white font-bold">Resolved</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="font-display-lg text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{resolvedCount}</h3>
            <span className="text-white text-sm font-bold bg-white/10 px-2 py-1 rounded border border-white/20">+8%</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-auto">
            <div className="h-full bg-white w-[60%] shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
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
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-error font-bold">Critical Pending</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="font-display-lg text-5xl font-black text-error drop-shadow-[0_0_15px_rgba(255,180,171,0.4)]">{criticalCount}</h3>
            <span className="text-white/70 text-sm font-bold bg-white/5 px-2 py-1 rounded border border-white/10">-4%</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-auto">
            <div className="h-full bg-error w-[20%] shadow-[0_0_10px_#ffb4ab]"></div>
          </div>
        </div>

      </div>

      {/* Bento Layout Grid for Charts and Maps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Categories Bar Chart Card */}
        <div className="col-span-1 lg:col-span-7 glass-card rounded-2xl p-6 md:p-8 flex flex-col min-h-[450px] animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display-lg text-xl font-black text-white uppercase tracking-tight">Issue Breakdown</h3>
            {showAnalytics && (
              <button
                onClick={() => navigate('/analytics')}
                className="text-primary-container hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2 bg-primary-container/10 px-4 py-2 rounded-lg border border-primary-container/30"
              >
                Advanced Analytics <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            )}
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.4)" 
                  fontFamily="monospace"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.4)" 
                  fontFamily="monospace"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  content={({ active, payload }) => {
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
                  }}
                />
                <Bar 
                  dataKey="Count" 
                  fill="#00f0ff" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={50}
                  fillOpacity={0.6}
                  stroke="#00f0ff"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Map Preview Card */}
        <div className="col-span-1 lg:col-span-5 glass-card rounded-2xl p-2 flex flex-col min-h-[450px] relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="w-full h-full relative flex-grow rounded-xl overflow-hidden min-h-[320px]">
            <MapContainer 
              center={[40.7580, -73.9855]} 
              zoom={13} 
              scrollWheelZoom={false}
              className="w-full h-full min-h-[350px] absolute inset-0 z-10"
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              {issues.map(issue => (
                <Marker 
                  key={issue.id} 
                  position={[issue.location.lat, issue.location.lng]}
                >
                  <Popup>
                    <div className="font-sans text-xs p-1">
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span className="font-mono text-primary-container font-bold">{issue.id}</span>
                        <StatusBadge value={issue.severity} type="severity" />
                      </div>
                      <h4 className="font-bold text-white uppercase">{issue.title}</h4>
                      <p className="text-white/60 line-clamp-1 mt-1">{issue.description}</p>
                      <button 
                        onClick={() => navigate(`/issues/${issue.id}`)}
                        className="text-primary-container hover:text-white transition-colors underline font-bold mt-2 inline-block cursor-pointer"
                      >
                        Inspect Issue
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Overlay indicators */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <div className="bg-[#00060d]/85 backdrop-blur-md px-4 py-2 rounded-lg border border-primary-container/50 inline-flex items-center gap-3 pointer-events-auto shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-container shadow-[0_0_8px_#00f0ff]"></span>
                </span>
                <span className="text-xs font-mono font-bold text-primary-container uppercase tracking-widest">Live Map Preview</span>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 z-20">
              <button 
                onClick={() => navigate('/map')}
                className="bg-[#00060d]/80 hover:bg-primary-container/20 backdrop-blur-md px-4 py-2 text-xs font-bold uppercase tracking-widest text-white border border-primary-container/30 hover:border-primary-container rounded-lg transition-all shadow-[0_0_15px_rgba(0,240,255,0.1)] cursor-pointer"
              >
                Expand Map
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Activity Feed Section */}
      <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        <div className="flex justify-between items-center mb-6 border-b border-primary-container/20 pb-4">
          <h3 className="font-display-lg text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-container text-2xl drop-shadow-[0_0_8px_#00f0ff]">history</span>
            Recent Operations Log
          </h3>
          <button 
            onClick={() => navigate('/my-complaints')}
            className="text-white/70 hover:text-primary-container transition-colors text-xs font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:border-primary-container/50"
          >
            All Reports
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {recentHistory.map((historyItem, idx) => {
            let catIcon = 'build';
            if (historyItem.category?.toLowerCase() === 'waste') catIcon = 'delete';
            else if (historyItem.category?.toLowerCase() === 'traffic') catIcon = 'traffic';
            else if (historyItem.category?.toLowerCase() === 'safety') catIcon = 'campaign';
            else if (historyItem.category?.toLowerCase() === 'noise') catIcon = 'volume_up';

            const elapsed = Math.round((Date.now() - new Date(historyItem.createdAt).getTime()) / (1000 * 60)); // in minutes
            let timeString = `${elapsed}m ago`;
            if (elapsed >= 60 * 24) timeString = `${Math.round(elapsed / (60 * 24))}d ago`;
            else if (elapsed >= 60) timeString = `${Math.round(elapsed / 60)}h ago`;

            return (
              <div 
                key={historyItem.id || idx}
                onClick={() => navigate(`/issues/${historyItem.issueId}`)}
                className="flex items-start gap-5 p-4 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-primary-container/20 group cursor-pointer"
              >
                <div className="mt-1 w-12 h-12 rounded-xl bg-[#00060d] flex items-center justify-center text-primary-container border border-primary-container/40 flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                  <span className="material-symbols-outlined text-[22px]">{catIcon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-base font-bold text-white uppercase tracking-tight group-hover:text-primary-container transition-colors">
                      {historyItem.issueTitle} - {historyItem.title}
                    </h4>
                    <span className="text-[10px] font-mono text-primary-container whitespace-nowrap bg-primary-container/10 px-2 py-0.5 rounded border border-primary-container/20">
                      {timeString.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-white/70 mt-1 font-light line-clamp-2">
                    {historyItem.text}
                  </p>
                  <div className="flex gap-3 mt-3">
                    <span className="px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-widest bg-white/10 text-white border border-white/20">
                      {historyItem.category}
                    </span>
                    <StatusBadge value={historyItem.status} type="status" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
