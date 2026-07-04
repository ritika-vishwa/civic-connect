import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [locality, setLocality] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { user, login, signup, loginWithGoogle, resetPassword } = useAuth();
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
        showToast('Email already in use. If you signed up with Google, please click Continue with Google.', 'error');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        showToast('Invalid credentials. If you created this account with Google, please click Continue with Google.', 'error');
      } else if (err.code === 'auth/weak-password') {
        showToast('Password is too weak. Please use at least 6 characters.', 'error');
      } else if (err.code === 'permission-denied') {
        showToast('Firestore permission denied. Please set your Firebase Security Rules to Test Mode.', 'error');
      } else {
        console.error("Login/Signup Error:", err);
        showToast(err.message || 'Authentication failed. Please check your credentials.', 'error');
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

  const handleResetPassword = async () => {
    if (!email.trim()) {
      showToast('Please enter your email address first to reset password.', 'warning');
      return;
    }
    try {
      await resetPassword(email);
      showToast('Password reset email sent! Check your inbox to set a password.', 'success');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        showToast('No account found with this email.', 'error');
      } else {
        showToast('Failed to send password reset email.', 'error');
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4 bg-[#00060d] font-body-sm relative overflow-hidden text-white">
      
      {/* Top Left Back Button */}
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate(user ? '/dashboard' : '/')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        {user ? 'Back to Dashboard' : 'Back to Home'}
      </motion.button>

      {/* Removed the background glow effect to prevent green flash */}

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[420px] z-10 flex flex-col items-center"
      >
        
        {/* Title Section */}
        <motion.h1 variants={itemVariants} className="font-display-lg text-4xl font-black text-white mb-2 uppercase tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">CivicConnect</motion.h1>
        <motion.p variants={itemVariants} className="text-on-surface-variant font-mono text-xs mb-8 uppercase tracking-widest">AI-Powered Civic Network</motion.p>

        {/* Badges */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 mb-8">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container/5 border border-primary-container/20 text-[10px] font-mono uppercase tracking-widest text-white/80">
            <span className="material-symbols-outlined text-[14px] text-primary-container drop-shadow-[0_0_5px_#00f0ff]">bolt</span>
            AI Analysis
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container/5 border border-primary-container/20 text-[10px] font-mono uppercase tracking-widest text-white/80">
            <span className="material-symbols-outlined text-[14px] text-primary-container drop-shadow-[0_0_5px_#00f0ff]">shield</span>
            Verified Reports
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container/5 border border-primary-container/20 text-[10px] font-mono uppercase tracking-widest text-white/80">
            <span className="material-symbols-outlined text-[14px] text-primary-container drop-shadow-[0_0_5px_#00f0ff]">bar_chart</span>
            City Analytics
          </div>
        </motion.div>

        {/* Social / Demo Logins */}
        <motion.div variants={itemVariants} className="w-full flex flex-col gap-3 mb-6">
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: "rgba(3,20,39,1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-[#031427]/80 border border-white/10 transition-colors font-label-caps text-xs tracking-widest uppercase text-white shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
          >
            {/* Minimal SVG Google Logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: "rgba(0, 240, 255, 0.2)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleQuickDemo}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-container/10 border border-primary-container/30 transition-colors font-label-caps text-xs tracking-widest uppercase text-primary-container shadow-[0_0_15px_rgba(0,240,255,0.1)]"
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            Quick Demo Login
          </motion.button>
        </motion.div>

        {/* Divider */}
        <motion.div variants={itemVariants} className="w-full flex items-center gap-4 mb-6 opacity-40">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="text-xs text-white/60">or</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </motion.div>

        {/* Email/Password Form */}
        <motion.form variants={itemVariants} onSubmit={handleAuth} className="w-full flex flex-col gap-4" autoComplete="off">
          
          <AnimatePresence mode="popLayout">
            {isSignUp && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden"
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-white/40 text-[18px]">person</span>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Username"
                  autoComplete="off"
                  className="input-glass w-full rounded-xl py-3.5 pl-11 pr-4 text-sm font-mono placeholder-white/30"
                  required={isSignUp}
                />
              </motion.div>
            )}

            {isSignUp && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="relative overflow-hidden"
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-white/40 text-[18px]">location_on</span>
                </div>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="Locality (e.g. Downtown)"
                  autoComplete="off"
                  className="input-glass w-full rounded-xl py-3.5 pl-11 pr-4 text-sm font-mono placeholder-white/30"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-white/40 text-[18px]">mail</span>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="off"
              className="input-glass w-full rounded-xl py-3.5 pl-11 pr-4 text-sm font-mono placeholder-white/30"
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
              autoComplete="new-password"
              className="input-glass w-full rounded-xl py-3.5 pl-11 pr-11 text-sm font-mono placeholder-white/30"
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

          {!isSignUp && (
            <div className="flex justify-end w-full -mt-2 mb-2">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-[10px] uppercase font-mono tracking-widest text-white/50 hover:text-primary-container transition-colors"
              >
                Set / Forgot Password?
              </button>
            </div>
          )}

          {/* Role Selector */}
          <div className="flex bg-[#031427]/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden p-1">
            {(['citizen', 'official', 'moderator', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all ${
                  role === r 
                    ? 'bg-primary-container/20 text-primary-container shadow-[0_0_10px_rgba(0,240,255,0.1)]' 
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="primary-btn w-full py-4 rounded-xl flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:grayscale"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin"></span>
            ) : (
              <>
                {isSignUp ? 'Initialize Profile' : 'Authenticate'}
                <span className="material-symbols-outlined text-[18px]">login</span>
              </>
            )}
          </motion.button>
        </motion.form>

        <motion.div variants={itemVariants} className="mt-6 text-xs font-mono text-white/40 uppercase tracking-widest">
          {isSignUp ? "Existing Node? " : "New to the Network? "}
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary-container hover:text-white drop-shadow-[0_0_5px_rgba(0,240,255,0.4)] font-bold cursor-pointer transition-colors"
          >
            {isSignUp ? 'Sign in' : 'Register'}
          </button>
        </motion.div>

        {/* Small Bottom Demo Button matching screenshot */}
        <motion.button 
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleQuickDemo}
          type="button"
          className="mt-8 flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/5 bg-transparent hover:bg-white/5 transition-colors text-[11px] text-white/50"
        >
          <span className="material-symbols-outlined text-[14px] text-yellow-500">bolt</span>
          Quick Demo Mode
        </motion.button>

      </motion.div>
    </div>
  );
};
export default Login;
