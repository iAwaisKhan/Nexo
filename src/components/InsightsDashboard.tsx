import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, Clock, Flame, Layers3, NotebookText, Target } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { addDays, buildSpaces, dateKey, formatDuration, getDailyStreak } from '../lib/productivity';

const InsightsDashboard: React.FC = () => {
  const notes = useAppStore((state) => state.notes);
  const tasks = useAppStore((state) => state.tasks);
  const sessions = useAppStore((state) => state.focusSessions);

  const insights = useMemo(() => {
    const today = dateKey(new Date());
    const weekKeys = Array.from({ length: 7 }, (_, index) => dateKey(addDays(new Date(), index - 6)));
    const focusByDay = weekKeys.map((key) => ({
      key,
      label: new Date(`${key}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' }),
      seconds: sessions.filter((session) => session.date === key).reduce((total, session) => total + session.duration, 0),
    }));

    const totalFocus = sessions.reduce((total, session) => total + session.duration, 0);
    const weekFocus = focusByDay.reduce((total, day) => total + day.seconds, 0);
    const todayFocus = focusByDay.find((day) => day.key === today)?.seconds || 0;
    const completedTasks = tasks.filter((task) => task.status === 'Done').length;
    const openTasks = tasks.length - completedTasks;
    const overdueTasks = tasks.filter((task) => task.status !== 'Done' && task.dueDate && task.dueDate < today).length;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    const spaces = buildSpaces(notes, tasks, sessions)
      .filter((space) => space.notes.length + space.tasks.length > 0)
      .sort((a, b) => (b.notes.length + b.tasks.length) - (a.notes.length + a.tasks.length));

    return {
      focusByDay,
      totalFocus,
      weekFocus,
      todayFocus,
      completedTasks,
      openTasks,
      overdueTasks,
      completionRate,
      streak: getDailyStreak(sessions),
      spaces,
      maxDayFocus: Math.max(1, ...focusByDay.map((day) => day.seconds)),
    };
  }, [notes, tasks, sessions]);

  const statCards = [
    { label: 'Today Focus', value: formatDuration(insights.todayFocus), icon: Clock },
    { label: 'Week Focus', value: formatDuration(insights.weekFocus), icon: Flame },
    { label: 'Task Completion', value: `${insights.completionRate}%`, icon: CheckCircle2 },
    { label: 'Current Streak', value: `${insights.streak}d`, icon: Target },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-9rem)] space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary mb-2">Intelligence</p>
          <h1 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-text">Insights Dashboard</h1>
          <p className="text-sm text-text/50 mt-2 max-w-2xl">
            A weekly read on focus, task health, note momentum, and active spaces.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-5">
        {statCards.map(({ label, value, icon: Icon }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-surface/50 backdrop-blur-2xl border border-border/40 p-4 md:p-5"
          >
            <Icon className="w-5 h-5 text-primary mb-4" />
            <div className="text-2xl md:text-3xl font-semibold text-text tabular-nums">{value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-text/35 mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-5">
        <section className="rounded-3xl bg-surface/50 backdrop-blur-2xl border border-border/40 p-5 md:p-7">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-semibold text-text">Weekly Focus Rhythm</h2>
              <p className="text-xs text-text/40 mt-1">Last 7 days of recorded deep work</p>
            </div>
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div className="h-64 flex items-end gap-3 md:gap-5">
            {insights.focusByDay.map((day) => {
              const height = Math.max(8, Math.round((day.seconds / insights.maxDayFocus) * 100));
              return (
                <div key={day.key} className="flex-1 h-full flex flex-col justify-end gap-3">
                  <div className="flex-1 flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      className="w-full rounded-t-2xl bg-primary/70 border border-primary/20"
                      title={`${day.label}: ${formatDuration(day.seconds)}`}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-text/40 uppercase tracking-widest">{day.label}</div>
                    <div className="text-[10px] text-text/25 mt-1">{formatDuration(day.seconds)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl bg-surface/50 backdrop-blur-2xl border border-border/40 p-5 md:p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-text">Task Health</h2>
              <p className="text-xs text-text/40 mt-1">Open, done, and overdue balance</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-4">
            {[
              { label: 'Open', value: insights.openTasks, color: 'bg-blue-500' },
              { label: 'Completed', value: insights.completedTasks, color: 'bg-green-500' },
              { label: 'Overdue', value: insights.overdueTasks, color: 'bg-red-500' },
            ].map((item) => {
              const total = Math.max(1, tasks.length);
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-semibold text-text/60 mb-2">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-border/20 overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.round((item.value / total) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="rounded-3xl bg-surface/50 backdrop-blur-2xl border border-border/40 p-5 md:p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-text">Knowledge Momentum</h2>
              <p className="text-xs text-text/40 mt-1">Notes, public pages, and pinned material</p>
            </div>
            <NotebookText className="w-5 h-5 text-primary" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Notes', value: notes.length },
              { label: 'Pinned', value: notes.filter((note) => note.isPinned).length },
              { label: 'Public', value: notes.filter((note) => note.isPublic).length },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-background/55 border border-border/20 p-4">
                <div className="text-2xl font-semibold text-text">{item.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-text/35 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-surface/50 backdrop-blur-2xl border border-border/40 p-5 md:p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-text">Active Spaces</h2>
              <p className="text-xs text-text/40 mt-1">Largest collections by notes and tasks</p>
            </div>
            <Layers3 className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-3">
            {insights.spaces.slice(0, 5).map((space) => (
              <div key={space.id} className="rounded-2xl bg-background/55 border border-border/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-sm text-text truncate">{space.name}</h3>
                  <span className="text-xs font-bold text-primary">{space.notes.length + space.tasks.length}</span>
                </div>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-text/35">
                  {space.notes.length} notes - {space.tasks.length} tasks - {formatDuration(space.focusSeconds)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default InsightsDashboard;
