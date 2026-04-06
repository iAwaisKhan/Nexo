import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Note } from '../types/focus';
import { Task } from '../store/useAppStore';

export function useSearch(userId: string | undefined, query: string) {
  return useQuery({
    queryKey: ['search', userId, query],
    queryFn: async () => {
      if (!userId || !query.trim()) return { notes: [], tasks: [] };

      // Format query for Postgres Full-Text Search (replace spaces with & for AND matching)
      // Example: "react typescript" -> "react & typescript"
      const formattedQuery = query.trim().split(/\s+/).join(' & ');

      // Run parallel FTS queries
      const [notesRes, tasksRes] = await Promise.all([
        supabase
          .from('notes')
          .select('id, title, content, updated_at')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .textSearch('fts', formattedQuery)
          .limit(10),
        supabase
          .from('tasks')
          .select('id, title, description, status, priority, due_date')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .textSearch('fts', formattedQuery)
          .limit(10),
      ]);

      if (notesRes.error) throw notesRes.error;
      if (tasksRes.error) throw tasksRes.error;

      return {
        notes: notesRes.data as Partial<Note>[],
        tasks: tasksRes.data as Partial<Task>[],
      };
    },
    enabled: !!userId && query.length >= 2,
    staleTime: 1000 * 60, // 1 minute cache for search queries
  });
}
