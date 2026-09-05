/**
 * Account-scoped, offline-first synchronization for Nexo.
 *
 * Local writes are queued before they are sent and are drained serially. This
 * prevents an older request from completing after a newer request from the
 * same browser. Database triggers provide the final version/timestamp guard
 * for writes arriving from different devices.
 */
import { supabase, isSupabaseConfigured } from './supabase';
import { useAppStore } from '../store/useAppStore';
import type { Task } from '../types/task';
import type { Note } from '../types/note';
import type { AppFocusSession } from '../store/useAppStore';
import type { RealtimeChannel } from '@supabase/supabase-js';

type QueuedWrite =
  | { type: 'upsert_note'; note: Note; userId: string }
  | { type: 'delete_note'; noteId: string; version: number; lastModified: number; userId: string }
  | { type: 'upsert_task'; task: Task; userId: string }
  | { type: 'delete_task'; taskId: string; version: number; lastModified: number; userId: string }
  | { type: 'upsert_session'; session: AppFocusSession; userId: string };

interface NoteRow {
  id: string;
  title: string;
  content: string;
  tags: string[] | null;
  is_pinned: boolean | null;
  last_modified: number;
  time_spent: number | null;
  is_public: boolean | null;
  published_at: number | null;
  slug: string | null;
  is_blog: boolean | null;
  version: number | null;
  deleted_at: string | null;
}

interface TaskRow {
  id: string;
  title: string;
  description: string;
  priority: Task['priority'];
  due_date: string | null;
  status: Task['status'];
  created_at_ts: number;
  last_modified: number | null;
  time_spent: number | null;
  version: number | null;
  deleted_at: string | null;
}

interface SessionRow {
  id: string;
  start_time: number;
  end_time: number;
  duration: number;
  target_id: string | null;
  target_type: string | null;
  session_date: string;
  hour: number;
}

const QUEUE_STORAGE_PREFIX = 'nexo_sync_write_queue_v3:';
const LEGACY_QUEUE_STORAGE_KEY = 'nexo_sync_write_queue_v2';
const queueStorageKey = (userId: string) => `${QUEUE_STORAGE_PREFIX}${userId}`;

const isQueuedWrite = (value: unknown): value is QueuedWrite => {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.userId === 'string' && typeof record.type === 'string' && [
    'upsert_note',
    'delete_note',
    'upsert_task',
    'delete_task',
    'upsert_session',
  ].includes(record.type);
};

