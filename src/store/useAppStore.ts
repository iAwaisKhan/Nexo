import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note, Task, AppFocusSession, SyncStatus } from '../types';

// Re-export types so existing consumers (Header, etc.) that import from
// this file keep working during the transition.
export type { AppFocusSession, SyncStatus };

interface AppState {
  tasks: Task[];
  notes: Note[];
  focusSessions: AppFocusSession[];

  // Daily Intention
  dailyIntention: { text: string; completed: boolean } | null;
  setDailyIntention: (text: string) => void;
  toggleDailyIntention: () => void;
  clearDailyIntention: () => void;

  // Sync metadata
  syncStatus: SyncStatus;
  lastSyncedAt: number | null;

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

  // Internal sync actions (prefixed with _ to indicate internal use)
  _setSyncStatus: (status: SyncStatus) => void;
  _setLastSyncedAt: (timestamp: number) => void;
  _hydrateFromCloud: (notes: Note[], tasks: Task[], sessions: AppFocusSession[]) => void;
}

// Lazy import to avoid circular dependency — syncEngine imports useAppStore
const getSyncEngine = () => import('../lib/syncEngine').then(m => m.syncEngine);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      notes: [],
      focusSessions: [],
      syncStatus: 'idle' as SyncStatus,
      lastSyncedAt: null,
      dailyIntention: null,

      // ── Daily Intention ──
      setDailyIntention: (text) => set({ dailyIntention: { text, completed: false } }),
      toggleDailyIntention: () => set((state) => ({
        dailyIntention: state.dailyIntention 
          ? { ...state.dailyIntention, completed: !state.dailyIntention.completed }
          : null
      })),
      clearDailyIntention: () => set({ dailyIntention: null }),

      // ── Tasks ──────────────────────────────────────────────
      addTask: (task) => {
        set((state) => ({ tasks: [...state.tasks, task] }));
        getSyncEngine().then(se => se.pushTask(task));
      },
      updateTask: (updatedTask) => {
        set((state) => ({
          tasks: state.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
        }));
        getSyncEngine().then(se => se.pushTask(updatedTask));
      },
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter(t => t.id !== id)
        }));
        getSyncEngine().then(se => se.deleteTaskCloud(id));
      },

      // ── Notes ──────────────────────────────────────────────
      addNote: (note) => {
        set((state) => ({ notes: [...state.notes, note] }));
        getSyncEngine().then(se => se.pushNote(note));
      },
      updateNote: (updatedNote) => {
        set((state) => ({
          notes: state.notes.map(n => n.id === updatedNote.id ? updatedNote : n)
        }));
        getSyncEngine().then(se => se.pushNote(updatedNote));
      },
      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter(n => n.id !== id)
        }));
        getSyncEngine().then(se => se.deleteNoteCloud(id));
      },

      // ── Focus Sessions ────────────────────────────────────
      addFocusSession: (session) => {
        set((state) => ({
          focusSessions: [...state.focusSessions, session]
        }));
        getSyncEngine().then(se => se.pushFocusSession(session));
      },

      // ── Internal Sync Actions ─────────────────────────────
      _setSyncStatus: (status) => set({ syncStatus: status }),
      _setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp }),
      _hydrateFromCloud: (notes, tasks, sessions) =>
        set({ notes, tasks, focusSessions: sessions }),
    }),
    {
      name: 'nexo_storage',
      partialize: (state) => ({
        // Only persist data, not transient sync state
        tasks: state.tasks,
        notes: state.notes,
        focusSessions: state.focusSessions,
      }),
    }
  )
);
