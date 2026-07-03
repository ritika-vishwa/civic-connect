import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useIssues } from '../context/IssueContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { GlassCard } from '../components/ui/GlassCard';

export const Map: React.FC = () => {
  const navigate = useNavigate();
  const { issues } = useIssues();
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Filter logic
  const filteredIssues = issues.filter(issue => {
    const matchCategory = selectedCategory === 'All' || issue.category === selectedCategory;
    const matchSeverity = selectedSeverity === 'All' || issue.severity === selectedSeverity;
    const matchStatus = selectedStatus === 'All' || issue.status === selectedStatus;
    return matchCategory && matchSeverity && matchStatus;
  });

  return (
    <div className="relative w-full h-[calc(100vh-140px)] rounded-2xl overflow-hidden border border-white/10 animate-fade-in-up">
      {/* Interactive Map */}
      <MapContainer
        center={[40.7580, -73.9855]}
        zoom={13}
        className="w-full h-full z-10"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {filteredIssues.map(issue => (
          <Marker 
            key={issue.id} 
            position={[issue.location.lat, issue.location.lng]}
          >
            <Popup>
              <div className="font-sans text-xs p-1 max-w-[200px]">
                <div className="flex justify-between items-center gap-2 mb-1">
                  <span className="font-mono text-primary-container font-bold">{issue.id}</span>
                  <StatusBadge value={issue.severity} type="severity" />
                </div>
                <h4 className="font-bold text-white uppercase">{issue.title}</h4>
                <p className="text-white/60 line-clamp-2 mt-1 font-light">{issue.description}</p>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10">
                  <StatusBadge value={issue.status} type="status" />
                  <button 
                    onClick={() => navigate(`/issues/${issue.id}`)}
                    className="text-primary-container hover:text-white transition-colors underline font-bold cursor-pointer"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Filter Overlay */}
      <div className="absolute top-4 left-4 z-20 w-80 max-w-[90vw] pointer-events-none">
        <GlassCard noHover className="p-5 border border-primary-container/30 bg-[#031427]/85 backdrop-blur-xl pointer-events-auto shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-primary-container/20 pb-3">
            <span className="material-symbols-outlined text-primary-container text-xl drop-shadow-[0_0_5px_#00f0ff]">filter_alt</span>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Geospatial Filters</h4>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-glass w-full rounded-lg px-3 py-2 text-xs font-mono"
            >
              <option value="All">All Categories</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Waste">Waste</option>
              <option value="Traffic">Traffic</option>
              <option value="Safety">Safety</option>
              <option value="Noise">Noise</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="input-glass w-full rounded-lg px-3 py-2 text-xs font-mono"
            >
              <option value="All">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-glass w-full rounded-lg px-3 py-2 text-xs font-mono"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="AI Reviewing">AI Reviewing</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Result Count Indicator */}
          <div className="text-[9px] font-mono text-primary-container uppercase tracking-wider pt-2 border-t border-white/10 flex justify-between">
            <span>Filtered Markers</span>
            <span className="font-bold">{filteredIssues.length} found</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
export default Map;
