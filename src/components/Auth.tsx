import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { GraduationCap, Loader2, Cloud, Zap, Shield, ArrowRight } from "lucide-react";

const Auth: React.FC = () => {
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Sign-in failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.02, 0.05, 0.02],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-md w-full mx-4"
      >
        {/* Logo & Branding */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mx-auto mb-6"
          >
            <GraduationCap className="w-8 h-8 text-primary" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-display italic tracking-tight mb-3"
          >
            Welcome to Nexo
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-text/40 font-medium max-w-xs mx-auto"
          >
            Sign in to sync your workspace across all your devices.
          </motion.p>
        </div>

        {/* Sign-in Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface/40 backdrop-blur-xl border border-border/10 rounded-3xl p-8 space-y-6"
        >
          {/* Google Sign-in Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-white/95 text-gray-700 rounded-2xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            {isLoading ? "Connecting..." : "Continue with Google"}
          </motion.button>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500 text-center bg-red-500/5 rounded-xl px-4 py-3 font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border/10" />
            <span className="text-[10px] font-bold text-text/20 uppercase tracking-[0.3em]">
              Why sign in?
            </span>
            <div className="flex-1 h-px bg-border/10" />
          </div>

          {/* Features */}
          <div className="space-y-3">
            {[
              { icon: Cloud, label: "Cross-device sync", desc: "Access your workspace anywhere" },
              { icon: Shield, label: "Secure & private", desc: "Your data is encrypted and isolated" },
              { icon: Zap, label: "Instant sync", desc: "Real-time updates across devices" },
            ].map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary/60" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-text/80">{label}</div>
                  <div className="text-xs text-text/30 font-medium">{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Skip / Continue offline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8"
        >
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // Allow using the app without auth by dispatching a custom event
              window.dispatchEvent(new CustomEvent('nexo:skip-auth'));
            }}
            className="inline-flex items-center gap-2 text-xs text-text/30 hover:text-primary font-semibold transition-colors group"
          >
            Continue without signing in
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="text-[10px] text-text/15 mt-2 font-medium">
            Your data will stay local to this browser only.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
