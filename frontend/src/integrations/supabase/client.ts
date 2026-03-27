import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined);

if (!SUPABASE_URL) {
  // Hard failure if URL is missing — app cannot operate without a Supabase URL
  throw new Error('Missing Supabase URL (VITE_SUPABASE_URL). Please check your .env file.');
}

if (!SUPABASE_ANON_KEY) {
  // Allow app to run in a degraded mode for local dev but warn clearly.
  console.warn('VITE_SUPABASE_ANON_KEY / VITE_SUPABASE_PUBLISHABLE_KEY is not set. Supabase calls will fail.');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY ?? '', {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
