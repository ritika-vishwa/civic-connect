import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

// ─── Animated Counter Hook ────────────────────────────────────────────────────
function useCounter(target: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) { setHasStarted(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setHasStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [hasStarted, target, duration]);

  return { count, ref };
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
const StatCard: React.FC<{ value: number; suffix: string; label: string; icon: string; color: string }> = ({ value, suffix, label, icon, color }) => {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="flex flex-col items-center text-center p-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div className="font-display-lg text-4xl md:text-5xl font-black text-white mb-1">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="font-label-caps text-[11px] tracking-widest text-on-surface-variant uppercase font-bold">{label}</div>
    </div>
  );
};

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeIssueType, setActiveIssueType] = useState(0);

  const issueTypes = [
    { icon: 'construction', label: 'Potholes & Road Damage', color: 'text-orange-400' },
    { icon: 'water_drop', label: 'Water Leaks & Drainage', color: 'text-blue-400' },
    { icon: 'lightbulb', label: 'Broken Streetlights', color: 'text-yellow-400' },
    { icon: 'delete', label: 'Illegal Garbage Dumps', color: 'text-red-400' },
    { icon: 'dangerous', label: 'Sewage Blockages', color: 'text-purple-400' },
    { icon: 'park', label: 'Park & Public Space Issues', color: 'text-green-400' },
    { icon: 'traffic', label: 'Traffic Signal Faults', color: 'text-primary-container' },
    { icon: 'home_repair_service', label: 'Infrastructure Damage', color: 'text-pink-400' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setActiveIssueType(p => (p + 1) % issueTypes.length), 2000);
    return () => clearInterval(timer);
  }, [issueTypes.length]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHeroCTA = () => navigate(user ? '/dashboard' : '/login');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as const } }
  };

  const roles = [
    {
      label: 'For Citizens',
      icon: 'person_pin',
      color: 'from-primary-container/20 to-primary-container/5',
      border: 'border-primary-container/30',
      iconColor: 'text-primary-container',
      glow: 'hover:shadow-[0_0_40px_rgba(0,240,255,0.15)]',
      features: [
        { icon: 'add_a_photo', text: 'Report issues with photo & GPS location' },
        { icon: 'track_changes', text: 'Track complaint status in real-time' },
        { icon: 'thumb_up', text: 'Endorse & support existing reports' },
        { icon: 'forum', text: 'Participate in neighborhood discussions' },
        { icon: 'event', text: 'Register for local events & volunteering' },
        { icon: 'edit', text: 'Edit or delete own reports before assignment' },
      ]
    },
    {
      label: 'For Municipal Officials',
      icon: 'admin_panel_settings',
      color: 'from-[#0088ff]/20 to-[#0088ff]/5',
      border: 'border-[#0088ff]/30',
      iconColor: 'text-[#0088ff]',
      glow: 'hover:shadow-[0_0_40px_rgba(0,136,255,0.15)]',
      features: [
        { icon: 'inbox', text: 'View complaints assigned to your department' },
        { icon: 'update', text: 'Update issue statuses & add official notes' },
        { icon: 'engineering', text: 'Assign field workers to complaints' },
        { icon: 'image', text: 'Upload resolution evidence photos' },
        { icon: 'campaign', text: 'Communicate official progress updates' },
        { icon: 'analytics', text: 'Access department performance analytics' },
      ]
    },
    {
      label: 'For Moderators',
      icon: 'shield_person',
      color: 'from-purple-500/20 to-purple-500/5',
      border: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      glow: 'hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]',
      features: [
        { icon: 'gavel', text: 'Moderate community discussions & posts' },
        { icon: 'remove_moderator', text: 'Remove inappropriate content' },
        { icon: 'verified', text: 'Verify and validate reported issues' },
        { icon: 'people', text: 'Manage community interactions' },
        { icon: 'flag', text: 'Review flagged content and reports' },
        { icon: 'star', text: 'Highlight impactful community posts' },
      ]
    }
  ];

  const howItWorks = [
    {
      step: '01',
      icon: 'add_location_alt',
      title: 'Spot & Report',
      desc: 'Snap a photo, pin the location on the map, describe the issue, and submit in under 60 seconds. The AI auto-categorizes and routes it to the right department.',
      color: 'text-primary-container',
      bg: 'bg-primary-container/10 border-primary-container/30',
    },
    {
      step: '02',
      icon: 'manage_accounts',
      title: 'Assigned & Actioned',
      desc: 'Municipal officials receive the complaint, assign field workers, and update the status with official communications visible to the reporter and community.',
      color: 'text-[#0088ff]',
      bg: 'bg-[#0088ff]/10 border-[#0088ff]/30',
    },
    {
      step: '03',
      icon: 'task_alt',
      title: 'Resolved & Closed',
      desc: 'Officials upload resolution evidence. The complaint is marked resolved, stats update in real-time, and the community is notified of the fix.',
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/30',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-body-sm relative overflow-x-hidden bg-[#00060d] text-white">
      {/* Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          style={{ willChange: 'transform, opacity' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] rounded-full bg-primary-container blur-[150px] mix-blend-screen"
        />
        <motion.div
          style={{ willChange: 'transform, opacity' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#0088ff] blur-[150px] mix-blend-screen"
        />
      </div>

      {/* Landing Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#00060d]/90 backdrop-blur-xl border-b border-primary-container/20 shadow-[0_4px_30px_rgba(0,240,255,0.1)]' : 'bg-transparent'}`}
      >
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 max-w-container-max mx-auto w-full">
          <button onClick={() => navigate('/')} className="font-display-lg text-headline-lg-mobile md:text-title-md tracking-widest uppercase text-white flex items-center gap-3 font-bold bg-transparent border-0 focus:outline-none">
            <motion.span whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }} className="material-symbols-outlined text-primary-container drop-shadow-[0_0_8px_#00f0ff]" style={{ fontVariationSettings: "'FILL' 1" }}>public</motion.span>
            CivicConnect
          </button>
          <nav className="hidden md:flex items-center gap-10 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            <button onClick={() => navigate('/about')} className="hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0">About</button>
            {!loading && !user && <button onClick={() => navigate('/login')} className="hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0">Sign Up</button>}
            {!loading && user && <button onClick={handleHeroCTA} className="hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0">Dashboard</button>}
          </nav>
          <div className="flex items-center gap-4 text-white">
            {loading ? null : !user ? (
              <motion.button whileHover={{ scale: 1.05, backgroundColor: 'rgba(0, 240, 255, 0.15)' }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/login')} className="text-white bg-primary-container/10 border border-primary-container/30 transition-colors px-5 py-2 rounded-full flex items-center gap-2 font-label-caps text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                <span>Sign In</span>
                <span className="material-symbols-outlined text-[16px]">login</span>
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 240, 255, 0.2)' }} whileTap={{ scale: 0.9 }} onClick={() => navigate('/profile')} className="text-white bg-primary-container/10 border border-primary-container/30 transition-colors p-2 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.1)] flex items-center justify-center">
                <span className="material-symbols-outlined">account_circle</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      <main className="flex-grow pt-20 pb-20 relative z-10 w-full">

        {/* ── Hero Section ─────────────────────────────────────────────── */}
        <section className="w-full min-h-[90vh] flex items-center justify-center relative mb-0 overflow-hidden border-b border-primary-container/10">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00060d]/80 to-[#00060d] z-10"></div>
            <img alt="Smart City Glow" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen" src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=1200" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-[#00f0ff]/10 to-transparent blur-3xl z-0"></div>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 p-8 md:p-16 max-w-5xl text-center flex flex-col items-center mt-6">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-3 bg-[#000f21]/80 border border-primary-container/50 rounded-full px-6 py-2 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_10px_#00f0ff]"></span>
              <span className="font-label-caps text-label-caps text-primary-container uppercase tracking-widest font-bold">A New Era of Civic Engagement</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-display-lg text-5xl md:text-8xl leading-[1.1] mb-8 font-black text-white uppercase tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
              Empowering <br/>
              <span className="text-primary-container drop-shadow-[0_0_30px_rgba(0,240,255,0.6)]">Communities</span> <br/>
              Through Clarity.
            </motion.h1>

            <motion.p variants={itemVariants} className="font-body-lg text-xl md:text-2xl max-w-3xl mx-auto mb-6 text-on-surface-variant font-light leading-relaxed">
              Report civic issues instantly. Track resolutions, participate in local discussions, and build a stronger community together.
            </motion.p>

            {/* Issue Type Ticker */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-12 h-10">
              <span className="text-on-surface-variant text-sm font-mono uppercase tracking-widest hidden sm:block">Now reporting:</span>
              <div className="relative overflow-hidden h-10 flex items-center min-w-[280px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIssueType}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`flex items-center gap-2 font-label-caps text-sm tracking-widest font-bold ${issueTypes[activeIssueType].color}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{issueTypes[activeIssueType].icon}</span>
                    {issueTypes[activeIssueType].label}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-6 justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleHeroCTA} className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-primary-container to-[#0088ff] text-[#00060d] font-label-caps text-sm tracking-widest uppercase px-12 py-5 rounded-full font-bold shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_50px_rgba(0,240,255,0.8)] transition-shadow duration-300 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative z-10 flex items-center gap-2">Get Started <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">rocket_launch</span></span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.05, backgroundColor: 'rgba(0,240,255,0.1)', borderColor: '#00f0ff', boxShadow: '0 0 30px rgba(0,240,255,0.3)' }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/about')} className="group flex items-center justify-center gap-3 bg-transparent backdrop-blur-md text-white font-label-caps text-sm tracking-widest uppercase px-12 py-5 rounded-full border-2 border-primary-container/40 transition-all duration-300 cursor-pointer">
                <span className="material-symbols-outlined text-[18px] group-hover:rotate-45 transition-transform duration-500">explore</span>
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Animated Stats Strip ─────────────────────────────────────── */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-20 w-full">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={sectionVariants}
            className="bg-[#031427]/80 backdrop-blur-xl rounded-3xl border border-primary-container/20 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10">
              <StatCard value={5200} suffix="+" label="Issues Reported" icon="report_problem" color="bg-primary-container/20 text-primary-container" />
              <StatCard value={4100} suffix="+" label="Issues Resolved" icon="task_alt" color="bg-green-500/20 text-green-400" />
              <StatCard value={2400} suffix="+" label="Active Citizens" icon="group" color="bg-[#0088ff]/20 text-[#0088ff]" />
              <StatCard value={48} suffix="hr" label="Avg. Response Time" icon="timer" color="bg-purple-500/20 text-purple-400" />
            </div>
          </motion.div>
        </section>

        {/* ── Issue Types Grid ─────────────────────────────────────────── */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-24 w-full">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={containerVariants} className="text-center mb-12">
            <motion.span variants={itemVariants} className="inline-block font-label-caps text-[11px] tracking-widest text-primary-container uppercase border border-primary-container/30 px-4 py-1.5 rounded-full mb-4">What You Can Report</motion.span>
            <motion.h2 variants={itemVariants} className="font-display-lg text-4xl md:text-5xl font-black uppercase tracking-tight text-white">Every Issue. <span className="text-primary-container">Covered.</span></motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {issueTypes.map((type, i) => (
              <motion.div key={i} variants={itemVariants} whileHover={{ scale: 1.04, y: -4 }}
                className="bg-[#031427]/60 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:border-primary-container/40 transition-all duration-300 flex flex-col items-center gap-3 text-center cursor-default group">
                <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-primary-container/10 flex items-center justify-center transition-colors">
                  <span className={`material-symbols-outlined text-2xl ${type.color}`}>{type.icon}</span>
                </div>
                <span className="font-label-caps text-xs tracking-wide text-on-surface-variant group-hover:text-white transition-colors uppercase font-semibold">{type.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── How It Works ─────────────────────────────────────────────── */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-28 w-full">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={containerVariants} className="text-center mb-16">
            <motion.span variants={itemVariants} className="inline-block font-label-caps text-[11px] tracking-widest text-primary-container uppercase border border-primary-container/30 px-4 py-1.5 rounded-full mb-4">Simple & Effective</motion.span>
            <motion.h2 variants={itemVariants} className="font-display-lg text-4xl md:text-5xl font-black uppercase tracking-tight text-white">How It <span className="text-primary-container">Works</span></motion.h2>
            <motion.p variants={itemVariants} className="text-on-surface-variant mt-4 max-w-xl mx-auto">From report to resolution — a transparent, traceable journey every step of the way.</motion.p>
          </motion.div>

          <div className="relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-16 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-primary-container/30 via-[#0088ff]/30 to-green-500/30 z-0" />

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {howItWorks.map((step, i) => (
                <motion.div key={i} variants={itemVariants} whileHover={{ y: -6 }}
                  className={`bg-[#031427]/70 backdrop-blur-xl rounded-3xl p-8 border ${step.bg} relative flex flex-col items-center text-center transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]`}>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 border ${step.bg}`}>
                    <span className={`material-symbols-outlined text-3xl ${step.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                  </div>
                  <span className={`font-mono text-[11px] font-bold tracking-widest mb-2 ${step.color} uppercase`}>Step {step.step}</span>
                  <h3 className="font-display-lg text-xl font-bold uppercase tracking-tight text-white mb-3">{step.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Core Principles Bento Grid ───────────────────────────────── */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-28 relative z-10 w-full">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={containerVariants} className="text-center mb-16 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-container/10 rounded-full blur-[80px] pointer-events-none"></div>
            <motion.span variants={itemVariants} className="inline-block font-label-caps text-[11px] tracking-widest text-primary-container uppercase border border-primary-container/30 px-4 py-1.5 rounded-full mb-4 relative z-10">Our Foundation</motion.span>
            <motion.h2 variants={itemVariants} className="font-display-lg text-4xl md:text-6xl mb-4 text-white font-black uppercase tracking-tight relative z-10">Core Principles</motion.h2>
            <motion.p variants={itemVariants} className="font-body-lg text-lg text-on-surface-variant max-w-2xl mx-auto relative z-10">Built on a foundation of trust, designed for immediate action.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={containerVariants} className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[320px]">
            {/* Report & Track */}
            <motion.div variants={itemVariants} className="md:col-span-8 bg-[#031427]/60 backdrop-blur-xl rounded-3xl p-10 flex flex-col justify-between group overflow-hidden relative border border-primary-container/20 hover:border-primary-container/60 hover:shadow-[0_0_40px_rgba(0,240,255,0.15)] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div className="bg-[#00060d] p-4 rounded-2xl border border-primary-container/30 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                  <span className="material-symbols-outlined text-primary-container text-4xl drop-shadow-[0_0_8px_#00f0ff]">visibility</span>
                </div>
                <span className="font-label-caps text-[10px] tracking-widest bg-primary-container/10 px-4 py-2 rounded-full border border-primary-container/30 text-primary-container font-bold uppercase">Empower Citizens</span>
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="font-display-lg text-3xl mb-3 text-white font-bold uppercase tracking-tight group-hover:text-primary-container transition-colors">Report & Track Issues</h3>
                <p className="font-body-lg text-on-surface-variant max-w-lg text-sm leading-relaxed">
                  Easily report public infrastructure problems with photos and precise location data. Track the progress of your complaints in real-time as municipal authorities work to resolve them.
                </p>
              </div>
            </motion.div>

            {/* Community Engagement */}
            <motion.div variants={itemVariants} className="md:col-span-4 bg-[#031427]/60 backdrop-blur-xl rounded-3xl p-10 flex flex-col justify-between group relative overflow-hidden border border-outline-variant/30 hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500">
              <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/5 rounded-tl-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
              <div className="bg-[#00060d] p-4 rounded-2xl border border-outline-variant/50 w-fit relative z-10">
                <span className="material-symbols-outlined text-white text-4xl">groups</span>
              </div>
              <div className="mt-auto relative z-10">
                <h3 className="font-display-lg text-2xl mb-3 text-white font-bold uppercase tracking-tight group-hover:text-white transition-colors">Community Engagement</h3>
                <p className="font-body-lg text-on-surface-variant text-sm leading-relaxed">Participate in neighborhood discussions, support existing reports, and engage in local events or volunteering initiatives to foster a stronger community.</p>
              </div>
            </motion.div>

            {/* Municipal Efficiency */}
            <motion.div variants={itemVariants} className="md:col-span-5 bg-[#031427]/60 backdrop-blur-xl rounded-3xl p-10 flex flex-col justify-between group relative overflow-hidden border border-primary-container/20 hover:border-primary-container/60 hover:shadow-[0_0_40px_rgba(0,240,255,0.15)] transition-all duration-500">
              <div className="absolute inset-0 bg-[#00060d]/80 z-0"></div>
              <img alt="Abstract Tech" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen group-hover:scale-110 transition-transform duration-1000" src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600" />
              <div className="relative z-10 bg-[#00060d] p-4 rounded-2xl border border-primary-container/30 w-fit shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                <span className="material-symbols-outlined text-primary-container text-4xl drop-shadow-[0_0_8px_#00f0ff]">trending_up</span>
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="font-display-lg text-2xl mb-3 text-white font-bold uppercase tracking-tight group-hover:text-primary-container transition-colors">Municipal Efficiency</h3>
                <p className="font-body-lg text-on-surface-variant text-sm leading-relaxed">Empower authorities to efficiently manage complaints, communicate updates, and improve transparency in public service delivery.</p>
              </div>
            </motion.div>

            {/* Secure & Scalable */}
            <motion.div variants={itemVariants} className="md:col-span-7 bg-[#031427]/60 backdrop-blur-xl rounded-3xl p-10 flex items-center justify-between group relative overflow-hidden border border-outline-variant/30 hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500">
              <div className="absolute left-0 top-0 w-48 h-48 bg-white/5 rounded-br-full blur-3xl"></div>
              <div className="relative z-10 pr-8">
                <div className="bg-[#00060d] p-4 rounded-2xl border border-outline-variant/50 w-fit mb-6">
                  <span className="material-symbols-outlined text-white text-4xl">shield_lock</span>
                </div>
                <h3 className="font-display-lg text-3xl mb-3 text-white font-bold uppercase tracking-tight">Secure & Scalable</h3>
                <p className="font-body-lg text-on-surface-variant text-sm leading-relaxed max-w-sm">A robust environment enforcing strict authentication, role-based authorization, and comprehensive data ownership rules.</p>
              </div>
              <div className="hidden sm:block relative z-10 shrink-0">
                <div className="w-36 h-36 rounded-full border border-white/20 flex items-center justify-center relative bg-[#00060d]/50 backdrop-blur-md group-hover:border-white/50 transition-colors duration-500">
                  <div className="absolute inset-[-2px] rounded-full border-2 border-white/10 border-t-white animate-spin drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]"></div>
                  <span className="material-symbols-outlined text-white text-6xl">verified</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Role-Based Features ──────────────────────────────────────── */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-28 w-full">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={containerVariants} className="text-center mb-16">
            <motion.span variants={itemVariants} className="inline-block font-label-caps text-[11px] tracking-widest text-primary-container uppercase border border-primary-container/30 px-4 py-1.5 rounded-full mb-4">Built For Everyone</motion.span>
            <motion.h2 variants={itemVariants} className="font-display-lg text-4xl md:text-5xl font-black uppercase tracking-tight text-white">Platform <span className="text-primary-container">For Every Role</span></motion.h2>
            <motion.p variants={itemVariants} className="text-on-surface-variant mt-4 max-w-xl mx-auto">A tailored experience for citizens, municipal officials, and community moderators — each with the right tools and the right access.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role, i) => (
              <motion.div key={i} variants={itemVariants} whileHover={{ y: -8 }}
                className={`bg-gradient-to-b ${role.color} backdrop-blur-xl rounded-3xl p-8 border ${role.border} flex flex-col gap-6 ${role.glow} transition-all duration-500`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-[#00060d]/60 border ${role.border} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-2xl ${role.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{role.icon}</span>
                  </div>
                  <h3 className="font-display-lg text-xl font-bold uppercase tracking-tight text-white">{role.label}</h3>
                </div>
                <ul className="flex flex-col gap-3">
                  {role.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <span className={`material-symbols-outlined text-[18px] mt-0.5 shrink-0 ${role.iconColor}`}>{f.icon}</span>
                      <span className="text-on-surface-variant text-sm leading-relaxed">{f.text}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Real-Time Civic Pulse ────────────────────────────────────── */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-24 w-full">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={sectionVariants}
            className="bg-[#031427]/80 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-16 relative overflow-hidden border border-primary-container/30 hover:shadow-[0_0_80px_rgba(0,240,255,0.15)] transition-shadow duration-700 w-full">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-40" />
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 lg:gap-16 w-full">
              <div className="lg:w-1/2 w-full">
                <h2 className="font-display-lg text-3xl sm:text-4xl md:text-6xl mb-6 text-white font-black uppercase tracking-tight leading-tight break-words">Real-Time Civic Pulse</h2>
                <p className="font-body-lg text-base sm:text-lg text-on-surface-variant mb-10 font-light leading-relaxed max-w-xl">Monitor the health and activity of your district with granular, live telemetry. Every complaint, every resolution — tracked.</p>
                <div className="flex flex-row items-center gap-6 sm:gap-12 w-full flex-wrap">
                  <div>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-display-lg text-5xl text-primary-container drop-shadow-[0_0_20px_rgba(0,240,255,0.6)] font-black">84%</motion.div>
                    <div className="font-label-caps text-[11px] mt-3 tracking-widest text-white uppercase font-bold">Resolution Rate</div>
                  </div>
                  <div className="w-px h-20 bg-primary-container/30"></div>
                  <div>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="font-display-lg text-5xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] font-black">2.4k+</motion.div>
                    <div className="font-label-caps text-[11px] mt-3 tracking-widest text-white uppercase font-bold">Active Citizens</div>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 w-full mt-4 lg:mt-0">
                <div className="w-full h-64 sm:h-80 bg-[#00060d]/90 rounded-2xl sm:rounded-3xl border border-primary-container/20 flex items-end p-4 sm:p-8 gap-2 sm:gap-4 backdrop-blur-xl relative shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-container/10 to-transparent"></div>
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-[#00060d] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-primary-container/50 backdrop-blur-md flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.2)] z-10">
                    <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_10px_#00f0ff]"></span>
                    <span className="text-[10px] sm:text-[11px] text-primary-container font-mono uppercase tracking-widest font-bold">Live Pulse</span>
                  </div>
                  {[30, 50, 80, 40, 60, 100, 70].map((height, i) => (
                    <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${height}%` }} transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                      className={`flex-1 rounded-t-lg transition-colors duration-300 relative z-10 ${height === 100 ? 'bg-primary-container/50 border-t-2 border-primary-container hover:bg-primary-container/70 shadow-[0_0_40px_rgba(0,240,255,0.5)] cursor-pointer' : height === 80 ? 'bg-[#0088ff]/50 border-t-2 border-[#0088ff] hover:bg-[#0088ff]/70 shadow-[0_0_30px_rgba(0,136,255,0.4)] cursor-pointer' : 'bg-white/10 hover:bg-white/30 cursor-pointer'}`}>
                      {height === 100 && <div className="absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2 bg-[#00060d] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[8px] sm:text-[9px] uppercase tracking-widest text-primary-container border border-primary-container/50 opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]">Peak</div>}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Final CTA Banner ─────────────────────────────────────────── */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pb-8 w-full">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={sectionVariants}
            className="relative overflow-hidden rounded-[2.5rem] p-12 md:p-20 text-center border border-primary-container/30 bg-gradient-to-br from-[#031427] via-[#001a33] to-[#031427]">
            {/* Animated blobs */}
            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity }} className="hidden sm:block absolute top-[-30%] left-[-10%] w-[50%] h-[200%] bg-primary-container/20 rounded-full blur-[100px] pointer-events-none" />
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 7, repeat: Infinity, delay: 1 }} className="hidden sm:block absolute bottom-[-30%] right-[-10%] w-[50%] h-[200%] bg-[#0088ff]/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-8">
              <span className="font-label-caps text-[11px] tracking-widest text-primary-container uppercase border border-primary-container/30 px-4 py-1.5 rounded-full">Join the Movement</span>
              <h2 className="font-display-lg text-4xl md:text-6xl font-black uppercase tracking-tight text-white max-w-3xl">Your City Needs <span className="text-primary-container drop-shadow-[0_0_20px_rgba(0,240,255,0.5)]">Your Voice</span></h2>
              <p className="text-on-surface-variant text-lg max-w-xl mx-auto font-light leading-relaxed">Stop watching problems go unnoticed. Report, track, and resolve civic issues with thousands of citizens already making a difference.</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleHeroCTA}
                className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-primary-container to-[#0088ff] text-[#00060d] font-label-caps text-sm tracking-widest uppercase px-14 py-5 rounded-full font-bold shadow-[0_0_40px_rgba(0,240,255,0.5)] hover:shadow-[0_0_70px_rgba(0,240,255,0.9)] transition-shadow duration-300 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-2">Start Reporting Now <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span></span>
              </motion.button>
            </div>
          </motion.div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-12 mt-auto bg-[#00060d]/95 backdrop-blur-2xl border-t border-primary-container/20">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop gap-8 max-w-container-max mx-auto w-full">
          <div className="font-display-lg text-2xl text-white font-black uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">CivicConnect</div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 font-label-caps text-sm uppercase tracking-widest text-white/70">
            <button onClick={() => navigate('/about')} className="hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0 font-label-caps text-sm tracking-widest uppercase">About Us</button>
            <a className="hover:text-primary-container transition-colors" href="#privacy">Privacy Policy</a>
            <a className="hover:text-primary-container transition-colors" href="#terms">Terms of Service</a>
          </div>
          <div className="font-mono text-white/40 text-center md:text-right text-[11px] uppercase tracking-widest">© 2025 CivicConnect. Civic Infrastructure Platform.</div>
        </div>
      </footer>
    </div>
  );
};
export default Landing;
