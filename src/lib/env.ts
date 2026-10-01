import { clientEnvSchema } from '@nexo/contracts';

const parsedEnv = clientEnvSchema.safeParse({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || undefined,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || undefined,
});

if (!parsedEnv.success) {
  throw new Error(`Invalid client environment: ${parsedEnv.error.issues[0]?.message}`);
}

export const clientEnv = parsedEnv.data;
