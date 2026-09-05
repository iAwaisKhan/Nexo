import { create } from 'zustand';
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

export interface WorkspaceData {
  tasks: Task[];
  notes: Note[];
  focusSessions: AppFocusSession[];
}

export type WorkspaceId = 'guest' | `user:${string}`;
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

interface AppState extends WorkspaceData {
  activeWorkspaceId: WorkspaceId | null;
  syncStatus: SyncStatus;
  lastSyncedAt: number | null;
  isLoading: boolean;

  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  addFocusSession: (session: AppFocusSession) => void;

  _switchWorkspace: (workspaceId: WorkspaceId) => void;
  _clearActiveWorkspace: () => void;
  _setSyncStatus: (status: SyncStatus) => void;
  _setLastSyncedAt: (timestamp: number | null) => void;
  _setIsLoading: (loading: boolean) => void;
  _hydrateFromCloud: (notes: Note[], tasks: Task[], sessions: AppFocusSession[]) => void;
}

const STORAGE_VERSION = 1;
const STORAGE_PREFIX = 'nexo_workspace_v1:';
const LEGACY_STORAGE_KEY = 'nexo_storage';
const emptyWorkspace = (): WorkspaceData => ({ tasks: [], notes: [], focusSessions: [] });
const getStorageKey = (workspaceId: WorkspaceId) => `${STORAGE_PREFIX}${workspaceId}`;

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const parseWorkspace = (raw: string | null): WorkspaceData => {
  if (!raw) return emptyWorkspace();

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return emptyWorkspace();

    // Zustand's legacy persist format wrapped data in a `state` property.
    const candidate = isRecord(parsed.state) ? parsed.state : parsed;
    return {
      tasks: Array.isArray(candidate.tasks) ? candidate.tasks as Task[] : [],
      notes: Array.isArray(candidate.notes) ? candidate.notes as Note[] : [],
      focusSessions: Array.isArray(candidate.focusSessions)
        ? candidate.focusSessions as AppFocusSession[]
        : [],
    };
  } catch (error) {
    console.error('[WorkspaceStorage] Failed to read workspace:', error);
    return emptyWorkspace();
  }
};

const writeWorkspace = (workspaceId: WorkspaceId, data: WorkspaceData): void => {
  try {
    localStorage.setItem(getStorageKey(workspaceId), JSON.stringify({
      version: STORAGE_VERSION,
      ...data,
    }));
  } catch (error) {
    console.error('[WorkspaceStorage] Failed to persist workspace:', error);
  }
};

const readWorkspace = (workspaceId: WorkspaceId): WorkspaceData => {
  const key = getStorageKey(workspaceId);
  const existing = localStorage.getItem(key);
  if (existing) return parseWorkspace(existing);

  // Ownership of the old shared store cannot be proven. Preserve it as guest
  // data so it can never be uploaded into whichever account signs in next.
  if (workspaceId === 'guest') {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const migrated = parseWorkspace(legacy);
      writeWorkspace('guest', migrated);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return migrated;
    }
  }

  return emptyWorkspace();
};

const getSyncEngine = () => import('../lib/syncEngine').then((module) => module.syncEngine);

