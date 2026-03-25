import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUser = async (currentSession) => {
      if (!currentSession?.user) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const authUser = currentSession.user;
      
      // 1. Fast path: check cache
      const cachedProfile = localStorage.getItem(`profile_${authUser.id}`);
      if (cachedProfile) {
        if (mounted) {
          setUser({ ...authUser, ...JSON.parse(cachedProfile) });
          setLoading(false); // UI can render immediately
        }
      }

      // 2. Fetch fresh profile
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (error) throw error;
        
        localStorage.setItem(`profile_${authUser.id}`, JSON.stringify(data));
        if (mounted) {
          setUser({ ...authUser, ...data });
        }
      } catch (err) {
        console.error("Error fetching profile:", err.message);
        if (mounted && !cachedProfile) {
          // Fallback to auth user with metadata role
          setUser({ 
            ...authUser, 
            role: authUser.user_metadata?.role || 'member',
            full_name: authUser.user_metadata?.full_name || authUser.email
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          loadUser(session);
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
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          // Don't set loading to true if we already have a user, to prevent flicker
          if (!user) setLoading(true);
          loadUser(newSession);
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

  // 🔐 UNIVERSAL LOGIN FUNCTION
  const login = async (email, password) => {
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

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      let profile = profileData;

      if (!profile) {
        // 🧪 SELF-REPAIR: If profile is missing but we have metadata, create it
        const metadata = data.user.user_metadata;
        if (metadata?.role) {
          console.log("🛠️ Profile missing, attempting self-repair using metadata...");
          const { data: newProfile, error: repairError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              full_name: metadata.full_name || metadata.name || "User",
              role: metadata.role
            })
            .select('role')
            .single();
          
          if (!repairError) {
            profile = newProfile;
            console.log("✅ Profile repaired!");
          }
        }
      }

      if (!profile) {
        throw new Error("User profile not found. Please contact an administrator.");
      }

      // Cache profile for faster reloads
      localStorage.setItem(`profile_${data.user.id}`, JSON.stringify(profile));
      
      setSession(data.session);
      setUser({ ...data.session?.user, ...profile });
      setLoading(false);

      return { ...data, profile };
    } catch (err) {
      throw err;
    }
  };

  const signup = async (email, password, name, role) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role
        }
      }
    });
    
    if (error) throw error;

    if (data.user) {
      const profileData = { id: data.user.id, full_name: name, role: role };
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData);
      
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