const readQueue = (userId: string): QueuedWrite[] => {
  try {
    const raw = localStorage.getItem(queueStorageKey(userId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isQueuedWrite) : [];
  } catch (error) {
    console.error('[SyncEngine] Failed to read queued writes:', error);
    return [];
  }
};

const persistQueue = (userId: string, queue: QueuedWrite[]): void => {
  try {
    const key = queueStorageKey(userId);
    if (queue.length === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(queue));
  } catch (error) {
    console.error('[SyncEngine] Failed to persist queued writes:', error);
  }
};

const migrateLegacyQueue = (): void => {
  try {
    const raw = localStorage.getItem(LEGACY_QUEUE_STORAGE_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const grouped = new Map<string, QueuedWrite[]>();
      parsed.filter(isQueuedWrite).forEach((write) => {
        grouped.set(write.userId, [...(grouped.get(write.userId) ?? []), write]);
      });
      grouped.forEach((writes, userId) => persistQueue(userId, [...readQueue(userId), ...writes]));
    }
    localStorage.removeItem(LEGACY_QUEUE_STORAGE_KEY);
  } catch (error) {
    console.error('[SyncEngine] Failed to migrate the legacy queue:', error);
  }
};

const assertNoError = (result: { error?: unknown | null }): void => {
  if (result.error) throw result.error;
};

const noteToRow = (note: Note, userId: string) => ({
  id: note.id,
  user_id: userId,
  title: note.title,
  content: note.content,
  tags: note.tags,
  is_pinned: note.isPinned,
  last_modified: note.lastModified,
  time_spent: note.timeSpent || 0,
  is_public: note.isPublic || false,
  published_at: note.publishedAt || null,
  slug: note.slug || null,
  is_blog: note.isBlog || false,
  version: note.version ?? 0,
  deleted_at: null,
  updated_at: new Date().toISOString(),
});

const rowToNote = (row: NoteRow): Note => ({
  id: row.id,
  title: row.title,
  content: row.content,
  tags: row.tags || [],
  isPinned: row.is_pinned || false,
  lastModified: row.last_modified,
  timeSpent: row.time_spent || 0,
  version: row.version ?? 0,
  isPublic: row.is_public || false,
  publishedAt: row.published_at || undefined,
  slug: row.slug || undefined,
  isBlog: row.is_blog || false,
});

const taskToRow = (task: Task, userId: string) => ({
  id: task.id,
  user_id: userId,
  title: task.title,
  description: task.description,
  priority: task.priority,
  due_date: task.dueDate,
  status: task.status,
  created_at_ts: task.createdAt,
  last_modified: task.lastModified ?? task.createdAt,
  time_spent: task.timeSpent || 0,
  version: task.version ?? 0,
  deleted_at: null,
  updated_at: new Date().toISOString(),
});

const rowToTask = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  description: row.description,
  priority: row.priority,
  dueDate: row.due_date || '',
  status: row.status,
  createdAt: row.created_at_ts,
  lastModified: row.last_modified ?? row.created_at_ts,
  timeSpent: row.time_spent || 0,
  version: row.version ?? 0,
});

const sessionToRow = (session: AppFocusSession, userId: string) => ({
  id: session.id,
  user_id: userId,
  start_time: session.startTime,
  end_time: session.endTime,
  duration: session.duration,
  target_id: session.targetId || null,
  target_type: session.targetType || null,
  session_date: session.date,
  hour: session.hour,
});

const rowToSession = (row: SessionRow): AppFocusSession => ({
  id: row.id,
  startTime: row.start_time,
  endTime: row.end_time,
  duration: row.duration,
  targetId: row.target_id || undefined,
  targetType: row.target_type || undefined,
  date: row.session_date,
  hour: row.hour,
});

class SyncEngine {
  private userId: string | null = null;
  private channel: RealtimeChannel | null = null;
  private initializedUserId: string | null = null;
  private writeQueue: QueuedWrite[] = [];
  private isOnline = typeof navigator === 'undefined' ? true : navigator.onLine;
  private draining = false;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private retryAttempt = 0;
  private lifecycle = 0;

  constructor() {
    if (typeof window === 'undefined') return;
    migrateLegacyQueue();
    window.addEventListener('online', () => {
      this.isOnline = true;
      if (this.userId) void this.forceSync();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
      useAppStore.getState()._setSyncStatus('offline');
    });
  }

  async initialize(userId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    if (this.initializedUserId === userId) return;
    if (this.userId && this.userId !== userId) await this.destroy();

    const lifecycle = ++this.lifecycle;
    this.userId = userId;
    this.writeQueue = readQueue(userId);
    const store = useAppStore.getState();

    if (!this.isOnline) {
      this.initializedUserId = userId;
      store._setSyncStatus('offline');
      store._setIsLoading(false);
      return;
    }

    const hasLocalData = store.notes.length > 0 || store.tasks.length > 0;
    if (!hasLocalData) store._setIsLoading(true);
    store._setSyncStatus('syncing');

    try {
      await this.pullAndMerge();
      if (lifecycle !== this.lifecycle || this.userId !== userId) return;
      this.subscribeRealtime();
      this.initializedUserId = userId;
      await this.drainQueue();
      store._setSyncStatus('idle');
      store._setLastSyncedAt(Date.now());
    } catch (error) {
      if (lifecycle !== this.lifecycle) return;
      console.error('[SyncEngine] Initialization failed:', error);
      store._setSyncStatus('error');
    } finally {
      if (lifecycle === this.lifecycle) store._setIsLoading(false);
    }
  }

