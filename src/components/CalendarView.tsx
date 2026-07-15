import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, CheckSquare, Clock, Flame } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { dateFromKey } from '../lib/date';
import { dateKey, formatDuration, getMonthMatrix } from '../lib/productivity';

const monthLabel = (date: Date) => date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

const CalendarView: React.FC = () => {
  const tasks = useAppStore((state) => state.tasks);
  const sessions = useAppStore((state) => state.focusSessions);
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));

  const days = useMemo(() => getMonthMatrix(anchorDate), [anchorDate]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      map.set(task.dueDate, [...(map.get(task.dueDate) || []), task]);
    });
    return map;
  }, [tasks]);

  const focusByDate = useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach((session) => {
      map.set(session.date, (map.get(session.date) || 0) + session.duration);
    });
    return map;
  }, [sessions]);

  const selectedTasks = tasksByDate.get(selectedDate) || [];
  const selectedFocusSeconds = focusByDate.get(selectedDate) || 0;

  const moveMonth = (direction: number) => {
    const next = new Date(anchorDate);
    next.setMonth(anchorDate.getMonth() + direction);
    setAnchorDate(next);
  };

  return (
    <div className="w-full h-[calc(100dvh-12rem)] md:h-[calc(100dvh-11rem)] flex flex-col gap-3 md:gap-4 overflow-hidden">
      <div className="shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.35em] text-primary mb-1 md:mb-2">Planner</p>
          <h1 className="text-2xl md:text-5xl font-display font-semibold tracking-tight text-text">Calendar View</h1>
          <p className="hidden md:block text-sm text-text/50 mt-2 max-w-2xl">
            See task deadlines and focus history in one monthly rhythm.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-surface/60 border border-border/20 p-1 self-start md:self-auto">
          <button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month" className="p-2 md:p-3 rounded-xl hover:bg-primary/10 text-text/60 hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="min-w-36 md:min-w-44 text-center text-xs md:text-sm font-bold text-text">{monthLabel(anchorDate)}</div>
          <button type="button" onClick={() => moveMonth(1)} aria-label="Next month" className="p-2 md:p-3 rounded-xl hover:bg-primary/10 text-text/60 hover:text-primary transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-rows-[1fr_auto] xl:grid-rows-1 xl:grid-cols-[1fr_20rem] gap-3 md:gap-4 flex-1 min-h-0">
        <div className="rounded-2xl md:rounded-3xl bg-surface/45 backdrop-blur-2xl border border-border/40 p-2 md:p-4 overflow-hidden flex flex-col min-h-0">
          <div className="shrink-0 grid grid-cols-7 gap-1.5 md:gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-text/35 py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 grid-rows-6 gap-1.5 md:gap-2 flex-1 min-h-0">
            {days.map((day) => {
              const key = dateKey(day);
              const isSelected = key === selectedDate;
              const isToday = key === dateKey(new Date());
              const isCurrentMonth = day.getMonth() === anchorDate.getMonth();
              const dayTasks = tasksByDate.get(key) || [];
              const focusSeconds = focusByDate.get(key) || 0;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={`min-h-0 rounded-xl md:rounded-2xl border p-1.5 md:p-2 text-left transition-all overflow-hidden ${
                    isSelected
                      ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/10'
                      : 'bg-background/45 border-border/20 hover:border-primary/20 hover:bg-primary/5'
                  } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs md:text-sm font-bold ${isToday ? 'text-primary' : 'text-text'}`}>{day.getDate()}</span>
                    {focusSeconds > 0 && <Flame className="w-3 h-3 text-primary" />}
                  </div>
                  <div className="mt-1 md:mt-2 space-y-1">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div key={task.id} className="truncate rounded-md md:rounded-lg bg-surface/70 px-1.5 md:px-2 py-0.5 md:py-1 text-[8px] md:text-[10px] font-semibold text-text/70">
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[8px] md:text-[10px] font-bold text-primary">+{dayTasks.length - 2} more</div>
                    )}
                    {focusSeconds > 0 && (
                      <div className="hidden sm:block text-[9px] md:text-[10px] font-bold text-text/40">{formatDuration(focusSeconds)}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <motion.aside
          key={selectedDate}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl md:rounded-3xl bg-surface/55 backdrop-blur-2xl border border-border/40 p-3 md:p-4 xl:h-full overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-sm md:text-base text-text">
                {dateFromKey(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </h2>
              <p className="text-[10px] text-text/40 font-bold uppercase tracking-widest">Daily agenda</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3">
            <div className="rounded-xl md:rounded-2xl bg-background/60 border border-border/20 p-3 md:p-4">
              <CheckSquare className="w-4 h-4 text-primary mb-1 md:mb-2" />
              <div className="text-xl md:text-2xl font-semibold text-text">{selectedTasks.length}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-text/35">Tasks</div>
            </div>
            <div className="rounded-xl md:rounded-2xl bg-background/60 border border-border/20 p-3 md:p-4">
              <Clock className="w-4 h-4 text-primary mb-1 md:mb-2" />
              <div className="text-xl md:text-2xl font-semibold text-text">{formatDuration(selectedFocusSeconds)}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-text/35">Focus</div>
            </div>
          </div>

          <div className="space-y-2 xl:max-h-[calc(100%-12rem)] overflow-hidden">
            {selectedTasks.slice(0, 2).map((task) => (
              <div key={task.id} className="rounded-xl md:rounded-2xl bg-background/60 border border-border/20 p-3 md:p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-sm text-text">{task.title}</h3>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-text/35">{task.status}</span>
                </div>
                {task.description && <p className="text-xs text-text/45 mt-2 line-clamp-2">{task.description}</p>}
              </div>
            ))}
            {selectedTasks.length > 2 && (
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary px-1">
                +{selectedTasks.length - 2} more tasks
              </div>
            )}
            {selectedTasks.length === 0 && selectedFocusSeconds === 0 && (
              <div className="rounded-xl md:rounded-2xl border border-dashed border-border/40 p-4 md:p-6 text-center text-xs md:text-sm text-text/30">
                Nothing scheduled for this day.
              </div>
            )}
          </div>
        </motion.aside>
      </div>
    </div>
  );
};

export default CalendarView;
