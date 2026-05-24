/**
 * Sync Engine — Offline-first, optimistic cloud synchronization
 *
 * Strategy:
 *  1. Local writes go to Zustand immediately (instant UI).
 *  2. Background push to Supabase after each local write.
 *  3. On failure: optimistic rollback restores previous state.
 *  4. When offline: writes are queued in memory and flushed on reconnect.
 *  5. On app load + auth: pull full state from cloud and merge.
 *  6. Realtime subscriptions apply changes from other devices live.
 *
 * Conflict resolution: version counter (logical clock) wins over wall-clock timestamps.
 * IDs: crypto.randomUUID() — no more Date.now() collisions.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { useAppStore } from '../store/useAppStore';
import type { Task } from '../types/task';
import type { Note } from '../types/note';
import type { AppFocusSession } from '../store/useAppStore';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ── Offline write queue ──────────────────────────────────────

type QueuedWrite =
  | { type: 'upsert_note'; note: Note; userId: string }
  | { type: 'delete_note'; noteId: string; userId: string }
  | { type: 'upsert_task'; task: Task; userId: string }
  | { type: 'delete_task'; taskId: string; userId: string }
  | { type: 'upsert_session'; session: AppFocusSession; userId: string };

// ── Mappers: Local ↔ DB ──────────────────────────────────────

function noteToRow(note: Note, userId: string) {
  return {
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
    version: (note.version ?? 0) + 1,
    updated_at: new Date().toISOString(),
  };
}

function rowToNote(row: any): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    tags: row.tags || [],
    isPinned: row.is_pinned,
    lastModified: row.last_modified,
    timeSpent: row.time_spent || 0,
    version: row.version ?? 0,
    isPublic: row.is_public || false,
    publishedAt: row.published_at || undefined,
    slug: row.slug || undefined,
    isBlog: row.is_blog || false,
  };
}

function taskToRow(task: Task, userId: string) {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    description: task.description,
    priority: task.priority,
    due_date: task.dueDate,
    status: task.status,
    created_at_ts: task.createdAt,
    time_spent: task.timeSpent || 0,
    version: (task.version ?? 0) + 1,
    updated_at: new Date().toISOString(),
  };
}

function rowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    dueDate: row.due_date || '',
    status: row.status,
    createdAt: row.created_at_ts,
    timeSpent: row.time_spent || 0,
    version: row.version ?? 0,
  };
}

function sessionToRow(session: AppFocusSession, userId: string) {
  return {
    id: session.id,
    user_id: userId,
    start_time: session.startTime,
    end_time: session.endTime,
    duration: session.duration,
    target_id: session.targetId || null,
    target_type: session.targetType || null,
    session_date: session.date,
    hour: session.hour,
  };
}

function rowToSession(row: any): AppFocusSession {
  return {
    id: row.id,
    startTime: row.start_time,
    endTime: row.end_time,
    duration: row.duration,
    targetId: row.target_id || undefined,
    targetType: row.target_type || undefined,
    date: row.session_date,
    hour: row.hour,
  };
}

// ── Sync Engine Class ─────────────────────────────────────────

class SyncEngine {
  private userId: string | null = null;
  private channel: RealtimeChannel | null = null;
  private isInitialized = false;

  // In-memory offline write queue — flushed when back online
  private writeQueue: QueuedWrite[] = [];
  private isOnline = navigator.onLine;
  private draining = false;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.drainQueue();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
      useAppStore.getState()._setSyncStatus('offline');
    });
  }

  // ── Initialization ────────────────────────────────────────

  async initialize(userId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    if (this.isInitialized && this.userId === userId) return;

    this.userId = userId;
    const store = useAppStore.getState();

    // Only show loading spinner if we have no local data yet
    const hasLocalData = store.notes.length > 0 || store.tasks.length > 0;
    if (!hasLocalData) store._setIsLoading(true);
    store._setSyncStatus('syncing');

    try {
      await this.pullAndMerge();
      this.subscribeRealtime();
      this.isInitialized = true;
      store._setSyncStatus('idle');
      store._setLastSyncedAt(Date.now());
      // Flush any queued writes from before auth
      await this.drainQueue();
    } catch (error) {
      console.error('[SyncEngine] Initialization failed:', error);
      store._setSyncStatus('error');
    } finally {
      store._setIsLoading(false);
    }
  }

  async destroy(): Promise<void> {
    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.userId = null;
    this.isInitialized = false;
  }

  // ── Pull & Merge ──────────────────────────────────────────

  private async pullAndMerge(): Promise<void> {
    if (!this.userId) return;

    const [notesRes, tasksRes, sessionsRes] = await Promise.all([
      supabase.from('notes').select('*').eq('user_id', this.userId),
      supabase.from('tasks').select('*').eq('user_id', this.userId),
      supabase.from('focus_sessions').select('*').eq('user_id', this.userId),
    ]);

    const cloudNotes: Note[] = (notesRes.data || []).map(rowToNote);
    const cloudTasks: Task[] = (tasksRes.data || []).map(rowToTask);
    const cloudSessions: AppFocusSession[] = (sessionsRes.data || []).map(rowToSession);

    const store = useAppStore.getState();
    const { notes: localNotes, tasks: localTasks, focusSessions: localSessions } = store;

    // Merge: version counter wins; fall back to lastModified / createdAt
    const mergedNotes = this.mergeByVersion<Note>(localNotes, cloudNotes, 'lastModified');
    const mergedTasks = this.mergeByVersion<Task>(localTasks, cloudTasks, 'createdAt');
    const mergedSessions = this.mergeById(localSessions, cloudSessions);

    store._hydrateFromCloud(mergedNotes, mergedTasks, mergedSessions);

    // Push any local-only or locally-newer items to cloud
    await this.pushLocalOnlyToCloud(mergedNotes, cloudNotes, mergedTasks, cloudTasks, mergedSessions, cloudSessions);
  }

  /**
   * Merge strategy: version counter is the primary conflict resolver.
   * If versions are equal, fall back to the provided timestamp key.
   * Cloud items seed the map first; local overwrites if local wins the comparison.
   */
  private mergeByVersion<T extends { id: string; version?: number }>(
    local: T[],
    cloud: T[],
    fallbackKey: keyof T
  ): T[] {
    const map = new Map<string, T>();
    for (const item of cloud) map.set(item.id, item);
    for (const item of local) {
      const existing = map.get(item.id);
      if (!existing) {
        map.set(item.id, item);
      } else {
        const localVer = item.version ?? 0;
        const cloudVer = existing.version ?? 0;
        if (localVer > cloudVer) {
          map.set(item.id, item);
        } else if (localVer === cloudVer) {
          // Tie-break by timestamp
          if ((item[fallbackKey] as number) >= (existing[fallbackKey] as number)) {
            map.set(item.id, item);
          }
        }
        // else cloud is newer — keep cloud (already in map)
      }
    }
    return Array.from(map.values());
  }

  private mergeById<T extends { id: string }>(local: T[], cloud: T[]): T[] {
    const map = new Map<string, T>();
    for (const item of cloud) map.set(item.id, item);
    for (const item of local) map.set(item.id, item);
    return Array.from(map.values());
  }

  private async pushLocalOnlyToCloud(
    mergedNotes: Note[], cloudNotes: Note[],
    mergedTasks: Task[], cloudTasks: Task[],
    mergedSessions: AppFocusSession[], cloudSessions: AppFocusSession[]
  ): Promise<void> {
    if (!this.userId) return;

    const cloudNoteIds = new Set(cloudNotes.map(n => n.id));
    const cloudTaskIds = new Set(cloudTasks.map(t => t.id));
    const cloudSessionIds = new Set(cloudSessions.map(s => s.id));

    const notesToPush = mergedNotes.filter(n => {
      if (!cloudNoteIds.has(n.id)) return true;
      const cloud = cloudNotes.find(c => c.id === n.id)!;
      return (n.version ?? 0) > (cloud.version ?? 0);
    });

    const tasksToPush = mergedTasks.filter(t => {
      if (!cloudTaskIds.has(t.id)) return true;
      const cloud = cloudTasks.find(c => c.id === t.id)!;
      return (t.version ?? 0) > (cloud.version ?? 0);
    });

    const sessionsToPush = mergedSessions.filter(s => !cloudSessionIds.has(s.id));

    const promises: Promise<any>[] = [];
    if (notesToPush.length)
      promises.push(supabase.from('notes').upsert(notesToPush.map(n => noteToRow(n, this.userId!))));
    if (tasksToPush.length)
      promises.push(supabase.from('tasks').upsert(tasksToPush.map(t => taskToRow(t, this.userId!))));
    if (sessionsToPush.length)
      promises.push(supabase.from('focus_sessions').upsert(sessionsToPush.map(s => sessionToRow(s, this.userId!))));

    await Promise.allSettled(promises);
  }

  // ── Realtime ──────────────────────────────────────────────

  private subscribeRealtime(): void {
    if (!this.userId || this.channel) return;

    this.channel = supabase
      .channel('nexo-sync')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${this.userId}` },
        (payload) => this.handleRealtimeChange('notes', payload))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${this.userId}` },
        (payload) => this.handleRealtimeChange('tasks', payload))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'focus_sessions', filter: `user_id=eq.${this.userId}` },
        (payload) => this.handleRealtimeChange('focus_sessions', payload))
      .subscribe();
  }

  private handleRealtimeChange(table: string, payload: any): void {
    const store = useAppStore.getState();
    const { eventType, new: newRow, old: oldRow } = payload;

    switch (table) {
      case 'notes': {
        if (eventType === 'INSERT' || eventType === 'UPDATE') {
          const note = rowToNote(newRow);
          const existing = store.notes.find(n => n.id === note.id);
          if (!existing) {
            store.addNote(note);
          } else if ((note.version ?? 0) >= (existing.version ?? 0)) {
            // Direct set to avoid re-triggering a cloud push
            useAppStore.setState(state => ({
              notes: state.notes.map(n => n.id === note.id ? note : n),
            }));
          }
        } else if (eventType === 'DELETE') {
          useAppStore.setState(state => ({
            notes: state.notes.filter(n => n.id !== oldRow.id),
          }));
        }
        break;
      }
      case 'tasks': {
        if (eventType === 'INSERT' || eventType === 'UPDATE') {
          const task = rowToTask(newRow);
          const existing = store.tasks.find(t => t.id === task.id);
          if (!existing) {
            store.addTask(task);
          } else if ((task.version ?? 0) >= (existing.version ?? 0)) {
            useAppStore.setState(state => ({
              tasks: state.tasks.map(t => t.id === task.id ? task : t),
            }));
          }
        } else if (eventType === 'DELETE') {
          useAppStore.setState(state => ({
            tasks: state.tasks.filter(t => t.id !== oldRow.id),
          }));
        }
        break;
      }
      case 'focus_sessions': {
        if (eventType === 'INSERT') {
          const session = rowToSession(newRow);
          const exists = store.focusSessions.find(s => s.id === session.id);
          if (!exists) {
            useAppStore.setState(state => ({
              focusSessions: [...state.focusSessions, session],
            }));
          }
        }
        break;
      }
    }

    store._setLastSyncedAt(Date.now());
  }

  // ── Offline Write Queue ───────────────────────────────────

  private enqueue(write: QueuedWrite): void {
    this.writeQueue.push(write);
  }

  private async drainQueue(): Promise<void> {
    if (this.draining || !this.isOnline || !this.userId) return;
    this.draining = true;

    while (this.writeQueue.length > 0 && this.isOnline) {
      const write = this.writeQueue[0];
      try {
        await this.executeWrite(write);
        this.writeQueue.shift(); // only remove after successful execution
      } catch {
        break; // stop draining on failure; will retry next time back online
      }
    }

    this.draining = false;
  }

  private async executeWrite(write: QueuedWrite): Promise<void> {
    switch (write.type) {
      case 'upsert_note':
        await supabase.from('notes').upsert(noteToRow(write.note, write.userId));
        break;
      case 'delete_note':
        await supabase.from('notes').delete().eq('id', write.noteId).eq('user_id', write.userId);
        break;
      case 'upsert_task':
        await supabase.from('tasks').upsert(taskToRow(write.task, write.userId));
        break;
      case 'delete_task':
        await supabase.from('tasks').delete().eq('id', write.taskId).eq('user_id', write.userId);
        break;
      case 'upsert_session':
        await supabase.from('focus_sessions').upsert(sessionToRow(write.session, write.userId));
        break;
    }
  }

  // ── Cloud Push Methods (called by store actions) ──────────

  async pushNote(note: Note, previousNote?: Note): Promise<void> {
    if (!this.userId || !isSupabaseConfigured()) return;

    if (!this.isOnline) {
      this.enqueue({ type: 'upsert_note', note, userId: this.userId });
      return;
    }

    try {
      const { error } = await supabase.from('notes').upsert(noteToRow(note, this.userId));
      if (error) throw error;
    } catch (error) {
      console.error('[SyncEngine] pushNote failed — rolling back:', error);
      useAppStore.getState()._rollbackNote(previousNote, note.id);
      useAppStore.getState()._setSyncStatus('error');
    }
  }

  async deleteNoteCloud(noteId: string, deletedNote?: Note): Promise<void> {
    if (!this.userId || !isSupabaseConfigured()) return;

    if (!this.isOnline) {
      this.enqueue({ type: 'delete_note', noteId, userId: this.userId });
      return;
    }

    try {
      const { error } = await supabase.from('notes').delete().eq('id', noteId).eq('user_id', this.userId);
      if (error) throw error;
    } catch (error) {
      console.error('[SyncEngine] deleteNote failed — rolling back:', error);
      if (deletedNote) useAppStore.getState()._rollbackDeleteNote(deletedNote);
      useAppStore.getState()._setSyncStatus('error');
    }
  }

  async pushTask(task: Task, previousTask?: Task): Promise<void> {
    if (!this.userId || !isSupabaseConfigured()) return;

    if (!this.isOnline) {
      this.enqueue({ type: 'upsert_task', task, userId: this.userId });
      return;
    }

    try {
      const { error } = await supabase.from('tasks').upsert(taskToRow(task, this.userId));
      if (error) throw error;
    } catch (error) {
      console.error('[SyncEngine] pushTask failed — rolling back:', error);
      useAppStore.getState()._rollbackTask(previousTask, task.id);
      useAppStore.getState()._setSyncStatus('error');
    }
  }

  async deleteTaskCloud(taskId: string, deletedTask?: Task): Promise<void> {
    if (!this.userId || !isSupabaseConfigured()) return;

    if (!this.isOnline) {
      this.enqueue({ type: 'delete_task', taskId, userId: this.userId });
      return;
    }

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', this.userId);
      if (error) throw error;
    } catch (error) {
      console.error('[SyncEngine] deleteTask failed — rolling back:', error);
      if (deletedTask) useAppStore.getState()._rollbackDeleteTask(deletedTask);
      useAppStore.getState()._setSyncStatus('error');
    }
  }

  async pushFocusSession(session: AppFocusSession): Promise<void> {
    if (!this.userId || !isSupabaseConfigured()) return;

    if (!this.isOnline) {
      this.enqueue({ type: 'upsert_session', session, userId: this.userId });
      return;
    }

    try {
      const { error } = await supabase.from('focus_sessions').upsert(sessionToRow(session, this.userId));
      if (error) throw error;
    } catch (error) {
      console.error('[SyncEngine] pushFocusSession failed:', error);
      // Sessions are append-only; no rollback needed — just log
    }
  }

  async forceSync(): Promise<void> {
    if (!this.userId || !isSupabaseConfigured()) return;
    const store = useAppStore.getState();
    store._setSyncStatus('syncing');
    try {
      await this.pullAndMerge();
      await this.drainQueue();
      store._setSyncStatus('idle');
      store._setLastSyncedAt(Date.now());
    } catch (error) {
      console.error('[SyncEngine] Force sync failed:', error);
      store._setSyncStatus('error');
    }
  }
}

export const syncEngine = new SyncEngine();