  async destroy(): Promise<void> {
    this.lifecycle += 1;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    if (this.userId) persistQueue(this.userId, this.writeQueue);
    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.userId = null;
    this.initializedUserId = null;
    this.writeQueue = [];
    this.draining = false;
    this.retryAttempt = 0;
  }

  clearQueuedWrites(userId = this.userId): void {
    if (!userId) return;
    localStorage.removeItem(queueStorageKey(userId));
    if (this.userId === userId) this.writeQueue = [];
  }

  private async pullAndMerge(): Promise<void> {
    const userId = this.userId;
    if (!userId) return;

    const [notesRes, tasksRes, sessionsRes] = await Promise.all([
      supabase.from('notes').select('*').eq('user_id', userId),
      supabase.from('tasks').select('*').eq('user_id', userId),
      supabase.from('focus_sessions').select('*').eq('user_id', userId),
    ]);

    assertNoError(notesRes);
    assertNoError(tasksRes);
    assertNoError(sessionsRes);
    if (this.userId !== userId) return;

    const allCloudNotes = (notesRes.data || []) as NoteRow[];
    const allCloudTasks = (tasksRes.data || []) as TaskRow[];
    const pendingNoteDeletes = new Map(
      this.writeQueue
        .filter((write): write is Extract<QueuedWrite, { type: 'delete_note' }> => write.type === 'delete_note')
        .map((write) => [write.noteId, write.version]),
    );
    const pendingTaskDeletes = new Map(
      this.writeQueue
        .filter((write): write is Extract<QueuedWrite, { type: 'delete_task' }> => write.type === 'delete_task')
        .map((write) => [write.taskId, write.version]),
    );
    const cloudNotes = allCloudNotes
      .filter((row) => !row.deleted_at && (row.version ?? 0) > (pendingNoteDeletes.get(row.id) ?? -1))
      .map(rowToNote);
    const cloudTasks = allCloudTasks
      .filter((row) => !row.deleted_at && (row.version ?? 0) > (pendingTaskDeletes.get(row.id) ?? -1))
      .map(rowToTask);
    const cloudSessions = ((sessionsRes.data || []) as SessionRow[]).map(rowToSession);

    const noteTombstones = new Map(
      allCloudNotes.filter((row) => row.deleted_at).map((row) => [row.id, row.version ?? 0]),
    );
    const taskTombstones = new Map(
      allCloudTasks.filter((row) => row.deleted_at).map((row) => [row.id, row.version ?? 0]),
    );
    pendingNoteDeletes.forEach((version, id) => {
      noteTombstones.set(id, Math.max(version, noteTombstones.get(id) ?? -1));
    });
    pendingTaskDeletes.forEach((version, id) => {
      taskTombstones.set(id, Math.max(version, taskTombstones.get(id) ?? -1));
    });

    const store = useAppStore.getState();
    const localNotes = store.notes.filter((note) => (
      (note.version ?? 0) > (noteTombstones.get(note.id) ?? -1)
    ));
    const localTasks = store.tasks.filter((task) => (
      (task.version ?? 0) > (taskTombstones.get(task.id) ?? -1)
    ));

    const mergedNotes = this.mergeByVersion(localNotes, cloudNotes, 'lastModified');
    const mergedTasks = this.mergeByVersion(localTasks, cloudTasks, 'lastModified');
    const mergedSessions = this.mergeById(store.focusSessions, cloudSessions);

    store._hydrateFromCloud(mergedNotes, mergedTasks, mergedSessions);
    await this.pushLocalOnlyToCloud(
      mergedNotes,
      allCloudNotes,
      mergedTasks,
      allCloudTasks,
      mergedSessions,
      cloudSessions,
    );
  }

