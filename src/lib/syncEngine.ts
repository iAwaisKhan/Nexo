/**
 * Sync Engine — Offline-first, optimistic cloud synchronization
 * 
 * Strategy:
 *  1. Local writes go to Zustand immediately (instant UI).
 *  2. Background push to Supabase after each local write.
 *  3. On app load + auth, pull full state from cloud and merge.
 *  4. Realtime subscriptions apply changes from other devices live.
 *  
 * Conflict resolution: last-write-wins via timestamps.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { useAppStore } from '../store/useAppStore';
import type { Task } from '../components/Tasks';
import type { Note } from '../components/Notes';
import type { AppFocusSession } from '../store/useAppStore';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ── Mappers: Local ↔ DB ─────────────────────────────────────

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

// ── Sync Engine Class ────────────────────────────────────────

class SyncEngine {
  private userId: string | null = null;
  private channel: RealtimeChannel | null = null;
  private isInitialized = false;

  /**
   * Initialize sync for an authenticated user.
   * Pulls cloud data, merges with local, then subscribes to realtime.
   */
  async initialize(userId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    if (this.isInitialized && this.userId === userId) return;

    this.userId = userId;
    const store = useAppStore.getState();

    store._setSyncStatus('syncing');

    try {
      // Pull and merge
      await this.pullAndMerge();

      // Subscribe to realtime
      this.subscribeRealtime();

      this.isInitialized = true;
      store._setSyncStatus('idle');
      store._setLastSyncedAt(Date.now());
    } catch (error) {
      console.error('Sync initialization failed:', error);
      store._setSyncStatus('error');
    }
  }

  /**
   * Tear down: unsubscribe realtime, reset state.
   */
  async destroy(): Promise<void> {
    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.userId = null;
    this.isInitialized = false;
  }

  // ── Pull & Merge ─────────────────────────────────────────

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
    const localNotes = store.notes;
    const localTasks = store.tasks;
    const localSessions = store.focusSessions;

    // Merge: last-write-wins for notes/tasks, union for sessions
    const mergedNotes = this.mergeByTimestamp(localNotes, cloudNotes, 'lastModified');
    const mergedTasks = this.mergeByTimestamp(localTasks, cloudTasks, 'createdAt');
    const mergedSessions = this.mergeById(localSessions, cloudSessions);

    // Hydrate local store
    store._hydrateFromCloud(mergedNotes, mergedTasks, mergedSessions);

    // Push any local-only items to cloud
    await this.pushLocalOnlyToCloud(mergedNotes, cloudNotes, mergedTasks, cloudTasks, mergedSessions, cloudSessions);
  }

  private mergeByTimestamp<T extends { id: string }>(
    local: T[],
    cloud: T[],
    timestampKey: keyof T
  ): T[] {
    const map = new Map<string, T>();

    // Cloud first
    for (const item of cloud) {
      map.set(item.id, item);
    }

    // Local overwrites if newer
    for (const item of local) {
      const existing = map.get(item.id);
      if (!existing || (item[timestampKey] as number) >= (existing[timestampKey] as number)) {
        map.set(item.id, item);
      }
    }

    return Array.from(map.values());
  }

  private mergeById<T extends { id: string }>(local: T[], cloud: T[]): T[] {
    const map = new Map<string, T>();
    for (const item of cloud) map.set(item.id, item);
    for (const item of local) map.set(item.id, item); // local wins on conflict
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

    const newNotes = mergedNotes.filter(n => !cloudNoteIds.has(n.id));
    const newTasks = mergedTasks.filter(t => !cloudTaskIds.has(t.id));
    const newSessions = mergedSessions.filter(s => !cloudSessionIds.has(s.id));

    // Also push notes/tasks that exist in cloud but local is newer
    const updatedNotes = mergedNotes.filter(n => {
      if (cloudNoteIds.has(n.id)) {
        const cloud = cloudNotes.find(c => c.id === n.id);
        return cloud && n.lastModified > cloud.lastModified;
      }
      return false;
    });

    const updatedTasks = mergedTasks.filter(t => {
      if (cloudTaskIds.has(t.id)) {
        const cloud = cloudTasks.find(c => c.id === t.id);
        return cloud && t.createdAt > cloud.createdAt;
      }
      return false;
    });

    const promises: Promise<any>[] = [];

    if (newNotes.length > 0) {
      promises.push(
        supabase.from('notes').upsert(newNotes.map(n => noteToRow(n, this.userId!)))
      );
    }
    if (updatedNotes.length > 0) {
      promises.push(
        supabase.from('notes').upsert(updatedNotes.map(n => noteToRow(n, this.userId!)))
      );
    }
    if (newTasks.length > 0) {
      promises.push(
        supabase.from('tasks').upsert(newTasks.map(t => taskToRow(t, this.userId!)))
      );
    }
    if (updatedTasks.length > 0) {
      promises.push(
        supabase.from('tasks').upsert(updatedTasks.map(t => taskToRow(t, this.userId!)))
      );
    }
    if (newSessions.length > 0) {
      promises.push(
        supabase.from('focus_sessions').upsert(newSessions.map(s => sessionToRow(s, this.userId!)))
      );
    }

    await Promise.allSettled(promises);
  }

  // ── Realtime Subscriptions ────────────────────────────────

  private subscribeRealtime(): void {
    if (!this.userId || this.channel) return;

    this.channel = supabase
      .channel('nexo-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${this.userId}` },
        (payload) => this.handleRealtimeChange('notes', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${this.userId}` },
        (payload) => this.handleRealtimeChange('tasks', payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'focus_sessions', filter: `user_id=eq.${this.userId}` },
        (payload) => this.handleRealtimeChange('focus_sessions', payload)
      )
      .subscribe();
  }

  private handleRealtimeChange(table: string, payload: any): void {
    const store = useAppStore.getState();
    const { eventType, new: newRow, old: oldRow } = payload;

    switch (table) {
      case 'notes': {
        if (eventType === 'INSERT' || eventType === 'UPDATE') {
          const note = rowToNote(newRow);
          const exists = store.notes.find(n => n.id === note.id);
          if (exists) {
            // Only update if cloud is newer
            if (note.lastModified >= exists.lastModified) {
              store.updateNote(note);
            }
          } else {
            store.addNote(note);
          }
        } else if (eventType === 'DELETE') {
          store.deleteNote(oldRow.id);
        }
        break;
      }
      case 'tasks': {
        if (eventType === 'INSERT' || eventType === 'UPDATE') {
          const task = rowToTask(newRow);
          const exists = store.tasks.find(t => t.id === task.id);
          if (exists) {
            store.updateTask(task);
          } else {
            store.addTask(task);
          }
        } else if (eventType === 'DELETE') {
          store.deleteTask(oldRow.id);
        }
        break;
      }
      case 'focus_sessions': {
        if (eventType === 'INSERT') {
          const session = rowToSession(newRow);
          const exists = store.focusSessions.find(s => s.id === session.id);
          if (!exists) {
            store.addFocusSession(session);
          }
        }
        break;
      }
    }

    store._setLastSyncedAt(Date.now());
  }

  // ── Cloud Push Methods (called by store actions) ──────────

  async pushNote(note: Note): Promise<void> {
    if (!this.userId || !isSupabaseConfigured()) return;
    try {
      await supabase.from('notes').upsert(noteToRow(note, this.userId));
    } catch (error) {
      console.error('Failed to push note:', error);
    }
  }

  async deleteNoteCloud(noteId: string): Promise<void> {
    if (!this.userId || !isSupabaseConfigured()) return;
    try {
      await supabase.from('notes').delete().eq('id', noteId).eq('user_id', this.userId);
    } catch (error) {
      console.error('Failed to delete note from cloud:', error);
    }
  }

  async pushTask(task: Task): Promise<void> {
    if (!this.userId || !isSupabaseConfigured()) return;
    try {
      await supabase.from('tasks').upsert(taskToRow(task, this.userId));
    } catch (error) {
      console.error('Failed to push task:', error);
    }
  }

  async deleteTaskCloud(taskId: string): Promise<void> {
    if (!this.userId || !isSupabaseConfigured()) return;
    try {
      await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', this.userId);
    } catch (error) {
      console.error('Failed to delete task from cloud:', error);
    }
  }

  async pushFocusSession(session: AppFocusSession): Promise<void> {
    if (!this.userId || !isSupabaseConfigured()) return;
    try {
      await supabase.from('focus_sessions').upsert(sessionToRow(session, this.userId));
    } catch (error) {
      console.error('Failed to push focus session:', error);
    }
  }

  /**
   * Manual full sync — re-pull everything from cloud.
   */
  async forceSync(): Promise<void> {
    if (!this.userId || !isSupabaseConfigured()) return;
    const store = useAppStore.getState();
    store._setSyncStatus('syncing');
    try {
      await this.pullAndMerge();
      store._setSyncStatus('idle');
      store._setLastSyncedAt(Date.now());
    } catch (error) {
      console.error('Force sync failed:', error);
      store._setSyncStatus('error');
    }
  }
}

export const syncEngine = new SyncEngine();
