import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, X } from 'lucide-react';
import Footer from './Footer';
import { useAppStore } from '../store/useAppStore';

const DailyIntention: React.FC = () => {
  const { dailyIntention, setDailyIntention, toggleDailyIntention, clearDailyIntention } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setDailyIntention(inputValue.trim());
      setInputValue('');
      setIsEditing(false);
    }
  };

  if (!dailyIntention && !isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-12 md:mt-24 group relative"
      >
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-3 px-6 py-3 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white/50 hover:text-white hover:bg-black/30 hover:border-white/30 transition-all duration-500 shadow-xl"
        >
          <Target className="w-5 h-5" />
          <span className="text-sm font-medium tracking-widest uppercase font-sans">Set Today's Focus</span>
        </button>
      </motion.div>
    );
  }

  if (isEditing) {
    return (
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="mt-12 md:mt-24 w-full max-w-xl mx-auto px-4"
      >
        <div className="relative group">
          <input
            autoFocus
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => !inputValue && setIsEditing(false)}
            placeholder="My one thing for today is..."
            className="w-full bg-black/40 backdrop-blur-2xl border-b-2 border-white/20 text-center text-xl md:text-3xl text-white placeholder-white/30 px-6 py-4 focus:outline-none focus:border-white/60 transition-all font-serif bg-transparent shadow-2xl rounded-t-2xl"
          />
        </div>
      </motion.form>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 md:mt-24 group cursor-pointer relative"
    >
      <div 
        onClick={toggleDailyIntention}
        className={`flex flex-col items-center max-w-2xl text-center transition-all duration-700 ${dailyIntention?.completed ? 'opacity-50' : 'opacity-100 hover:scale-105'}`}
      >
        <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-white/40 mb-3 flex items-center gap-2">
          <Target className="w-3 h-3 md:w-4 md:w-4" /> The One Thing
        </span>
        
        <h2 className={`text-2xl md:text-5xl font-serif text-white drop-shadow-xl relative inline-block transition-all duration-500 ${dailyIntention?.completed ? 'text-white/60' : 'text-white'}`}>
          {dailyIntention?.text}
          
          <AnimatePresence>
            {dailyIntention?.completed && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute top-1/2 left-[-5%] right-[-5%] h-[2px] md:h-[3px] bg-white origin-left rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              />
            )}
          </AnimatePresence>
        </h2>
      </div>

      {dailyIntention?.completed && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            clearDailyIntention();
          }}
          className="absolute -right-4 -top-4 p-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/20 text-white/50 hover:text-white hover:bg-white/10 transition-all md:opacity-0 md:group-hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
};

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
      <div className='flex flex-col items-center text-center mb-10 md:mb-16 mt-16 md:mt-24 relative z-10'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <h1 className='text-3xl md:text-6xl font-serif font-medium text-white drop-shadow-2xl mb-4 tracking-tight leading-tight px-4'>
            Nexo: Zero Distractions
            <span className='block mt-2 text-white/90 font-handwriting py-2 leading-[1.2] text-5xl md:text-[5.5rem] tracking-normal drop-shadow-2xl filter blur-[0.3px]'>
              Deep Flow State
            </span>
          </h1>
        </motion.div>

        {/* The One Thing Daily Intention Component */}
        <DailyIntention />
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
