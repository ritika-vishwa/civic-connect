import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { BackgroundShader } from '../components/layout/BackgroundShader';

export const About: React.FC = () => {
  const navigate = useNavigate();
  const [activeStat, setActiveStat] = useState(0);

  // Stats for high-tech premium feel
  const stats = [
    { label: 'Active Network Nodes', value: '14,892', icon: 'hub', desc: 'Verified local citizen profiles feeding real-time telemetry.' },
    { label: 'Municipal Resolvers', value: '184', icon: 'engineering', desc: 'Registered field officials dispatched across departments.' },
    { label: 'Avg Dispatch Latency', value: '< 18.5m', icon: 'speed', desc: 'Time elapsed between citizen report and municipal action.' },
    { label: 'Audit Verification Rate', value: '99.4%', icon: 'verified_user', desc: 'Accuracy rate of decentralized peer-to-peer verification.' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStat((prev) => (prev + 1) % stats.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [stats.length]);

  const team = [
    {
      name: 'Dr. Evelyn Carter',
      role: 'Chief GovTech Architect',
      bio: 'Former city planning director with 15+ years engineering smart municipal integrations and transparent databases.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120',
      clearance: 'Clearance: Lvl 5 (Root)'
    },
    {
      name: 'Marcus Vance',
      role: 'Lead System Designer',
      bio: 'Pioneered several hyper-local engagement networks, focusing on high-fidelity dashboard structures and real-time overlays.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
      clearance: 'Clearance: Lvl 4 (SysOps)'
    },
    {
      name: 'Sarah Jenkins',
      role: 'Director of Community Outreach',
      bio: 'Coordinates engagement networks, citizen user-research groups, and volunteer programs with public works offices.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
      clearance: 'Clearance: Lvl 3 (Relations)'
    }
  ];

  // Motion variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-body-sm relative overflow-x-hidden bg-[#00060d] text-white">
      {/* Dynamic Network Shader Background */}
      <BackgroundShader />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#00060d]/80 backdrop-blur-xl border-b border-primary-container/20 shadow-[0_4px_30px_rgba(0,240,255,0.1)] transition-all duration-300">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 max-w-container-max mx-auto w-full">
          {/* Brand Logo */}
          <button 
            onClick={() => navigate('/')}
            className="font-display-lg text-headline-lg-mobile md:text-title-md tracking-widest uppercase text-white flex items-center gap-3 font-bold bg-transparent border-0 focus:outline-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary-container drop-shadow-[0_0_8px_#00f0ff]" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
            CivicConnect
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-10 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            <button onClick={() => navigate('/')} className="hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0 font-label-caps text-label-caps uppercase tracking-widest text-white font-bold">Home</button>
            <button onClick={() => navigate('/login')} className="hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0 font-label-caps text-label-caps uppercase tracking-widest text-white font-bold">Login</button>
          </nav>

          <div className="flex items-center gap-4 text-white">
            <button 
              onClick={() => navigate('/login')}
              className="text-white hover:text-primary-container transition-colors p-2 rounded-full hover:bg-primary-container/10 cursor-pointer"
            >
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-20 relative z-10 w-full">
        
        {/* Section: Title Hero */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 bg-[#000f21]/80 border border-primary-container/50 rounded-full px-5 py-1.5 backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-container shadow-[0_0_8px_#00f0ff]"></span>
            </span>
            <span className="font-label-caps text-[10px] text-primary-container uppercase tracking-widest font-bold">Bridging the Gap</span>
          </div>
          <h1 className="font-display-lg text-4xl md:text-6xl font-black uppercase tracking-tight drop-shadow-[0_0_20px_rgba(0,240,255,0.3)] mb-6 text-white">
            About Our Mission
          </h1>
          <p className="font-body-lg text-base text-white/80 leading-relaxed max-w-2xl mx-auto font-light">
            CivicConnect is engineered to bridge the gap between institutional reliability and cutting-edge digital craftsmanship. We empower residents by giving them real-time, transparent access to municipal action workflows.
          </p>
        </motion.section>

        {/* Section: Live Telemetry Ticker (Interactive Stats) */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-20"
        >
          <div className="glass-card rounded-2xl p-6 md:p-8 border border-primary-container/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[150px] text-primary-container">insights</span>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8 justify-between items-center">
              <div className="w-full lg:w-1/3">
                <span className="text-[10px] font-mono text-primary-container uppercase tracking-widest font-bold">System Status</span>
                <h3 className="font-display-lg text-2xl font-black text-white uppercase tracking-tight mt-1 mb-2">Live Network Telemetry</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Real-time synchronization matrix connecting local nodes and municipal responders.
                </p>
              </div>

              <div className="w-full lg:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div 
                    key={stat.label}
                    onClick={() => setActiveStat(index)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                      activeStat === index 
                        ? 'bg-primary-container/10 border-primary-container/50 shadow-[0_0_15px_rgba(0,240,255,0.1)]' 
                        : 'bg-black/20 border-white/5 hover:border-primary-container/30'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`material-symbols-outlined text-base ${activeStat === index ? 'text-primary-container' : 'text-white/40'}`}>{stat.icon}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-container opacity-50 animate-pulse"></span>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white font-mono mt-2">{stat.value}</h4>
                      <span className="text-[8px] font-mono text-white/50 uppercase tracking-widest mt-1 block truncate">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stat detail panel */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3 text-xs text-white/70 font-mono">
              <span className="material-symbols-outlined text-primary-container text-sm">info</span>
              <span>{stats[activeStat].desc}</span>
            </div>
          </div>
        </motion.section>

        {/* Section: Mission Grid */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-24 grid grid-cols-1 md:grid-cols-2 gap-gutter"
        >
          <motion.div variants={fadeInUp}>
            <GlassCard noHover className="p-8 border-primary-container/20 flex flex-col gap-4 h-full relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <span className="material-symbols-outlined text-[80px] text-primary-container">groups</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary-container/20 p-2.5 rounded-xl border border-primary-container/30">
                  <span className="material-symbols-outlined text-primary-container text-xl drop-shadow-[0_0_5px_#00f0ff]">campaign</span>
                </div>
                <h3 className="font-display-lg text-lg font-bold uppercase tracking-tight text-white">Empowering Citizens</h3>
              </div>
              <p className="text-xs text-white/70 font-light leading-relaxed">
                We believe that local governance is most effective when residents have absolute clarity. Through geotelematic tracking, AI image sorting, and progress history logs, every citizen becomes an active node in the improvement of their municipality.
              </p>
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <GlassCard noHover className="p-8 border-primary-container/20 flex flex-col gap-4 h-full relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <span className="material-symbols-outlined text-[80px] text-purple-400">admin_panel_settings</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 p-2.5 rounded-xl border border-purple-500/30">
                  <span className="material-symbols-outlined text-purple-300 text-xl drop-shadow-[0_0_5px_#c084fc]">local_police</span>
                </div>
                <h3 className="font-display-lg text-lg font-bold uppercase tracking-tight text-white">Supporting Municipal Staff</h3>
              </div>
              <p className="text-xs text-white/70 font-light leading-relaxed">
                Platform tools aren’t just for reporting. Our dedicated Officer Workspace provides field workers, supervisors, and department heads with clean data dashboards, automated routing, and duplicate checkers to optimize resource allocation.
              </p>
            </GlassCard>
          </motion.div>
        </motion.section>

        {/* Section: Core Team */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-24">
          <h2 className="font-display-lg text-2xl md:text-3xl font-black uppercase tracking-tight text-center mb-12">
            The Architectural Team
          </h2>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-gutter"
          >
            {team.map((member) => (
              <motion.div key={member.name} variants={fadeInUp}>
                <GlassCard noHover className="p-6 border-white/5 hover:border-primary-container/30 flex flex-col items-center text-center h-full group transition-all relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-[9px] font-mono text-primary-container bg-primary-container/10 border border-primary-container/20 px-2 py-0.5 rounded">
                    {member.clearance}
                  </div>
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary-container/40 bg-surface-container-lowest mb-4 group-hover:scale-105 transition-transform duration-500">
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">{member.name}</h4>
                  <span className="text-[9px] font-mono text-primary-container uppercase tracking-widest mt-1 block font-semibold">{member.role}</span>
                  <p className="text-xs text-white/60 font-light leading-relaxed mt-4">
                    {member.bio}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Section: Technical Specs */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto"
        >
          <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[120px] text-white">terminal</span>
            </div>
            
            <h3 className="font-display-lg text-xl font-bold uppercase tracking-tight text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container drop-shadow-[0_0_5px_#00f0ff]">terminal</span>
              Network Technical Specifications
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-[10px] uppercase tracking-wider text-white/60">
              <div className="p-4 rounded-xl bg-black/20 border border-white/5 hover:border-primary-container/20 transition-colors">
                <span className="text-white font-bold block mb-1">Frontend Framework</span>
                React 19, Vite, TypeScript
              </div>
              <div className="p-4 rounded-xl bg-black/20 border border-white/5 hover:border-primary-container/20 transition-colors">
                <span className="text-white font-bold block mb-1">Styling Engine</span>
                Tailwind CSS, Glassmorphic CSS
              </div>
              <div className="p-4 rounded-xl bg-black/20 border border-white/5 hover:border-primary-container/20 transition-colors">
                <span className="text-white font-bold block mb-1">Telemetry Maps</span>
                Leaflet Geospatial Markers
              </div>
              <div className="p-4 rounded-xl bg-black/20 border border-white/5 hover:border-primary-container/20 transition-colors">
                <span className="text-white font-bold block mb-1">Background Pipeline</span>
                Three.js GLSL Fragment Shaders
              </div>
            </div>
          </div>
        </motion.section>

      </main>

      {/* Footer */}
      <footer className="w-full py-10 mt-auto bg-[#00060d]/90 backdrop-blur-xl border-t border-primary-container/20">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop gap-6 max-w-container-max mx-auto w-full">
          <div className="font-display-lg text-xl text-white font-black uppercase tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            CivicConnect
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 font-label-caps text-xs uppercase tracking-widest text-white/70">
            <button onClick={() => navigate('/')} className="hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0 font-label-caps text-xs tracking-widest uppercase">Home</button>
            <a className="hover:text-primary-container transition-colors" href="#privacy">Privacy Policy</a>
            <a className="hover:text-primary-container transition-colors" href="#terms">Terms of Service</a>
          </div>
          <div className="font-mono text-white/40 text-center md:text-right text-[10px] uppercase tracking-widest">
            © 2024 CivicConnect. An authorized GovTech partner.
          </div>
        </div>
      </footer>
    </div>
  );
};
export default About;
