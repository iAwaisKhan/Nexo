/**
 * Canonical Task type — single source of truth.
 * Previously defined only inside Tasks.tsx component.
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  status: 'To Do' | 'Done';
  createdAt: number;
  /** Last local mutation timestamp, used as the conflict-resolution tie-breaker. */
  lastModified?: number;
  /** Logical version counter for conflict resolution (increments on every write). */
  version?: number;
  timeSpent?: number; // Cumulative seconds
}
