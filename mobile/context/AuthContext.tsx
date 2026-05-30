import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { supabase } from "../services/supabaseClient";

interface UserProfile {
  id: string;
  email?: string;
  role: string;
  full_name?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  notification_email?: boolean;
  notification_app?: boolean;
  created_at?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const CACHE_KEY_PREFIX = "profile_";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUser = async (currentSession: any) => {
      if (!currentSession?.user) {
        if (mounted) { setUser(null); setLoading(false); }
        return;
      }

      const authUser = currentSession.user;

      // Fast path: SecureStore cache
      try {
        const cached = await SecureStore.getItemAsync(`${CACHE_KEY_PREFIX}${authUser.id}`);
        if (cached && mounted) {
          setUser({ ...authUser, ...JSON.parse(cached) });
          setLoading(false);
        }
      } catch (_) {}

      // Fetch fresh profile
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          await SecureStore.setItemAsync(
            `${CACHE_KEY_PREFIX}${authUser.id}`,
            JSON.stringify(data)
          );
          if (mounted) setUser({ ...authUser, ...data });
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        if (mounted && !user) {
          setUser({
            ...authUser,
            role: authUser.user_metadata?.role ?? "member",
            full_name: authUser.user_metadata?.full_name ?? authUser.email,
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const init = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (mounted) { setSession(s); loadUser(s); }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          loadUser(newSession);
        }
        if (event === "SIGNED_OUT") {
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

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!profileData) throw new Error("User profile not found. Contact an administrator.");
    if (profileData.role !== "bible_leader") {
      await supabase.auth.signOut();
      throw new Error("Access denied. This app is for Bible Leaders only.");
    }

    await SecureStore.setItemAsync(
      `${CACHE_KEY_PREFIX}${data.user.id}`,
      JSON.stringify(profileData)
    );

    // Log login
    try {
      await supabase.from("login_logs").insert({
        user_id: data.user.id,
        full_name: profileData.full_name,
        role: profileData.role,
        device_info: "React Native Mobile App",
      });
      await supabase.from("activity_logs").insert({
        user_id: data.user.id,
        action: "login",
        description: `${profileData.full_name} logged in via mobile app`,
      });
    } catch (_) {}

    setSession(data.session);
    setUser({ ...data.user, ...profileData });
  };

  const logout = async () => {
    if (user?.id) {
      try {
        await supabase.from("activity_logs").insert({
          user_id: user.id,
          action: "logout",
          description: "User logged out from mobile app",
          entity_type: "auth",
        });
        await SecureStore.deleteItemAsync(`${CACHE_KEY_PREFIX}${user.id}`);
      } catch (_) {}
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
