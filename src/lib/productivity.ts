import type { Task } from '../types/task';
import type { Note } from '../types/note';
import type { AppFocusSession } from '../store/useAppStore';
import { localDateKey } from './date';

export type KanbanColumnId = 'backlog' | 'today' | 'upcoming' | 'done';

export interface SpaceSummary {
  id: string;
  name: string;
  notes: Note[];
  tasks: Task[];
  focusSeconds: number;
}

export const todayKey = () => localDateKey();

export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const dateKey = (date: Date) => localDateKey(date);

export const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${Math.max(0, seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const getTaskColumn = (task: Task): KanbanColumnId => {
  if (task.status === 'Done') return 'done';
  if (!task.dueDate) return 'backlog';

  const today = todayKey();
  if (task.dueDate <= today) return 'today';
  return 'upcoming';
};

export const getKanbanColumns = (tasks: Task[]) => {
  const columns: Record<KanbanColumnId, Task[]> = {
    backlog: [],
    today: [],
    upcoming: [],
    done: [],
  };

  tasks.forEach((task) => {
    columns[getTaskColumn(task)].push(task);
  });

  const priorityRank = { High: 3, Medium: 2, Low: 1 };
  Object.values(columns).forEach((column) => {
    column.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'Done' ? 1 : -1;
      if (a.dueDate !== b.dueDate) return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
      return priorityRank[b.priority] - priorityRank[a.priority] || b.createdAt - a.createdAt;
    });
  });

  return columns;
};

export const buildSpaces = (notes: Note[], tasks: Task[], sessions: AppFocusSession[]): SpaceSummary[] => {
  const tagNames = new Set<string>();
  notes.forEach((note) => note.tags.forEach((tag) => tagNames.add(tag.trim())));

  const normalizedTags = Array.from(tagNames)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const spaces = normalizedTags.map((tag) => {
    const lower = tag.toLowerCase();
    const spaceNotes = notes.filter((note) => note.tags.some((noteTag) => noteTag.toLowerCase() === lower));
    const spaceTasks = tasks.filter((task) =>
      task.title.toLowerCase().includes(lower) || task.description.toLowerCase().includes(lower)
    );
    const noteIds = new Set(spaceNotes.map((note) => note.id));
    const taskIds = new Set(spaceTasks.map((task) => task.id));
    const focusSeconds = sessions
      .filter((session) => (
        (session.targetType === 'note' && session.targetId && noteIds.has(session.targetId)) ||
        (session.targetType === 'task' && session.targetId && taskIds.has(session.targetId))
      ))
      .reduce((total, session) => total + session.duration, 0);

    return {
      id: tag,
      name: tag,
      notes: spaceNotes,
      tasks: spaceTasks,
      focusSeconds,
    };
  });

  const taggedNoteIds = new Set(spaces.flatMap((space) => space.notes.map((note) => note.id)));
  const taggedTaskIds = new Set(spaces.flatMap((space) => space.tasks.map((task) => task.id)));
  const generalNotes = notes.filter((note) => note.tags.length === 0 || !taggedNoteIds.has(note.id));
  const generalTasks = tasks.filter((task) => !taggedTaskIds.has(task.id));

  return [
    {
      id: 'general',
      name: 'General',
      notes: generalNotes,
      tasks: generalTasks,
      focusSeconds: sessions.reduce((total, session) => total + session.duration, 0),
    },
    ...spaces,
  ].filter((space) => space.notes.length > 0 || space.tasks.length > 0 || space.id === 'general');
};

export const getDailyStreak = (sessions: AppFocusSession[]) => {
  const activeDays = new Set(sessions.filter((session) => session.duration > 0).map((session) => session.date));
  let streak = 0;
  for (let offset = 0; offset < 365; offset += 1) {
    const key = dateKey(addDays(new Date(), -offset));
    if (!activeDays.has(key)) {
      if (offset === 0) continue;
      break;
    }
    streak += 1;
  }
  return streak;
};

export const getMonthMatrix = (anchorDate: Date) => {
  const firstOfMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
};
