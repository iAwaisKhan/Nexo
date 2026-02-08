import React from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  FileText, 
  CheckCircle2, 
  Code2, 
  Copy, 
  Share2 
} from "lucide-react";

const LandingHero: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start pt-24 px-4 overflow-hidden bg-background font-sans">
      {/* Background Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Decorative Floating Elements (Pushed to background) */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 0.1 }}
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
        animate={{ x: 0, opacity: 0.1 }}
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
      <div className="relative z-10 w-full flex flex-col items-center pt-24 md:pt-32">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center max-w-6xl mx-auto mb-12 md:mb-16 px-4"
        >
          <h1 className="text-3xl md:text-6xl font-serif font-medium text-text mb-2 tracking-[-0.02em] leading-tight">
            Nexo: Your Single
            <span className="block mt-2 text-primary font-handwriting py-2 leading-[1.1] text-5xl md:text-9xl">
              Dashboard for Deep Flow
            </span>
          </h1>
        </motion.div>

        {/* Description - Removed */}

        {/* Mockup Dashboard Section (The Requested Image Implementation) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 relative"
        >
          {/* Main Focus Card (Top Left) - Height Reduced */}
          <div className="md:col-span-8 bg-surface/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 md:p-6 relative overflow-hidden group shadow-2xl">
            {/* Wavy Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/20 to-transparent" />
              <svg className="absolute bottom-0 left-0 w-full scale-y-150 origin-bottom" viewBox="0 0 1440 320">
                <path fill="rgba(59, 130, 246, 0.2)" d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,138.7C960,160,1056,224,1152,245.3C1248,267,1344,245,1392,234.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              </svg>
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl font-serif font-medium text-text mb-1">Current Session: Deep Work</h3>
              <p className="text-text-muted mb-4 font-redhat">Analyzing the new backend architecture</p>
              
              <div className="flex items-end gap-4 mb-0">
                <span className="text-7xl font-sans font-bold text-text tracking-tighter">24:52</span>
                <span className="text-2xl font-sans text-text-muted mb-1 tracking-tight">/ 45:00</span>
              </div>
            </div>
          </div>

          {/* Recent Notes (Top Right) */}
          <div className="md:col-span-4 bg-surface/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h4 className="font-serif font-bold text-text text-lg">Recent Notes</h4>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-surface/50 border border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                <h5 className="font-bold text-sm text-text mb-1 group-hover:text-primary transition-colors">Tailwind v4 Thoughts</h5>
                <p className="text-[11px] text-text-muted line-clamp-2">The new engine feels incredibly fast. Native support for light-weight...</p>
              </div>
            </div>
          </div>

          {/* Code Snippet (Full Width) */}
          <div className="md:col-span-12 bg-surface/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-5 md:p-6 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                <h4 className="font-serif font-bold text-text text-base md:text-lg">Snippet: Next.js Middleware</h4>
              </div>
              <div className="flex gap-4">
                <Copy className="w-4 h-4 text-text-muted hover:text-primary cursor-pointer" />
                <Share2 className="w-4 h-4 text-text-muted hover:text-primary cursor-pointer" />
              </div>
            </div>

            <div className="flex-1 bg-[#050505] rounded-[1.5rem] p-5 font-mono text-sm leading-relaxed overflow-hidden border border-white/5 relative">
              <div className="flex gap-1.5 absolute top-3 left-6">
                <div className="w-2 h-2 rounded-full bg-red-500/40" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
                <div className="w-2 h-2 rounded-full bg-green-500/40" />
              </div>
              <div className="mt-6">
                <pre className="text-xs">
                  <code className="text-gray-400">
                    <span className="text-primary">export function</span>{" "}
                    <span className="text-blue-400">middleware</span>(request) {"{"}
                    {"\n"}{"  "}
                    <span className="text-gray-500">// Check authentication status</span>
                    {"\n"}{"  "}
                    <span className="text-primary">const</span> token = request.cookies.get(
                    <span className="text-green-400">'session'</span>);
                    {"\n\n"}{"  "}
                    <span className="text-primary">if</span> (!token) {"{"}
                    {"\n"}{"    "}
                    <span className="text-primary">return</span> Response.redirect(
                    <span className="text-blue-400">new</span> URL(
                    <span className="text-green-400">'/login'</span>, request.url));
                    {"\n"}{"  "}
                    {"}"}
                    {"\n"}{"}"}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Padding for bottom */}
        <div className="h-32 w-full" />
      </div>
    </div>
  );
};

export default LandingHero;

