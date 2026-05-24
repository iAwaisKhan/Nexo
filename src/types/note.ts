/**
 * Canonical Note type — single source of truth.
 * Previously duplicated across Notes.tsx and src/types/focus.ts.
 */
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  lastModified: number;
  /** Logical version counter for conflict resolution (increments on every write). */
  version?: number;
  timeSpent?: number; // Cumulative seconds
  isPublic?: boolean;
  publishedAt?: number;
  slug?: string;
  isBlog?: boolean;
}