  private mergeByVersion<T extends { id: string; version?: number }>(
    local: T[],
    cloud: T[],
    fallbackKey: keyof T,
  ): T[] {
    const map = new Map<string, T>();
    cloud.forEach((item) => map.set(item.id, item));
    local.forEach((item) => {
      const existing = map.get(item.id);
      if (!existing) {
        map.set(item.id, item);
        return;
      }
      const localVersion = item.version ?? 0;
      const cloudVersion = existing.version ?? 0;
      if (
        localVersion > cloudVersion ||
        (localVersion === cloudVersion && Number(item[fallbackKey] ?? 0) >= Number(existing[fallbackKey] ?? 0))
      ) map.set(item.id, item);
    });
    return Array.from(map.values());
  }

  private mergeById<T extends { id: string }>(local: T[], cloud: T[]): T[] {
    const map = new Map<string, T>();
    cloud.forEach((item) => map.set(item.id, item));
    local.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }

  private async pushLocalOnlyToCloud(
    mergedNotes: Note[],
    cloudNoteRows: NoteRow[],
    mergedTasks: Task[],
    cloudTaskRows: TaskRow[],
    mergedSessions: AppFocusSession[],
    cloudSessions: AppFocusSession[],
  ): Promise<void> {
    const userId = this.userId;
    if (!userId) return;

    const cloudNotes = new Map(cloudNoteRows.map((row) => [row.id, row]));
    const cloudTasks = new Map(cloudTaskRows.map((row) => [row.id, row]));
    const cloudSessionIds = new Set(cloudSessions.map((session) => session.id));

    mergedNotes.forEach((note) => {
      const cloud = cloudNotes.get(note.id);
      const localVersion = note.version ?? 0;
      const cloudVersion = cloud?.version ?? 0;
      if (
        !cloud ||
        localVersion > cloudVersion ||
        (localVersion === cloudVersion && note.lastModified > cloud.last_modified)
      ) {
        this.enqueue({ type: 'upsert_note', note, userId });
      }
    });
    mergedTasks.forEach((task) => {
      const cloud = cloudTasks.get(task.id);
      const localVersion = task.version ?? 0;
      const cloudVersion = cloud?.version ?? 0;
      const localModified = task.lastModified ?? task.createdAt;
      const cloudModified = cloud?.last_modified ?? cloud?.created_at_ts ?? 0;
      if (
        !cloud ||
        localVersion > cloudVersion ||
        (localVersion === cloudVersion && localModified > cloudModified)
      ) {
        this.enqueue({ type: 'upsert_task', task, userId });
      }
    });
    mergedSessions
      .filter((session) => !cloudSessionIds.has(session.id))
      .forEach((session) => this.enqueue({ type: 'upsert_session', session, userId }));

    await this.drainQueue();
  }

