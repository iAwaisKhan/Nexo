import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Archive, CalendarDays, CheckCircle2, CircleDot, Clock, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import type { Task } from '../types/task';
import { addDays, dateKey, getKanbanColumns, type KanbanColumnId } from '../lib/productivity';

const columnMeta: Record<KanbanColumnId, { title: string; icon: React.ElementType; hint: string }> = {
  backlog: { title: 'Backlog', icon: Archive, hint: 'Open work without a date' },
  today: { title: 'Today', icon: CircleDot, hint: 'Due now or overdue' },
  upcoming: { title: 'Upcoming', icon: CalendarDays, hint: 'Scheduled next' },
  done: { title: 'Done', icon: CheckCircle2, hint: 'Completed work' },
};

const columnOrder: KanbanColumnId[] = ['backlog', 'today', 'upcoming', 'done'];

const priorityClass = {
  High: 'text-red-500 bg-red-500/10 border-red-500/20',
  Medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  Low: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
};

const KanbanBoard: React.FC = () => {
  const navigate = useNavigate();
  const tasks = useAppStore((state) => state.tasks);
  const updateTask = useAppStore((state) => state.updateTask);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const columns = useMemo(() => getKanbanColumns(tasks), [tasks]);

  const moveTask = (task: Task, column: KanbanColumnId) => {
    const today = dateKey(new Date());
    const tomorrow = dateKey(addDays(new Date(), 1));
    const updates: Partial<Task> =
      column === 'done'
        ? { status: 'Done' }
        : column === 'today'
          ? { status: 'To Do', dueDate: today }
          : column === 'upcoming'
            ? { status: 'To Do', dueDate: task.dueDate && task.dueDate > today ? task.dueDate : tomorrow }
            : { status: 'To Do', dueDate: '' };

    updateTask({ ...task, ...updates });
  };

  const dropOnColumn = (column: KanbanColumnId) => {
    const task = tasks.find((item) => item.id === draggingId);
    if (task) moveTask(task, column);
    setDraggingId(null);
  };

  return (
    <div className="w-full min-h-[calc(100vh-9rem)] space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary mb-2">Task Flow</p>
          <h1 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-text">Kanban Board</h1>
          <p className="text-sm text-text/50 mt-2 max-w-2xl">
            Drag work between lanes or use the quick moves on each card.
          </p>
        </div>
        <button
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {columnOrder.map((columnId) => {
          const meta = columnMeta[columnId];
          const Icon = meta.icon;
          return (
            <section
              key={columnId}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropOnColumn(columnId)}
              className="min-h-[22rem] rounded-3xl bg-surface/45 backdrop-blur-2xl border border-border/40 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-text">{meta.title}</h2>
                    <p className="text-[10px] text-text/40 font-bold uppercase tracking-widest">{meta.hint}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-text/40 tabular-nums">{columns[columnId].length}</span>
              </div>

              <div className="space-y-3">
                {columns[columnId].map((task) => (
                  <motion.article
                    layout
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggingId(task.id)}
                    onDragEnd={() => setDraggingId(null)}
                    className={`rounded-2xl bg-background/70 border border-border/30 p-4 shadow-sm cursor-grab active:cursor-grabbing ${
                      draggingId === task.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-text leading-snug break-words">{task.title}</h3>
                        {task.description && (
                          <p className="text-xs text-text/50 line-clamp-2 mt-2 leading-relaxed">{task.description}</p>
                        )}
                      </div>
                      <span className={`shrink-0 px-2 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest ${priorityClass[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text/40">
                      <Clock className="w-3 h-3" />
                      {task.dueDate || 'No date'}
                      {task.timeSpent ? <span>{Math.floor(task.timeSpent / 60)}m focused</span> : null}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {columnOrder.filter((target) => target !== columnId).slice(0, 3).map((target) => (
                        <button
                          key={target}
                          onClick={() => moveTask(task, target)}
                          className="px-2 py-2 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 text-[9px] font-bold uppercase tracking-widest transition-colors"
                        >
                          {columnMeta[target].title}
                        </button>
                      ))}
                    </div>
                  </motion.article>
                ))}

                {columns[columnId].length === 0 && (
                  <div className="h-40 rounded-2xl border border-dashed border-border/40 flex items-center justify-center text-xs font-medium text-text/25">
                    Drop tasks here
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
