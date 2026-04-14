/**
 * Centralized type definitions for Nexo.
 *
 * All domain types live here to avoid fragmentation across components.
 */

// ── Note ────────────────────────────────────────────────────

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  lastModified: number;
  timeSpent?: number; // Cumulative seconds
  isPublic?: boolean;
  publishedAt?: number;
  slug?: string;
  isBlog?: boolean;
}

// ── Task ────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  status: "To Do" | "Done";
  createdAt: number;
  timeSpent?: number; // Cumulative seconds
  deleted_at?: string | null;
}

// ── Focus / Session ─────────────────────────────────────────

export interface AppFocusSession {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
  targetId?: string;
  targetType?: 'task' | 'note' | string;
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
}

/** @deprecated Use AppFocusSession instead — kept for backward compatibility. */
export type FocusSession = AppFocusSession;

export interface FocusStats {
  totalTime: number;
  dailyStreak: number;
  weeklyScore: number;
  topFocusHours: string; // e.g. "9–11 AM"
}

// ── Sync ────────────────────────────────────────────────────

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';
