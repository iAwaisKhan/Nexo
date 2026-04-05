import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Brain, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useAppStore, AppFocusSession } from "../store/useAppStore";

const FocusMode: React.FC = () => {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [isMuted, setIsMuted] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number | null>(null);
  
  const addFocusSession = useAppStore(state => state.addFocusSession);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleComplete = async () => {
    setIsActive(false);
    if (mode === "focus" && sessionStartRef.current) {
        const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
        await logSession(duration);
    }
    // Simple notification sound or alert could go here
    const nextMode = mode === "focus" ? "break" : "focus";
    setMode(nextMode);
    setTimeLeft(nextMode === "focus" ? focusMinutes * 60 : breakMinutes * 60);
  };

  const toggleTimer = () => {
    if (isEditing) setIsEditing(false);
    if (!isActive) {
      sessionStartRef.current = Date.now();
    } else {
      if (mode === "focus" && sessionStartRef.current) {
        const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
        logSession(duration);
      }
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsEditing(false);
    setTimeLeft(mode === "focus" ? focusMinutes * 60 : breakMinutes * 60);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    if (mode === "focus") {
      setFocusMinutes(val);
      if (!isActive) setTimeLeft(val * 60);
    } else {
      setBreakMinutes(val);
      if (!isActive) setTimeLeft(val * 60);
    }
  };

  const logSession = async (duration: number) => {
    if (duration < 10) return; // Prevent logging very short accidental sessions

    const session: AppFocusSession = {
      id: Date.now().toString(),
      startTime: sessionStartRef.current || Date.now(),
      endTime: Date.now(),
      duration: duration,
      targetId: "manual-focus",
      targetType: "focus",
      date: new Date().toISOString().split('T')[0],
      hour: new Date().getHours()
    };

    addFocusSession(session);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = mode === "focus" ? (timeLeft / (25 * 60)) : (timeLeft / (5 * 60));

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12">
      {/* Mode Switcher */}
      <div className="flex bg-surface/50 backdrop-blur-md p-1.5 rounded-2xl border border-border/10">
        <button
          onClick={() => { setMode("focus"); setTimeLeft(25 * 60); setIsActive(false); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all text-xs font-bold uppercase tracking-widest ${
            mode === "focus" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text/40 hover:text-text/60"
          }`}
        >
          <Brain className="w-4 h-4" />
          Deep Focus
        </button>
        <button
          onClick={() => { setMode("break"); setTimeLeft(5 * 60); setIsActive(false); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all text-xs font-bold uppercase tracking-widest ${
            mode === "break" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text/40 hover:text-text/60"
          }`}
        >
          <Coffee className="w-4 h-4" />
          Short Break
        </button>
      </div>

      {/* Main Timer Display */}
      <div className="relative group">
        <svg className="w-80 h-80 -rotate-90">
          <circle
            cx="160"
            cy="160"
            r="150"
            className="stroke-primary/5 fill-none"
            strokeWidth="4"
          />
          <motion.circle
            cx="160"
            cy="160"
            r="150"
            className="stroke-primary fill-none shadow-2xl"
            strokeWidth="4"
            strokeLinecap="round"
            style={{ pathLength: progress }}
            transition={{ duration: 0.5, ease: "linear" }}
          />
        </svg>

        <div 
          className="absolute inset-0 flex flex-col items-center justify-center space-y-2 cursor-pointer z-20"
          onClick={() => !isActive && setIsEditing(true)}
        >
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
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
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                  className="w-32 bg-transparent text-7xl font-display text-primary text-center outline-none border-b-2 border-primary/20 focus:border-primary transition-all tabular-nums"
                />
                <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mt-2">Adjust Minutes</span>
              </motion.div>
            ) : (
              <motion.span
                key={timeLeft}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-7xl font-display text-text tabular-nums tracking-tighter"
              >
                {formatTime(timeLeft)}
              </motion.span>
            )}
          </AnimatePresence>
          {!isEditing && (
            <motion.div 
              animate={{ opacity: isActive ? [0.4, 1, 0.4] : 0.6 }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] ml-1"
            >
              {isActive ? "Flowing" : "Paused"}
            </motion.div>
          )}
        </div>

        {/* Ambient Breath Ring */}
        {isActive && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: [0, 0.2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border border-primary/20 shadow-[0_0_50px_rgba(var(--color-primary-rgb),0.1)]"
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-12 h-12 rounded-full border border-border/10 flex items-center justify-center text-text/30 hover:text-primary transition-all hover:bg-primary/5"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTimer}
          className="w-20 h-20 rounded-[2.5rem] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          {isActive ? <Pause className="w-8 h-8 relative z-10" /> : <Play className="w-8 h-8 relative z-10 ml-1" />}
        </motion.button>

        <button
          onClick={resetTimer}
          className="w-12 h-12 rounded-full border border-border/10 flex items-center justify-center text-text/30 hover:text-primary transition-all hover:bg-primary/5"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Presets - Auto Adjustments */}
      <AnimatePresence>
        {!isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex gap-3 mt-8"
          >
            {[
              { label: "Zen", mins: 60 },
              { label: "Deep", mins: 45 },
              { label: "Classic", mins: 25 },
              { label: "Short", mins: 15 }
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setFocusMinutes(preset.mins);
                  if (mode === 'focus') setTimeLeft(preset.mins * 60);
                }}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  focusMinutes === preset.mins 
                    ? "bg-primary text-white border-primary" 
                    : "border-border/10 text-text/40 hover:border-primary/30 hover:text-text"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Hint */}
      <AnimatePresence>
        {!isActive && mode === "focus" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-text/30 text-xs font-medium italic"
          >
            <Sparkles className="w-3 h-3" />
            <span>Find your sanctuary. Silence the noise.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FocusMode;
