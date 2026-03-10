import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      // Return null or handle gracefully in hooks
      return null;
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

// Export a constant that safely calls getSupabase() for convenience, 
// but we'll primarily use getSupabase() in hooks.
export const supabase = getSupabase();

export type Role = 'admin' | 'leader';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  group_id?: string;
}
