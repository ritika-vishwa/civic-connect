import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GlassCard } from '../components/ui/GlassCard';
import { useIssues } from '../context/IssueContext';

export const Analytics: React.FC = () => {
  const { issues } = useIssues();

  // Aggregate categories for Pie Chart
  const categoriesMap = issues.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(categoriesMap).map(key => ({
    name: key,
    value: categoriesMap[key]
  }));

  const COLORS = ['#00f0ff', '#8b5cf6', '#dae2fd', '#ffb4ab', '#1b2b3f'];

  // Mock time-series data for AreaChart
  const timeSeriesData = [
    { name: '06-28', Reported: 12, Resolved: 8 },
    { name: '06-29', Reported: 18, Resolved: 11 },
    { name: '06-30', Reported: 15, Resolved: 16 },
    { name: '07-01', Reported: 22, Resolved: 14 },
    { name: '07-02', Reported: 25, Resolved: 19 },
    { name: '07-03', Reported: issues.length, Resolved: issues.filter(i=>i.status==='Resolved').length }
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 animate-fade-in-up">
        <div>
          <h2 className="font-display-lg text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
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
            <h4 className="text-3xl font-black text-white font-display-lg mt-2">98.4%</h4>
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
            <h4 className="text-3xl font-black text-white font-display-lg mt-2">1.8d</h4>
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
            <h4 className="text-3xl font-black text-white font-display-lg mt-2">+86.2</h4>
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
          <h3 className="font-display-lg text-lg font-black text-white uppercase tracking-tight mb-6">Activity Timeline Dynamics</h3>
          <div className="flex-1 w-full min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          <h3 className="font-display-lg text-lg font-black text-white uppercase tracking-tight w-full text-left mb-4">Category Spread</h3>
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
              <span className="text-2xl font-black text-white font-display-lg mt-0.5">{issues.filter(i=>i.status!=='Resolved').length}</span>
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

      {/* AI Recommendation Engine */}
      <GlassCard noHover className="p-6 md:p-8 animate-fade-in-up border border-primary-container/30" style={{ animationDelay: '0.4s' }}>
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
