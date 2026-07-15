import React from "react";
import { motion } from "framer-motion";
import { 
  Bug, 
  Lightbulb, 
  AlertCircle,
  BarChart3
} from "lucide-react";

export const DebugJournal: React.FC = () => (
  <div className="my-8 p-6 rounded-3xl bg-red-500/5 border border-red-500/10 space-y-4">
    <div className="flex items-center gap-3 text-red-500">
      <Bug className="w-5 h-5" />
      <span className="text-xs font-bold uppercase tracking-[0.3em]">Debug Journal</span>
    </div>
    <div className="grid gap-4">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-text/30 uppercase">The Culprit (Problem)</label>
        <p className="text-sm font-medium italic text-text/60 italic">Describe the glitch in the frequency...</p>
      </div>
      <div className="space-y-1 border-l-2 border-red-500/20 pl-4">
        <label className="text-[10px] font-bold text-text/30 uppercase">Hypothesis</label>
        <p className="text-sm font-medium text-text/80">I suspect the issue lies in the state reconciliation...</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-red-500/60">Active Investigation</span>
      </div>
    </div>
  </div>
);

export const FeynmanBlock: React.FC = () => (
  <div className="my-8 p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
    <div className="flex items-center gap-3 text-primary">
      <Lightbulb className="w-5 h-5" />
      <span className="text-xs font-bold uppercase tracking-[0.3em]">Feynman Explanation</span>
    </div>
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-text/30 uppercase">Step 1: Simplify for a Child</span>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-border/5 text-sm leading-relaxed italic text-text/80">
          "Imagine knowledge is like a tree..."
        </div>
      </div>
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-text/30 uppercase">Step 2: Identifying the Void (Gaps)</span>
        <div className="flex items-center gap-2 text-primary/60">
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">3 knowledge gaps detected</span>
        </div>
      </div>
    </div>
  </div>
);

export const FocusAnalyticsBlock: React.FC<{ sessions: any[] }> = ({ sessions }) => {
  const totalSeconds = sessions.reduce((acc, s) => acc + s.duration, 0);
  const hours = (totalSeconds / 3600).toFixed(1);
  
  return (
    <div className="my-8 p-6 rounded-3xl bg-surface/50 backdrop-blur-md border border-border/10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 text-text/40">
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Integrated Flow Analytics</span>
        </div>
        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em]">Live Data</div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-1">
          <div className="text-3xl font-display text-text">{hours}h</div>
          <div className="text-[10px] font-bold text-text/20 uppercase tracking-widest">Total Deep Focus</div>
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-display text-text">{sessions.length}</div>
          <div className="text-[10px] font-bold text-text/20 uppercase tracking-widest">Sessions Completed</div>
        </div>
      </div>

      <div className="mt-8 flex gap-1 h-8 items-end">
        {[40, 70, 30, 90, 50, 60, 80].map((h, i) => (
          <motion.div 
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            className="flex-1 bg-primary/20 rounded-t-sm"
          />
        ))}
      </div>
    </div>
  );
};
