import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          if (session?.user) {
            await fetchProfile(session.user);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error getting session:", error);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        setSession(newSession);
        
        if (event === 'SIGNED_IN' && newSession?.user) {
          setLoading(true);
          await fetchProfile(newSession.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (authUser) => {
    try {
      // Check local storage for cached profile to speed up initial load
      const cachedProfile = localStorage.getItem(`profile_${authUser.id}`);
      if (cachedProfile) {
        setUser({ ...authUser, ...JSON.parse(cachedProfile) });
        setLoading(false); // Stop loading immediately if we have cached data
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;
      
      // Update cache and state with fresh data
      localStorage.setItem(`profile_${authUser.id}`, JSON.stringify(data));
      setUser({ ...authUser, ...data });
    } catch (err) {
      console.error("Error fetching profile:", err.message);
      // Still set user even if profile fetch fails, so they aren't completely locked out
      if (!user) setUser(authUser);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 UNIVERSAL LOGIN FUNCTION
  const login = async (email, password, role) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          throw new Error("Invalid email or password. Please check your credentials and try again.");
        }
        throw error;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      // 🔒 ROLE VALIDATION
      if (role && profile.role !== role) {
        // Sign out immediately if role doesn't match
        await supabase.auth.signOut();
        throw new Error(`Access denied: This account is registered as a ${profile.role}, not a ${role}.`);
      }

      // Cache profile for faster reloads
      localStorage.setItem(`profile_${data.user.id}`, JSON.stringify(profile));
      
      setSession(data.session);
      setUser({ ...data.session?.user, ...profile });
      setLoading(false);

      return data;
    } catch (err) {
      throw err;
    }
  };

  const signup = async (email, password, name, role) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;

    if (data.user) {
      const profileData = { id: data.user.id, full_name: name, role: role };
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData]);
      
      if (profileError) throw profileError;
      
      // Cache profile for faster reloads
      localStorage.setItem(`profile_${data.user.id}`, JSON.stringify(profileData));
    }

    return data;
  };

  const logout = async () => {
    setLoading(true);
    if (user?.id) {
      localStorage.removeItem(`profile_${user.id}`);
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, login, signup, logout, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);









