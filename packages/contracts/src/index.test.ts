import { describe, expect, it } from 'vitest';
import {
  clientEnvSchema,
  focusSessionSchema,
  noteSchema,
  taskSchema,
  workspaceDataSchema,
} from './index';

const note = {
  id: 'note-1',
  title: 'Architecture notes',
  content: 'Preserve the local-first workflow.',
  tags: ['architecture'],
  isPinned: true,
  lastModified: 1_700_000_000_000,
};

const task = {
  id: 'task-1',
  title: 'Create the API boundary',
  description: 'Move persistence behind contracts.',
  priority: 'High' as const,
  dueDate: '2026-10-02',
  status: 'To Do' as const,
  createdAt: 1_700_000_000_000,
};

const session = {
  id: 'session-1',
  startTime: 1_700_000_000_000,
  endTime: 1_700_000_001_500,
  duration: 1_500,
  date: '2026-10-01',
  hour: 10,
};

describe('shared domain contracts', () => {
  it('accepts a complete workspace payload', () => {
    expect(
      workspaceDataSchema.parse({ notes: [note], tasks: [task], focusSessions: [session] }),
    ).toEqual({ notes: [note], tasks: [task], focusSessions: [session] });
  });

  it('rejects invalid task and focus values', () => {
    expect(taskSchema.safeParse({ ...task, priority: 'Urgent' }).success).toBe(false);
    expect(focusSessionSchema.safeParse({ ...session, hour: 24 }).success).toBe(false);
  });

  it('rejects empty note identifiers and tags', () => {
    expect(noteSchema.safeParse({ ...note, id: '' }).success).toBe(false);
    expect(noteSchema.safeParse({ ...note, tags: [''] }).success).toBe(false);
  });
});

describe('client environment contract', () => {
  it('allows local-only mode when cloud variables are absent', () => {
    expect(clientEnvSchema.safeParse({}).success).toBe(true);
  });

  it('requires the Supabase URL and anonymous key together', () => {
    expect(
      clientEnvSchema.safeParse({ VITE_SUPABASE_URL: 'https://example.supabase.co' }).success,
    ).toBe(false);
  });
});
