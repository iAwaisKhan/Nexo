import React from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  FileText,
  CheckCircle2
} from 'lucide-react';
import Footer from './Footer';
import { useAppStore } from '../store/useAppStore';

const Dashboard: React.FC = () => {
  const notes = useAppStore(state => state.notes);
  const tasks = useAppStore(state => state.tasks);

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
          <h1 className='text-2xl md:text-5xl font-serif font-medium text-black drop-shadow-md mb-2 tracking-[-0.02em] leading-tight px-2'>
            Nexo: Your Single
            <span className='block mt-2 text-black font-handwriting py-1 leading-[1.1] text-4xl md:text-7xl drop-shadow-lg'>
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
        {/* Cards removed as per request to keep video fully visible */}
      </motion.div>
      <Footer />
    </div>
  );
};

export default Dashboard;
