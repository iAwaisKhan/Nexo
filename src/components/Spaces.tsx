import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FolderKanban, Hash, NotebookText, TimerReset } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { buildSpaces, formatDuration } from '../lib/productivity';

const Spaces: React.FC = () => {
  const navigate = useNavigate();
  const notes = useAppStore((state) => state.notes);
  const tasks = useAppStore((state) => state.tasks);
  const sessions = useAppStore((state) => state.focusSessions);

  const spaces = useMemo(() => buildSpaces(notes, tasks, sessions), [notes, tasks, sessions]);
  const [selectedId, setSelectedId] = useState(() => spaces[0]?.id || 'general');
  const selected = spaces.find((space) => space.id === selectedId) || spaces[0];

  return (
    <div className="w-full min-h-[calc(100vh-9rem)] space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary mb-2">Collections</p>
          <h1 className="text-3xl md:text-5xl font-display font-semibold tracking-tight text-text">Spaces</h1>
          <p className="text-sm text-text/50 mt-2 max-w-2xl">
            Your notes and tasks grouped by note tags, with General holding everything uncategorized.
          </p>
        </div>
        <button
          onClick={() => navigate('/notes')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          <Hash className="w-4 h-4" />
          Tag Notes
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[22rem_1fr] gap-5">
        <aside className="rounded-3xl bg-surface/45 backdrop-blur-2xl border border-border/40 p-4 h-fit">
          <div className="space-y-2">
            {spaces.map((space) => {
              const active = selected?.id === space.id;
              return (
                <button
                  key={space.id}
                  onClick={() => setSelectedId(space.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${
                    active
                      ? 'bg-primary/10 border-primary/25 text-primary'
                      : 'bg-background/45 border-border/20 text-text hover:border-primary/20 hover:bg-primary/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FolderKanban className="w-4 h-4 shrink-0" />
                      <span className="font-semibold truncate">{space.name}</span>
                    </div>
                    <span className="text-[10px] font-bold tabular-nums">{space.notes.length + space.tasks.length}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {selected && (
          <motion.section
            key={selected.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="rounded-3xl bg-surface/55 backdrop-blur-2xl border border-border/40 p-5 md:p-7">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary mb-2">Space</div>
                  <h2 className="text-3xl font-display font-semibold text-text">{selected.name}</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Notes', value: selected.notes.length, icon: NotebookText },
                    { label: 'Tasks', value: selected.tasks.length, icon: FolderKanban },
                    { label: 'Focus', value: formatDuration(selected.focusSeconds), icon: TimerReset },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="min-w-24 rounded-2xl bg-background/60 border border-border/20 p-4">
                      <Icon className="w-4 h-4 text-primary mb-2" />
                      <div className="text-xl font-semibold text-text tabular-nums">{value}</div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-text/35">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-3xl bg-surface/45 backdrop-blur-2xl border border-border/40 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-text">Notes</h3>
                  <button onClick={() => navigate('/notes')} className="text-primary text-[10px] font-bold uppercase tracking-widest">Open Notes</button>
                </div>
                <div className="space-y-3">
                  {selected.notes.slice(0, 8).map((note) => (
                    <button
                      key={note.id}
                      onClick={() => navigate(`/notes?note=${encodeURIComponent(note.id)}`)}
                      className="w-full text-left rounded-2xl bg-background/55 border border-border/20 p-4 hover:border-primary/20 hover:bg-primary/5 transition-all"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-semibold text-sm text-text truncate">{note.title || 'Untitled Note'}</h4>
                        <ArrowRight className="w-4 h-4 text-text/25" />
                      </div>
                      <p className="text-xs text-text/45 mt-2 line-clamp-2">{note.content || 'No content yet.'}</p>
                    </button>
                  ))}
                  {selected.notes.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border/40 p-8 text-center text-sm text-text/30">
                      No notes in this space yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-surface/45 backdrop-blur-2xl border border-border/40 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-text">Tasks</h3>
                  <button onClick={() => navigate('/kanban')} className="text-primary text-[10px] font-bold uppercase tracking-widest">Open Board</button>
                </div>
                <div className="space-y-3">
                  {selected.tasks.slice(0, 8).map((task) => (
                    <div key={task.id} className="rounded-2xl bg-background/55 border border-border/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-semibold text-sm text-text">{task.title}</h4>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-text/35">{task.status}</span>
                      </div>
                      <p className="text-xs text-text/45 mt-2 line-clamp-2">{task.description || task.dueDate || 'No extra details.'}</p>
                    </div>
                  ))}
                  {selected.tasks.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border/40 p-8 text-center text-sm text-text/30">
                      No related tasks in this space.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default Spaces;
