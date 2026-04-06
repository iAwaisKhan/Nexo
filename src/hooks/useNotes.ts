import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Note } from '../types/focus';

export function useInfiniteNotes(userId: string | undefined, pageSize: number = 20) {
  return useInfiniteQuery({
    queryKey: ['infiniteNotes', userId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) return [];
      const from = pageParam * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return data as Note[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize ? allPages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!userId,
  });
}

export function useNotes(userId: string | undefined) {
  return useQuery({
    queryKey: ['notes', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Note[];
    },
    enabled: !!userId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newNote: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single();
      if (error) throw error;
      return data as Note;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['notes', data.user_id], (old: Note[] | undefined) => 
        old ? [data, ...old] : [data]
      );
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Note> }) => {
      const { data, error } = await supabase
        .from('notes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Note;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['notes', data.user_id], (old: Note[] | undefined) => 
        old ? old.map((n) => (n.id === data.id ? data : n)) : [data]
      );
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      // Soft delete: update deleted_at instead of actual DELETE
      const { error } = await supabase
        .from('notes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      return { id, userId };
    },
    onSuccess: ({ id, userId }) => {
      queryClient.setQueryData(['notes', userId], (old: Note[] | undefined) =>
        old ? old.filter((n) => n.id !== id) : []
      );
    },
  });
}
