import React, { useMemo } from 'react';
import { ArrowRight, CalendarClock, CheckCircle2, Clock3, NotebookPen, Sparkles, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { localDateKey } from '../lib/date';
import { formatDuration } from '../lib/productivity';

const DailyCommandCenter: React.FC = () => {
  const navigate = useNavigate();
  const tasks = useAppStore((state) => state.tasks);
  const notes = useAppStore((state) => state.notes);
  const sessions = useAppStore((state) => state.focusSessions);

  const today = localDateKey();
  const todayTasks = useMemo(
    () => tasks.filter((task) => task.status !== 'Done' && task.dueDate === today),
    [tasks, today],
  );
  const nextTask = useMemo(() => {
    const openTasks = tasks.filter((task) => task.status !== 'Done');
    return [...openTasks].sort((a, b) => {
      const aDate = a.dueDate || '9999-12-31';
      const bDate = b.dueDate || '9999-12-31';
      return aDate.localeCompare(bDate) || b.createdAt - a.createdAt;
    })[0];
  }, [tasks]);
  const todayFocus = sessions
    .filter((session) => session.date === today)
    .reduce((total, session) => total + session.duration, 0);
  const recentNote = notes.slice().sort((a, b) => b.lastModified - a.lastModified)[0];

  return (
    <div className="w-full min-h-[calc(100vh-9rem)] space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary mb-2">Daily Command Center</p>
          <h1 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-text">Make today count.</h1>
          <p className="text-sm text-text/50 mt-2 max-w-2xl">A calm launchpad for the work that matters today.</p>
        </div>
        <button type="button" onClick={() => navigate('/focus')} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
          <Timer className="w-4 h-4" />
          Start focus
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-5">
        {[
          { label: 'Due today', value: todayTasks.length, icon: CalendarClock },
          { label: 'Focus logged', value: formatDuration(todayFocus), icon: Clock3 },
          { label: 'Open tasks', value: tasks.filter((task) => task.status !== 'Done').length, icon: CheckCircle2 },
          { label: 'Notes captured', value: notes.length, icon: NotebookPen },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-3xl bg-surface/50 backdrop-blur-2xl border border-border/40 p-4 md:p-5">
            <Icon className="w-5 h-5 text-primary mb-4" />
            <div className="text-2xl md:text-3xl font-semibold text-text tabular-nums">{value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-text/35 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5">
        <section className="rounded-3xl bg-surface/50 backdrop-blur-2xl border border-border/40 p-5 md:p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
            <div><h2 className="font-semibold text-text">Your next move</h2><p className="text-xs text-text/40 mt-1">Keep the day focused and concrete.</p></div>
          </div>
          {nextTask ? (
            <div className="rounded-2xl bg-background/55 border border-border/20 p-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Recommended task</div>
              <h3 className="text-xl font-semibold text-text break-words">{nextTask.title}</h3>
              {nextTask.description && <p className="text-sm text-text/50 mt-2 line-clamp-3">{nextTask.description}</p>}
              <button type="button" onClick={() => navigate('/tasks')} className="mt-5 inline-flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest">Open task list <ArrowRight className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/40 p-8 text-center text-sm text-text/35">Your task list is clear. Use the space for meaningful work.</div>
          )}
        </section>

        <section className="rounded-3xl bg-surface/50 backdrop-blur-2xl border border-border/40 p-5 md:p-7">
          <div className="flex items-center justify-between mb-5"><div><h2 className="font-semibold text-text">Today’s agenda</h2><p className="text-xs text-text/40 mt-1">Tasks scheduled for today</p></div><CalendarClock className="w-5 h-5 text-primary" /></div>
          <div className="space-y-3">
            {todayTasks.slice(0, 5).map((task) => <button type="button" key={task.id} onClick={() => navigate('/tasks')} className="w-full text-left rounded-2xl bg-background/55 border border-border/20 p-4 hover:border-primary/20 transition-colors"><div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-primary shrink-0" /><span className="text-sm font-semibold text-text truncate">{task.title}</span></div></button>)}
            {todayTasks.length === 0 && <div className="rounded-2xl border border-dashed border-border/40 p-6 text-center text-sm text-text/35">No tasks due today.</div>}
          </div>
          {recentNote && <button type="button" onClick={() => navigate(`/notes?note=${encodeURIComponent(recentNote.id)}`)} className="w-full mt-5 flex items-center gap-3 text-left text-xs text-text/50 hover:text-primary transition-colors"><NotebookPen className="w-4 h-4 text-primary" /><span className="truncate">Continue “{recentNote.title || 'Untitled note'}”</span><ArrowRight className="w-3.5 h-3.5 ml-auto shrink-0" /></button>}
        </section>
      </div>
    </div>
  );
};

export default DailyCommandCenter;
