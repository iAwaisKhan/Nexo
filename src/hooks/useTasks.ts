import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Task } from '../store/useAppStore'; // Temporarily assume Task is exported here

export function useInfiniteTasks(userId: string | undefined, pageSize: number = 20) {
  return useInfiniteQuery({
    queryKey: ['infiniteTasks', userId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) return [];
      const from = pageParam * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return data as Task[];
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize ? allPages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!userId,
  });
}

export function useTasks(userId: string | undefined) {
  return useQuery({
    queryKey: ['tasks', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!userId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['tasks', data.user_id], (old: Task[] | undefined) => 
        old ? [data, ...old] : [data]
      );
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['tasks', data.user_id], (old: Task[] | undefined) => 
        old ? old.map((t) => (t.id === data.id ? data : t)) : [data]
      );
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      // Soft delete: update deleted_at instead of actual DELETE
      const { error } = await supabase
        .from('tasks')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      return { id, userId };
    },
    onSuccess: ({ id, userId }) => {
      queryClient.setQueryData(['tasks', userId], (old: Task[] | undefined) =>
        old ? old.filter((t) => t.id !== id) : []
      );
    },
  });
}
