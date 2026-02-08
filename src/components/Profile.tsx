import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, Github, Chrome, UserPlus, ArrowRight, Loader2, CheckCircle2, User, Shield } from "lucide-react";
import { Avatar } from "./ui/Avatar";

const Profile: React.FC = () => {
  const [mode, setMode] = useState<"login" | "signup" | "account">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setIsSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSuccess(true);
    setTimeout(() => {
        setMode("account");
        setIsSuccess(false);
    }, 2000);
  };

  const handleOAuth = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        setMode("account");
        setIsSuccess(false);
      }, 1500);
    }, 1000);
  };

  if (mode === "account") {
    return (
      <div className="flex items-center justify-center min-h-[70vh] p-6 lg:p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-surface/30 backdrop-blur-2xl border border-border rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
        >
          <header className="flex justify-center mb-10">
            <Avatar 
              size="lg" 
              src="https://cdn.flyonui.com/fy-assets/avatar/avatar-1.png" 
              fallback="AK" 
              status="online"
              label={{ name: "Awais Khan", email: "awais@aura.io" }}
            />
          </header>

          <div className="space-y-3">
            <div className="group flex items-center justify-between p-4 rounded-2xl bg-surface/50 border border-border/50 hover:border-primary/20 transition-all cursor-default">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
                  <Mail className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm font-medium text-text/80">awais@aura.io</span>
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
              onClick={() => setMode("login")}
              className="w-full h-11 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted hover:text-red-500 transition-colors"
            >
              Sign Out of Aura
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-6 lg:p-12">
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
                      <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">Name</label>
                      <input
                        type="text"
                        placeholder="Your name"
                        required
                        className="w-full h-11 bg-surface/50 border border-border/50 rounded-2xl px-4 text-sm text-text placeholder:text-text-muted/20 focus:outline-hidden focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest ml-1">Email</label>
                  <input
                    type="email"
                    placeholder="m@aura.io"
                    required
                    className="w-full h-11 bg-surface/50 border border-border/50 rounded-2xl px-4 text-sm text-text placeholder:text-text-muted/20 focus:outline-hidden focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Password</label>
                    {mode === "login" && (
                      <a href="#" className="text-[9px] font-bold text-primary/40 hover:text-primary transition-colors tracking-widest">
                        RECOVER
                      </a>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full h-11 bg-surface/50 border border-border/50 rounded-2xl px-4 text-sm text-text placeholder:text-text-muted/20 focus:outline-hidden focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

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