  private subscribeRealtime(): void {
    const userId = this.userId;
    if (!userId || this.channel) return;

    this.channel = supabase
      .channel(`nexo-sync-${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` },
        (payload) => this.handleRealtimeChange('notes', payload))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
        (payload) => this.handleRealtimeChange('tasks', payload))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'focus_sessions', filter: `user_id=eq.${userId}` },
        (payload) => this.handleRealtimeChange('focus_sessions', payload))
      .subscribe();
  }

  private handleRealtimeChange(table: string, payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }): void {
    const store = useAppStore.getState();
    const newRow = payload.new;
    const oldRow = payload.old;

    if (table === 'notes') {
      const id = String(newRow.id ?? oldRow.id ?? '');
      if (payload.eventType === 'DELETE' || newRow.deleted_at) {
        useAppStore.setState((state) => ({ notes: state.notes.filter((note) => note.id !== id) }));
      } else {
        const note = rowToNote(newRow as unknown as NoteRow);
        const existing = store.notes.find((item) => item.id === note.id);
        if (!existing) useAppStore.setState((state) => ({ notes: [...state.notes, note] }));
        else if (
          (note.version ?? 0) > (existing.version ?? 0) ||
          ((note.version ?? 0) === (existing.version ?? 0) && note.lastModified >= existing.lastModified)
        ) useAppStore.setState((state) => ({
          notes: state.notes.map((item) => item.id === note.id ? note : item),
        }));
      }
    }

    if (table === 'tasks') {
      const id = String(newRow.id ?? oldRow.id ?? '');
      if (payload.eventType === 'DELETE' || newRow.deleted_at) {
        useAppStore.setState((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
      } else {
        const task = rowToTask(newRow as unknown as TaskRow);
        const existing = store.tasks.find((item) => item.id === task.id);
        if (!existing) useAppStore.setState((state) => ({ tasks: [...state.tasks, task] }));
        else if (
          (task.version ?? 0) > (existing.version ?? 0) ||
          ((task.version ?? 0) === (existing.version ?? 0) &&
            (task.lastModified ?? 0) >= (existing.lastModified ?? 0))
        ) useAppStore.setState((state) => ({
          tasks: state.tasks.map((item) => item.id === task.id ? task : item),
        }));
      }
    }

    if (table === 'focus_sessions' && payload.eventType === 'INSERT') {
      const session = rowToSession(newRow as unknown as SessionRow);
      if (!store.focusSessions.some((item) => item.id === session.id)) {
        useAppStore.setState((state) => ({ focusSessions: [...state.focusSessions, session] }));
      }
    }

    store._setLastSyncedAt(Date.now());
  }

  private writeKey(write: QueuedWrite): string {
    switch (write.type) {
      case 'upsert_note': return `note:${write.note.id}`;
      case 'delete_note': return `note:${write.noteId}`;
      case 'upsert_task': return `task:${write.task.id}`;
      case 'delete_task': return `task:${write.taskId}`;
      case 'upsert_session': return `session:${write.session.id}`;
    }
  }

  private enqueue(write: QueuedWrite): void {
    if (!this.userId || write.userId !== this.userId) return;
    const key = this.writeKey(write);
    this.writeQueue = this.writeQueue.filter((queued) => this.writeKey(queued) !== key);
    this.writeQueue.push(write);
    persistQueue(this.userId, this.writeQueue);
    useAppStore.getState()._setSyncStatus(this.isOnline ? 'syncing' : 'offline');
    if (this.isOnline) void this.drainQueue();
  }

  private scheduleRetry(): void {
    if (this.retryTimer || !this.isOnline || !this.userId) return;
    const delay = Math.min(30_000, 1_000 * 2 ** this.retryAttempt);
    this.retryAttempt += 1;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      void this.drainQueue();
    }, delay);
  }

  private async drainQueue(): Promise<void> {
    const userId = this.userId;
    if (this.draining || !this.isOnline || !userId) return;
    const lifecycle = this.lifecycle;
    this.draining = true;

    try {
      while (this.isOnline && this.userId === userId && this.lifecycle === lifecycle) {
        const write = this.writeQueue[0];
        if (!write) break;
        try {
          await this.executeWrite(write, lifecycle);
          // A sign-out or account switch may finish while the request is in
          // flight. Never mutate or persist the next account's queue afterward.
          if (this.lifecycle !== lifecycle || this.userId !== userId) return;
          this.writeQueue = this.writeQueue.filter((queued) => queued !== write);
          persistQueue(userId, this.writeQueue);
          this.retryAttempt = 0;
        } catch (error) {
          if (this.lifecycle !== lifecycle || this.userId !== userId) return;
          console.error('[SyncEngine] Queued write failed:', error);
          useAppStore.getState()._setSyncStatus('error');
          this.scheduleRetry();
          break;
        }
      }
    } finally {
      // destroy() resets this flag before a new account starts draining. An
      // older request must not clear the flag of that newer drain.
      if (this.lifecycle === lifecycle) this.draining = false;
    }

    if (this.lifecycle === lifecycle && this.userId === userId && this.writeQueue.length === 0) {
      useAppStore.getState()._setSyncStatus('idle');
      useAppStore.getState()._setLastSyncedAt(Date.now());
    }
  }

  private async executeWrite(write: QueuedWrite, lifecycle: number): Promise<void> {
    const canApplyResult = () => this.lifecycle === lifecycle && this.userId === write.userId;
    switch (write.type) {
      case 'upsert_note': {
        const result = await supabase.from('notes')
          .upsert(noteToRow(write.note, write.userId))
          .select('*')
          .single();
        assertNoError(result);
        if (result.data && canApplyResult()) this.handleRealtimeChange('notes', {
          eventType: 'UPDATE',
          new: result.data,
          old: {},
        });
        break;
      }
      case 'delete_note': {
        const result = await supabase.from('notes').update({
          deleted_at: new Date(write.lastModified).toISOString(),
          last_modified: write.lastModified,
          version: write.version,
          updated_at: new Date().toISOString(),
        }).eq('id', write.noteId).eq('user_id', write.userId).select('*').maybeSingle();
        assertNoError(result);
        if (result.data && canApplyResult()) this.handleRealtimeChange('notes', {
          eventType: 'UPDATE',
          new: result.data,
          old: {},
        });
        break;
      }
      case 'upsert_task': {
        const result = await supabase.from('tasks')
          .upsert(taskToRow(write.task, write.userId))
          .select('*')
          .single();
        assertNoError(result);
        if (result.data && canApplyResult()) this.handleRealtimeChange('tasks', {
          eventType: 'UPDATE',
          new: result.data,
          old: {},
        });
        break;
      }
      case 'delete_task': {
        const result = await supabase.from('tasks').update({
          deleted_at: new Date(write.lastModified).toISOString(),
          last_modified: write.lastModified,
          version: write.version,
          updated_at: new Date().toISOString(),
        }).eq('id', write.taskId).eq('user_id', write.userId).select('*').maybeSingle();
        assertNoError(result);
        if (result.data && canApplyResult()) this.handleRealtimeChange('tasks', {
          eventType: 'UPDATE',
          new: result.data,
          old: {},
        });
        break;
      }
      case 'upsert_session':
        assertNoError(await supabase.from('focus_sessions').upsert(sessionToRow(write.session, write.userId)));
        break;
    }
  }

  async pushNote(note: Note): Promise<void> {
    if (!this.userId || !isSupabaseConfigured()) return;
    this.enqueue({ type: 'upsert_note', note, userId: this.userId });
  }

  async deleteNoteCloud(noteId: string, version: number, lastModified: number): Promise<void> {
    if (!this.userId || !isSupabaseConfigured()) return;
    this.enqueue({ type: 'delete_note', noteId, version, lastModified, userId: this.userId });
  }

  async pushTask(task: Task): Promise<void> {
    if (!this.userId || !isSupabaseConfigured()) return;
    this.enqueue({ type: 'upsert_task', task, userId: this.userId });
  }

  async deleteTaskCloud(taskId: string, version: number, lastModified: number): Promise<void> {
    if (!this.userId || !isSupabaseConfigured()) return;
    this.enqueue({ type: 'delete_task', taskId, version, lastModified, userId: this.userId });
  }

  async pushFocusSession(session: AppFocusSession): Promise<void> {
    if (!this.userId || !isSupabaseConfigured()) return;
    this.enqueue({ type: 'upsert_session', session, userId: this.userId });
  }

  async forceSync(): Promise<void> {
    const userId = this.userId;
    if (!userId || !isSupabaseConfigured()) return;
    const store = useAppStore.getState();
    if (!this.isOnline) {
      store._setSyncStatus('offline');
      return;
    }
    store._setSyncStatus('syncing');
    try {
      await this.pullAndMerge();
      if (this.userId !== userId) return;
      this.subscribeRealtime();
      await this.drainQueue();
      store._setSyncStatus('idle');
      store._setLastSyncedAt(Date.now());
    } catch (error) {
      if (this.userId !== userId) return;
      console.error('[SyncEngine] Force sync failed:', error);
      store._setSyncStatus('error');
    }
  }
}

export const syncEngine = new SyncEngine();
