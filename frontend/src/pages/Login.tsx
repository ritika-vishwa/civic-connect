import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [locality, setLocality] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { user, login, signup, loginWithGoogle } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSignUp && !name.trim()) {
      showToast('Please enter a username', 'error');
      return;
    }
    if (!email.trim() || !password.trim()) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signup(name, email, password, role, locality);
        showToast('Account created successfully!', 'success');
      } else {
        await login(email, password, role);
        showToast(`Welcome back! Logged in as ${role.toUpperCase()}`, 'success');
      }
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        showToast('Email already in use. Please sign in instead.', 'error');
      } else if (err.code === 'auth/weak-password') {
        showToast('Password is too weak. Please use at least 6 characters.', 'error');
      } else {
        showToast('Authentication failed. Please check your credentials.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle(role);
      showToast('Successfully logged in with Google', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast('Google authentication failed.', 'error');
    }
  };

  const handleQuickDemo = async () => {
    setEmail('citizen@demo.com');
    setPassword('demo123');
    setRole('citizen');
    // We let state update, then submit. Since state update is async, we can just call login directly here for speed
    setIsSubmitting(true);
    try {
      await login('citizen@demo.com', 'demo123', 'citizen');
      showToast('Demo login successful', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast('Demo login failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4 bg-[#0B0C10] font-body-sm relative overflow-hidden">
      
      {/* Top Left Back Button */}
      <button 
        onClick={() => navigate(user ? '/dashboard' : '/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        {user ? 'Back to Dashboard' : 'Back to Home'}
      </button>

      {/* Background glow effects matching the screenshot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[420px] z-10 flex flex-col items-center">
        
        {/* Title Section */}
        <h1 className="text-3xl font-bold text-white mb-2">CivicMind AI</h1>
        <p className="text-white/60 text-sm mb-8">AI-Powered Community Resolution</p>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/80">
            <span className="material-symbols-outlined text-[14px] text-blue-400">bolt</span>
            AI Analysis
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/80">
            <span className="material-symbols-outlined text-[14px] text-blue-400">shield</span>
            Verified Reports
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/80">
            <span className="material-symbols-outlined text-[14px] text-blue-400">bar_chart</span>
            City Analytics
          </div>
        </div>

        {/* Social / Demo Logins */}
        <div className="w-full flex flex-col gap-3 mb-6">
          <button 
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-sm font-medium text-white"
          >
            {/* Minimal SVG Google Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          
          <button 
            onClick={handleQuickDemo}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2A1B3D]/80 hover:bg-[#3B2655] border border-purple-500/20 transition-colors text-sm font-medium text-[#E0C8FF]"
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            Quick Demo Login
          </button>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-4 mb-6 opacity-40">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="text-xs text-white/60">or</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleAuth} className="w-full flex flex-col gap-4">
          
          {isSignUp && (
            <div className="relative animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-white/40 text-[18px]">person</span>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Username"
                className="w-full bg-[#1A1B23] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
                required={isSignUp}
              />
            </div>
          )}

          {isSignUp && (
            <div className="relative animate-fade-in-up" style={{ animationDelay: '0.1s', animationDuration: '0.3s' }}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-white/40 text-[18px]">location_on</span>
              </div>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Locality (e.g. Downtown)"
                className="w-full bg-[#1A1B23] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-white/40 text-[18px]">mail</span>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full bg-[#1A1B23] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-white/40 text-[18px]">lock</span>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-[#1A1B23] border border-white/5 rounded-xl py-3.5 pl-11 pr-11 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <span className="material-symbols-outlined text-white/40 hover:text-white/70 text-[18px] transition-colors cursor-pointer">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          {/* Role Selector (Subtle) */}
          <div className="flex bg-[#1A1B23] border border-white/5 rounded-xl overflow-hidden p-1">
            {(['citizen', 'official', 'moderator', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-[11px] uppercase tracking-wider font-medium rounded-lg transition-all ${
                  role === r 
                    ? 'bg-indigo-600/20 text-indigo-300' 
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
            ) : (
              <>
                {isSignUp ? 'Sign Up' : 'Sign In'}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-sm text-white/60">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>

        {/* Small Bottom Demo Button matching screenshot */}
        <button 
          onClick={handleQuickDemo}
          type="button"
          className="mt-8 flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/5 bg-transparent hover:bg-white/5 transition-colors text-[11px] text-white/50"
        >
          <span className="material-symbols-outlined text-[14px] text-yellow-500">bolt</span>
          Quick Demo Mode
        </button>

      </div>
    </div>
  );
};
export default Login;
