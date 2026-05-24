import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task } from '../types/task';
import type { Note } from '../types/note';

export type { Task, Note };

export interface AppFocusSession {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  targetId?: string;
  targetType?: 'task' | 'note' | string;
  date: string;
  hour: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

interface AppState {
  tasks: Task[];
  notes: Note[];
  focusSessions: AppFocusSession[];

  // Sync metadata
  syncStatus: SyncStatus;
  lastSyncedAt: number | null;

  // isLoading: true while syncStatus is 'syncing' AND we have no local data yet
  isLoading: boolean;

  // Tasks Actions
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;

  // Notes Actions
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;

  // Focus Session Actions
  addFocusSession: (session: AppFocusSession) => void;

  // Internal sync actions
  _setSyncStatus: (status: SyncStatus) => void;
  _setLastSyncedAt: (timestamp: number) => void;
  _setIsLoading: (loading: boolean) => void;
  _hydrateFromCloud: (notes: Note[], tasks: Task[], sessions: AppFocusSession[]) => void;

  // Optimistic rollback helpers (used by SyncEngine on push failure)
  _rollbackNote: (previousNote: Note | undefined, noteId: string) => void;
  _rollbackTask: (previousTask: Task | undefined, taskId: string) => void;
  _rollbackDeleteNote: (note: Note) => void;
  _rollbackDeleteTask: (task: Task) => void;
}

// Lazy import to avoid circular dependency
const getSyncEngine = () => import('../lib/syncEngine').then(m => m.syncEngine);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      notes: [],
      focusSessions: [],
      syncStatus: 'idle' as SyncStatus,
      lastSyncedAt: null,
      isLoading: false,

      // ── Tasks ──────────────────────────────────────────────
      addTask: (task) => {
        set((state) => ({ tasks: [...state.tasks, task] }));
        getSyncEngine().then(se => se.pushTask(task));
      },
      updateTask: (updatedTask) => {
        const previous = get().tasks.find(t => t.id === updatedTask.id);
        set((state) => ({
          tasks: state.tasks.map(t => t.id === updatedTask.id ? updatedTask : t),
        }));
        getSyncEngine().then(se => se.pushTask(updatedTask, previous));
      },
      deleteTask: (id) => {
        const deletedTask = get().tasks.find(t => t.id === id);
        set((state) => ({ tasks: state.tasks.filter(t => t.id !== id) }));
        getSyncEngine().then(se => se.deleteTaskCloud(id, deletedTask));
      },

      // ── Notes ──────────────────────────────────────────────
      addNote: (note) => {
        set((state) => ({ notes: [...state.notes, note] }));
        getSyncEngine().then(se => se.pushNote(note));
      },
      updateNote: (updatedNote) => {
        const previous = get().notes.find(n => n.id === updatedNote.id);
        set((state) => ({
          notes: state.notes.map(n => n.id === updatedNote.id ? updatedNote : n),
        }));
        getSyncEngine().then(se => se.pushNote(updatedNote, previous));
      },
      deleteNote: (id) => {
        const deletedNote = get().notes.find(n => n.id === id);
        set((state) => ({ notes: state.notes.filter(n => n.id !== id) }));
        getSyncEngine().then(se => se.deleteNoteCloud(id, deletedNote));
      },

      // ── Focus Sessions ─────────────────────────────────────
      addFocusSession: (session) => {
        set((state) => ({ focusSessions: [...state.focusSessions, session] }));
        getSyncEngine().then(se => se.pushFocusSession(session));
      },

      // ── Internal Sync Actions ──────────────────────────────
      _setSyncStatus: (status) => set({ syncStatus: status }),
      _setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp }),
      _setIsLoading: (loading) => set({ isLoading: loading }),
      _hydrateFromCloud: (notes, tasks, sessions) =>
        set({ notes, tasks, focusSessions: sessions }),

      // ── Optimistic Rollback ────────────────────────────────
      _rollbackNote: (previousNote, noteId) => {
        if (previousNote) {
          set((state) => ({
            notes: state.notes.map(n => n.id === noteId ? previousNote : n),
          }));
        } else {
          // Was an add; remove it
          set((state) => ({ notes: state.notes.filter(n => n.id !== noteId) }));
        }
      },
      _rollbackTask: (previousTask, taskId) => {
        if (previousTask) {
          set((state) => ({
            tasks: state.tasks.map(t => t.id === taskId ? previousTask : t),
          }));
        } else {
          set((state) => ({ tasks: state.tasks.filter(t => t.id !== taskId) }));
        }
      },
      _rollbackDeleteNote: (note) => {
        set((state) => ({ notes: [...state.notes, note] }));
      },
      _rollbackDeleteTask: (task) => {
        set((state) => ({ tasks: [...state.tasks, task] }));
      },
    }),
    {
      name: 'nexo_storage',
      partialize: (state) => ({
        tasks: state.tasks,
        notes: state.notes,
        focusSessions: state.focusSessions,
      }),
    }
  )
);
