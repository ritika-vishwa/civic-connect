import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHeroCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  return (
    <div className="min-h-screen flex flex-col font-body-sm relative overflow-x-hidden bg-[#00060d] text-white">
      {/* Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          style={{ willChange: "transform, opacity" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] rounded-full bg-primary-container blur-[150px] mix-blend-screen"
        />
        <motion.div 
          style={{ willChange: "transform, opacity" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#0088ff] blur-[150px] mix-blend-screen"
        />
      </div>

      {/* Landing Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#00060d]/90 backdrop-blur-xl border-b border-primary-container/20 shadow-[0_4px_30px_rgba(0,240,255,0.1)]' : 'bg-transparent'}`}
      >
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 max-w-container-max mx-auto w-full">
          {/* Brand Logo */}
          <button 
            onClick={() => navigate('/')}
            className="font-display-lg text-headline-lg-mobile md:text-title-md tracking-widest uppercase text-white flex items-center gap-3 font-bold bg-transparent border-0 focus:outline-none"
          >
            <motion.span 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="material-symbols-outlined text-primary-container drop-shadow-[0_0_8px_#00f0ff]" 
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              public
            </motion.span>
            CivicConnect
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-10 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            <button onClick={() => navigate('/about')} className="hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0">About</button>
            {!loading && !user && (
              <button onClick={() => navigate('/login')} className="hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0">Sign Up</button>
            )}
            {!loading && user && (
              <button onClick={handleHeroCTA} className="hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0">Dashboard</button>
            )}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-4 text-white">
            {loading ? null : !user ? (
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(0, 240, 255, 0.15)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="text-white bg-primary-container/10 border border-primary-container/30 transition-colors px-5 py-2 rounded-full flex items-center gap-2 font-label-caps text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(0,240,255,0.1)]"
              >
                <span>Sign In</span>
                <span className="material-symbols-outlined text-[16px]">login</span>
              </motion.button>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 240, 255, 0.2)' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/profile')}
                className="text-white bg-primary-container/10 border border-primary-container/30 transition-colors p-2 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.1)] flex items-center justify-center"
              >
                <span className="material-symbols-outlined">account_circle</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Container */}
      <main className="flex-grow pt-20 pb-20 relative z-10 w-full">
        
        {/* Hero Section */}
        <section className="w-full min-h-[90vh] flex items-center justify-center relative mb-24 overflow-hidden border-b border-primary-container/10">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00060d]/80 to-[#00060d] z-10"></div>
            <img 
              alt="Smart City Glow" 
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen" 
              src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=1200"
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-[#00f0ff]/10 to-transparent blur-3xl z-0"></div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 p-8 md:p-16 max-w-5xl text-center flex flex-col items-center mt-6"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-3 bg-[#000f21]/80 border border-primary-container/50 rounded-full px-6 py-2 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_10px_#00f0ff]"></span>
              <span className="font-label-caps text-label-caps text-primary-container uppercase tracking-widest font-bold">A New Era of Civic Engagement</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-display-lg text-5xl md:text-8xl leading-[1.1] mb-8 font-black text-white uppercase tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
              Empowering <br/>
              <span className="text-primary-container drop-shadow-[0_0_30px_rgba(0,240,255,0.6)]">Communities</span> <br/>
              Through Clarity.
            </motion.h1>
            
            <motion.p variants={itemVariants} className="font-body-lg text-xl md:text-2xl max-w-3xl mx-auto mb-12 text-on-surface-variant font-light leading-relaxed">
              Bridge the gap between institutional reliability and cutting-edge digital craftsmanship. Join the movement for transparent, effective civic action.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-6 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleHeroCTA}
                className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-primary-container to-[#0088ff] text-[#00060d] font-label-caps text-sm tracking-widest uppercase px-12 py-5 rounded-full font-bold shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_50px_rgba(0,240,255,0.8)] transition-shadow duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">rocket_launch</span>
                </span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(0,240,255,0.1)", borderColor: "#00f0ff", boxShadow: "0 0 30px rgba(0,240,255,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/about')}
                className="group flex items-center justify-center gap-3 bg-transparent backdrop-blur-md text-white font-label-caps text-sm tracking-widest uppercase px-12 py-5 rounded-full border-2 border-primary-container/40 transition-all duration-300 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:rotate-45 transition-transform duration-500">explore</span>
                Explore Specs
              </motion.button>
            </motion.div>
          </motion.div>
        </section>

        {/* Bento Grid Principles */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-32 relative z-10 w-full">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center mb-16 relative"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-container/10 rounded-full blur-[80px] pointer-events-none"></div>
            <motion.h2 variants={itemVariants} className="font-display-lg text-4xl md:text-6xl mb-6 text-white font-black uppercase tracking-tight relative z-10">Core Principles</motion.h2>
            <motion.p variants={itemVariants} className="font-body-lg text-lg text-on-surface-variant max-w-2xl mx-auto relative z-10">Built on a foundation of trust, designed for immediate action.</motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[320px]"
          >
            {/* Absolute Transparency */}
            <motion.div variants={itemVariants} className="md:col-span-8 bg-[#031427]/60 backdrop-blur-xl rounded-3xl p-10 flex flex-col justify-between group overflow-hidden relative border border-primary-container/20 hover:border-primary-container/60 hover:shadow-[0_0_40px_rgba(0,240,255,0.15)] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div className="bg-[#00060d] p-4 rounded-2xl border border-primary-container/30 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                  <span className="material-symbols-outlined text-primary-container text-4xl drop-shadow-[0_0_8px_#00f0ff]">visibility</span>
                </div>
                <span className="font-label-caps text-[10px] tracking-widest bg-primary-container/10 px-4 py-2 rounded-full border border-primary-container/30 text-primary-container font-bold uppercase">Open Data</span>
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="font-display-lg text-3xl mb-3 text-white font-bold uppercase tracking-tight group-hover:text-primary-container transition-colors">Absolute Transparency</h3>
                <p className="font-body-lg text-on-surface-variant max-w-lg text-sm leading-relaxed">
                  Access real-time municipal budgets, project timelines, and decision logs with surgical precision. Our open-data architecture ensures total visibility.
                </p>
              </div>
            </motion.div>

            {/* Community Driven */}
            <motion.div variants={itemVariants} className="md:col-span-4 bg-[#031427]/60 backdrop-blur-xl rounded-3xl p-10 flex flex-col justify-between group relative overflow-hidden border border-outline-variant/30 hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500">
              <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/5 rounded-tl-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
              <div className="bg-[#00060d] p-4 rounded-2xl border border-outline-variant/50 w-fit relative z-10">
                <span className="material-symbols-outlined text-white text-4xl">groups</span>
              </div>
              <div className="mt-auto relative z-10">
                <h3 className="font-display-lg text-2xl mb-3 text-white font-bold uppercase tracking-tight group-hover:text-white transition-colors">Community Driven</h3>
                <p className="font-body-lg text-on-surface-variant text-sm leading-relaxed">
                  Foster hyper-local engagement networks, community cleanups, and collective action.
                </p>
              </div>
            </motion.div>

            {/* Measurable Impact */}
            <motion.div variants={itemVariants} className="md:col-span-5 bg-[#031427]/60 backdrop-blur-xl rounded-3xl p-10 flex flex-col justify-between group relative overflow-hidden border border-primary-container/20 hover:border-primary-container/60 hover:shadow-[0_0_40px_rgba(0,240,255,0.15)] transition-all duration-500">
              <div className="absolute inset-0 bg-[#00060d]/80 z-0"></div>
              <img 
                alt="Abstract Tech" 
                className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen group-hover:scale-110 transition-transform duration-1000" 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600"
              />
              <div className="relative z-10 bg-[#00060d] p-4 rounded-2xl border border-primary-container/30 w-fit shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                <span className="material-symbols-outlined text-primary-container text-4xl drop-shadow-[0_0_8px_#00f0ff]">trending_up</span>
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="font-display-lg text-2xl mb-3 text-white font-bold uppercase tracking-tight group-hover:text-primary-container transition-colors">Measurable Impact</h3>
                <p className="font-body-lg text-on-surface-variant text-sm leading-relaxed">
                  Track initiatives and defect resolutions from submission to completion with beautiful metrics.
                </p>
              </div>
            </motion.div>

            {/* Institutional Security */}
            <motion.div variants={itemVariants} className="md:col-span-7 bg-[#031427]/60 backdrop-blur-xl rounded-3xl p-10 flex items-center justify-between group relative overflow-hidden border border-outline-variant/30 hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500">
              <div className="absolute left-0 top-0 w-48 h-48 bg-white/5 rounded-br-full blur-3xl"></div>
              <div className="relative z-10 pr-8">
                <div className="bg-[#00060d] p-4 rounded-2xl border border-outline-variant/50 w-fit mb-6">
                  <span className="material-symbols-outlined text-white text-4xl">shield_lock</span>
                </div>
                <h3 className="font-display-lg text-3xl mb-3 text-white font-bold uppercase tracking-tight">Institutional Security</h3>
                <p className="font-body-lg text-on-surface-variant text-sm leading-relaxed max-w-sm">
                  Enterprise-grade protection for civic geotelematic data nodes. Your privacy and identity are rigorously encrypted.
                </p>
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

        {/* Real-time pulse section */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pb-16">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
            className="bg-[#031427]/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden border border-primary-container/30 hover:shadow-[0_0_80px_rgba(0,240,255,0.15)] transition-shadow duration-700"
          >
            {/* Grid Backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-40" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
              <div className="lg:w-1/2">
                <h2 className="font-display-lg text-4xl md:text-6xl mb-6 text-white font-black uppercase tracking-tight">Real-Time Civic Pulse</h2>
                <p className="font-body-lg text-lg text-on-surface-variant mb-12 font-light leading-relaxed max-w-xl">
                  Monitor the health and activity of your district with granular, beautiful telemetry visualizations.
                </p>
                <div className="flex items-center gap-12">
                  <div>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="font-display-lg text-5xl text-primary-container drop-shadow-[0_0_20px_rgba(0,240,255,0.6)] font-black"
                    >
                      84%
                    </motion.div>
                    <div className="font-label-caps text-[11px] mt-3 tracking-widest text-white uppercase font-bold">Proposal Success</div>
                  </div>
                  <div className="w-px h-20 bg-primary-container/30"></div>
                  <div>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="font-display-lg text-5xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] font-black"
                    >
                      2.4k+
                    </motion.div>
                    <div className="font-label-caps text-[11px] mt-3 tracking-widest text-white uppercase font-bold">Active Citizens</div>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2 w-full">
                {/* Mock Visual Chart */}
                <div className="w-full h-80 bg-[#00060d]/90 rounded-3xl border border-primary-container/20 flex items-end p-8 gap-4 backdrop-blur-xl relative shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-container/10 to-transparent"></div>
                  <div className="absolute top-6 right-6 bg-[#00060d] px-4 py-2 rounded-lg border border-primary-container/50 backdrop-blur-md flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.2)] z-10">
                    <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_10px_#00f0ff]"></span>
                    <span className="text-[11px] text-primary-container font-mono uppercase tracking-widest font-bold">Live Pulse</span>
                  </div>
                  {/* Bars */}
                  {[30, 50, 80, 40, 60, 100, 70].map((height, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                      className={`flex-1 rounded-t-lg transition-colors duration-300 relative z-10 ${
                        height === 100 
                          ? 'bg-primary-container/50 border-t-2 border-primary-container hover:bg-primary-container/70 shadow-[0_0_40px_rgba(0,240,255,0.5)] cursor-pointer' 
                          : height === 80
                          ? 'bg-[#0088ff]/50 border-t-2 border-[#0088ff] hover:bg-[#0088ff]/70 shadow-[0_0_30px_rgba(0,136,255,0.4)] cursor-pointer'
                          : 'bg-white/10 hover:bg-white/30 cursor-pointer'
                      }`}
                    >
                      {height === 100 && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#00060d] px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-widest text-primary-container border border-primary-container/50 opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]">Peak</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-12 mt-auto bg-[#00060d]/95 backdrop-blur-2xl border-t border-primary-container/20">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop gap-8 max-w-container-max mx-auto w-full">
          <div className="font-display-lg text-2xl text-white font-black uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            CivicConnect
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 font-label-caps text-sm uppercase tracking-widest text-white/70">
            <button onClick={() => navigate('/about')} className="hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0 font-label-caps text-sm tracking-widest uppercase">About Us</button>
            <a className="hover:text-primary-container transition-colors" href="#privacy">Privacy Policy</a>
            <a className="hover:text-primary-container transition-colors" href="#terms">Terms of Service</a>
          </div>
          <div className="font-mono text-white/40 text-center md:text-right text-[11px] uppercase tracking-widest">
            © 2024 CivicConnect. An authorized GovTech partner.
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Landing;