export const useAppStore = create<AppState>((set, get) => ({
  ...emptyWorkspace(),
  activeWorkspaceId: null,
  syncStatus: 'idle',
  lastSyncedAt: null,
  isLoading: false,

  addTask: (task) => {
    const now = Date.now();
    const nextTask: Task = {
      ...task,
      version: task.version ?? 1,
      lastModified: task.lastModified ?? now,
    };
    set((state) => ({ tasks: [...state.tasks, nextTask] }));
    void getSyncEngine().then((engine) => engine.pushTask(nextTask));
  },

  updateTask: (updatedTask) => {
    const previous = get().tasks.find((task) => task.id === updatedTask.id);
    if (!previous) return;
    const nextTask: Task = {
      ...updatedTask,
      version: Math.max(updatedTask.version ?? 0, (previous?.version ?? 0) + 1),
      lastModified: Math.max(Date.now(), updatedTask.lastModified ?? 0),
    };
    set((state) => ({
      tasks: state.tasks.map((task) => task.id === updatedTask.id ? nextTask : task),
    }));
    void getSyncEngine().then((engine) => engine.pushTask(nextTask));
  },

  deleteTask: (id) => {
    const deletedTask = get().tasks.find((task) => task.id === id);
    if (!deletedTask) return;
    const deletedVersion = (deletedTask.version ?? 0) + 1;
    const deletedAt = Date.now();
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
    void getSyncEngine().then((engine) => engine.deleteTaskCloud(id, deletedVersion, deletedAt));
  },

  addNote: (note) => {
    const nextNote: Note = {
      ...note,
      version: note.version ?? 1,
      lastModified: note.lastModified || Date.now(),
    };
    set((state) => ({ notes: [...state.notes, nextNote] }));
    void getSyncEngine().then((engine) => engine.pushNote(nextNote));
  },

  updateNote: (updatedNote) => {
    const previous = get().notes.find((note) => note.id === updatedNote.id);
    if (!previous) return;
    const nextNote: Note = {
      ...updatedNote,
      version: Math.max(updatedNote.version ?? 0, (previous?.version ?? 0) + 1),
      lastModified: Math.max(Date.now(), updatedNote.lastModified || 0),
    };
    set((state) => ({
      notes: state.notes.map((note) => note.id === updatedNote.id ? nextNote : note),
    }));
    void getSyncEngine().then((engine) => engine.pushNote(nextNote));
  },

  deleteNote: (id) => {
    const deletedNote = get().notes.find((note) => note.id === id);
    if (!deletedNote) return;
    const deletedVersion = (deletedNote.version ?? 0) + 1;
    const deletedAt = Date.now();
    set((state) => ({ notes: state.notes.filter((note) => note.id !== id) }));
    void getSyncEngine().then((engine) => engine.deleteNoteCloud(id, deletedVersion, deletedAt));
  },

  addFocusSession: (session) => {
    set((state) => ({ focusSessions: [...state.focusSessions, session] }));
    void getSyncEngine().then((engine) => engine.pushFocusSession(session));
  },

  _switchWorkspace: (workspaceId) => {
    const state = get();
    if (state.activeWorkspaceId === workspaceId) return;

    if (state.activeWorkspaceId) writeWorkspace(state.activeWorkspaceId, state);

    const workspace = readWorkspace(workspaceId);
    set({
      ...workspace,
      activeWorkspaceId: workspaceId,
      syncStatus: navigator.onLine ? 'idle' : 'offline',
      lastSyncedAt: null,
      isLoading: false,
    });
  },

  _clearActiveWorkspace: () => {
    const workspaceId = get().activeWorkspaceId;
    if (workspaceId) localStorage.removeItem(getStorageKey(workspaceId));
    set({ ...emptyWorkspace(), lastSyncedAt: null, syncStatus: 'idle' });
  },

  _setSyncStatus: (syncStatus) => set({ syncStatus }),
  _setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
  _setIsLoading: (isLoading) => set({ isLoading }),
  _hydrateFromCloud: (notes, tasks, focusSessions) => set({ notes, tasks, focusSessions }),
}));

let persistenceTimer: ReturnType<typeof setTimeout> | null = null;

const persistActiveWorkspace = (): void => {
  const state = useAppStore.getState();
  if (state.activeWorkspaceId) writeWorkspace(state.activeWorkspaceId, state);
};

useAppStore.subscribe((state, previous) => {
  if (
    !state.activeWorkspaceId ||
    (state.notes === previous.notes &&
      state.tasks === previous.tasks &&
      state.focusSessions === previous.focusSessions)
  ) return;

  if (persistenceTimer) clearTimeout(persistenceTimer);
  persistenceTimer = setTimeout(() => {
    persistenceTimer = null;
    persistActiveWorkspace();
  }, 100);
});

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', persistActiveWorkspace);
}
