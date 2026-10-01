import { createClient } from '@supabase/supabase-js';
import { clientEnv } from './env';

const supabaseUrl = clientEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = clientEnv.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials not found. Cloud sync is disabled.\n' +
      'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable sync.',
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
);

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));
};
