import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Chrome, ArrowRight, Loader2, CheckCircle2, Shield } from "lucide-react";
import { Avatar } from "./ui/Avatar";
import FocusAnalytics from "./FocusAnalytics";
import { useAuthStore } from "../store/useAuthStore";

const Profile: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isPasswordRecovery,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    requestPasswordReset,
    updatePassword,
    signOut,
  } = useAuthStore();
  
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setIsSuccess(false);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const fullName = String(form.get("name") || "").trim();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
        setIsSuccess(true);
      } else {
        const requiresConfirmation = await signUpWithEmail(email, password, fullName);
        setIsSuccess(!requiresConfirmation);
        if (requiresConfirmation) setErrorMessage("Check your email to confirm your account.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to complete authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    if (provider !== "Google") {
      alert(`${provider} login is not supported yet.`);
      return;
    }
    
    setIsLoading(true);
    try {
      await signInWithGoogle();
      setIsSuccess(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to start Google sign-in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordRecovery = async () => {
    if (!email.trim()) {
      setErrorMessage("Enter your email address first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await requestPasswordReset(email.trim());
      setErrorMessage("Password reset link sent. Check your inbox.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send the reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await updatePassword(newPassword);
      setNewPassword("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update your password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated && user && isPasswordRecovery) {
    return (
      <div className="flex items-center justify-center min-h-0 md:min-h-[70vh] p-4 md:p-6 lg:p-12">
        <motion.form
          onSubmit={handlePasswordUpdate}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-surface/30 backdrop-blur-2xl border border-border rounded-[2.5rem] shadow-2xl p-8 space-y-6"
        >
          <div>
            <h2 className="text-2xl font-display text-text tracking-tight">Choose a new password</h2>
            <p className="mt-2 text-xs text-text-muted">Use at least 8 characters for your Nexo account.</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="recovery-password" className="text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">New password</label>
            <input
              id="recovery-password"
              name="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              className="w-full h-11 bg-surface/50 border border-border/50 rounded-2xl px-4 text-sm text-text focus:outline-hidden focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          {errorMessage && <p role="alert" className="text-xs text-red-500/80">{errorMessage}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-text text-background text-xs font-bold uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
          </button>
        </motion.form>
      </div>
    );
  }

  // If user is authenticated, we show their account instead of the forms!
  if (isAuthenticated && user) {
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "User";
    
    return (
      <div className="flex flex-col md:flex-row items-center md:items-center justify-center min-h-0 md:min-h-[70vh] p-4 md:p-6 lg:p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-surface/30 backdrop-blur-2xl border border-border rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
        >
          <header className="flex justify-center mb-10">
            <Avatar 
              size="lg" 
              src={avatarUrl} 
              fallback={fullName.substring(0, 2).toUpperCase()} 
              label={{ name: fullName, email: user.email || "" }}
            />
          </header>

          <div className="space-y-3">
            <div className="group flex items-center justify-between p-4 rounded-2xl bg-surface/50 border border-border/50 hover:border-primary/20 transition-all cursor-default">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
                  <Mail className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm font-medium text-text/80">{user.email}</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60 px-2 py-1 bg-primary/5 rounded-full">Verified</span>
            </div>

            <div className="group flex items-center justify-between p-4 rounded-2xl bg-surface/50 border border-border/50 hover:border-primary/20 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm font-medium text-text/80">Security & Privacy</span>
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted/30 group-hover:text-primary/40 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/40">
            <button 
              onClick={() => signOut()}
              className="w-full h-11 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted hover:text-red-500 transition-colors"
            >
              Sign Out of Nexo
            </button>
          </div>
        </motion.div>

        {/* Heatmap Section */}
        <div className="w-full max-w-full md:max-w-sm lg:max-w-3xl lg:ml-8 mt-6 lg:mt-0 flex flex-col justify-center">
          <FocusAnalytics />
        </div>
      </div>
    );
  }

  // Fallback for Users who 'skipped' Auth allowing them to login from Dashboard Profile directly
  return (
    <div className="flex items-center justify-center min-h-0 md:min-h-[70vh] p-4 md:p-6 lg:p-12">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-surface/30 backdrop-blur-2xl border border-border rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        {/* Card Header */}
        <div className="p-8 pb-4 flex flex-col gap-1 relative">
          <div className="absolute top-8 right-8">
            <button 
              onClick={toggleMode}
              className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/60 hover:text-primary transition-colors"
            >
              {mode === "login" ? "Sign Up" : "Login"}
            </button>
          </div>
          <h2 className="text-2xl font-display text-text tracking-tight">
            {isSuccess ? "Identity Secured" : (mode === "login" ? "Welcome back" : "Join the Flow")}
          </h2>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.1em] opacity-60">
            {isSuccess ? "Syncing Resonance..." : (mode === "login" ? "Access your personal workspace" : "Create your decentralized identity")}
          </p>
        </div>

        {/* Card Content */}
        <div className="px-8 pb-8 pt-2">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-4">
                <AnimatePresence mode="popLayout">
                  {mode === "signup" && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-1.5"
                    >
                      <label htmlFor="auth-name" className="text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">Name</label>
                      <input
                        id="auth-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Your name"
                        required
                        className="w-full h-11 bg-surface/50 border border-border/50 rounded-2xl px-4 text-sm text-text placeholder:text-text-muted/20 focus:outline-hidden focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1.5">
                  <label htmlFor="auth-email" className="text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">Email</label>
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="m@nexo.io"
                    required
                    className="w-full h-11 bg-surface/50 border border-border/50 rounded-2xl px-4 text-sm text-text placeholder:text-text-muted/20 focus:outline-hidden focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label htmlFor="auth-password" className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Password</label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={handlePasswordRecovery}
                        disabled={isLoading}
                        className="text-[9px] font-bold text-primary/40 hover:text-primary disabled:opacity-40 transition-colors tracking-widest"
                      >
                        RECOVER
                      </button>
                    )}
                  </div>
                  <input
                    id="auth-password"
                    name="password"
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    minLength={8}
                    placeholder="••••••••"
                    required
                    className="w-full h-11 bg-surface/50 border border-border/50 rounded-2xl px-4 text-sm text-text placeholder:text-text-muted/20 focus:outline-hidden focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {errorMessage && (
                <p role="status" className="text-[10px] leading-relaxed text-red-500/80" aria-live="polite">
                  {errorMessage}
                </p>
              )}

              {/* Card Footer */}
              <div className="flex flex-col gap-3 pt-2">
                <button 
                  disabled={isLoading}
                  type="submit" 
                  className="w-full h-11 bg-text text-background text-xs font-bold uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (mode === "login" ? "Enter Dashboard" : "Create Account")}
                </button>
                
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50"></div></div>
                  <div className="relative flex justify-center text-[8px] uppercase tracking-[0.4em] font-bold"><span className="bg-surface/30 px-3 backdrop-blur-xl text-text-muted/40">OR</span></div>
                </div>

                <button 
                  type="button"
                  onClick={() => handleOAuth("Google")}
                  disabled={isLoading}
                  className="w-full h-11 rounded-2xl bg-surface/50 border border-border/50 hover:border-primary/20 transition-all flex items-center justify-center gap-2 group"
                >
                  <Chrome className="w-4 h-4 text-text-muted group-hover:text-text transition-colors" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted/60 group-hover:text-text">Provider login</span>
                </button>
              </div>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-6"
            >
              <div className="relative mx-auto w-20 h-20">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-xl"
                />
                <div className="relative w-full h-full bg-primary/10 rounded-[2.5rem] flex items-center justify-center border border-primary/20 shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-text">Access Granted</p>
                <p className="text-[9px] font-medium text-text-muted/50 uppercase tracking-widest">Workspace resonance synced</p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
