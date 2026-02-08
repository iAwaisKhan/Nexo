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
import Footer from './Footer';
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
    { id: 'm2', title: 'Next.js 15 Partial Prerendering', contentSnippet: 'How to combine static and dynamic content in a single route...' }
  ];

  const MOCK_TASKS = [
    { id: 'mt1', title: 'Refactor state management', status: 'To Do' },
    { id: 'mt2', title: 'Update documentation', status: 'To Do' }
  ];

  const recentNotes = notes.length > 0 ? notes.slice(0, 2) : MOCK_NOTES;
  const pendingTasks = (tasks.length > 0 ? tasks.filter(t => t.status === 'To Do') : MOCK_TASKS).slice(0, 2);
  
  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.status === 'Done').length / tasks.length) * 100) 
    : 65; // High completion rate for mock look

  return (
    <div className='min-h-full w-full pt-8 pb-2 px-2 md:px-8'>
      {/* Hero Header Section */}
      <div className='flex flex-col items-center text-center mb-10 md:mb-16'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <h1 className='text-2xl md:text-5xl font-serif font-medium text-text mb-2 tracking-[-0.02em] leading-tight px-2'>
            Nexo: Your Single
            <span className='block mt-2 text-primary font-handwriting py-1 leading-[1.1] text-4xl md:text-7xl'>
              Dashboard for Deep Flow
            </span>
          </h1>
        </motion.div>
      </div>

      {/* Main Dashboard Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className='max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8'
      >
        {/* Focus Card */}
        <div className='md:col-span-8 bg-surface/50 backdrop-blur-3xl border border-border/50 rounded-[2rem] md:rounded-[3rem] p-5 md:p-6 relative overflow-hidden group shadow-xl'>
          <div className='absolute inset-0 opacity-10 pointer-events-none'>
            <svg className='absolute bottom-0 left-0 w-full scale-y-150 origin-bottom' viewBox='0 0 1440 320'>
              <path fill='var(--color-primary)' d='M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,138.7C960,160,1056,224,1152,245.3C1248,267,1344,245,1392,234.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'></path>
            </svg>
          </div>

          <div className='relative z-10'>
            <h3 className='text-3xl md:text-4xl font-serif font-medium text-text mb-1'>Current Session: Deep Work</h3>
            <p className='text-text-muted text-sm mb-4 md:mb-6 font-redhat'>Finalizing dashboard architecture</p>
            
            <div className='flex items-end gap-4 md:gap-6 mb-2 md:mb-0'>
              <span className='text-6xl md:text-8xl font-sans font-bold text-text tracking-tighter'>24:52</span>
              <span className='text-xl md:text-3xl font-sans text-text-muted mb-2 md:mb-3 opacity-50 tracking-tight'>/ 45:00</span>
            </div>
          </div>
        </div>

        {/* Recent Notes Card */}
        <div className='md:col-span-4 bg-surface/50 backdrop-blur-3xl border border-border/50 rounded-[2rem] p-6 md:p-8 shadow-xl'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <FileText className='w-6 h-6 text-primary' />
              <h4 className='font-serif font-bold text-text text-xl'>Recent Notes</h4>
            </div>
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

        {/* Snippet Card - Full Width */}
        <div className='md:col-span-12 bg-surface/50 backdrop-blur-3xl border border-border/50 rounded-[2rem] md:rounded-[3rem] p-5 md:p-6 shadow-xl overflow-hidden flex flex-col'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <Code2 className='w-5 h-5 text-primary' />
              <h4 className='font-serif font-bold text-text text-base md:text-lg'>Snippet: Next.js Middleware</h4>
            </div>
            <div className='flex gap-4'>
              <Copy className='w-4 h-4 text-text-muted hover:text-primary cursor-pointer transition-colors' />
              <Share2 className='w-4 h-4 text-text-muted hover:text-primary cursor-pointer transition-colors' />
            </div>
          </div>

          <div className='flex-1 bg-black/95 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 font-mono text-xs md:text-sm leading-relaxed overflow-hidden border border-white/5 relative shadow-inner'>
            <div className='flex gap-2 absolute top-4 left-6'>
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
      <Footer />
    </div>
  );
};

export default Dashboard;
