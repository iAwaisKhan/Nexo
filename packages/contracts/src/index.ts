import { z } from 'zod';

const identifierSchema = z.string().trim().min(1).max(128);
const timestampSchema = z.number().int().nonnegative();

export const taskPrioritySchema = z.enum(['High', 'Medium', 'Low']);
export const taskStatusSchema = z.enum(['To Do', 'Done']);

export const noteSchema = z.object({
  id: identifierSchema,
  title: z.string().max(255),
  content: z.string(),
  tags: z.array(z.string().trim().min(1).max(64)),
  isPinned: z.boolean(),
  lastModified: timestampSchema,
  version: z.number().int().nonnegative().optional(),
  timeSpent: z.number().int().nonnegative().optional(),
  isPublic: z.boolean().optional(),
  publishedAt: timestampSchema.optional(),
  slug: z.string().trim().min(1).max(160).optional(),
  isBlog: z.boolean().optional(),
});

export const taskSchema = z.object({
  id: identifierSchema,
  title: z.string().trim().min(1).max(255),
  description: z.string(),
  priority: taskPrioritySchema,
  dueDate: z.string(),
  status: taskStatusSchema,
  createdAt: timestampSchema,
  lastModified: timestampSchema.optional(),
  version: z.number().int().nonnegative().optional(),
  timeSpent: z.number().int().nonnegative().optional(),
});

export const focusSessionSchema = z.object({
  id: identifierSchema,
  startTime: timestampSchema,
  endTime: timestampSchema,
  duration: z.number().int().nonnegative(),
  targetId: identifierSchema.optional(),
  targetType: z.string().trim().min(1).max(32).optional(),
  date: z.iso.date(),
  hour: z.number().int().min(0).max(23),
});

export const workspaceDataSchema = z.object({
  notes: z.array(noteSchema),
  tasks: z.array(taskSchema),
  focusSessions: z.array(focusSessionSchema),
});

export const clientEnvSchema = z
  .object({
    VITE_SUPABASE_URL: z.url().optional(),
    VITE_SUPABASE_ANON_KEY: z.string().trim().min(1).optional(),
  })
  .superRefine((value, context) => {
    const hasUrl = Boolean(value.VITE_SUPABASE_URL);
    const hasKey = Boolean(value.VITE_SUPABASE_ANON_KEY);
    if (hasUrl !== hasKey) {
      context.addIssue({
        code: 'custom',
        message: 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be provided together.',
      });
    }
  });

export type Note = z.infer<typeof noteSchema>;
export type Task = z.infer<typeof taskSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type FocusSession = z.infer<typeof focusSessionSchema>;
export type WorkspaceData = z.infer<typeof workspaceDataSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
