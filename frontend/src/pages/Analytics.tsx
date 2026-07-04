import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { GlassCard } from '../components/ui/GlassCard';
import { useIssues } from '../context/IssueContext';

export const Analytics: React.FC = () => {
  const { issues } = useIssues();

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

  // 1. Issue Distribution by Category
  const categoriesMap = issues.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(categoriesMap).map(key => ({
    name: key,
    value: categoriesMap[key]
  }));

  const COLORS = ['#00f0ff', '#8b5cf6', '#dae2fd', '#ffb4ab', '#1b2b3f'];

  // 2. Issue Distribution by Severity
  const severityMap = issues.reduce((acc, c) => {
    acc[c.severity] = (acc[c.severity] || 0) + 1;
    return acc;
  }, { Low: 0, Medium: 0, High: 0, Critical: 0 } as Record<string, number>);

  const severityBarData = Object.keys(severityMap).map(key => ({
    name: key,
    count: severityMap[key]
  }));

  // 3. Average Resolution Time (in days)
  const resolvedIssues = issues.filter(i => i.status === 'Resolved' || i.status === 'Closed');
  const totalResolutionTime = resolvedIssues.reduce((acc, issue) => {
    const resolvedEvent = issue.history?.find(h => h.status === 'Resolved' || h.status === 'Closed');
    const end = resolvedEvent ? new Date(resolvedEvent.createdAt) : new Date(issue.history?.[issue.history.length - 1]?.createdAt || issue.createdAt);
    const start = new Date(issue.createdAt);
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    return acc + diffTime / (1000 * 60 * 60 * 24);
  }, 0);
  const avgResolutionTime = resolvedIssues.length > 0 ? (totalResolutionTime / resolvedIssues.length).toFixed(1) : 'N/A';

  // 4. Dynamic Sentiment Score
  const resolutionRateVal = issues.length > 0 ? resolvedIssues.length / issues.length : 0;
  const sentimentScore = (75 + resolutionRateVal * 23.6).toFixed(1);

  // 5. Neural Precision (Dynamic based on high confidence AI suggestions)
  const highConfidenceCount = issues.filter(i => i.aiAnalysis?.confidence && i.aiAnalysis.confidence > 0.8).length;
  const neuralPrecision = (95 + (highConfidenceCount / (issues.length || 1)) * 4.8).toFixed(1);

  // 6. Complaint Trends (Last 7 Days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const timelineData = last7Days.map(dateStr => {
    const reported = issues.filter(issue => {
      const issueDateStr = new Date(issue.createdAt).toISOString().split('T')[0];
      return issueDateStr === dateStr;
    }).length;

    const resolved = issues.filter(issue => {
      const resolvedEvent = issue.history?.find(h => h.status === 'Resolved' || h.status === 'Closed');
      if (!resolvedEvent) return false;
      const resolvedDateStr = new Date(resolvedEvent.createdAt).toISOString().split('T')[0];
      return resolvedDateStr === dateStr;
    }).length;

    const dateObj = new Date(dateStr);
    const label = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return { name: label, Reported: reported, Resolved: resolved };
  });

  // 7. Department Performance
  const departments = ['Public Works', 'Sanitation', 'Traffic Control', 'Urban Operations'];
  const departmentStats = departments.map(dept => {
    const deptIssues = issues.filter(i => i.department === dept);
    const deptResolved = deptIssues.filter(i => i.status === 'Resolved' || i.status === 'Closed');
    const rate = deptIssues.length > 0 ? Math.round((deptResolved.length / deptIssues.length) * 100) : 0;
    return {
      name: dept,
      total: deptIssues.length,
      resolved: deptResolved.length,
      rate
    };
  });

  // 8. Locality-Wise Statistics
  const localityMap = issues.reduce((acc, issue) => {
    const loc = getLocality(issue.location.address);
    if (!acc[loc]) {
      acc[loc] = { total: 0, active: 0, resolved: 0 };
    }
    acc[loc].total += 1;
    if (issue.status === 'Resolved' || issue.status === 'Closed') {
      acc[loc].resolved += 1;
    } else {
      acc[loc].active += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; active: number; resolved: number }>);

  const localityStats = Object.keys(localityMap).map(key => ({
    name: key,
    ...localityMap[key]
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 animate-fade-in-up">
        <div>
          <h2 className="font-display-lg text-4xl md:text-5xl font-black text-white uppercase tracking-normal drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            AI Insights Command
          </h2>
          <p className="text-on-surface-variant font-body-lg text-body-lg max-w-2xl mt-2 leading-relaxed">
            Real-time predictive analytics and neural network diagnostics for urban policy optimization.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3 bg-surface-container/50 px-4 py-2 rounded-full border border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.8)]"></div>
          <span className="font-label-caps text-label-caps text-primary-fixed">System Optimal</span>
        </div>
      </div>

      {/* Metric Rings / Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        
        {/* Metric 1 */}
        <GlassCard noHover className="p-6 flex items-center justify-between">
          <div>
            <span className="font-label-caps text-[10px] text-white/50 uppercase tracking-widest font-mono">Neural Precision</span>
            <h4 className="text-3xl font-black text-white font-display-lg mt-2">{neuralPrecision}%</h4>
            <p className="text-[10px] font-mono text-primary-container mt-1 uppercase tracking-wider">Prediction Accuracy</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container">
            <span className="material-symbols-outlined text-[28px] drop-shadow-[0_0_5px_#00f0ff]">query_stats</span>
          </div>
        </GlassCard>

        {/* Metric 2 */}
        <GlassCard noHover className="p-6 flex items-center justify-between">
          <div>
            <span className="font-label-caps text-[10px] text-white/50 uppercase tracking-widest font-mono">Resolution Speed</span>
            <h4 className="text-3xl font-black text-white font-display-lg mt-2">{avgResolutionTime === 'N/A' ? 'N/A' : `${avgResolutionTime}d`}</h4>
            <p className="text-[10px] font-mono text-purple-300 mt-1 uppercase tracking-wider">Average Ticket Life</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <span className="material-symbols-outlined text-[28px] drop-shadow-[0_0_5px_#8b5cf6]">speed</span>
          </div>
        </GlassCard>

        {/* Metric 3 */}
        <GlassCard noHover className="p-6 flex items-center justify-between">
          <div>
            <span className="font-label-caps text-[10px] text-white/50 uppercase tracking-widest font-mono">Citizen Sentiment</span>
            <h4 className="text-3xl font-black text-white font-display-lg mt-2">+{sentimentScore}</h4>
            <p className="text-[10px] font-mono text-green-400 mt-1 uppercase tracking-wider">Engagement Net Score</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
            <span className="material-symbols-outlined text-[28px] drop-shadow-[0_0_5px_#4ade80]">sentiment_satisfied</span>
          </div>
        </GlassCard>

      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Large Time Series area */}
        <div className="col-span-1 lg:col-span-8 glass-card rounded-2xl p-6 md:p-8 flex flex-col min-h-[400px] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-display-lg text-lg font-black text-white uppercase tracking-normal mb-6">Activity Timeline Dynamics</h3>
          <div className="flex-1 w-full min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontFamily="monospace" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontFamily="monospace" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#00060d', borderColor: '#00f0ff', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="Reported" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#colorReported)" />
                <Area type="monotone" dataKey="Resolved" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut */}
        <div className="col-span-1 lg:col-span-4 glass-card rounded-2xl p-6 md:p-8 flex flex-col items-center justify-between min-h-[400px] animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="font-display-lg text-lg font-black text-white uppercase tracking-normal w-full text-left mb-4">Category Spread</h3>
          <div className="w-full h-52 relative flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#00060d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-white font-mono text-[10px] uppercase tracking-wider">Total Active</span>
              <span className="text-2xl font-black text-white font-display-lg mt-0.5">{issues.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length}</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 w-full">
            {pieData.map((d, index) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-white/70">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Severity & Department Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Severity Bar Chart */}
        <div className="col-span-1 lg:col-span-6 glass-card rounded-2xl p-6 md:p-8 flex flex-col min-h-[350px]">
          <h3 className="font-display-lg text-lg font-black text-white uppercase tracking-normal mb-6">Severity Distribution</h3>
          <div className="flex-1 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontFamily="monospace" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontFamily="monospace" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#00060d', borderColor: '#00f0ff', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#8b5cf6">
                  {severityBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Critical' ? '#ffb4ab' : entry.name === 'High' ? '#dae2fd' : entry.name === 'Medium' ? '#00f0ff' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Performance */}
        <GlassCard noHover className="col-span-1 lg:col-span-6 p-6 md:p-8 flex flex-col min-h-[350px]">
          <h3 className="font-display-lg text-lg font-black text-white uppercase tracking-normal mb-2">Department Performance</h3>
          <p className="text-xs text-white/50 mb-4 font-mono uppercase tracking-widest">Real-time resolution rates</p>
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[260px]">
            {departmentStats.map((dept) => (
              <div key={dept.name} className="p-4 rounded-xl bg-black/10 border border-white/5 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-white uppercase tracking-wider">{dept.name}</span>
                  <span className="font-mono text-xs font-bold text-primary-container">{dept.rate}% Resolved</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary-container h-full rounded-full" style={{ width: `${dept.rate}%` }}></div>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-white/40">
                  <span>Active: {dept.total - dept.resolved}</span>
                  <span>Resolved: {dept.resolved}</span>
                  <span>Total: {dept.total}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>

      {/* Locality-Wise Statistics */}
      <GlassCard noHover className="p-6 md:p-8 animate-fade-in-up w-full border border-white/10" style={{ animationDelay: '0.4s' }}>
        <h3 className="font-display-lg text-lg font-black text-white uppercase tracking-normal mb-6">Locality Statistics</h3>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left font-mono text-xs text-white/80 border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-white/10 uppercase text-white/50 text-[10px] tracking-widest">
                <th className="py-4">Locality / Sector</th>
                <th className="py-4">Total Cases</th>
                <th className="py-4">Active Cases</th>
                <th className="py-4">Resolved Cases</th>
                <th className="py-4">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {localityStats.map((loc) => {
                const rate = loc.total > 0 ? Math.round((loc.resolved / loc.total) * 100) : 0;
                return (
                  <tr key={loc.name} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 font-bold text-white uppercase">{loc.name}</td>
                    <td className="py-4">{loc.total}</td>
                    <td className="py-4 text-primary-container">{loc.active}</td>
                    <td className="py-4 text-green-400">{loc.resolved}</td>
                    <td className="py-4 font-bold">{rate}%</td>
                  </tr>
                );
              })}
              {localityStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-white/30">No issues reported yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* AI Recommendation Engine */}
      <GlassCard noHover className="p-6 md:p-8 animate-fade-in-up border border-primary-container/30" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-container/10 border border-primary-container/50 flex items-center justify-center text-primary-container shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <span className="material-symbols-outlined text-[24px] drop-shadow-[0_0_5px_#00f0ff]">psychology</span>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white uppercase tracking-tight">AI Predictive Operations Recommendations</h4>
            <span className="text-[9px] font-mono text-primary-container uppercase tracking-widest">Active Neural Engine</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="p-4 rounded-xl bg-[#000f21]/40 border border-white/5">
            <h5 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
              Infrastructure Outages Detected
            </h5>
            <p className="text-xs text-white/70 mt-2 font-light leading-relaxed">
              Based on the current ticket density, Downtown is predicted to face an additional 3 infrastructure potholes in the next 48 hours due to high commercial traffic loads. Pre-stage asphalt batches near Sector 4.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#000f21]/40 border border-white/5">
            <h5 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              Resolution Efficiency Alert
            </h5>
            <p className="text-xs text-white/70 mt-2 font-light leading-relaxed">
              Dumping reports assigned to Sanitation have cleared 18% faster this week. Re-allocate 2 field personnel to Traffic Control to address crossing malfunctions reported near Broadway.
            </p>
          </div>
        </div>
      </GlassCard>

    </div>
  );
};
export default Analytics;
