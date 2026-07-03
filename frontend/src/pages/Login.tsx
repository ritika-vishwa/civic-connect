import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GlassCard } from '../components/ui/GlassCard';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password, role);
      showToast(`Welcome back! Logged in as ${role.toUpperCase()}`, 'success');
      navigate('/');
    } catch (err) {
      showToast('Authentication failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex justify-center py-10 animate-fade-in-up">
      <GlassCard noHover className="w-full max-w-[480px] p-8 md:p-10 border border-primary-container bg-[#031427]/60 shadow-[0_0_40px_rgba(0,240,255,0.25)]">
        {/* Brand/Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-container/20 to-secondary-container/20 flex items-center justify-center border border-primary-container/50 shadow-[0_0_20px_rgba(0,240,255,0.25)] mb-4">
            <span className="material-symbols-outlined text-primary-container text-3xl drop-shadow-[0_0_10px_#00f0ff]">fingerprint</span>
          </div>
          <h2 className="font-display-lg text-2xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            CivicConnect
          </h2>
          <p className="text-primary-container/70 font-mono text-[10px] uppercase tracking-widest mt-1.5">
            Secure Node Authentication
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email input */}
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider" htmlFor="email">
              Node Identifier (Email)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-glass w-full rounded-xl px-4 py-3 text-sm placeholder-white/20 font-mono"
              placeholder="e.g., node01@civic.gov"
              required
            />
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider" htmlFor="password">
              Secure Key (Password)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-glass w-full rounded-xl px-4 py-3 text-sm placeholder-white/20 font-mono"
              placeholder="••••••••••••"
              required
            />
          </div>

          {/* Role selector */}
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider">
              Access Terminal Level
            </label>
            <div className="grid grid-cols-3 gap-2.5 segmented-control">
              <input
                type="radio"
                id="role-citizen"
                name="role"
                checked={role === 'citizen'}
                onChange={() => setRole('citizen')}
                className="hidden"
              />
              <label 
                htmlFor="role-citizen"
                className="btn-glass py-2.5 px-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest text-center cursor-pointer border hover:border-primary-container/40 transition-all flex items-center justify-center gap-1"
              >
                Citizen
              </label>

              <input
                type="radio"
                id="role-officer"
                name="role"
                checked={role === 'officer'}
                onChange={() => setRole('officer')}
                className="hidden"
              />
              <label 
                htmlFor="role-officer"
                className="btn-glass py-2.5 px-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest text-center cursor-pointer border hover:border-primary-container/40 transition-all flex items-center justify-center gap-1"
              >
                Officer
              </label>

              <input
                type="radio"
                id="role-admin"
                name="role"
                checked={role === 'admin'}
                onChange={() => setRole('admin')}
                className="hidden"
              />
              <label 
                htmlFor="role-admin"
                className="btn-glass py-2.5 px-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest text-center cursor-pointer border hover:border-primary-container/40 transition-all flex items-center justify-center gap-1"
              >
                Admin
              </label>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full primary-btn py-3.5 rounded-xl font-label-caps text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mt-4 hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-[0_0_20px_rgba(0,240,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin"></span>
                Authorizing Node...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                Authorize Access
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-[10px] font-mono text-white/30 uppercase tracking-widest">
          Authorized personnel only. Activities are audited.
        </div>
      </GlassCard>
    </div>
  );
};
export default Login;
