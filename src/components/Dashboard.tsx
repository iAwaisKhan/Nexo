import React from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  FileText,
  CheckCircle2,
  Code2,
  Copy,
  Share2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { storage } from '../js/storageManager';

const Dashboard: React.FC = () => {
  // Real data fetching
  const { data: notes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      await storage.init();
      return await storage.getAll<any>('notes');
    }
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      await storage.init();
      return await storage.getAll<any>('tasks');
    }
  });

  const MOCK_NOTES = [
    { id: 'm1', title: 'Rust Memory Safety', contentSnippet: 'Exploring Ownership and Borrowing rules in concurrent systems...' },
    { id: 'm2', title: 'Next.js 15 Partial Prerendering', contentSnippet: 'How to combine static and dynamic content in a single route...' },
    { id: 'm3', title: 'TypeScript 5.5 Decorators', contentSnippet: 'Leveraging stage 3 proposal for metadata and logging...' }
  ];

  const MOCK_TASKS = [
    { id: 'mt1', title: 'Refactor state management', status: 'To Do' },
    { id: 'mt2', title: 'Update documentation', status: 'To Do' }
  ];

  const recentNotes = notes.length > 0 ? notes.slice(0, 3) : MOCK_NOTES;
  const pendingTasks = (tasks.length > 0 ? tasks.filter(t => t.status === 'To Do') : MOCK_TASKS).slice(0, 2);
  
  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.status === 'Done').length / tasks.length) * 100) 
    : 65; // High completion rate for mock look

  return (
    <div className='min-h-full w-full py-8 md:py-12 px-2 md:px-8'>
      {/* Hero Header Section */}
      <div className='flex flex-col items-center text-center mb-10 md:mb-16'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className='text-4xl md:text-7xl font-serif font-medium text-text mb-4 tracking-[-0.02em] leading-tight px-2'>
            Aura: Your Single
            <span className='block mt-2 bg-gradient-to-r from-primary via-primary/50 to-primary bg-clip-text text-transparent filter drop-shadow-[0_0_30px_rgba(59,130,246,0.2)] font-handwriting font-bold py-2 leading-[1.1]'>
              Dashboard for Deep Flow
            </span>
          </h1>
          <p className='text-text-muted text-xs md:text-base max-w-2xl mx-auto leading-relaxed font-redhat mt-4 md:mt-6 px-4'>
            Experience the ultimate synergy of notes, tasks, and code. Seamlessly
            bridge the gap between learning and building in a distraction-free
            environment.
          </p>
        </motion.div>
      </div>

      {/* Main Dashboard Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8'
      >
        {/* Focus Card */}
        <div className='md:col-span-8 bg-surface/50 backdrop-blur-3xl border border-border/50 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden group shadow-xl'>
          <div className='absolute inset-0 opacity-10 pointer-events-none'>
            <svg className='absolute bottom-0 left-0 w-full' viewBox='0 0 1440 320'>
              <path fill='var(--color-primary)' d='M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,138.7C960,160,1056,224,1152,245.3C1248,267,1344,245,1392,234.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'></path>
            </svg>
          </div>

          <div className='relative z-10'>
            <div className='inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6 md:mb-8'>
              <span className='text-[10px] font-black text-primary tracking-widest uppercase'>Focus Session</span>
            </div>
            
            <h3 className='text-3xl md:text-4xl font-serif font-medium text-text mb-2 md:mb-3'>Current Session: Deep Work</h3>
            <p className='text-text-muted text-sm mb-10 md:mb-12 font-redhat'>Finalizing dashboard architecture</p>
            
            <div className='flex items-end gap-4 md:gap-6 mb-16 md:mb-4'>
              <span className='text-6xl md:text-8xl font-sans font-bold text-text tracking-tighter'>24:52</span>
              <span className='text-xl md:text-3xl font-sans text-text-muted mb-2 md:mb-3 opacity-50 tracking-tight'>/ 45:00</span>
            </div>

            <div className='absolute bottom-6 md:bottom-10 right-6 md:right-10'>
              <button className='flex items-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-5 bg-primary text-white rounded-[1.5rem] md:rounded-[2rem] font-bold shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all group'>
                <Play className='w-5 h-5 md:w-6 md:h-6 fill-white' />
                <span className='text-base md:text-lg'>Resume</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Notes Card */}
        <div className='md:col-span-4 bg-surface/50 backdrop-blur-3xl border border-border/50 rounded-[3rem] p-10 shadow-xl'>
          <div className='flex items-center justify-between mb-10'>
            <div className='flex items-center gap-3'>
              <FileText className='w-6 h-6 text-primary' />
              <h4 className='font-serif font-bold text-text text-xl'>Recent Notes</h4>
            </div>
            <button className='text-xs font-black text-primary/50 hover:text-primary transition-colors uppercase tracking-widest'>View all</button>
          </div>

          <div className='aura-list'>
            {recentNotes.map((note: any) => (
              <div key={note.id} className='aura-list-item group'>
                <div className='item-indicator' />
                <div className='item-content'>
                  <h5 className='item-title'>{note.title}</h5>
                  <p className='item-snippet'>{note.contentSnippet || note.content?.substring(0, 50)}...</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Card */}
        <div className='md:col-span-4 bg-surface/50 backdrop-blur-3xl border border-border/50 rounded-[3rem] p-10 shadow-xl'>
          <div className='flex items-center justify-between mb-10'>
            <div className='flex items-center gap-3'>
              <CheckCircle2 className='w-6 h-6 text-green-500' />
              <h4 className='font-serif font-bold text-text text-xl'>Tasks</h4>
            </div>
            <div className='px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20'>
              <span className='text-[10px] font-black text-green-500 tracking-widest'>{completionRate}% DONE</span>
            </div>
          </div>

          <div className='space-y-8'>
            {pendingTasks.map((task: any) => (
              <div key={task.id} className='flex items-start gap-4 group cursor-pointer'>
                <div className='w-6 h-6 rounded-full border-2 border-primary/30 mt-1 group-hover:border-primary transition-colors flex-shrink-0' />
                <div className='flex-1'>
                  <p className='text-sm font-bold text-text group-hover:text-primary transition-colors'>{task.title}</p>
                  <div className='h-1.5 w-full bg-primary/5 rounded-full mt-3 overflow-hidden'>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '40%' }}
                      className='h-full bg-primary' 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Snippet Card */}
        <div className='md:col-span-8 bg-surface/50 backdrop-blur-3xl border border-border/50 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-xl overflow-hidden flex flex-col'>
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center gap-3'>
              <Code2 className='w-6 h-6 text-primary' />
              <h4 className='font-serif font-bold text-text text-lg md:text-xl'>Snippet: Next.js Middleware</h4>
            </div>
            <div className='flex gap-4 md:gap-5'>
              <Copy className='w-4 h-4 md:w-5 md:h-5 text-text-muted hover:text-primary cursor-pointer transition-colors' />
              <Share2 className='w-4 h-4 md:w-5 md:h-5 text-text-muted hover:text-primary cursor-pointer transition-colors' />
            </div>
          </div>

          <div className='flex-1 bg-black/95 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 font-mono text-xs md:text-sm leading-relaxed overflow-hidden border border-white/5 relative shadow-inner'>
            <div className='flex gap-2 absolute top-6 left-8'>
              <div className='w-2.5 h-2.5 rounded-full bg-red-500/30' />
              <div className='w-2.5 h-2.5 rounded-full bg-yellow-500/30' />
              <div className='w-2.5 h-2.5 rounded-full bg-green-500/30' />
            </div>
            <div className='mt-8'>
              <pre className='text-[13px]'>
                <code className='text-gray-400'>
                  <span className='text-primary/80'>export function</span>{' '}
                  <span className='text-blue-400/80'>middleware</span>(request) {'{'}
                  {'\n'}{'  '}
                  <span className='text-gray-600'>// Validate session sync</span>
                  {'\n'}{'  '}
                  <span className='text-primary/80'>const</span> token = request.cookies.get(
                  <span className='text-green-400/80'>'aura_token'</span>);
                  {'\n\n'}{'  '}
                  <span className='text-primary/80'>if</span> (!token) {'{'}
                  {'\n'}{'    '}
                  <span className='text-primary/80'>return</span> Response.redirect(
                  <span className='text-blue-400/80'>new</span> URL(
                  <span className='text-green-400/80'>'/auth'</span>, request.url));
                  {'\n'}{'  '}
                  {'}'}
                  {'\n'}{'}'}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
