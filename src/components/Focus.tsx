import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Brain, Coffee, Volume2, VolumeX, ShieldAlert, Waves, AlertTriangle } from "lucide-react";
import { useAmbientSound, SoundType } from "../hooks/useAmbientSound";
import { useAppStore, AppFocusSession } from "../store/useAppStore";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./ui/ErrorFallback";
import FocusAnalytics from "./FocusAnalytics";

const FocusMode: React.FC = () => {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [isMuted, setIsMuted] = useState(false);
  const [soundType, setSoundType] = useState<SoundType>("none");
  const [isStrictMode, setIsStrictMode] = useState(false);
  const [showStrictWarning, setShowStrictWarning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  useAmbientSound(isActive, isMuted, soundType);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number | null>(null);
  const addFocusSession = useAppStore((state) => state.addFocusSession);

  // Timer Countdown Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      handleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  // Strict Mode Logic
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement && isStrictMode && isActive) {
        setIsActive(false);
        setShowStrictWarning(true);
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [isStrictMode, isActive]);

  const logSession = useCallback(async (duration: number) => {
    if (duration < 10) return;
    const session: AppFocusSession = {
      id: crypto.randomUUID(),
      startTime: sessionStartRef.current || Date.now(),
      endTime: Date.now(),
      duration,
      targetId: "manual-focus",
      targetType: "focus",
      date: new Date().toISOString().split("T")[0],
      hour: new Date().getHours(),
    };
    addFocusSession(session);
  }, [addFocusSession]);

  const handleComplete = useCallback(async () => {
    setIsActive(false);
    if (isStrictMode && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (mode === "focus" && sessionStartRef.current) {
      const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      await logSession(duration);
      setCompletedSessions((p) => p + 1);
    }
    const next = mode === "focus" ? "break" : "focus";
    setMode(next);
    setTimeLeft(next === "focus" ? focusMinutes * 60 : breakMinutes * 60);
  }, [mode, isStrictMode, focusMinutes, breakMinutes, logSession]);

  const toggleTimer = useCallback(async () => {
    if (isEditing) setIsEditing(false);
    
    if (!isActive) {
      sessionStartRef.current = Date.now();
      if (isStrictMode) {
        try { await document.documentElement.requestFullscreen(); } catch {}
      }
    } else {
      if (mode === "focus" && sessionStartRef.current) {
        logSession(Math.floor((Date.now() - sessionStartRef.current) / 1000));
      }
      if (isStrictMode && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }
    setIsActive((p) => !p);
  }, [isActive, isEditing, isStrictMode, mode, logSession]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsEditing(false);
    setTimeLeft(mode === "focus" ? focusMinutes * 60 : breakMinutes * 60);
    if (isStrictMode && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, [mode, focusMinutes, breakMinutes, isStrictMode]);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(1, Math.min(120, parseInt(e.target.value) || 1));
    if (mode === "focus") {
      setFocusMinutes(val);
      if (!isActive) setTimeLeft(val * 60);
    } else {
      setBreakMinutes(val);
      if (!isActive) setTimeLeft(val * 60);
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setIsActive(false)}>
      <div className="w-full min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center p-4">
        
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-12">
          
          {/* Top Switcher */}
          <div className="flex bg-surface/30 backdrop-blur-2xl p-1 rounded-full border border-border/10 shadow-sm transition-opacity duration-500" style={{ opacity: isActive ? 0.3 : 1 }}>
            {(["focus", "break"] as const).map((m) => (
              <button
                key={m}
                disabled={isActive}
                onClick={() => {
                  setMode(m);
                  setTimeLeft(m === "focus" ? focusMinutes * 60 : breakMinutes * 60);
                  setIsActive(false);
                }}
                className={`relative px-6 py-2 rounded-full text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 ${mode === m ? "text-text" : "text-text-muted hover:text-text/80"}`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="focus-pill"
                    className="absolute inset-0 bg-surface shadow-sm rounded-full border border-border/20"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {m === "focus" ? <Brain className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5" />}
                  {m === "focus" ? "Flow" : "Rest"}
                </span>
              </button>
            ))}
          </div>

          {/* Master Timer */}
          <div className="relative flex flex-col items-center justify-center w-full py-10 cursor-pointer group" onClick={() => !isActive && setIsEditing(true)}>
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-end justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    autoFocus
                    type="number"
                    min="1"
                    max="120"
                    value={mode === "focus" ? focusMinutes : breakMinutes}
                    onChange={handleDurationChange}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
                    className="w-48 bg-transparent text-[8rem] leading-none font-light tracking-tighter text-center outline-none border-b-2 border-primary/30 focus:border-primary text-text transition-colors"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="timer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex flex-col items-center"
                >
                  <span className={`text-[8rem] md:text-[10rem] font-light tabular-nums tracking-tighter leading-none transition-colors duration-700 ${isActive ? (mode === "focus" ? "text-primary" : "text-emerald-400") : "text-text group-hover:text-primary/80"}`}>
                    {formatTime(timeLeft)}
                  </span>
                  
                  {/* Action Status label */}
                  <motion.div
                    animate={{ opacity: isActive ? [0.4, 1, 0.4] : 0 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className={`mt-4 text-xs font-bold uppercase tracking-[0.4em] ${mode === "focus" ? "text-primary" : "text-emerald-400"}`}
                  >
                    {isActive ? "Deep Work Active" : ""}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Minimal Controls */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-text-muted hover:text-text transition-colors p-3"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleTimer}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${isActive ? "bg-surface/50 text-text border border-border/20 backdrop-blur-xl" : "bg-text text-background hover:scale-105"}`}
            >
              {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>

            <button
              onClick={resetTimer}
              className="text-text-muted hover:text-text transition-colors p-3"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Settings Bar */}
          <AnimatePresence>
            {!isActive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-6 text-xs uppercase tracking-[0.1em] font-medium text-text-muted"
              >
                <div className="flex items-center gap-2">
                  <Waves className="w-3.5 h-3.5" />
                  <select
                    value={soundType}
                    onChange={(e) => setSoundType(e.target.value as SoundType)}
                    className="bg-transparent outline-none cursor-pointer hover:text-text transition-colors appearance-none"
                  >
                    <option value="none">No Sound</option>
                    <option value="brown-noise">Brown Noise</option>
                    <option value="pink-noise">Pink Noise</option>
                  </select>
                </div>

                <div className="w-1 h-1 rounded-full bg-border/50" />

                <button
                  onClick={() => setIsStrictMode((p) => !p)}
                  className={`flex items-center gap-2 transition-colors ${isStrictMode ? "text-orange-500" : "hover:text-text"}`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Strict Mode {isStrictMode ? "On" : "Off"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Analytics Section */}
        <div className="w-full mt-24">
          <FocusAnalytics />
        </div>

        {/* Strict Warning Modal */}
        <AnimatePresence>
          {showStrictWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-sm w-full bg-surface border border-border/20 rounded-3xl p-8 text-center shadow-2xl"
              >
                <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-light text-text mb-2">Focus Broken</h3>
                <p className="text-sm text-text-muted mb-8 line-clamp-2 leading-relaxed">
                  You left fullscreen. Strict mode requires continuous attention.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowStrictWarning(false)}
                    className="px-6 py-2 rounded-full border border-border/20 text-xs font-medium uppercase tracking-widest text-text-muted hover:text-text transition-colors"
                  >
                    Take a break
                  </button>
                  <button
                    onClick={() => { setShowStrictWarning(false); toggleTimer(); }}
                    className="px-6 py-2 rounded-full bg-text text-background text-xs font-medium uppercase tracking-widest transition-transform hover:scale-105"
                  >
                    Resume
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default FocusMode;
