import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useIssues, Issue } from '../context/IssueContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { CustomSelect } from '../components/ui/CustomSelect';
import { canUpdateIssueStatus, canAssignWorkers } from '../context/permissions';

export const OfficerWorkspace: React.FC = () => {
  const { issues, updateStatus, assignWorker } = useIssues();
  const { user } = useAuth();
  const { showToast } = useNotification();

  // Helper to extract locality/sector from address
  const getLocality = (address: string) => {
    if (!address) return 'Downtown';
    const sectorMatch = address.match(/Sector\s+\d+/i);
    if (sectorMatch) return sectorMatch[0];
    const commonNames = ['Downtown', 'Broadway', 'Central Park', 'Greenwood', 'Oakridge', 'Westside', 'Eastside'];
    for (const name of commonNames) {
      if (address.toLowerCase().includes(name.toLowerCase())) {
        return name;
      }
    }
    const firstSegment = address.split(',')[0].trim();
    return firstSegment.length < 20 ? firstSegment : 'Downtown';
  };

  const calculatePriorityScore = (issue: Issue) => {
    // 1. Severity (40%)
    let severityScore = 10;
    if (issue.severity === 'Critical') severityScore = 40;
    else if (issue.severity === 'High') severityScore = 30;
    else if (issue.severity === 'Medium') severityScore = 20;

    // 2. Support Count (30%)
    const supports = issue.supportedBy?.length || issue.supportCount || 0;
    const supportScore = Math.min(30, supports * 5);

    // 3. Locality Weight (15%)
    let localityScore = 5;
    const loc = getLocality(issue.location?.address || '');
    if (['downtown', 'broadway'].includes(loc.toLowerCase())) {
      localityScore = 15;
    } else if (['sector 1', 'sector 3', 'central park'].includes(loc.toLowerCase())) {
      localityScore = 10;
    }

    // 4. Proximity/Description Keywords (15%)
    let keywordScore = 5;
    const keywords = ['school', 'hospital', 'transit', 'station', 'highway', 'subway', 'metro', 'park', 'main road', 'traffic lights', 'clinic', 'emergency'];
    const descLower = (issue.description || '').toLowerCase();
    for (const kw of keywords) {
      if (descLower.includes(kw)) {
        keywordScore = 15;
        break;
      }
    }

    return {
      total: severityScore + supportScore + localityScore + keywordScore,
      breakdown: {
        severity: severityScore,
        support: supportScore,
        locality: localityScore,
        keyword: keywordScore
      }
    };
  };

  // Filters logic — officers see only their department by default
  const defaultDept = user?.role === 'official' && user?.department ? user.department : 'All';
  const [filterDepartment, setFilterDepartment] = useState<string>(defaultDept);
  const [sortBy, setSortBy] = useState<'priority' | 'newest' | 'severity' | 'support'>('priority');

  // Update inputs
  const [statusVal, setStatusVal] = useState<Issue['status']>('In Progress');
  const [updateText, setUpdateText] = useState('');
  const [resolutionImg, setResolutionImg] = useState('');
  const [workerName, setWorkerName] = useState('');

  // Departments list - officials are restricted to their own department
  const departments = user?.role === 'official' && user?.department 
    ? [user.department] 
    : ['All', 'Public Works', 'Sanitation', 'Traffic Control', 'Urban Operations'];

  // Workers mock data
  const workers = ['Robert Carter', 'Lisa Wong', 'David Brooks', 'Sarah Jenkins', 'Marcus Vance'];

  const filtered = issues.filter(issue => {
    // Strictly restrict officials to their department
    if (user?.role === 'official' && user?.department) {
      if (issue.department !== user.department) return false;
    }
    const dept = filterDepartment === 'All' ? 'All' : filterDepartment;
    const matchesDept = dept === 'All' || issue.department === dept;
    const isNotClosed = issue.status !== 'Closed';
    return matchesDept && isNotClosed;
  });

  const processedIssues = filtered.map(issue => ({
    ...issue,
    priorityInfo: calculatePriorityScore(issue)
  })).sort((a, b) => {
    if (sortBy === 'priority') {
      return b.priorityInfo.total - a.priorityInfo.total;
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'severity') {
      const sevWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return (sevWeight[b.severity] || 0) - (sevWeight[a.severity] || 0);
    }
    if (sortBy === 'support') {
      return (b.supportedBy?.length || b.supportCount || 0) - (a.supportedBy?.length || a.supportCount || 0);
    }
    return 0;
  });

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Selected issue
  const activeIssue = processedIssues.find(i => i.id === selectedIssueId) || processedIssues[0];

  const canUpdateActive = canUpdateIssueStatus(user, activeIssue);
  const canAssign = canAssignWorkers(user);

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIssue || !updateText.trim()) {
      showToast('Please provide update logs', 'warning');
      return;
    }

    updateStatus(activeIssue.id, statusVal, updateText, resolutionImg || undefined);
    setUpdateText('');
    setResolutionImg('');
    showToast(`Status updated successfully to ${statusVal}`, 'success');
  };

  const handleAssignWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIssue || !workerName) {
      showToast('Please select a worker', 'warning');
      return;
    }

    assignWorker(activeIssue.id, workerName, activeIssue.department);
    setWorkerName('');
    showToast(`Assigned worker: ${workerName}`, 'success');
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in-up">
      
      {/* Filters header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container drop-shadow-[0_0_5px_#00f0ff]">assignment_turned_in</span>
            Officer Workspace Portal
          </h2>
          <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mt-0.5">
            Active Department: {user?.department || 'Public Works'} Operations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-white/40 uppercase">Queue:</span>
            <CustomSelect
              value={filterDepartment}
              onChange={(val) => setFilterDepartment(val)}
              options={departments}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-white/40 uppercase">Sort:</span>
            <CustomSelect
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              options={[
                { label: 'Smart Priority', value: 'priority' },
                { label: 'Date Reported', value: 'newest' },
                { label: 'Severity', value: 'severity' },
                { label: 'Support Count', value: 'support' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Left Column: List of assigned issues (4 cols) */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-4 max-h-[400px] lg:max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
          {processedIssues.map(issue => {
            const isActive = issue.id === activeIssue?.id;
            return (
              <div 
                key={issue.id}
                onClick={() => {
                  setSelectedIssueId(issue.id);
                  setStatusVal(issue.status);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
                  isActive 
                    ? 'bg-primary-container/10 border-primary-container/40 shadow-[0_0_15px_rgba(0,240,255,0.1)]' 
                    : 'bg-[#031427]/40 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate">{issue.title}</h4>
                  <StatusBadge value={issue.severity} type="severity" />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-primary-container font-black">{issue.id}</span>
                    <span className="text-[9px] font-mono text-white/40">|</span>
                    <span className="text-[9px] font-mono text-yellow-400 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">★ {issue.priorityInfo.total} pts</span>
                  </div>
                  <StatusBadge value={issue.status} type="status" />
                </div>
              </div>
            );
          })}
          {processedIssues.length === 0 && (
            <div className="text-center py-10 font-mono text-[10px] text-white/40 uppercase border border-white/5 rounded-xl">
              No active assignments in this department.
            </div>
          )}
        </div>

        {/* Center/Right Details and Action console (8 cols) */}
        <div className="col-span-1 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-gutter overflow-y-auto h-full pr-1">
          
          {activeIssue ? (
            <>
              {/* Left Side details card */}
              <div className="flex flex-col gap-4">
                <GlassCard noHover className="p-5 border-white/10 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-primary-container text-xs font-bold">{activeIssue.id}</span>
                    <StatusBadge value={activeIssue.severity} type="severity" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wider">{activeIssue.title}</h3>
                    <p className="text-[10px] font-mono text-white/50 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      {activeIssue.location.address}
                    </p>
                  </div>
                  <p className="text-xs text-white/80 font-light leading-relaxed leading-normal bg-black/20 p-3 rounded-lg border border-white/5">
                    {activeIssue.description}
                  </p>
                  <div className="w-full h-32 rounded-lg overflow-hidden border border-white/10">
                    <img 
                      src={activeIssue.image} 
                      alt="Ticket evidence" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=1200';
                      }}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="text-[9px] font-mono text-white/40 uppercase flex justify-between">
                    <span>Filed by: {activeIssue.citizenName}</span>
                    <span>Assigned worker: {activeIssue.assignedWorker || 'UNASSIGNED'}</span>
                  </div>
                </GlassCard>

                {/* Worker Assignment panel */}
                <GlassCard noHover overflowVisible className="relative z-50 p-5">
                  <h4 className="font-mono text-[10px] uppercase text-primary-container font-bold border-b border-white/5 pb-2 mb-3">
                    Assign Field Technician
                  </h4>
                  <form onSubmit={handleAssignWorkerSubmit} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono text-white/40 uppercase">Select Worker</label>
                      <CustomSelect
                        value={workerName}
                        onChange={(val) => setWorkerName(val)}
                        options={workers}
                        placeholder="Choose Worker..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn-gradient-cyan py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                    >
                      Dispatch Worker
                    </button>
                  </form>
                </GlassCard>

                {/* Smart Priority Diagnostics Panel */}
                <GlassCard noHover className="p-5 border-white/10 flex flex-col gap-3.5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h4 className="font-mono text-[10px] uppercase text-primary-container font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">analytics</span>
                      Smart Priority Diagnostics
                    </h4>
                    <span className="font-mono text-xs font-black text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30 animate-pulse">
                      ★ {activeIssue.priorityInfo.total} Pts
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2.5 font-mono text-[10px] text-white/70">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span>Severity (40% max):</span>
                        <span className="text-white font-bold">{activeIssue.priorityInfo.breakdown.severity} pts</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <div className="bg-red-400 h-full rounded-full" style={{ width: `${(activeIssue.priorityInfo.breakdown.severity / 40) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span>Citizen Endorsements (30%):</span>
                        <span className="text-white font-bold">{activeIssue.priorityInfo.breakdown.support} pts</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <div className="bg-blue-400 h-full rounded-full" style={{ width: `${(activeIssue.priorityInfo.breakdown.support / 30) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span>Locality Density (15%):</span>
                        <span className="text-white font-bold">{activeIssue.priorityInfo.breakdown.locality} pts</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${(activeIssue.priorityInfo.breakdown.locality / 15) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span>Public Proximity (15%):</span>
                        <span className="text-white font-bold">{activeIssue.priorityInfo.breakdown.keyword} pts</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <div className="bg-green-400 h-full rounded-full" style={{ width: `${(activeIssue.priorityInfo.breakdown.keyword / 15) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Right Side action console */}
              <div className="flex flex-col gap-4">
                
                {/* Status Update Form */}
                <GlassCard noHover overflowVisible className="relative z-40 p-5">
                  <h4 className="font-mono text-[10px] uppercase text-primary-container font-bold border-b border-white/5 pb-2 mb-3">
                    Update Ticket Dispatch Logs
                  </h4>
                  <form onSubmit={handleUpdateStatusSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono text-white/40 uppercase">Target Status</label>
                      <CustomSelect
                        value={statusVal}
                        onChange={(val) => setStatusVal(val as any)}
                        options={['Reported', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed']}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono text-white/40 uppercase">Resolution / Status Image URL (Optional)</label>
                      <input
                        type="text"
                        value={resolutionImg}
                        onChange={(e) => setResolutionImg(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="input-glass w-full rounded-lg px-3 py-2 text-xs font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono text-white/40 uppercase">Operations Update Log</label>
                      <textarea
                        value={updateText}
                        onChange={(e) => setUpdateText(e.target.value)}
                        placeholder="Detail the work carried out or status change log..."
                        className="input-glass w-full rounded-lg px-3 py-2 text-xs h-20 leading-relaxed"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="primary-btn py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                    >
                      Submit Progress Logs
                    </button>
                  </form>
                </GlassCard>

                {/* Map location Preview */}
                <div className="w-full h-44 rounded-xl overflow-hidden border border-white/10 relative">
                  <MapContainer 
                    center={[activeIssue.location.lat, activeIssue.location.lng]} 
                    zoom={15} 
                    scrollWheelZoom={false}
                    zoomControl={false}
                    className="w-full h-full"
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    />
                    <Marker position={[activeIssue.location.lat, activeIssue.location.lng]} />
                  </MapContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-2 py-20 text-center text-white/40 font-mono text-xs uppercase tracking-widest flex flex-col items-center justify-center border border-white/5 rounded-xl">
              <span className="material-symbols-outlined text-4xl mb-2">assignment_turned_in</span>
              Select a ticket from the left panel queue to inspect.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
export default OfficerWorkspace;
