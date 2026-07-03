import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { GlassCard } from '../components/ui/GlassCard';

export const SuccessScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const ticketId = searchParams.get('id') || 'CC-MOCK';

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/issues/${ticketId}`);
    showToast('Telemetry share link copied to clipboard!', 'success');
  };

  return (
    <div className="w-full flex justify-center py-10 animate-fade-in-up">
      <GlassCard noHover className="w-full max-w-[500px] text-center p-8 md:p-10 border border-primary-container bg-[#031427]/60 shadow-[0_0_45px_rgba(0,240,255,0.3)]">
        
        {/* Pulsing Checkmark Animation */}
        <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500/25 opacity-75"></span>
          <div className="w-20 h-20 rounded-full bg-[#031427] border-2 border-green-400 flex items-center justify-center text-green-400 shadow-[0_0_25px_rgba(74,222,128,0.4)]">
            <span className="material-symbols-outlined text-[44px]">check</span>
          </div>
        </div>

        <h2 className="font-display-lg text-2xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
          Ticket Registered
        </h2>
        
        <p className="text-xs text-white/70 font-light mt-2 leading-relaxed">
          Your complaint was successfully verified, indexed, and logged on the civic networks database nodes.
        </p>

        {/* Details Block */}
        <div className="bg-[#000f21]/40 border border-white/10 rounded-xl p-5 my-8 flex flex-col gap-3 font-mono text-xs uppercase tracking-wider">
          <div className="flex justify-between items-center">
            <span className="text-white/40">Complaint ID</span>
            <span className="text-primary-container font-black drop-shadow-[0_0_5px_#00f0ff]">{ticketId}</span>
          </div>
          <div className="flex justify-between items-center border-t border-white/5 pt-3">
            <span className="text-white/40">Estimated Resolution</span>
            <span className="text-green-400 font-bold">48 Hours</span>
          </div>
          <div className="flex justify-between items-center border-t border-white/5 pt-3">
            <span className="text-white/40">Target Department</span>
            <span className="text-white font-bold">Public Works</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3.5">
          <button
            onClick={() => navigate(`/issues/${ticketId}`)}
            className="w-full primary-btn py-3.5 rounded-xl font-label-caps text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-[0_0_20px_rgba(0,240,255,0.2)]"
          >
            <span className="material-symbols-outlined text-[18px]">track_changes</span>
            Track Complaint
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShare}
              className="btn-glass py-3 px-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest text-center cursor-pointer border hover:border-primary-container/40 transition-all flex items-center justify-center gap-1.5 text-white"
            >
              <span className="material-symbols-outlined text-[14px]">share</span>
              Share Link
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-glass py-3 px-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest text-center cursor-pointer border hover:border-primary-container/40 transition-all flex items-center justify-center gap-1.5 text-white"
            >
              <span className="material-symbols-outlined text-[14px]">home</span>
              Dashboard
            </button>
          </div>
        </div>

      </GlassCard>
    </div>
  );
};
export default SuccessScreen;
