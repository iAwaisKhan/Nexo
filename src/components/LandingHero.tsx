import React from "react";
import { motion } from "framer-motion";
import { Play, ArrowRight } from "lucide-react";

const LandingHero: React.FC = () => {
  return (
    <div className="relative h-screen flex flex-col items-center justify-start pt-24 px-4 overflow-hidden bg-background font-sans">
      {/* Background Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Decorative Floating Elements (Pushed to background) */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 0.2 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute -left-20 top-[40%] -translate-y-1/2 hidden 2xl:block w-[480px] h-[320px] pointer-events-none"
      >
        <div className="bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden backdrop-blur-sm h-full">
           <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
             <div className="flex gap-2">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
               <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
               <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
             </div>
             <span className="text-[10px] text-text-muted font-mono tracking-widest uppercase">system.sys</span>
           </div>
           <div className="p-6 font-mono text-xs text-primary/40 leading-relaxed">
             <div className="mb-2 text-text/30">PROCESS [0x4F2]: Optimized</div>
             <div className="ml-4">Memory: Stable</div>
             <div className="ml-4">Focus Hook: Active</div>
             <div className="mb-2 ml-4">Flow State: Synchronized</div>
           </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 0.2 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute -right-20 top-[30%] -translate-y-1/2 hidden 2xl:block w-[400px] h-[280px] pointer-events-none"
      >
        <div className="bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden backdrop-blur-sm h-full">
           <div className="p-6 font-mono text-xs text-primary/40 leading-relaxed">
             <div className="flex justify-between mb-4 border-b border-border/10 pb-2">
               <span>TASKS</span>
               <span>84%</span>
             </div>
             <div className="space-y-2">
               <div className="h-1.5 w-full bg-primary/5 rounded-full overflow-hidden">
                 <div className="h-full w-[84%] bg-primary/20" />
               </div>
               <div className="h-1.5 w-full bg-primary/5 rounded-full overflow-hidden">
                 <div className="h-full w-[45%] bg-primary/20" />
               </div>
             </div>
           </div>
        </div>
      </motion.div>

      {/* Main Content (Z-10) */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface/50 border border-border backdrop-blur-md mb-8"
        >
          <span className="text-primary font-bold">⚡</span>
          <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">Unified Resonance 2.0</span>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center max-w-4xl mx-auto mb-8"
        >
          <h1 className="text-6xl md:text-8xl font-serif font-extralight text-text mb-4 tracking-[-0.02em] leading-tight">
            Aura: Your Single
            <span className="block mt-4 bg-gradient-to-r from-primary via-primary/50 to-primary bg-clip-text text-transparent filter drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] font-handwriting font-bold py-4 leading-[1.1]">
              Dashboard for Deep Flow
            </span>
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-text-muted text-lg md:text-xl text-center max-w-2xl mb-12 leading-relaxed font-serif-display"
        >
          Experience the ultimate synergy of notes, tasks, and code. Seamlessly
          bridge the gap between learning and building in a distraction-free
          environment.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <button className="flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all duration-300 shadow-[0_0_40px_rgba(59,130,246,0.4)] group">
            Start Your Flow
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="flex items-center gap-2 px-8 py-4 bg-surface hover:bg-surface/80 text-text border border-border rounded-xl font-bold transition-all duration-300">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="w-4 h-4 fill-primary text-primary" />
            </div>
            View Demo
          </button>
        </motion.div>

        {/* Dashboard Mockup (Bottom-Up Optimization) */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="w-full max-w-6xl mx-auto relative group px-4 lg:px-0"
        >
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="bg-surface/30 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden aspect-[16/9] relative">
            {/* Mockup Frame Content */}
            <div className="w-full h-full p-1 bg-gradient-to-br from-white/10 to-transparent">
              <div className="w-full h-full bg-background/40 rounded-[2.2rem] flex flex-col items-center justify-center text-text-muted/20">
                <div className="relative w-full h-full p-8 md:p-12 overflow-hidden">
                  {/* Mockup Inner Design */}
                  <div className="grid grid-cols-12 gap-6 h-full">
                    <div className="col-span-3 space-y-4">
                      <div className="h-32 bg-primary/5 rounded-3xl border border-primary/10" />
                      <div className="h-full bg-primary/5 rounded-3xl border border-primary/10" />
                    </div>
                    <div className="col-span-6 space-y-4">
                      <div className="h-full bg-primary/5 rounded-[3rem] border border-primary/10" />
                    </div>
                    <div className="col-span-3 space-y-4">
                      <div className="h-1/2 bg-primary/5 rounded-3xl border border-primary/10" />
                      <div className="h-1/2 bg-primary/5 rounded-3xl border border-primary/10" />
                    </div>
                  </div>
                  {/* Center Overlay Text (Optional) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-30">Dashboard Preview Resonance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Glass Glow behind mockup */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-40 bg-primary/10 blur-[100px] rounded-full -z-10" />
        </motion.div>
      </div>
    </div>
  );
};

export default LandingHero;

