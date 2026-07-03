import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleHeroCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-body-sm relative overflow-x-hidden bg-[#00060d] text-white">
      {/* Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] rounded-full bg-primary-container opacity-20 blur-[150px] mix-blend-screen"></div>
      </div>

      {/* Landing Header */}
      <header className="fixed top-0 w-full z-50 bg-[#00060d]/80 backdrop-blur-xl border-b border-primary-container/20 shadow-[0_4px_30px_rgba(0,240,255,0.1)] transition-all duration-300">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 max-w-container-max mx-auto w-full">
          {/* Brand Logo */}
          <button 
            onClick={() => navigate('/')}
            className="font-display-lg text-headline-lg-mobile md:text-title-md tracking-widest uppercase text-white flex items-center gap-3 font-bold bg-transparent border-0 focus:outline-none"
          >
            <span className="material-symbols-outlined text-primary-container drop-shadow-[0_0_8px_#00f0ff]" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
            CivicConnect
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-10 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            <button onClick={() => navigate('/about')} className="hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0">About</button>
            {!user && (
              <button onClick={() => navigate('/login')} className="hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0">Sign Up</button>
            )}
            {user && (
              <button onClick={handleHeroCTA} className="hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0">Dashboard</button>
            )}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-4 text-white">
            {!user ? (
              <button 
                onClick={() => navigate('/login')}
                className="text-white hover:text-primary-container transition-colors p-2 rounded-full hover:bg-primary-container/10 flex items-center gap-2 font-label-caps text-xs uppercase tracking-widest"
              >
                <span>Sign In</span>
                <span className="material-symbols-outlined">login</span>
              </button>
            ) : (
              <button 
                onClick={() => navigate('/profile')}
                className="text-white hover:text-primary-container transition-colors p-2 rounded-full hover:bg-primary-container/10"
              >
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow pt-20 pb-20 relative z-10 w-full">
        
        {/* Hero Section */}
        <section className="w-full min-h-[85vh] flex items-center justify-center relative mb-24 border-b border-primary-container/20 overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00060d]/80 to-[#00060d] z-10"></div>
            <img 
              alt="Smart City Glow" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen" 
              src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=1200"
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-[#00f0ff]/10 to-transparent blur-3xl z-0"></div>
          </div>

          <div className="relative z-10 p-8 md:p-16 max-w-4xl text-center flex flex-col items-center mt-6">
            <div className="inline-flex items-center gap-3 bg-[#000f21]/80 border border-primary-container/50 rounded-full px-6 py-2 backdrop-blur-md mb-8 shadow-[0_0_15px_rgba(0,240,255,0.2)] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_10px_#00f0ff]"></span>
              <span className="font-label-caps text-label-caps text-primary-container uppercase tracking-widest font-bold">A New Era of Civic Engagement</span>
            </div>

            <h1 className="font-display-lg text-4xl md:text-7xl leading-tight mb-8 font-black text-white uppercase tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Empowering <br/>
              <span className="text-primary-container drop-shadow-[0_0_20px_rgba(0,240,255,0.8)]">Communities</span> <br/>
              Through Clarity.
            </h1>
            
            <p className="font-body-lg text-lg max-w-2xl mx-auto mb-10 text-on-surface-variant font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              Bridge the gap between institutional reliability and cutting-edge digital craftsmanship. Join the movement for transparent, effective civic action.
            </p>

            <div className="flex flex-wrap gap-6 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <button 
                onClick={handleHeroCTA}
                className="group relative flex items-center justify-center gap-3 bg-gradient-to-r from-primary-container to-[#0088ff] text-black font-label-caps text-sm tracking-widest uppercase px-10 py-5 rounded-full font-bold shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_50px_rgba(0,240,255,0.8)] hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">rocket_launch</span>
                </span>
              </button>
              <button 
                onClick={() => navigate('/about')}
                className="group flex items-center justify-center gap-3 bg-transparent backdrop-blur-md text-white font-label-caps text-sm tracking-widest uppercase px-10 py-5 rounded-full hover:bg-primary-container/10 transition-all duration-300 border-2 border-primary-container/50 hover:border-primary-container hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">explore</span>
                Explore Specs
              </button>
            </div>
          </div>
        </section>

        {/* Bento Grid Principles */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-28 relative z-10 w-full">
          <div className="text-center mb-16 relative animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-container/10 rounded-full blur-[80px] pointer-events-none"></div>
            <h2 className="font-display-lg text-3xl md:text-5xl mb-4 text-white font-black uppercase tracking-tight relative z-10">Core Principles</h2>
            <p className="font-body-lg text-base text-on-surface-variant max-w-2xl mx-auto relative z-10">Built on a foundation of trust, designed for immediate action.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]">
            {/* Absolute Transparency */}
            <div className="md:col-span-8 bg-surface-container-lowest/80 backdrop-blur-xl hover:-translate-y-2 rounded-2xl p-8 flex flex-col justify-between group overflow-hidden relative border border-primary-container/20 hover:border-primary-container/60 hover:shadow-[0_0_40px_rgba(0,240,255,0.15)] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div className="bg-[#00060d] p-3.5 rounded-xl border border-primary-container/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                  <span className="material-symbols-outlined text-primary-container text-3xl drop-shadow-[0_0_8px_#00f0ff]">visibility</span>
                </div>
                <span className="font-label-caps text-[9px] tracking-widest bg-primary-container/10 px-3.5 py-1.5 rounded-full border border-primary-container/30 text-primary-container font-bold uppercase">Open Data</span>
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="font-display-lg text-2xl mb-2 text-white font-bold uppercase tracking-tight">Absolute Transparency</h3>
                <p className="font-body-lg text-on-surface-variant max-w-md text-xs leading-relaxed">
                  Access real-time municipal budgets, project timelines, and decision logs with surgical precision.
                </p>
              </div>
            </div>

            {/* Community Driven */}
            <div className="md:col-span-4 bg-surface-container-lowest/80 backdrop-blur-xl hover:-translate-y-2 rounded-2xl p-8 flex flex-col justify-between group relative overflow-hidden border border-outline-variant/30 hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/5 rounded-tl-full blur-3xl"></div>
              <div className="bg-[#00060d] p-3.5 rounded-xl border border-outline-variant/50 w-fit relative z-10">
                <span className="material-symbols-outlined text-white text-3xl">groups</span>
              </div>
              <div className="mt-auto relative z-10">
                <h3 className="font-display-lg text-xl mb-2 text-white font-bold uppercase tracking-tight">Community Driven</h3>
                <p className="font-body-lg text-on-surface-variant text-xs leading-relaxed">
                  Foster hyper-local engagement networks and community cleanups.
                </p>
              </div>
            </div>

            {/* Measurable Impact */}
            <div className="md:col-span-5 bg-surface-container-lowest/80 backdrop-blur-xl hover:-translate-y-2 rounded-2xl p-8 flex flex-col justify-between group relative overflow-hidden border border-primary-container/20 hover:border-primary-container/60 hover:shadow-[0_0_40px_rgba(0,240,255,0.15)] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <div className="absolute inset-0 bg-[#00060d]/80 z-0"></div>
              <img 
                alt="Abstract Tech" 
                className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-screen group-hover:scale-105 transition-transform duration-1000" 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400"
              />
              <div className="relative z-10 bg-[#00060d] p-3.5 rounded-xl border border-primary-container/30 w-fit shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                <span className="material-symbols-outlined text-primary-container text-3xl drop-shadow-[0_0_8px_#00f0ff]">trending_up</span>
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="font-display-lg text-xl mb-2 text-white font-bold uppercase tracking-tight">Measurable Impact</h3>
                <p className="font-body-lg text-on-surface-variant text-xs leading-relaxed">
                  Track initiatives and defect resolutions from submission to completion.
                </p>
              </div>
            </div>

            {/* Institutional Security */}
            <div className="md:col-span-7 bg-surface-container-lowest/80 backdrop-blur-xl hover:-translate-y-2 rounded-2xl p-8 flex items-center justify-between group relative overflow-hidden border border-outline-variant/30 hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
              <div className="absolute left-0 top-0 w-48 h-48 bg-white/5 rounded-br-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="bg-[#00060d] p-3.5 rounded-xl border border-outline-variant/50 w-fit mb-5">
                  <span className="material-symbols-outlined text-white text-3xl">shield_lock</span>
                </div>
                <h3 className="font-display-lg text-xl mb-2 text-white font-bold uppercase tracking-tight">Institutional Security</h3>
                <p className="font-body-lg text-on-surface-variant text-xs leading-relaxed max-w-xs">
                  Enterprise-grade protection for civic geotelematic data nodes.
                </p>
              </div>
              <div className="hidden sm:block relative z-10 shrink-0">
                <div className="w-28 h-28 rounded-full border border-white/20 flex items-center justify-center relative bg-[#00060d]/50 backdrop-blur-md">
                  <div className="absolute inset-[-2px] rounded-full border border-white/10 border-t-white animate-spin drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                  <span className="material-symbols-outlined text-white text-4xl">verified</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real-time pulse section */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pb-10 animate-fade-in-up" style={{ animationDelay: '1s' }}>
          <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-3xl p-8 md:p-14 relative overflow-hidden border border-primary-container/30 hover:shadow-[0_0_60px_rgba(0,240,255,0.1)] transition-all duration-700">
            {/* Grid Backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-35" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="md:w-1/2">
                <h2 className="font-display-lg text-3xl md:text-5xl mb-4 text-white font-black uppercase tracking-tight">Real-Time Civic Pulse</h2>
                <p className="font-body-lg text-base text-on-surface-variant mb-10 font-light leading-relaxed">
                  Monitor the health and activity of your district with granular, beautiful telemetry visualizations.
                </p>
                <div className="flex items-center gap-10">
                  <div>
                    <div className="font-display-lg text-4xl text-primary-container drop-shadow-[0_0_20px_rgba(0,240,255,0.6)] font-black">84%</div>
                    <div className="font-label-caps text-[10px] mt-2 tracking-widest text-white uppercase font-bold">Proposal Success</div>
                  </div>
                  <div className="w-px h-16 bg-primary-container/30"></div>
                  <div>
                    <div className="font-display-lg text-4xl text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] font-black">2.4k+</div>
                    <div className="font-label-caps text-[10px] mt-2 tracking-widest text-white uppercase font-bold">Active Citizens</div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2 w-full">
                {/* Mock Visual Chart */}
                <div className="w-full h-72 bg-[#00060d]/80 rounded-2xl border border-primary-container/20 flex items-end p-6 gap-3.5 backdrop-blur-xl relative shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-container/5 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-[#00060d] px-3.5 py-1.5 rounded border border-primary-container/50 backdrop-blur-md flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.2)] z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse shadow-[0_0_8px_#00f0ff]"></span>
                    <span className="text-[10px] text-primary-container font-mono uppercase tracking-widest font-bold">Live Pulse</span>
                  </div>
                  {/* Bars */}
                  <div className="flex-1 bg-white/10 rounded-t h-[30%] hover:bg-white/30 transition-all duration-300 relative z-10"></div>
                  <div className="flex-1 bg-white/10 rounded-t h-[50%] hover:bg-white/30 transition-all duration-300 relative z-10"></div>
                  <div className="flex-1 bg-[#0088ff]/40 border-t-2 border-[#0088ff] rounded-t h-[80%] hover:bg-[#0088ff]/60 transition-all duration-300 shadow-[0_0_30px_rgba(0,136,255,0.4)] relative z-10"></div>
                  <div className="flex-1 bg-white/10 rounded-t h-[40%] hover:bg-white/30 transition-all duration-300 relative z-10"></div>
                  <div className="flex-1 bg-white/10 rounded-t h-[60%] hover:bg-white/30 transition-all duration-300 relative z-10"></div>
                  <div className="flex-1 bg-primary-container/40 border-t-2 border-primary-container rounded-t h-[100%] hover:bg-primary-container/60 transition-all duration-300 shadow-[0_0_40px_rgba(0,240,255,0.5)] relative z-10 group cursor-pointer">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#00060d] px-2 py-1 rounded text-[8px] uppercase tracking-widest text-primary-container border border-primary-container/50 opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]">Peak</div>
                  </div>
                  <div className="flex-1 bg-white/10 rounded-t h-[70%] hover:bg-white/30 transition-all duration-300 relative z-10"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-10 mt-auto bg-[#00060d]/90 backdrop-blur-xl border-t border-primary-container/20">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop gap-6 max-w-container-max mx-auto w-full">
          <div className="font-display-lg text-xl text-white font-black uppercase tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            CivicConnect
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 font-label-caps text-xs uppercase tracking-widest text-white/70">
            <button onClick={() => navigate('/about')} className="hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0 font-label-caps text-xs tracking-widest uppercase">About Us</button>
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
export default Landing;
