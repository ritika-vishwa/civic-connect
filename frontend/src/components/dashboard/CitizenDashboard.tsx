import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useIssues } from '../../context/IssueContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../ui/StatusBadge';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { issues, loading } = useIssues();
  const { user } = useAuth();

  const myIssues = issues.filter((issue) => {
    if (issue.authorId && issue.authorId === user?.uid) return true;
    if (issue.authorEmail && issue.authorEmail === user?.email) return true;
    return false;
  });

  const totalReports = myIssues.length;
  const resolvedCount = myIssues.filter(i => i.status === 'Resolved').length;

  const allHistory = myIssues.flatMap(issue =>
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
        <div className="h-96 rounded-2xl border border-white/5 skeleton-shimmer"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 animate-fade-in-up">
        <div>
          <h1 className="font-display-lg text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            My Neighborhood
          </h1>
          <p className="text-primary-container/80 font-mono text-sm mt-2 uppercase tracking-widest">
            Your civic reports and local activity.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/report')}
            className="px-6 py-2.5 rounded-lg bg-primary-container text-[#00060d] text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
          >
            File New Report
          </button>
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
              <span className="material-symbols-outlined text-primary-container text-sm drop-shadow-[0_0_8px_#00f0ff]">description</span>
            </div>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary-container font-bold">My Reports</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="font-display-lg text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{totalReports}</h3>
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
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-auto">
            <div className="h-full bg-white w-[100%] shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
          </div>
        </div>

        {/* Card 3: Community Updates */}
        <div className="col-span-1 md:col-span-4 glass-card rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
            <span className="material-symbols-outlined text-[80px] text-primary-container">groups</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-primary-container/20 p-2 rounded-lg border border-primary-container/30">
              <span className="material-symbols-outlined text-primary-container text-sm drop-shadow-[0_0_8px_#ffb4ab]">notifications_active</span>
            </div>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary-container font-bold">Updates</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="font-display-lg text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{recentHistory.length}</h3>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-auto">
            <div className="h-full bg-primary-container w-[40%] shadow-[0_0_10px_#ffb4ab]"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Live Map Preview Card */}
        <div className="col-span-1 lg:col-span-7 glass-card rounded-2xl p-2 flex flex-col min-h-[450px] relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
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
              {issues.slice(0, 10).map(issue => (
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
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <div className="bg-[#00060d]/85 backdrop-blur-md px-4 py-2 rounded-lg border border-primary-container/50 inline-flex items-center gap-3 pointer-events-auto shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-container shadow-[0_0_8px_#00f0ff]"></span>
                </span>
                <span className="text-xs font-mono font-bold text-primary-container uppercase tracking-widest">Local Reports Map</span>
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

        {/* Recent Activity Feed Section */}
        <div className="col-span-1 lg:col-span-5 glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up flex flex-col" style={{ animationDelay: '0.6s' }}>
          <div className="flex justify-between items-center mb-6 border-b border-primary-container/20 pb-4">
            <h3 className="font-display-lg text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container text-2xl drop-shadow-[0_0_8px_#00f0ff]">history</span>
              My Recent Updates
            </h3>
            <button 
              onClick={() => navigate('/my-complaints')}
              className="text-white/70 hover:text-primary-container transition-colors text-xs font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:border-primary-container/50 cursor-pointer"
            >
              All Reports
            </button>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {recentHistory.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-white/5 border-dashed rounded-xl">
                <span className="material-symbols-outlined text-4xl text-white/20 mb-3">inbox</span>
                <p className="text-white/50 text-sm font-mono">No recent updates on your reports.</p>
              </div>
            ) : (
              recentHistory.map((historyItem, idx) => {
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
                        <h4 className="text-base font-bold text-white uppercase tracking-tight group-hover:text-primary-container transition-colors line-clamp-1">
                          {historyItem.issueTitle}
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
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
