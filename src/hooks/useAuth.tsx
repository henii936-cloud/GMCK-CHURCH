import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabase, type Profile } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  configRequired: boolean;
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string | null) => void;
  loginAsDemo: (role: 'admin' | 'leader') => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [configRequired, setConfigRequired] = useState(false);
  const [selectedGroupId, setSelectedGroupIdState] = useState<string | null>(localStorage.getItem('selected_group_id'));

  const setSelectedGroupId = (id: string | null) => {
    if (id) localStorage.setItem('selected_group_id', id);
    else localStorage.removeItem('selected_group_id');
    setSelectedGroupIdState(id);
  };

  const supabase = getSupabase();

  useEffect(() => {
    if (!supabase) {
      setConfigRequired(true);
      setLoading(false);
      return;
    }

    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  const loginAsDemo = (role: 'admin' | 'leader') => {
    setLoading(true);
    const mockUser: any = {
      id: role === 'admin' ? 'demo-admin-id' : 'demo-leader-id',
      email: role === 'admin' ? 'admin@demo.com' : 'leader@demo.com',
      user_metadata: { full_name: role === 'admin' ? 'Demo Admin' : 'Demo Leader' }
    };
    
    const mockProfile: Profile = {
      id: mockUser.id,
      role: role,
      full_name: role === 'admin' ? 'Demo Admin' : 'Demo Leader',
    };

    setUser(mockUser);
    setProfile(mockProfile);
    setLoading(false);
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, configRequired, selectedGroupId, setSelectedGroupId, loginAsDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
