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

export const registerInputSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
  displayName: z.string().trim().min(1).max(80).optional(),
});

export const loginInputSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(128),
});

export const createNoteInputSchema = noteSchema
  .pick({
    id: true,
    title: true,
    content: true,
    tags: true,
    isPinned: true,
    isPublic: true,
    slug: true,
    isBlog: true,
  })
  .extend({
    title: z.string().max(255).default(''),
    content: z.string().default(''),
    tags: z.array(z.string().trim().min(1).max(64)).default([]),
    isPinned: z.boolean().default(false),
    isPublic: z.boolean().default(false),
    isBlog: z.boolean().default(false),
  });

export const updateNoteInputSchema = createNoteInputSchema
  .omit({ id: true })
  .partial()
  .extend({ expectedVersion: z.number().int().nonnegative().optional() })
  .refine((value) => Object.keys(value).some((key) => key !== 'expectedVersion'), {
    message: 'At least one note field must be provided.',
  });

export const noteListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(),
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
export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type CreateNoteInput = z.infer<typeof createNoteInputSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteInputSchema>;
