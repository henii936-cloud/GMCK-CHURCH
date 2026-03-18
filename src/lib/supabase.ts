import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const getSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Export a constant that safely calls getSupabase() for convenience, 
// but we'll primarily use getSupabase() in hooks.
export const supabase = getSupabase();

export type Role = 'admin' | 'leader' | 'finance';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  group_id?: string;
}

export interface Budget {
  id: string;
  title: string;
  ministry: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  year: number;
  created_by: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  member_id: string;
  type: 'tithe' | 'offering' | 'donation' | 'expense';
  amount: number;
  recorded_by: string;
  budget_id: string;
  date: string;
  created_at: string;
  member?: {
    full_name: string;
  };
  budget?: {
    title: string;
  };
}
