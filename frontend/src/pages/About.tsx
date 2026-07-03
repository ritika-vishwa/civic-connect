import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';

export const About: React.FC = () => {
  const navigate = useNavigate();

  const team = [
    {
      name: 'Dr. Evelyn Carter',
      role: 'Chief GovTech Architect',
      bio: 'Former city planning director with 15+ years engineering smart municipal integrations and transparent databases.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120'
    },
    {
      name: 'Marcus Vance',
      role: 'Lead System Designer',
      bio: 'Pioneered several hyper-local engagement networks, focusing on high-fidelity dashboard structures and real-time overlays.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120'
    },
    {
      name: 'Sarah Jenkins',
      role: 'Director of Community Outreach',
      bio: 'Coordinates engagement networks, citizen user-research groups, and volunteer programs with public works offices.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-body-sm relative overflow-x-hidden bg-[#00060d] text-white">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] rounded-full bg-primary-container opacity-20 blur-[150px] mix-blend-screen"></div>
      </div>

      {/* Header */}
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
            <button onClick={() => navigate('/')} className="hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0">Home</button>
            <button onClick={() => navigate('/login')} className="hover:text-primary-container transition-colors cursor-pointer bg-transparent border-0">Console Login</button>
          </nav>

          <div className="flex items-center gap-4 text-white">
            <button 
              onClick={() => navigate('/login')}
              className="text-white hover:text-primary-container transition-colors p-2 rounded-full hover:bg-primary-container/10"
            >
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-20 relative z-10 w-full">
        
        {/* Section: Title Hero */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto text-center mb-20 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 bg-[#000f21]/80 border border-primary-container/50 rounded-full px-5 py-1.5 backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
            <span className="font-label-caps text-[10px] text-primary-container uppercase tracking-widest font-bold">Bridging the Gap</span>
          </div>
          <h1 className="font-display-lg text-4xl md:text-6xl font-black uppercase tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] mb-6">
            About Our Mission
          </h1>
          <p className="font-body-lg text-base text-on-surface-variant leading-relaxed max-w-2xl mx-auto font-light">
            CivicConnect is engineered to bridge the gap between institutional reliability and cutting-edge digital craftsmanship. We empower residents by giving them real-time, transparent access to municipal action workflows.
          </p>
        </section>

        {/* Section: Mission Grid */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-24 grid grid-cols-1 md:grid-cols-2 gap-gutter animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <GlassCard noHover className="p-8 border-primary-container/20">
            <h3 className="font-display-lg text-xl font-bold uppercase tracking-tight text-white mb-3">Empowering Citizens</h3>
            <p className="text-xs text-white/70 font-light leading-relaxed">
              We believe that local governance is most effective when residents have absolute clarity. Through geotelematic tracking, AI image sorting, and progress history logs, every citizen becomes an active node in the improvement of their municipality.
            </p>
          </GlassCard>

          <GlassCard noHover className="p-8 border-primary-container/20">
            <h3 className="font-display-lg text-xl font-bold uppercase tracking-tight text-white mb-3">Supporting Municipal Staff</h3>
            <p className="text-xs text-white/70 font-light leading-relaxed">
              Platform tools aren’t just for reporting. Our dedicated Officer Workspace provides field workers, supervisors, and department heads with clean data dashboards, automated routing, and duplicate checkers to optimize resource allocation.
            </p>
          </GlassCard>
        </section>

        {/* Section: Core Team */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-24 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-display-lg text-2xl md:text-3xl font-black uppercase tracking-tight text-center mb-12">
            The Architectural Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {team.map((member) => (
              <GlassCard key={member.name} noHover className="p-6 border-white/5 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-primary-container/40 bg-surface-container-lowest mb-4">
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">{member.name}</h4>
                <span className="text-[9px] font-mono text-primary-container uppercase tracking-widest mt-1 block">{member.role}</span>
                <p className="text-xs text-white/70 font-light leading-relaxed mt-4">
                  {member.bio}
                </p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Section: Technical Specs */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8 md:p-12">
            <h3 className="font-display-lg text-xl font-bold uppercase tracking-tight text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container drop-shadow-[0_0_5px_#00f0ff]">terminal</span>
              Network Technical Specifications
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-[10px] uppercase tracking-wider text-white/60">
              <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                <span className="text-white font-bold block mb-1">Frontend Framework</span>
                React 19, Vite, TypeScript
              </div>
              <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                <span className="text-white font-bold block mb-1">Styling Engine</span>
                Tailwind CSS, Glassmorphic CSS
              </div>
              <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                <span className="text-white font-bold block mb-1">Telemetry Maps</span>
                Leaflet Geospatial Markers
              </div>
              <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                <span className="text-white font-bold block mb-1">Background Pipeline</span>
                Three.js GLSL Fragment Shaders
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
