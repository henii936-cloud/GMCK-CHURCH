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
          setLoading(false);
        }
        return { ...authUser, ...data };
      } catch (err) {
        console.error("Error fetching profile:", err.message);
        if (mounted && !cachedProfile) {
          const fallbackUser = { 
            ...authUser, 
            role: authUser.user_metadata?.role || 'member',
            full_name: authUser.user_metadata?.full_name || authUser.email
          };
          setUser(fallbackUser);
          return fallbackUser;
        }
        return null;
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
          loadUser(newSession).then(userData => {
            if (event === 'SIGNED_IN' && userData) {
              logLogin(userData); // Don't await
            }
          });
        }
        
        if (event === 'SIGNED_OUT') {
          const oldUser = user;
          logLogout(oldUser?.id);
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

  const logLogin = async (userData) => {
    try {
      const { data, error } = await supabase.from('login_logs').insert({
        user_id: userData.id,
        full_name: userData.full_name,
        role: userData.role,
        device_info: navigator.userAgent
      }).select().single();
      
      if (data) {
        sessionStorage.setItem('current_login_log_id', data.id);
      }

      await supabase.from('profiles').update({ last_active: new Date().toISOString() }).eq('id', userData.id);
      
      await supabase.from('activity_logs').insert({
        user_id: userData.id,
        action: 'login',
        description: `${userData.full_name} logged in`
      });
    } catch (err) {
      console.error("Tracking error:", err);
    }
  };

  const logLogout = async (userId) => {
    try {
      const logId = sessionStorage.getItem('login_log_id');
      if (logId) {
        await supabase.from('login_logs').update({ logout_time: new Date().toISOString() }).eq('id', logId);
        sessionStorage.removeItem('login_log_id');
      }
      
      if (userId) {
        await supabase.from('activity_logs').insert({
          user_id: userId,
          action: 'logout',
          description: 'User logged out',
          entity_type: 'auth'
        });
      }
    } catch (err) {
      console.error("Logout log error:", err);
    }
  };

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

  const logout = () => {
    setLoading(true);
    logLogout(user?.id);
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, login, signup, logout, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);









