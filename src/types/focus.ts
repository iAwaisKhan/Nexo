/**
 * Focus-session specific types.
 * Note: FocusSession here is the lightweight local variant.
 * The store uses AppFocusSession (from useAppStore) which is identical.
 */
export interface FocusSession {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
  targetId?: string;
  targetType?: 'note' | 'task';
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
}

export interface FocusStats {
  totalTime: number;
  dailyStreak: number;
  weeklyScore: number;
  topFocusHours: string;
}
